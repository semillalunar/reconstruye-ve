"use client";
import { useState } from 'react';
import { submitATC20Action, ATC20Data } from '@/actions/submitATC20';

type Step = 'INFO' | 'EXTERNA' | 'PISO_CRITICO' | 'MODERADO' | 'NO_ESTRUCTURAL' | 'RESULT' | 'SUBMITTED';

export default function PlanillaEvaluacionRapida() {
  const [step, setStep] = useState<Step>('INFO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      else alert('Error al guardar en el servidor local.');
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

  // UI Components
  const BackButton = ({ prevStep }: { prevStep: Step }) => (
    <button onClick={() => setStep(prevStep)} className="text-sm text-blue-400 mb-4 hover:underline flex items-center gap-1">
      <span>←</span> Volver para corregir
    </button>
  );

  const SectionHeader = ({ title, helpText }: { title: string, helpText: string }) => (
    <div className="mb-6 border-b border-gray-700 pb-4">
      <h2 className="text-xl font-bold text-white uppercase tracking-wider">{title}</h2>
      <div className="bg-blue-900/30 border-l-4 border-blue-500 p-3 mt-3 text-sm text-blue-100">
        <span className="font-bold mr-2">📘 MANUAL DE ENTRENAMIENTO:</span>
        {helpText}
      </div>
    </div>
  );

  const renderInfo = () => (
    <div className="space-y-4 animate-fade-in">
      <SectionHeader 
        title="1. INFORMACIÓN GENERAL" 
        helpText="Llenar todos los datos del inspector y de la edificación. Si el dato no se conoce, coloque 'No sabe'. Material predominante: Mampostería informal se entiende viviendas populares." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">Nombre del Inspector</label>
          <input type="text" className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white mt-1" value={data.inspector_nombre} onChange={e => updateData({ inspector_nombre: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase font-bold">Cédula de Identidad</label>
          <input type="text" className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white mt-1" value={data.inspector_cedula} onChange={e => updateData({ inspector_cedula: e.target.value })} />
        </div>
      </div>

      <div className="mt-6 border-t border-gray-800 pt-4">
        <h3 className="text-sm font-bold text-gray-300 uppercase mb-3">Datos Generales de la Edificación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Nombre/Nº (Ej: Hotel Macuto)" className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white" value={data.nombre_edificacion} onChange={e => updateData({ nombre_edificacion: e.target.value })} />
          <input type="text" placeholder="Sector/Calle/Ciudad" className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white" value={data.direccion} onChange={e => updateData({ direccion: e.target.value })} />
          
          <select className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white" value={data.uso_predominante} onChange={e => updateData({ uso_predominante: e.target.value })}>
            <option>Vivienda</option><option>Comercio/Oficina</option><option>Gubernamental</option>
            <option>Educativo</option><option>Médico/Asistencial</option><option>Seguridad</option>
          </select>
          
          <div className="flex gap-2">
            <input type="number" placeholder="Nº Pisos" className="w-1/2 p-3 bg-gray-800 border border-gray-600 rounded text-white" value={data.numero_pisos} onChange={e => updateData({ numero_pisos: parseInt(e.target.value) || 1 })} />
            <select className="w-1/2 p-3 bg-gray-800 border border-gray-600 rounded text-white" value={data.material_predominante} onChange={e => updateData({ material_predominante: e.target.value })}>
              <option>Concreto</option><option>Acero</option><option>Mampostería formal</option><option>Mampostería informal</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={() => handleNext('EXTERNA')} disabled={!data.inspector_nombre || !data.inspector_cedula} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded mt-6 disabled:opacity-50">
        Siguiente: Inspección Externa →
      </button>
    </div>
  );

  const renderExterna = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      <BackButton prevStep="INFO" />
      <SectionHeader 
        title="2. INSPECCIÓN EXTERNA" 
        helpText="Determinar Riesgo Externo (Bajo, Medio, Alto) con base en recorrido alrededor del edificio. 'Peligro geotécnico' incluye agrietamiento del terreno. 'Inclinación' se mide con plomada de 60cm." 
      />

      <div className="space-y-3">
        <button onClick={() => { updateData({ riesgo_externo: 'A' }); handleNext('PISO_CRITICO'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-green-400 font-bold uppercase">a. Bajo (Todos 'a')</h3>
          <ul className="text-xs text-gray-300 mt-2 list-disc list-inside ml-4">
            <li>Colapso: No</li>
            <li>Peligro aledaños: No</li>
            <li>Asentamiento: No</li>
          </ul>
        </button>

        <button onClick={() => { updateData({ riesgo_externo: 'B' }); handleNext('PISO_CRITICO'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-yellow-400 font-bold uppercase">b. Medio (Al menos un 'b')</h3>
          <ul className="text-xs text-gray-300 mt-2 list-disc list-inside ml-4">
            <li>Peligro aledaños o geológico: Moderado</li>
            <li>Asentamiento: Hasta 20 cm</li>
            <li>Inclinación: Hasta 2cm/60cm</li>
          </ul>
        </button>

        <button onClick={() => { updateData({ riesgo_externo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left p-4 bg-red-900/30 hover:bg-red-900/50 border border-red-800 rounded">
          <h3 className="text-red-400 font-bold uppercase">c. Alto (Al menos un 'c')</h3>
          <div className="bg-red-950/50 text-red-200 text-xs p-2 mt-2 border-l-2 border-red-500">
            Si cataloga como C. Alto, no continúe inspección interna. Vaya al punto 6 y coloque Etiqueta Roja.
          </div>
          <ul className="text-xs text-gray-300 mt-2 list-disc list-inside ml-4">
            <li>Colapso: Posible, Parcial o Total</li>
            <li>Peligro geológico: Elevado</li>
            <li>Asentamiento: ˃ 20 cm</li>
            <li>Inclinación: Mayor que 2cm/60cm</li>
          </ul>
        </button>
      </div>
    </div>
  );

  const renderPisoCritico = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      <BackButton prevStep="EXTERNA" />
      <SectionHeader 
        title="3. PISO CRÍTICO Y DAÑO SEVERO" 
        helpText="Identifique el piso con mayor concentración de daños. Examine columnas, uniones, muros de carga. Cuente elementos con daño SEVERO o COMPLETO (Pandeo de barras, caída de concreto, grietas en X > 3mm)." 
      />

      <div className="space-y-3">
        <button onClick={() => { updateData({ piso_critico_riesgo: 'A' }); handleNext('MODERADO'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-green-400 font-bold uppercase">Sin Daño Severo/Completo (N=0)</h3>
          <p className="text-xs text-gray-300 mt-1">Continuar inspección al Punto 4.</p>
        </button>

        <button onClick={() => { updateData({ piso_critico_riesgo: 'C' }); handleNext('RESULT', 'ROJA'); }} className="w-full text-left p-4 bg-red-900/30 hover:bg-red-900/50 border border-red-800 rounded">
          <h3 className="text-red-400 font-bold uppercase">C. Alto (N ≥ 1 elemento severo)</h3>
          <div className="bg-red-950/50 text-red-200 text-xs p-2 mt-2 border-l-2 border-red-500">
            Si cataloga como C. Alto, no continúe inspección. Vaya al punto 6 y coloque Etiqueta Roja.
          </div>
        </button>
      </div>
    </div>
  );

  const renderModerado = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      <BackButton prevStep="PISO_CRITICO" />
      <SectionHeader 
        title="4. INSPECCIÓN DAÑO MODERADO" 
        helpText="Calcule el % de elementos con daño Moderado (Grietas 1-2mm en columnas/vigas, o agrietamiento diagonal incipiente en muros)." 
      />

      <div className="space-y-3">
        <button onClick={() => { updateData({ dano_moderado_riesgo: 'A' }); handleNext('NO_ESTRUCTURAL'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-green-400 font-bold uppercase">A. Bajo ( ‹ 10% )</h3>
          <p className="text-xs text-gray-300 mt-1">% de elementos con daño moderado es menor al 10%.</p>
        </button>
        <button onClick={() => { updateData({ dano_moderado_riesgo: 'B' }); handleNext('NO_ESTRUCTURAL'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-yellow-400 font-bold uppercase">B. Medio ( 10% - 30% )</h3>
          <p className="text-xs text-gray-300 mt-1">% de elementos con daño moderado varía entre 10% y 30%.</p>
        </button>
        <button onClick={() => { updateData({ dano_moderado_riesgo: 'C' }); handleNext('NO_ESTRUCTURAL'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-red-400 font-bold uppercase">C. Alto ( ˃ 30% )</h3>
          <p className="text-xs text-gray-300 mt-1">% de elementos con daño moderado es mayor al 30%.</p>
        </button>
      </div>
    </div>
  );

  const renderNoEstructural = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      <BackButton prevStep="MODERADO" />
      <SectionHeader 
        title="5. COMPONENTES NO ESTRUCTURALES" 
        helpText="Evaluar Paredes de relleno, escaleras, tanques, gas, electricidad. Riesgo de caída compromete la seguridad." 
      />

      <div className="space-y-3">
        <button onClick={() => { updateData({ no_estructural_riesgo: 'A' }); handleNext('RESULT'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-green-400 font-bold uppercase">A. Bajo (Sin daño)</h3>
          <p className="text-xs text-gray-300 mt-1">Grietas muy pequeñas ‹ 1mm de espesor en paredes.</p>
        </button>
        <button onClick={() => { updateData({ no_estructural_riesgo: 'B' }); handleNext('RESULT'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-yellow-400 font-bold uppercase">B. Medio (b ≥ 2)</h3>
          <p className="text-xs text-gray-300 mt-1">Grietas de varios mm/cm. Separación de pared. Fuga de gas reparable.</p>
        </button>
        <button onClick={() => { updateData({ no_estructural_riesgo: 'C' }); handleNext('RESULT'); }} className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded">
          <h3 className="text-red-400 font-bold uppercase">C. Alto (c ≥ 1)</h3>
          <p className="text-xs text-gray-300 mt-1">Derrumbe de paredes. Riesgo de colapso de escaleras/balcones.</p>
        </button>
      </div>
    </div>
  );

  const renderResult = () => {
    const finalTag = calculateFinalTag();
    return (
      <div className="p-4 animate-fade-in flex flex-col justify-center h-full">
        <BackButton prevStep="NO_ESTRUCTURAL" />
        <h2 className="text-xl font-bold text-white mb-6 text-center">6. RECOMENDACIÓN DE ACCESO</h2>
        
        {finalTag === 'VERDE' && (
          <div className="bg-green-600 p-6 border-2 border-green-800 flex flex-col h-64">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center">🇻🇪</div>
              <div className="text-right">
                <h1 className="text-3xl font-black text-white">HABITABLE</h1>
                <p className="text-white font-bold uppercase text-sm">ACCESO PERMITIDO</p>
              </div>
            </div>
            <div className="mt-auto text-xs text-white">Esta estructura ha sido inspeccionada y aparentemente no se han encontrado daños estructurales. NO REMUEVA, ALTERE O CUBRA ESTA ETIQUETA.</div>
          </div>
        )}
        
        {finalTag === 'AMARILLA' && (
          <div className="bg-yellow-400 p-6 border-2 border-yellow-600 flex flex-col h-64 text-black">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">🇻🇪</div>
              <div className="text-right">
                <h1 className="text-3xl font-black text-black">ATENCIÓN</h1>
                <p className="text-black font-bold uppercase text-sm">USO RESTRINGIDO</p>
              </div>
            </div>
            <div className="mt-auto text-xs font-medium">Esta estructura ha sido inspeccionada y se han encontrado daños. La entrada, ocupación y uso legal serán restringidos. NO REMUEVA ESTA ETIQUETA.</div>
          </div>
        )}

        {finalTag === 'ROJA' && (
          <div className="bg-red-600 p-6 border-2 border-red-800 flex flex-col h-64">
            <div className="flex justify-between items-start">
              <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center">🇻🇪</div>
              <div className="text-right">
                <h1 className="text-3xl font-black text-white">PELIGRO</h1>
                <p className="text-white font-bold uppercase text-sm">NO ENTRE NI OCUPE</p>
              </div>
            </div>
            <div className="mt-auto text-xs text-white font-medium">Esta estructura ha sido inspeccionada encontrándose daños severos y es insegura para ser ocupada. No entre. NO REMUEVA ESTA ETIQUETA.</div>
          </div>
        )}

        <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded mt-8">
          {isSubmitting ? 'Guardando Oficialmente...' : 'Guardar Evaluación Oficial'}
        </button>
      </div>
    );
  };

  const renderSubmitted = () => (
    <div className="p-6 text-center animate-fade-in flex flex-col justify-center items-center h-full">
      <div className="text-6xl mb-6">📝</div>
      <h2 className="text-2xl font-bold text-white mb-2">Planilla Guardada</h2>
      <p className="text-gray-400 text-sm mb-8">La Planilla de Evaluación Rápida ha sido enviada al servidor central.</p>
      <button onClick={() => window.location.reload()} className="text-blue-400 font-bold border border-blue-400 px-6 py-2 rounded">
        Siguiente Inspección
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#1e1e1e] text-gray-100 font-sans p-0 md:p-6 flex justify-center">
      <div className="w-full max-w-2xl bg-[#121212] md:rounded shadow-2xl overflow-hidden flex flex-col border border-gray-800">
        <div className="bg-black p-4 border-b border-gray-800 text-center">
          <h1 className="text-lg font-bold text-white uppercase">EVALUACIÓN RÁPIDA DE DAÑOS EN EDIFICACIONES</h1>
          <p className="text-xs text-gray-500">Formato Digital Adaptado - Metodología Oficial</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
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
