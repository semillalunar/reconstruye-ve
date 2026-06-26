"use client";
import { useState, useEffect } from 'react';
import { submitATC20Action, ATC20CompletaData } from '@/actions/submitATC20';

export default function PlanillaEvaluacionRapida() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [data, setData] = useState<Partial<ATC20CompletaData>>({
    inspector_nombre: '', inspector_cedula: '', direccion: '', nombre_edificacion: '',
    uso_predominante: 'Vivienda', numero_pisos: 1, material_predominante: 'Concreto',
    
    ext_colapso: 'no', ext_aledanos: 'no', ext_geologico: 'no', ext_asentamiento: 'no', ext_inclinacion: 'no',
    riesgo_externo: 'A',
    
    critico_acceso: 'Todos', critico_piso: 'Planta Baja', sev_columnas: 0, sev_muros_conc: 0, sev_muros_mamp: 0, sev_vigas: 0,
    piso_critico_riesgo: 'A',
    
    mod_tipo_elemento: 'Columnas', mod_examinados: 0, mod_danados: 0, dano_moderado_riesgo: 'A',
    
    noest_losas: 'bajo', noest_paredes: 'bajo', noest_tanques: 'bajo', noest_gas: 'bajo', noest_ascensores: 'bajo',
    no_estructural_riesgo: 'A',
    
    acciones_recomendadas: [], comentarios: ''
  });

  const updateData = (fields: Partial<ATC20CompletaData>) => setData(prev => ({ ...prev, ...fields }));

  // Auto-calcular riesgos cada vez que cambian los detalles
  useEffect(() => {
    let r_ext = 'A';
    if (['posible_total'].includes(data.ext_colapso!) || ['elevado'].includes(data.ext_geologico!) || ['mayor_20'].includes(data.ext_asentamiento!) || ['mayor_2'].includes(data.ext_inclinacion!)) {
      r_ext = 'C';
    } else if (['moderado'].includes(data.ext_aledanos!) || ['moderado'].includes(data.ext_geologico!) || ['hasta_20'].includes(data.ext_asentamiento!) || ['hasta_2'].includes(data.ext_inclinacion!)) {
      r_ext = 'B';
    }

    let r_critico = 'A';
    const totalSeveros = (data.sev_columnas||0) + (data.sev_muros_conc||0) + (data.sev_muros_mamp||0) + (data.sev_vigas||0);
    if (totalSeveros >= 1) r_critico = 'C';

    let r_mod = 'A';
    if (data.mod_examinados! > 0) {
      const pct = ((data.mod_danados||0) / (data.mod_examinados||1)) * 100;
      if (pct > 30) r_mod = 'C';
      else if (pct >= 10) r_mod = 'B';
    }

    let r_noest = 'A';
    const vals = [data.noest_losas, data.noest_paredes, data.noest_tanques, data.noest_gas, data.noest_ascensores];
    if (vals.includes('alto')) r_noest = 'C';
    else if (vals.filter(v => v === 'medio').length >= 2) r_noest = 'B'; // Regla simplificada b>=2

    updateData({
      riesgo_externo: r_ext, piso_critico_riesgo: r_critico, dano_moderado_riesgo: r_mod, no_estructural_riesgo: r_noest
    });
  }, [
    data.ext_colapso, data.ext_aledanos, data.ext_geologico, data.ext_asentamiento, data.ext_inclinacion,
    data.sev_columnas, data.sev_muros_conc, data.sev_muros_mamp, data.sev_vigas,
    data.mod_examinados, data.mod_danados,
    data.noest_losas, data.noest_paredes, data.noest_tanques, data.noest_gas, data.noest_ascensores
  ]);

  const calculateFinalTag = (): 'VERDE' | 'AMARILLA' | 'ROJA' => {
    const risks = [data.riesgo_externo, data.piso_critico_riesgo, data.dano_moderado_riesgo, data.no_estructural_riesgo];
    if (risks.includes('C')) return 'ROJA';
    if (risks.includes('B')) return 'AMARILLA';
    return 'VERDE';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const submitToServer = async (lat: number, lng: number) => {
      const finalData = { ...data, etiqueta_final: calculateFinalTag(), lat, lng } as ATC20CompletaData;
      const result = await submitATC20Action(finalData);
      if (result.success) setSubmitted(true);
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6">📝</div>
        <h2 className="text-2xl font-bold text-white mb-2">Planilla Guardada</h2>
        <p className="text-gray-400 text-sm mb-8">La evaluación ha sido enviada al servidor central.</p>
        <button onClick={() => window.location.reload()} className="bg-blue-600 text-white font-bold px-6 py-3 rounded">Siguiente Inspección</button>
      </div>
    );
  }

  const finalTag = calculateFinalTag();

  return (
    <main className="min-h-screen bg-gray-100 text-black font-sans py-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white shadow-2xl border border-gray-300">
        
        {/* ENCABEZADO */}
        <div className="bg-black text-white p-4 flex justify-between items-center">
          <h1 className="font-bold text-lg">EVALUACIÓN RÁPIDA DE DAÑOS EN EDIFICACIONES</h1>
          <span className="text-xs bg-yellow-500 text-black px-2 py-1 font-bold">PLANILLA OFICIAL DIGITAL</span>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* 1. INFORMACIÓN GENERAL */}
          <section>
            <h2 className="bg-gray-800 text-white font-bold px-3 py-1 mb-4">1. INFORMACIÓN GENERAL</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold uppercase block">Nombre del Inspector</label>
                <input required type="text" className="w-full border-b border-gray-400 p-1 bg-gray-50 focus:bg-yellow-50 outline-none" value={data.inspector_nombre} onChange={e => updateData({ inspector_nombre: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase block">Cédula de Identidad / CIV</label>
                <input required type="text" className="w-full border-b border-gray-400 p-1 bg-gray-50 focus:bg-yellow-50 outline-none" value={data.inspector_cedula} onChange={e => updateData({ inspector_cedula: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase block">Nombre de la Edificación</label>
                <input type="text" className="w-full border-b border-gray-400 p-1 bg-gray-50 focus:bg-yellow-50 outline-none" value={data.nombre_edificacion} onChange={e => updateData({ nombre_edificacion: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase block">Sector/Calle/Ciudad</label>
                <input type="text" className="w-full border-b border-gray-400 p-1 bg-gray-50 focus:bg-yellow-50 outline-none" value={data.direccion} onChange={e => updateData({ direccion: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase block">Uso predominante</label>
                <select className="w-full border border-gray-400 p-1" value={data.uso_predominante} onChange={e => updateData({ uso_predominante: e.target.value })}>
                  <option>Vivienda</option><option>Comercio/Oficina</option><option>Gubernamental</option>
                  <option>Educativo</option><option>Médico/Asistencial</option><option>Seguridad</option><option>Religioso</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase block">Nº de Pisos</label>
                <input type="number" min="1" className="w-full border border-gray-400 p-1 text-center" value={data.numero_pisos} onChange={e => updateData({ numero_pisos: parseInt(e.target.value)||1 })} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase block">Estructura</label>
                <select className="w-full border border-gray-400 p-1" value={data.material_predominante} onChange={e => updateData({ material_predominante: e.target.value })}>
                  <option>Concreto</option><option>Acero</option><option>Mampostería formal</option><option>Mampostería informal</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. INSPECCIÓN EXTERNA */}
          <section>
            <div className="flex justify-between items-center bg-gray-800 px-3 py-1 mb-2">
              <h2 className="text-white font-bold">2. INSPECCIÓN EXTERNA (calificar sin ingresar a la edificación)</h2>
              <span className="text-yellow-400 font-mono text-sm font-bold">Riesgo Calculado: {data.riesgo_externo}</span>
            </div>
            <table className="w-full text-sm border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr><th className="border border-gray-400 p-1 text-left">Aspectos revisados</th><th className="border border-gray-400 p-1 w-24">a. Bajo</th><th className="border border-gray-400 p-1 w-32">b. Medio</th><th className="border border-gray-400 p-1 w-40">c. Alto</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Colapso de la estructura</td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="col" checked={data.ext_colapso==='no'} onChange={()=>updateData({ext_colapso:'no'})} /> No</label></td>
                  <td className="border border-gray-400 p-2 text-center bg-gray-100"></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="col" checked={data.ext_colapso==='posible_total'} onChange={()=>updateData({ext_colapso:'posible_total'})} /> Parcial/Total</label></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Peligro por edificios aledaños</td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="ale" checked={data.ext_aledanos==='no'} onChange={()=>updateData({ext_aledanos:'no'})} /> No</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="ale" checked={data.ext_aledanos==='moderado'} onChange={()=>updateData({ext_aledanos:'moderado'})} /> Moderado</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="ale" checked={data.ext_aledanos==='elevado'} onChange={()=>updateData({ext_aledanos:'elevado'})} /> Elevado</label></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Peligro geológico o geotécnico</td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="geo" checked={data.ext_geologico==='no'} onChange={()=>updateData({ext_geologico:'no'})} /> No</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="geo" checked={data.ext_geologico==='moderado'} onChange={()=>updateData({ext_geologico:'moderado'})} /> Moderado</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="geo" checked={data.ext_geologico==='elevado'} onChange={()=>updateData({ext_geologico:'elevado'})} /> Elevado</label></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Asentamiento del edificio</td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="ase" checked={data.ext_asentamiento==='no'} onChange={()=>updateData({ext_asentamiento:'no'})} /> No</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="ase" checked={data.ext_asentamiento==='hasta_20'} onChange={()=>updateData({ext_asentamiento:'hasta_20'})} /> Hasta 20 cm</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="ase" checked={data.ext_asentamiento==='mayor_20'} onChange={()=>updateData({ext_asentamiento:'mayor_20'})} /> &gt; 20 cm</label></td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 font-bold">Inclinación del edificio</td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="inc" checked={data.ext_inclinacion==='no'} onChange={()=>updateData({ext_inclinacion:'no'})} /> No</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="inc" checked={data.ext_inclinacion==='hasta_2'} onChange={()=>updateData({ext_inclinacion:'hasta_2'})} /> Hasta 2cm/60cm</label></td>
                  <td className="border border-gray-400 p-2 text-center"><label><input type="radio" name="inc" checked={data.ext_inclinacion==='mayor_2'} onChange={()=>updateData({ext_inclinacion:'mayor_2'})} /> &gt; 2cm/60cm</label></td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 3. PISO CRÍTICO */}
          <section>
            <div className="flex justify-between items-center bg-gray-800 px-3 py-1 mb-2">
              <h2 className="text-white font-bold uppercase">3. PISO CRÍTICO Y ELEMENTOS PRINCIPALES CON DAÑO SEVERO/COMPLETO</h2>
              <span className="text-yellow-400 font-mono text-sm font-bold">Riesgo Calculado: {data.piso_critico_riesgo}</span>
            </div>
            <div className="flex gap-4 text-sm mb-2 border border-gray-400 p-2">
              <div className="flex-1">
                <label className="font-bold mr-2">Pisos Inspeccionados:</label>
                <select className="border border-gray-400 p-1" value={data.critico_acceso} onChange={e=>updateData({critico_acceso:e.target.value})}>
                  <option>Todos</option><option>Casi todos</option><option>Pocos</option><option>Ninguno</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="font-bold mr-2">Piso Crítico detectado:</label>
                <input type="text" className="border-b border-gray-400 outline-none" placeholder="Ej: Planta Baja" value={data.critico_piso} onChange={e=>updateData({critico_piso:e.target.value})} />
              </div>
            </div>
            <table className="w-full text-sm border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr><th className="border border-gray-400 p-1 text-left" colSpan={4}>Nº de elementos con daño Severo/Completo (N) en piso crítico</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2 text-center"><label className="block text-xs uppercase mb-1">Columnas</label><input type="number" min="0" className="w-16 border border-gray-400 text-center" value={data.sev_columnas} onChange={e=>updateData({sev_columnas:parseInt(e.target.value)||0})} /></td>
                  <td className="border border-gray-400 p-2 text-center"><label className="block text-xs uppercase mb-1">Muro Conc.</label><input type="number" min="0" className="w-16 border border-gray-400 text-center" value={data.sev_muros_conc} onChange={e=>updateData({sev_muros_conc:parseInt(e.target.value)||0})} /></td>
                  <td className="border border-gray-400 p-2 text-center"><label className="block text-xs uppercase mb-1">Muro Mamp.</label><input type="number" min="0" className="w-16 border border-gray-400 text-center" value={data.sev_muros_mamp} onChange={e=>updateData({sev_muros_mamp:parseInt(e.target.value)||0})} /></td>
                  <td className="border border-gray-400 p-2 text-center"><label className="block text-xs uppercase mb-1">Vigas/Arriost.</label><input type="number" min="0" className="w-16 border border-gray-400 text-center" value={data.sev_vigas} onChange={e=>updateData({sev_vigas:parseInt(e.target.value)||0})} /></td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 4. DAÑO MODERADO */}
          <section>
            <div className="flex justify-between items-center bg-gray-800 px-3 py-1 mb-2">
              <h2 className="text-white font-bold uppercase">4. INSPECCIÓN DAÑO MODERADO EN EL PISO CRÍTICO</h2>
              <span className="text-yellow-400 font-mono text-sm font-bold">Riesgo Calculado: {data.dano_moderado_riesgo}</span>
            </div>
            <table className="w-full text-sm border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr><th className="border border-gray-400 p-1">Tipo de Elemento (más dañado)</th><th className="border border-gray-400 p-1 w-32">Nº Total Examinados</th><th className="border border-gray-400 p-1 w-32">Nº con Daño Moderado</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-400 p-2">
                    <select className="w-full border border-gray-400 p-1" value={data.mod_tipo_elemento} onChange={e=>updateData({mod_tipo_elemento:e.target.value})}>
                      <option>Columnas</option><option>Muros de Concreto</option><option>Muros Mampostería</option><option>Vigas</option>
                    </select>
                  </td>
                  <td className="border border-gray-400 p-2 text-center"><input type="number" min="0" className="w-16 border border-gray-400 text-center" value={data.mod_examinados} onChange={e=>updateData({mod_examinados:parseInt(e.target.value)||0})} /></td>
                  <td className="border border-gray-400 p-2 text-center"><input type="number" min="0" className="w-16 border border-gray-400 text-center" value={data.mod_danados} onChange={e=>updateData({mod_danados:parseInt(e.target.value)||0})} /></td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 5. NO ESTRUCTURAL */}
          <section>
            <div className="flex justify-between items-center bg-gray-800 px-3 py-1 mb-2">
              <h2 className="text-white font-bold uppercase">5. OTROS ELEMENTOS NO ESTRUCTURALES</h2>
              <span className="text-yellow-400 font-mono text-sm font-bold">Riesgo Calculado: {data.no_estructural_riesgo}</span>
            </div>
            <table className="w-full text-sm border-collapse border border-gray-400">
              <thead className="bg-gray-200">
                <tr><th className="border border-gray-400 p-1 text-left">Componente</th><th className="border border-gray-400 p-1 w-24">a. Bajo</th><th className="border border-gray-400 p-1 w-32">b. Medio</th><th className="border border-gray-400 p-1 w-32">c. Alto</th></tr>
              </thead>
              <tbody>
                {['losas', 'paredes', 'tanques', 'gas', 'ascensores'].map((item, idx) => (
                  <tr key={item}>
                    <td className="border border-gray-400 p-2 font-bold capitalize">{item}</td>
                    <td className="border border-gray-400 p-2 text-center"><input type="radio" name={item} checked={(data as any)[`noest_${item}`]==='bajo'} onChange={()=>updateData({[`noest_${item}`]:'bajo'})} /></td>
                    <td className="border border-gray-400 p-2 text-center"><input type="radio" name={item} checked={(data as any)[`noest_${item}`]==='medio'} onChange={()=>updateData({[`noest_${item}`]:'medio'})} /></td>
                    <td className="border border-gray-400 p-2 text-center"><input type="radio" name={item} checked={(data as any)[`noest_${item}`]==='alto'} onChange={()=>updateData({[`noest_${item}`]:'alto'})} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 7. COMENTARIOS (NUEVO) */}
          <section>
            <h2 className="bg-gray-800 text-white font-bold px-3 py-1 mb-2">7. ANOTACIONES Y OBSERVACIONES DEL INSPECTOR</h2>
            <textarea 
              className="w-full border border-gray-400 p-3 h-24 font-mono text-sm outline-none focus:border-blue-500 bg-yellow-50/30" 
              placeholder="Escriba observaciones adicionales, croquis mental o justificaciones de la decisión..."
              value={data.comentarios} onChange={e=>updateData({comentarios: e.target.value})}
            ></textarea>
          </section>

          {/* 6. RESULTADO FINAL */}
          <section className="bg-gray-100 border-4 border-gray-800 p-6 flex items-center justify-between shadow-inner">
            <div>
              <h2 className="text-xl font-bold uppercase mb-1">6. RECOMENDACIÓN DE ACCESO</h2>
              <p className="text-xs text-gray-500 max-w-sm">Calculado según el riesgo más desfavorable de los puntos 2, 3, 4 y 5. Al guardar, se fijará la coordenada GPS.</p>
            </div>
            
            <div className={`border-4 w-64 p-4 text-center ${finalTag==='VERDE'?'bg-green-500 border-green-800':finalTag==='AMARILLA'?'bg-yellow-400 border-yellow-600':'bg-red-600 border-red-900 text-white'}`}>
              <h1 className="text-2xl font-black tracking-widest">{finalTag}</h1>
              <p className="text-xs font-bold">{finalTag==='VERDE'?'ACCESO PERMITIDO':finalTag==='AMARILLA'?'ACCESO RESTRINGIDO':'NO ENTRE NI OCUPE'}</p>
            </div>
          </section>

          {/* SUBMIT */}
          <button type="submit" disabled={isSubmitting || !data.inspector_cedula} className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-6 text-xl tracking-wider disabled:opacity-50 transition-colors shadow-lg">
            {isSubmitting ? 'Firmando y Guardando (GPS)...' : 'FIRMADO: GUARDAR PLANILLA OFICIAL'}
          </button>
        </form>
      </div>
    </main>
  );
}
