"use client";
import { useState } from 'react';
import { submitReportAction } from '@/actions/submitReport';

type Step = 'CAMERA' | 'HOME' | 'WALLS' | 'STRUCTURE' | 'RESULT' | 'SUBMITTED';
type Severity = 'VERDE' | 'AMARILLO' | 'ROJO' | null;

export default function ReporteCiudadano() {
  const [step, setStep] = useState<Step>('CAMERA');
  const [severity, setSeverity] = useState<Severity>(null);
  const [mediaCount, setMediaCount] = useState(0);
  const [infraType, setInfraType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [realSeedPhrase, setRealSeedPhrase] = useState<string | null>(null);

  const handleCapture = () => {
    // Simula tomar una foto
    if (mediaCount < 3) {
      setMediaCount(mediaCount + 1);
    }
  };

  const handleResult = (sev: Severity) => {
    setSeverity(sev);
    setStep('RESULT');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Función auxiliar para enviar al servidor
    const submitToServer = async (lat: number, lng: number) => {
      const result = await submitReportAction({
        tipo_infraestructura: infraType,
        gravedad_ciudadano: severity || 'VERDE',
        lat: lat,
        lng: lng,
        imagenes: ['ipfs://mock-cid-1', 'ipfs://mock-cid-2']
      });

      if (result.success && result.seedPhrase) {
        setRealSeedPhrase(result.seedPhrase);
        setStep('SUBMITTED');
      } else {
        alert('Hubo un error al enviar el reporte. Inténtalo de nuevo.');
      }
      setIsSubmitting(false);
    };

    // Timeout de seguridad: Si el GPS tarda más de 3 segundos o está bloqueado, se usa ubicación por defecto
    let locationResolved = false;
    const timeoutId = setTimeout(() => {
      if (!locationResolved) {
        locationResolved = true;
        console.warn("Geolocalización bloqueada o muy lenta, usando ubicación por defecto (Caracas)");
        submitToServer(10.4806, -66.9036);
      }
    }, 3000);

    // Intentar obtener Geolocalización real
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (locationResolved) return;
          locationResolved = true;
          clearTimeout(timeoutId);
          submitToServer(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          if (locationResolved) return;
          locationResolved = true;
          clearTimeout(timeoutId);
          console.error("Error obteniendo ubicación:", error);
          submitToServer(10.4806, -66.9036); // Fallback Caracas
        },
        { timeout: 2500 }
      );
    } else {
      if (!locationResolved) {
        locationResolved = true;
        clearTimeout(timeoutId);
        submitToServer(10.4806, -66.9036);
      }
    }
  };

  return (
    <main className="min-h-screen bg-black text-gray-100 font-sans flex flex-col items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md h-screen md:h-[850px] bg-gray-900 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header estático excepto en cámara */}
        {step !== 'CAMERA' && step !== 'SUBMITTED' && (
          <div className="bg-red-600 p-4 text-center shadow-md shrink-0">
            <h1 className="text-xl font-bold text-white tracking-wide">Reporte de Daños</h1>
            <p className="text-sm text-red-100 opacity-90">Evidencia capturada: {mediaCount} foto(s)</p>
          </div>
        )}

        {/* CONTENIDO DESLIZABLE */}
        <div className="flex-1 overflow-y-auto w-full relative">
          
          {step === 'CAMERA' && (
            <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-between pb-8 pt-4">
              {/* Fake camera UI */}
              <div className="w-full px-4 flex justify-between items-center text-white z-10">
                 <span className="font-bold text-lg">Paso 1: Evidencia</span>
                 <span className="bg-gray-700 border border-gray-600 px-3 py-1 rounded-full text-xs font-mono">{mediaCount}/3 Max</span>
              </div>

              <div className="flex-1 w-full flex items-center justify-center relative">
                 <div className="text-center">
                    <div className="text-6xl mb-4 opacity-50">📷</div>
                    <p className="text-gray-300 font-medium mb-1">Simulador de Cámara (Story)</p>
                    <p className="text-sm text-gray-500 px-8">Toma hasta 3 fotografías detalladas o graba 1 video de 10 segundos.</p>
                    
                    {/* Indicador de fotos tomadas */}
                    <div className="mt-8 flex gap-3 justify-center h-24">
                       {[...Array(3)].map((_, i) => (
                         <div 
                           key={i} 
                           className={`w-16 rounded-xl border-2 transition-all duration-300 ${i < mediaCount ? 'border-green-500 bg-gray-700' : 'border-gray-600 bg-gray-800 border-dashed'}`}
                         >
                           {i < mediaCount && <div className="w-full h-full bg-black/20 flex items-center justify-center text-green-500 text-2xl font-bold">✓</div>}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* Boton obturador tipo Instagram Story */}
              <div className="flex flex-col items-center gap-8 w-full px-6">
                <button 
                  onClick={handleCapture}
                  disabled={mediaCount >= 3}
                  className="w-24 h-24 bg-white rounded-full border-8 border-gray-400 focus:border-red-500 hover:scale-105 transition-transform disabled:opacity-30 disabled:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                  aria-label="Capturar"
                />
                
                <div className="h-14 w-full flex justify-center">
                  {mediaCount > 0 && (
                    <button 
                      onClick={() => setStep('HOME')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all animate-fade-in text-lg"
                    >
                      Paso 2: Clasificar Daño →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 'HOME' && (
            <div className="p-6 space-y-6 animate-fade-in h-full flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white mb-2">¿Dónde está el daño principal?</h2>
              <p className="text-gray-400 text-sm mb-6">Selecciona la zona afectada en base a la evidencia que acabas de capturar.</p>
              
              <button 
                onClick={() => { setInfraType('Paredes'); setStep('WALLS'); }}
                className="w-full text-left p-6 rounded-2xl bg-gray-800 border-2 border-gray-700 hover:border-blue-500 transition-all flex items-center space-x-6 group shadow-lg"
              >
                <div className="text-5xl group-hover:scale-110 transition-transform">🧱</div>
                <div>
                  <h3 className="font-semibold text-xl text-white">En las Paredes</h3>
                  <p className="text-sm text-gray-400 mt-1">Mampostería, bloques, pintura o friso.</p>
                </div>
              </button>

              <button 
                onClick={() => { setInfraType('Estructura'); setStep('STRUCTURE'); }}
                className="w-full text-left p-6 rounded-2xl bg-gray-800 border-2 border-gray-700 hover:border-red-500 transition-all flex items-center space-x-6 group shadow-lg"
              >
                <div className="text-5xl group-hover:scale-110 transition-transform">🏗️</div>
                <div>
                  <h3 className="font-semibold text-xl text-white">En la Estructura</h3>
                  <p className="text-sm text-gray-400 mt-1">Columnas, vigas, uniones, techo o suelo.</p>
                </div>
              </button>
            </div>
          )}

          {step === 'WALLS' && (
            <div className="p-6 space-y-4 animate-fade-in">
              <button onClick={() => setStep('HOME')} className="text-sm text-blue-400 mb-2 hover:underline">← Atrás</button>
              <h2 className="text-2xl font-bold text-white mb-6">Daños en Paredes</h2>
              
              <button onClick={() => handleResult('VERDE')} className="w-full text-left p-5 rounded-xl bg-gray-800 border-2 border-transparent hover:border-green-500 transition-all">
                <h3 className="font-semibold text-white text-lg">Solo veo una grieta fina</h3>
                <p className="text-sm text-gray-400 mt-1">Daño superficial de pintura. La grieta no atraviesa el bloque.</p>
              </button>

              <button onClick={() => handleResult('AMARILLO')} className="w-full text-left p-5 rounded-xl bg-gray-800 border-2 border-transparent hover:border-yellow-500 transition-all">
                <h3 className="font-semibold text-white text-lg">La grieta forma una "X"</h3>
                <p className="text-sm text-gray-400 mt-1">Es profunda, atraviesa toda la pared y/o permite el paso de luz.</p>
              </button>
            </div>
          )}

          {step === 'STRUCTURE' && (
            <div className="p-6 space-y-4 animate-fade-in">
              <button onClick={() => setStep('HOME')} className="text-sm text-blue-400 mb-2 hover:underline">← Atrás</button>
              <h2 className="text-2xl font-bold text-white mb-6">Alerta Crítica: Estructura</h2>
              
              <button onClick={() => handleResult('ROJO')} className="w-full text-left p-5 rounded-xl bg-gray-800 border-2 border-transparent hover:bg-red-900/30 hover:border-red-500 transition-all">
                <h3 className="font-semibold text-white text-lg">Viga/columna con acero expuesto</h3>
                <p className="text-sm text-gray-400 mt-1">El concreto se desprendió dejando ver las cabillas, o hay grietas diagonales severas.</p>
              </button>

              <button onClick={() => handleResult('ROJO')} className="w-full text-left p-5 rounded-xl bg-gray-800 border-2 border-transparent hover:bg-red-900/30 hover:border-red-500 transition-all">
                <h3 className="font-semibold text-white text-lg">Suelo hundido o edificio inclinado</h3>
                <p className="text-sm text-gray-400 mt-1">Hundimientos muy marcados, pisos desnivelados o grietas en la base.</p>
              </button>
            </div>
          )}

          {step === 'RESULT' && (
            <div className="p-6 text-center py-8 animate-fade-in h-full flex flex-col">
              <div className="flex-1">
                {severity === 'VERDE' && (
                  <div className="bg-emerald-900/20 border-2 border-emerald-500 p-8 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                    <div className="text-7xl mb-6 drop-shadow-lg">🟢</div>
                    <h2 className="text-3xl font-bold text-emerald-400 mb-4">Escala: Baja</h2>
                    <p className="text-gray-300">El daño parece estético. La estructura principal luce estable.</p>
                  </div>
                )}
                {severity === 'AMARILLO' && (
                  <div className="bg-yellow-900/20 border-2 border-yellow-500 p-8 rounded-3xl shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                    <div className="text-7xl mb-6 drop-shadow-lg">🟡</div>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-4">Escala: Media</h2>
                    <p className="text-gray-300">Mampostería comprometida. Evita circular cerca de esta pared por riesgo de desprendimiento.</p>
                  </div>
                )}
                {severity === 'ROJO' && (
                  <div className="bg-red-900/20 border-2 border-red-500 p-8 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <div className="text-7xl mb-6 animate-pulse drop-shadow-lg">🔴</div>
                    <h2 className="text-3xl font-bold text-red-500 mb-4 uppercase tracking-wider">Alerta Crítica</h2>
                    <div className="bg-red-600/80 p-4 rounded-xl text-white font-bold tracking-wide shadow-lg">
                      Falla estructural inminente.<br/>Evacuar el área.
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-white text-black font-bold py-5 rounded-2xl shadow-xl transition-transform hover:scale-[1.02] active:scale-95 text-lg flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                >
                  <span>{isSubmitting ? 'Cifrando y Enviando...' : 'Enviar Evidencia Cifrada'}</span>
                  <span className="text-xl">{isSubmitting ? '⏳' : '🔒'}</span>
                </button>
                <button onClick={() => setStep('HOME')} className="mt-6 text-gray-500 hover:text-white transition-colors p-2 text-sm font-medium uppercase tracking-wider">
                  Reevaluar Clasificación
                </button>
              </div>
            </div>
          )}

          {step === 'SUBMITTED' && (
            <div className="p-6 text-center animate-fade-in h-full flex flex-col justify-center items-center bg-gray-900 relative">
              <div className="text-7xl mb-6 drop-shadow-xl animate-bounce-short">✅</div>
              <h2 className="text-3xl font-bold text-white mb-4">Evidencia Recibida</h2>
              <p className="text-gray-400 mb-8 max-w-sm text-sm">Tus metadatos EXIF han sido eliminados en el teléfono. El reporte ha entrado a la <strong>Cola de Triaje Universitario</strong>.</p>
              
              <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl w-full mb-6 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 opacity-50"></div>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-bold">Verificación Experta</p>
                <div className="flex flex-col items-center justify-center gap-2 text-yellow-500">
                  <span className="animate-spin text-3xl mb-1">⏳</span>
                  <span className="font-semibold text-lg">Pendiente de Ing. Voluntario</span>
                  <p className="text-xs text-gray-400 mt-2">Un ingeniero civil validará tu clasificación en breve.</p>
                </div>
              </div>

              <div className="bg-blue-900/10 border border-blue-900/50 p-6 rounded-2xl w-full text-left shadow-inner">
                <p className="text-xs text-blue-400 mb-3 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span>🔑</span> Identidad Anónima (DID)
                </p>
                <div className="font-mono bg-black/60 p-4 rounded-xl text-blue-300 text-lg text-center tracking-widest border border-blue-900/30">
                  {realSeedPhrase || 'ERROR_GENERANDO_SEMILLA'}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                  Guarda esta frase semilla. Con ella podrás saber si tu evidencia detona una auditoría anticorrupción en el futuro.
                </p>
              </div>

              <button 
                onClick={() => {setStep('CAMERA'); setSeverity(null); setMediaCount(0);}}
                className="mt-8 text-gray-500 hover:text-white font-medium text-sm tracking-wide transition-colors"
              >
                + Hacer un nuevo reporte
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
