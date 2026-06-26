"use client";
import { useState } from 'react';
import { submitATC20Action, ATC20Data } from '@/actions/submitATC20';

type Step = 'INFO' | 'EXTERNA' | 'PISO_CRITICO' | 'MODERADO' | 'NO_ESTRUCTURAL' | 'RESULT' | 'SUBMITTED';

export default function EvaluacionATC20() {
  const [step, setStep] = useState<Step>('INFO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState(false);
  
  // Datos del formulario
  const [data, setData] = useState<Partial<ATC20Data>>({
    inspector_nombre: '',
    inspector_cedula: '',
    direccion: '',
    nombre_edificacion: '',
    uso_predominante: 'Vivienda',
    numero_pisos: 1,
    material_predominante: 'Concreto',
    riesgo_externo: 'A',
    piso_critico_riesgo: 'A',
    dano_moderado_riesgo: 'A',
    no_estructural_riesgo: 'A',
    acciones_recomendadas: []
  });

  const updateData = (fields: Partial<ATC20Data>) => {
    setData(prev => ({ ...prev, ...fields }));
  };

  const calculateFinalTag = (): 'VERDE' | 'AMARILLA' | 'ROJA' => {
    const risks = [data.riesgo_externo, data.piso_critico_riesgo, data.dano_moderado_riesgo, data.no_estructural_riesgo];
    if (risks.includes('C')) return 'ROJA';
    if (risks.includes('B')) return 'AMARILLA';
    return 'VERDE';
  };

  const handleNext = (nextStep: Step, forceTag?: 'ROJA') => {
    if (forceTag === 'ROJA') {
      // Si hay colapso o daño severo, saltamos directo a la Etiqueta Roja
      setStep('RESULT');
    } else {
      setStep(nextStep);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    const submitToServer = async (lat: number, lng: number) => {
      const finalData: ATC20Data = {
        ...(data as ATC20Data),
        etiqueta_final: calculateFinalTag(),
        lat, lng
      };
      
      const result = await submitATC20Action(finalData);
      if (result.success) {
        setStep('SUBMITTED');
      } else {
        alert('Error guardando la evaluación ATC-20.');
      }
      setIsSubmitting(false);
    };

    let locResolved = false;
    const timeoutId = setTimeout(() => {
      if (!locResolved) {
        locResolved = true;
        setLocationError(true);
        submitToServer(10.4806, -66.9036); // Fallback Caracas
      }
    }, 4000);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (locResolved) return;
          locResolved = true;
          clearTimeout(timeoutId);
          submitToServer(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          if (locResolved) return;
          locResolved = true;
          clearTimeout(timeoutId);
          setLocationError(true);
          submitToServer(10.4806, -66.9036);
        },
        { timeout: 3500 }
      );
    } else {
      if (!locResolved) {
        locResolved = true;
        clearTimeout(timeoutId);
        submitToServer(10.4806, -66.9036);
      }
    }
  };

  const renderInfo = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-4">1. Información General</h2>
      <input type="text" placeholder="Nombre del Inspector" className="w-full p-3 bg-gray-800 rounded-xl text-white" 
        value={data.inspector_nombre} onChange={e => updateData({ inspector_nombre: e.target.value })} />
      <input type="text" placeholder="Cédula o CIV" className="w-full p-3 bg-gray-800 rounded-xl text-white"
        value={data.inspector_cedula} onChange={e => updateData({ inspector_cedula: e.target.value })} />
      
      <h3 className="text-gray-400 mt-6 font-bold">Datos del Edificio</h3>
      <input type="text" placeholder="Dirección o Sector" className="w-full p-3 bg-gray-800 rounded-xl text-white"
        value={data.direccion} onChange={e => updateData({ direccion: e.target.value })} />
      <input type="number" placeholder="Número de Pisos" className="w-full p-3 bg-gray-800 rounded-xl text-white"
        value={data.numero_pisos} onChange={e => updateData({ numero_pisos: parseInt(e.target.value) || 1 })} />
      
      <button onClick={() => handleNext('EXTERNA')} disabled={!data.inspector_nombre || !data.inspector_cedula}
        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl mt-6 disabled:opacity-50">
        Continuar Inspección →
      </button>
    </div>
  );

  const renderExterna = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-2">2. Inspección Externa</h2>
      <p className="text-sm text-gray-400 mb-6">Evalúe el colapso, peligro por edificios aledaños o riesgo geológico.</p>
      
      <button onClick={() => { updateData({ riesgo_externo: 'A' }); handleNext('PISO_CRITICO'); }} className="w-full text-left p-4 bg-gray-800 hover:border-green-500 border-2 border-transparent rounded-xl">
        <h3 className="text-green-400 font-bold">Riesgo Bajo (A)</h3>
        <p className="text-xs text-gray-300">Sin colapso, ni peligros aledaños.</p>
      </button>
      <button onClick={() => { updateData({ riesgo_externo: 'B' }); handleNext('PISO_CRITICO'); }} className="w-full text-left p-4 bg-gray-800 hover:border-yellow-500 border-2 border-transparent rounded-xl">
        <h3 className="text-yellow-400 font-bold">Riesgo Medio (B)</h3>
        <p className="text-xs text-gray-300">Daños moderados observables externamente.</p>
      </button>
      <button onClick={() => { updateData({ riesgo_externo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left p-4 bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-xl">
        <h3 className="text-red-400 font-bold">Riesgo Alto (C) - Colapso Posible</h3>
        <p className="text-xs text-gray-300">Asentamientos mayores a 20cm, inclinación severa.</p>
      </button>
    </div>
  );

  const renderPisoCritico = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-2">3. Piso Crítico y Daño Severo</h2>
      <p className="text-sm text-gray-400 mb-6">Identifique el piso con mayor concentración de daños estructurales.</p>
      
      <button onClick={() => { updateData({ piso_critico_riesgo: 'A' }); handleNext('MODERADO'); }} className="w-full text-left p-4 bg-gray-800 hover:border-green-500 border-2 border-transparent rounded-xl">
        <h3 className="text-green-400 font-bold">No hay daño severo/completo (A)</h3>
        <p className="text-xs text-gray-300">Continuar inspección.</p>
      </button>
      <button onClick={() => { updateData({ piso_critico_riesgo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left p-4 bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-xl">
        <h3 className="text-red-400 font-bold">Hay elementos con Daño Severo (C)</h3>
        <p className="text-xs text-gray-300">Pandeo de barras, caída de concreto en vigas/columnas principales.</p>
      </button>
    </div>
  );

  const renderModerado = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-2">4. Daño Moderado</h2>
      <p className="text-sm text-gray-400 mb-6">¿Qué porcentaje de los elementos principales tienen Daño Moderado?</p>
      
      <button onClick={() => { updateData({ dano_moderado_riesgo: 'A' }); handleNext('NO_ESTRUCTURAL'); }} className="w-full p-4 bg-gray-800 hover:border-green-500 border-2 border-transparent rounded-xl text-left text-green-400 font-bold">Menos del 10% (Riesgo Bajo)</button>
      <button onClick={() => { updateData({ dano_moderado_riesgo: 'B' }); handleNext('NO_ESTRUCTURAL'); }} className="w-full p-4 bg-gray-800 hover:border-yellow-500 border-2 border-transparent rounded-xl text-left text-yellow-400 font-bold">Entre 10% y 30% (Riesgo Medio)</button>
      <button onClick={() => { updateData({ dano_moderado_riesgo: 'C' }); handleNext('NO_ESTRUCTURAL'); }} className="w-full p-4 bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-xl text-left text-red-400 font-bold">Más del 30% (Riesgo Alto)</button>
    </div>
  );

  const renderNoEstructural = () => (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-white mb-2">5. Daño No Estructural</h2>
      <p className="text-sm text-gray-400 mb-6">Paredes de relleno, escaleras, tanques, fachadas.</p>
      
      <button onClick={() => { updateData({ no_estructural_riesgo: 'A' }); handleNext('RESULT'); }} className="w-full p-4 bg-gray-800 hover:border-green-500 border-2 border-transparent rounded-xl text-left text-green-400 font-bold">Daño Menor (Riesgo Bajo)</button>
      <button onClick={() => { updateData({ no_estructural_riesgo: 'B' }); handleNext('RESULT'); }} className="w-full p-4 bg-gray-800 hover:border-yellow-500 border-2 border-transparent rounded-xl text-left text-yellow-400 font-bold">Grietas de varios cm (Riesgo Medio)</button>
      <button onClick={() => { updateData({ no_estructural_riesgo: 'C' }); handleNext('RESULT'); }} className="w-full p-4 bg-gray-800 hover:border-red-500 border-2 border-transparent rounded-xl text-left text-red-400 font-bold">Derrumbe o Riesgo de Caída (Riesgo Alto)</button>
    </div>
  );

  const renderResult = () => {
    const finalTag = calculateFinalTag();
    return (
      <div className="p-6 text-center animate-fade-in flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-white mb-6">Emisión de Etiqueta (ATC-20)</h2>
        
        {finalTag === 'VERDE' && (
          <div className="bg-green-600 p-8 rounded-3xl shadow-xl border-4 border-green-400">
            <h1 className="text-4xl font-black text-white">HABITABLE</h1>
            <p className="text-green-100 font-bold mt-2">Acceso Permitido</p>
          </div>
        )}
        {finalTag === 'AMARILLA' && (
          <div className="bg-yellow-500 p-8 rounded-3xl shadow-xl border-4 border-yellow-300">
            <h1 className="text-4xl font-black text-black">ATENCIÓN</h1>
            <p className="text-yellow-900 font-bold mt-2">Acceso Restringido</p>
          </div>
        )}
        {finalTag === 'ROJA' && (
          <div className="bg-red-600 p-8 rounded-3xl shadow-xl border-4 border-red-400">
            <h1 className="text-4xl font-black text-white">PELIGRO</h1>
            <p className="text-red-100 font-bold mt-2">No Entre Ni Ocupe</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-white text-black font-bold py-4 rounded-xl mt-8 flex justify-center items-center">
          {isSubmitting ? 'Guardando Oficialmente...' : 'Guardar y Emitir Etiqueta Oficial'}
        </button>
      </div>
    );
  };

  const renderSubmitted = () => (
    <div className="p-6 text-center animate-fade-in flex flex-col justify-center items-center h-full">
      <div className="text-7xl mb-6 drop-shadow-xl">✅</div>
      <h2 className="text-3xl font-bold text-white mb-4">Evaluación ATC-20 Completada</h2>
      <p className="text-gray-400 mb-8">La etiqueta {calculateFinalTag()} ha sido registrada en el sistema de gestión de desastres. La ubicación GPS ha sido anclada a la base de datos.</p>
      {locationError && <p className="text-yellow-500 text-sm mb-4">Nota: El GPS falló, se usaron coordenadas por defecto.</p>}
      <button onClick={() => window.location.reload()} className="text-blue-400 font-bold">Hacer otra inspección</button>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-gray-100 font-sans flex flex-col items-center justify-center md:p-4">
      <div className="w-full max-w-md h-screen md:h-[800px] bg-gray-900 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-blue-800 p-4 text-center shrink-0">
          <h1 className="text-lg font-bold text-white tracking-wide">Panel de Inspector (ATC-20)</h1>
          <p className="text-xs text-blue-200">Evaluación Rápida Estructural</p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 relative flex flex-col justify-center">
          {step === 'INFO' && renderInfo()}
          {step === 'EXTERNA' && renderExterna()}
          {step === 'PISO_CRITICO' && renderPisoCritico()}
          {step === 'MODERADO' && renderModerado()}
          {step === 'NO_ESTRUCTURAL' && renderNoEstructural()}
          {step === 'RESULT' && renderResult()}
          {step === 'SUBMITTED' && renderSubmitted()}
        </div>
      </div>
    </main>
  );
}
