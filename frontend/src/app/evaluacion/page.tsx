"use client";
import { useState } from 'react';
import Image from 'next/image';
import { submitATC20Action, ATC20Data } from '@/actions/submitATC20';

type Step = 'INFO' | 'EXTERNA' | 'PISO_CRITICO' | 'MODERADO' | 'RESULT' | 'SUBMITTED';

export default function EvaluacionATC20Visual() {
  const [step, setStep] = useState<Step>('INFO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [data, setData] = useState<Partial<ATC20Data>>({
    inspector_nombre: '',
    inspector_cedula: '',
    direccion: '',
    nombre_edificacion: '',
    riesgo_externo: 'A',
    piso_critico_riesgo: 'A',
    dano_moderado_riesgo: 'A',
    no_estructural_riesgo: 'A',
  });

  const updateData = (fields: Partial<ATC20Data>) => setData(prev => ({ ...prev, ...fields }));

  const calculateFinalTag = (): 'VERDE' | 'AMARILLA' | 'ROJA' => {
    const risks = [data.riesgo_externo, data.piso_critico_riesgo, data.dano_moderado_riesgo, data.no_estructural_riesgo];
    if (risks.includes('C')) return 'ROJA';
    if (risks.includes('B')) return 'AMARILLA';
    return 'VERDE';
  };

  const handleNext = (nextStep: Step, forceTag?: 'ROJA') => {
    if (forceTag === 'ROJA') setStep('RESULT');
    else setStep(nextStep);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const submitToServer = async (lat: number, lng: number) => {
      const finalData = { ...data, etiqueta_final: calculateFinalTag(), lat, lng } as ATC20Data;
      const result = await submitATC20Action(finalData);
      if (result.success) setStep('SUBMITTED');
      else alert('Error al guardar.');
      setIsSubmitting(false);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => submitToServer(pos.coords.latitude, pos.coords.longitude),
        () => submitToServer(10.4806, -66.9036),
        { timeout: 3500 }
      );
    } else submitToServer(10.4806, -66.9036);
  };

  const renderInfo = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-blue-900/40 p-4 rounded-xl mb-6 border border-blue-500/30">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>📋</span> Manual FUNVISIS ATC-20
        </h2>
        <p className="text-sm text-blue-200 mt-2">Bienvenido a la planilla digital de certificación. Las siguientes pantallas contienen referencias visuales oficiales para guiar su inspección.</p>
      </div>

      <input type="text" placeholder="Nombre del Inspector (Certificado)" className="w-full p-4 bg-gray-800 rounded-xl text-white border border-gray-700 focus:border-blue-500" value={data.inspector_nombre} onChange={e => updateData({ inspector_nombre: e.target.value })} />
      <input type="text" placeholder="Nro. C.I. o CIV" className="w-full p-4 bg-gray-800 rounded-xl text-white border border-gray-700 focus:border-blue-500" value={data.inspector_cedula} onChange={e => updateData({ inspector_cedula: e.target.value })} />
      
      <h3 className="text-gray-400 mt-6 font-bold uppercase tracking-wider text-sm">Ubicación del Edificio</h3>
      <input type="text" placeholder="Dirección exacta o Sector" className="w-full p-4 bg-gray-800 rounded-xl text-white border border-gray-700" value={data.direccion} onChange={e => updateData({ direccion: e.target.value })} />
      
      <button onClick={() => handleNext('EXTERNA')} disabled={!data.inspector_nombre || !data.inspector_cedula} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl mt-6 transition-colors disabled:opacity-50">
        Iniciar Inspección Visual →
      </button>
    </div>
  );

  const renderExterna = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      <h2 className="text-2xl font-bold text-white mb-2">Paso 1: Riesgo Externo</h2>
      <p className="text-sm text-gray-400 mb-6">Evalúe el colapso o peligro inminente desde el exterior (sin ingresar).</p>
      
      <button onClick={() => { updateData({ riesgo_externo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-2xl overflow-hidden group transition-all">
        <div className="h-40 w-full relative">
          <Image src="/images/colapso.png" alt="Colapso" fill className="object-cover group-hover:scale-105 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          <span className="absolute bottom-3 left-4 text-xs font-bold bg-red-600 px-2 py-1 rounded text-white">RIESGO ALTO (C)</span>
        </div>
        <div className="p-4">
          <h3 className="text-white font-bold text-lg">Colapso Total o Parcial</h3>
          <p className="text-sm text-gray-400 mt-1">Pérdida de capacidad portante, losas aplastadas o derrumbe evidente.</p>
        </div>
      </button>

      <button onClick={() => { updateData({ riesgo_externo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-2xl overflow-hidden group transition-all mt-4">
        <div className="h-40 w-full relative">
          <Image src="/images/inclinacion.png" alt="Inclinación" fill className="object-cover group-hover:scale-105 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          <span className="absolute bottom-3 left-4 text-xs font-bold bg-red-600 px-2 py-1 rounded text-white">RIESGO ALTO (C)</span>
        </div>
        <div className="p-4">
          <h3 className="text-white font-bold text-lg">Inclinación Severa</h3>
          <p className="text-sm text-gray-400 mt-1">Asentamiento del terreno con inclinación mayor a 2cm/60cm o hundimiento mayor a 1m.</p>
        </div>
      </button>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <button onClick={() => { updateData({ riesgo_externo: 'B' }); handleNext('PISO_CRITICO'); }} className="p-4 bg-gray-800 hover:border-yellow-500 border-2 border-transparent rounded-xl text-center">
          <span className="text-3xl block mb-2">⚠️</span>
          <h3 className="text-yellow-400 font-bold">Riesgo Medio (B)</h3>
          <p className="text-xs text-gray-400 mt-1">Asentamiento leve ‹ 20cm</p>
        </button>
        <button onClick={() => { updateData({ riesgo_externo: 'A' }); handleNext('PISO_CRITICO'); }} className="p-4 bg-gray-800 hover:border-green-500 border-2 border-transparent rounded-xl text-center">
          <span className="text-3xl block mb-2">✅</span>
          <h3 className="text-green-400 font-bold">Riesgo Bajo (A)</h3>
          <p className="text-xs text-gray-400 mt-1">Estructura externa intacta</p>
        </button>
      </div>
    </div>
  );

  const renderPisoCritico = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      <button onClick={() => setStep('EXTERNA')} className="text-sm text-blue-400 mb-2 hover:underline">← Atrás</button>
      <h2 className="text-2xl font-bold text-white mb-2">Paso 2: Piso Crítico</h2>
      <p className="text-sm text-gray-400 mb-6">Inspección de elementos estructurales principales con Daño Severo o Completo.</p>
      
      <button onClick={() => { updateData({ piso_critico_riesgo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-2xl overflow-hidden group transition-all">
        <div className="h-48 w-full relative">
          <Image src="/images/columna_severo.png" alt="Columna" fill className="object-cover group-hover:scale-105 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          <span className="absolute bottom-3 left-4 text-xs font-bold bg-red-600 px-2 py-1 rounded text-white">DAÑO SEVERO (C)</span>
        </div>
        <div className="p-4">
          <h3 className="text-white font-bold text-lg">Falla en Columnas / Vigas</h3>
          <p className="text-sm text-gray-400 mt-1">Pérdida de recubrimiento amplia, pandeo de acero expuesto, aplastamiento del concreto.</p>
        </div>
      </button>

      <button onClick={() => { updateData({ piso_critico_riesgo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-2xl overflow-hidden group transition-all mt-4">
        <div className="h-48 w-full relative">
          <Image src="/images/muro_severo.png" alt="Muro" fill className="object-cover group-hover:scale-105 transition-transform" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          <span className="absolute bottom-3 left-4 text-xs font-bold bg-red-600 px-2 py-1 rounded text-white">DAÑO SEVERO (C)</span>
        </div>
        <div className="p-4">
          <h3 className="text-white font-bold text-lg">Falla en Muros Portantes</h3>
          <p className="text-sm text-gray-400 mt-1">Grietas anchas profundas (X) mayores a 3mm, dislocación de piezas, desplome parcial.</p>
        </div>
      </button>

      <button onClick={() => { updateData({ piso_critico_riesgo: 'A' }); handleNext('MODERADO'); }} className="w-full p-5 bg-gray-800 hover:border-green-500 border-2 border-transparent rounded-xl mt-6 text-center shadow-lg">
        <span className="text-green-400 font-bold text-lg block">Sin Daño Severo (Continuar)</span>
        <span className="text-xs text-gray-400">Ningún elemento principal está comprometido.</span>
      </button>
    </div>
  );

  const renderModerado = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      <button onClick={() => setStep('PISO_CRITICO')} className="text-sm text-blue-400 mb-2 hover:underline">← Atrás</button>
      <h2 className="text-2xl font-bold text-white mb-2">Paso 3: Daño Moderado</h2>
      <p className="text-sm text-gray-400 mb-6">Calcule el porcentaje (%) de elementos estructurales con daño moderado (grietas finas de 1 a 2mm).</p>
      
      <button onClick={() => { updateData({ dano_moderado_riesgo: 'A' }); handleNext('RESULT'); }} className="w-full p-6 bg-gray-800 hover:border-green-500 border-2 border-transparent rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-green-400 font-bold text-xl">Riesgo Bajo (A)</h3>
          <p className="text-sm text-gray-400 mt-1">Menos del 10% de elementos</p>
        </div>
        <span className="text-4xl">🟢</span>
      </button>

      <button onClick={() => { updateData({ dano_moderado_riesgo: 'B' }); handleNext('RESULT'); }} className="w-full p-6 bg-gray-800 hover:border-yellow-500 border-2 border-transparent rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-yellow-400 font-bold text-xl">Riesgo Medio (B)</h3>
          <p className="text-sm text-gray-400 mt-1">Entre 10% y 30% de elementos</p>
        </div>
        <span className="text-4xl">🟡</span>
      </button>

      <button onClick={() => { updateData({ dano_moderado_riesgo: 'C' }); handleNext('RESULT'); }} className="w-full p-6 bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-2xl flex items-center justify-between">
        <div>
          <h3 className="text-red-400 font-bold text-xl">Riesgo Alto (C)</h3>
          <p className="text-sm text-gray-400 mt-1">Más del 30% de elementos</p>
        </div>
        <span className="text-4xl">🔴</span>
      </button>
    </div>
  );

  const renderResult = () => {
    const finalTag = calculateFinalTag();
    return (
      <div className="p-6 text-center animate-fade-in flex flex-col justify-center h-full">
        <p className="text-gray-400 text-sm mb-4 uppercase tracking-widest">Resultado del Algoritmo</p>
        
        {finalTag === 'VERDE' && (
          <div className="bg-green-600 p-10 rounded-3xl shadow-[0_0_50px_rgba(22,163,74,0.3)] border-4 border-green-400 relative overflow-hidden">
            <span className="absolute -top-10 -right-10 text-9xl opacity-20">✅</span>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">VERDE</h1>
            <p className="text-green-100 font-bold text-xl uppercase tracking-widest">Acceso Permitido</p>
            <p className="text-sm text-green-200 mt-4">Habitable. Riesgo estructural bajo.</p>
          </div>
        )}
        {finalTag === 'AMARILLA' && (
          <div className="bg-yellow-500 p-10 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.3)] border-4 border-yellow-300 relative overflow-hidden">
            <span className="absolute -top-10 -right-10 text-9xl opacity-20">⚠️</span>
            <h1 className="text-5xl font-black text-black mb-2 tracking-tighter">AMARILLA</h1>
            <p className="text-yellow-900 font-bold text-xl uppercase tracking-widest">Acceso Restringido</p>
            <p className="text-sm text-yellow-800 mt-4">Requiere reparaciones o apuntalamiento.</p>
          </div>
        )}
        {finalTag === 'ROJA' && (
          <div className="bg-red-600 p-10 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.4)] border-4 border-red-400 relative overflow-hidden">
            <span className="absolute -top-10 -right-10 text-9xl opacity-20">🛑</span>
            <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">ROJA</h1>
            <p className="text-red-100 font-bold text-xl uppercase tracking-widest">No Entre Ni Ocupe</p>
            <p className="text-sm text-red-200 mt-4">Peligro inminente de colapso. Acordonar el área.</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-white text-black font-bold py-5 rounded-2xl mt-12 shadow-xl hover:scale-105 transition-transform flex justify-center items-center gap-2 text-lg disabled:opacity-50 disabled:scale-100">
          {isSubmitting ? 'Firmando y Guardando...' : 'Emitir Certificado Oficial'}
          <span>{isSubmitting ? '⏳' : '📝'}</span>
        </button>
      </div>
    );
  };

  const renderSubmitted = () => (
    <div className="p-6 text-center animate-fade-in flex flex-col justify-center items-center h-full">
      <div className="text-8xl mb-6 drop-shadow-xl animate-bounce-short">🎖️</div>
      <h2 className="text-3xl font-bold text-white mb-2">Planilla Procesada</h2>
      <p className="text-gray-400 mb-8 max-w-sm">La evaluación ha sido anclada geográficamente y guardada en el Registro Oficial Post-Sismo.</p>
      
      <div className="bg-gray-800 w-full p-4 rounded-xl mb-8 flex justify-between items-center">
        <span className="text-gray-400 text-sm">Etiqueta Emitida:</span>
        <span className={`font-bold px-3 py-1 rounded text-sm ${data.etiqueta_final === 'ROJA' ? 'bg-red-600 text-white' : data.etiqueta_final === 'AMARILLA' ? 'bg-yellow-500 text-black' : 'bg-green-600 text-white'}`}>{calculateFinalTag()}</span>
      </div>

      <button onClick={() => window.location.reload()} className="text-blue-400 font-bold hover:text-white transition-colors">
        + Realizar Nueva Inspección
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-gray-100 font-sans flex flex-col items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-md h-screen md:h-[850px] bg-gray-900 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        <div className="bg-blue-900 p-4 flex justify-between items-center shrink-0 border-b border-blue-800">
          <div className="font-black tracking-widest text-blue-100">RECONSTRUYE<span className="text-yellow-500">.VE</span></div>
          <div className="text-xs bg-blue-950 px-2 py-1 rounded text-blue-300 font-mono">ID: {data.inspector_cedula || 'N/A'}</div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 scroll-smooth">
          {step === 'INFO' && renderInfo()}
          {step === 'EXTERNA' && renderExterna()}
          {step === 'PISO_CRITICO' && renderPisoCritico()}
          {step === 'MODERADO' && renderModerado()}
          {step === 'RESULT' && renderResult()}
          {step === 'SUBMITTED' && renderSubmitted()}
        </div>
      </div>
    </main>
  );
}
