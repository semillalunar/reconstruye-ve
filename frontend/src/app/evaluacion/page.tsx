"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Camera } from 'lucide-react';

const Td = ({ children, className = "", colSpan, rowSpan, onClick, onDoubleClick }: any) => (
  <td onClick={onClick} onDoubleClick={onDoubleClick} colSpan={colSpan} rowSpan={rowSpan} className={`border border-black px-1 py-0.5 text-[10px] sm:text-[11px] align-top leading-tight ${className}`}>
    {children}
  </td>
);

const Th = ({ children, className = "", colSpan, rowSpan }: any) => (
  <th colSpan={colSpan} rowSpan={rowSpan} className={`border border-black px-1 py-0.5 text-[11px] sm:text-xs font-bold align-middle text-center bg-gray-200 uppercase tracking-tight ${className}`}>
    {children}
  </th>
);

const Input = ({ type = "text", placeholder = "", value, onChange, className = "", onDoubleClick }: any) => {
  if (type === 'checkbox') {
    return (
      <input
        type="checkbox"
        className={`accent-black w-3 h-3 m-0 p-0 cursor-pointer block ${className}`}
        checked={value}
        onChange={onChange}
      />
    );
  }
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onDoubleClick={onDoubleClick}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none focus:bg-yellow-100 placeholder-gray-300 ${className}`}
    />
  );
};

// Componente especial para la sección 8, permite escribir números o hacer doble clic para un ✓ automático
const DualInput = ({ value, onChange }: any) => {
  return (
    <Input 
      type="text" 
      className="text-center w-full h-full p-1 cursor-text" 
      value={value || ''} 
      onChange={(e:any) => onChange(e.target.value)} 
      onDoubleClick={() => onChange('✓')}
      placeholder="doble clic = ✓"
    />
  );
};

const CheckboxRow = ({ label, className = "" }: any) => (
  <table className={`w-full border-collapse ${className}`}>
    <tbody>
      <tr>
        <td className="px-1 text-left text-[10px] sm:text-[11px] align-middle">{label}</td>
        <td className="w-4 px-1 align-middle text-center border-l border-transparent"><Input type="checkbox" /></td>
      </tr>
    </tbody>
  </table>
);

// COMPONENTE DE DIBUJO PARA EL CROQUIS
const DrawingCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Configurar el contexto del canvas para que el trazo sea visible y suave
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
      }
    }
  }, []);

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Soportar mouse y touch
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return null;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    // Evitar scroll en móviles cuando se dibuja
    if (e.touches) e.preventDefault(); 
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      setIsDrawing(true);
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    if (e.touches) e.preventDefault();

    const coords = getCoordinates(e);
    if (!coords) return;

    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="relative w-full h-40">
      {/* El fondo de cuadrícula con CSS */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
      
      {/* El lienzo interactivo */}
      <canvas 
        ref={canvasRef}
        width={850} 
        height={160}
        className="absolute inset-0 z-10 w-full h-full cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      
      {/* Botón flotante para limpiar */}
      <button type="button" onClick={clearCanvas} className="absolute top-2 right-2 z-20 bg-white border border-gray-400 text-black text-[9px] px-2 py-1 rounded shadow-sm print:hidden hover:bg-gray-100 font-bold">
        Borrar Croquis
      </button>
    </div>
  );
};


export default function PlanillaOficialLimpia() {
  const [data, setData] = useState<any>({});
  const update = (key: string, val: any) => setData((prev: any) => ({ ...prev, [key]: val }));

  return (
    <main className="min-h-screen bg-neutral-300 py-8 flex flex-col items-center font-sans text-black select-none">
      
      <div className="fixed bottom-4 right-4 z-50">
        <button className="bg-blue-700 text-white font-bold px-6 py-3 rounded-full shadow-2xl hover:bg-blue-800 print:hidden text-sm">
          FIRMADO: ENVIAR
        </button>
      </div>

      {/* =========================================
          PÁGINA 1
          ========================================= */}
      <div className="w-full max-w-[850px] bg-white shadow-2xl p-4 sm:p-8 flex flex-col mb-8 print:shadow-none print:mb-0">
        
        {/* ENCABEZADO */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col border-r border-black pr-3">
              <div className="font-black text-[10px] bg-black text-white px-1.5 py-0.5 mb-0.5 inline-block w-max tracking-wide">
                INICIATIVA CIUDADANA
              </div>
              <div className="font-bold text-[8px] uppercase leading-tight text-gray-800">
                Digitalizado y Codificado<br/>Versión de Código Abierto
              </div>
            </div>
            <div className="leading-none">
              <div className="font-bold text-xs">Formato Basado en</div>
              <div className="font-bold text-xs">Planilla ATC-20</div>
            </div>
          </div>
          <div className="text-[10px] text-center border-l border-r border-black px-2 mx-2 leading-tight font-serif italic flex-1">
            Ministerio del Poder Popular<br/>para Relaciones Interiores, Justicia y Paz
          </div>
          <div className="text-[10px] leading-tight font-serif italic text-right">
            Fundación Venezolana<br/>de Investigaciones Sismológicas (Funvisis)
          </div>
        </div>

        <div className="border border-black text-center font-bold text-sm mb-1 bg-gray-100 uppercase py-0.5 shadow-sm">
          Instrumento para Inspección de Edificaciones Afectadas por Sismos
        </div>

        {/* TABLA MASTER PAG 1 */}
        <table className="w-full border-collapse border-2 border-black table-fixed bg-white">
          <tbody>
            
            {/* 1. DATOS DE LOS INSPECTORES */}
            <tr><Th colSpan={6}>1. DATOS DE LOS INSPECTORES</Th></tr>
            <tr className="bg-gray-100 font-bold text-center">
              <Td className="w-1/6">Función</Td>
              <Td className="w-2/6">Nombre y Apellido</Td>
              <Td className="w-1/6">Cédula</Td>
              <Td className="w-1/6">Profesión</Td>
              <Td className="w-1/6">Teléfono</Td>
              <Td className="w-1/6">Correo Electrónico</Td>
            </tr>
            {['Inspector', 'Inspector', 'Supervisor'].map((func, i) => (
              <tr key={i}>
                <Td className="font-bold bg-gray-50 text-center">{func}</Td>
                <Td><Input /></Td>
                <Td><Input /></Td>
                <Td><Input /></Td>
                <Td><Input /></Td>
                <Td><Input /></Td>
              </tr>
            ))}

            {/* 2. DATOS GENERALES */}
            <tr><Th colSpan={6}>2. DATOS GENERALES</Th></tr>
            <tr>
              <Td colSpan={4}><div className="flex items-center"><span className="w-16 whitespace-nowrap font-bold">Nombre:</span> <Input className="border-b border-black border-dashed mx-1" /></div></Td>
              <Td colSpan={2}><div className="flex items-center"><span className="w-20 whitespace-nowrap font-bold">Hora Inicio:</span> <Input type="time" className="border-b border-black border-dashed mx-1" /></div></Td>
            </tr>
            <tr>
              <Td colSpan={2}><div className="flex items-center"><span className="w-12 whitespace-nowrap font-bold">Fecha:</span> <Input type="date" className="border-b border-black border-dashed mx-1" /></div></Td>
              <Td colSpan={2}><div className="flex items-center"><span className="w-20 whitespace-nowrap font-bold">Nº Pisos:</span> <Input type="number" className="border-b border-black border-dashed mx-1" /></div></Td>
              <Td colSpan={2}><div className="flex items-center"><span className="w-24 whitespace-nowrap font-bold">Nº Semisótanos:</span> <Input type="number" className="border-b border-black border-dashed mx-1" /></div></Td>
            </tr>
            <tr>
              <Td colSpan={2}><div className="flex items-center"><span className="w-14 whitespace-nowrap font-bold">Estado:</span> <Input className="border-b border-black border-dashed mx-1" /></div></Td>
              <Td colSpan={2}><div className="flex items-center"><span className="w-14 whitespace-nowrap font-bold">Ciudad:</span> <Input className="border-b border-black border-dashed mx-1" /></div></Td>
              <Td colSpan={2}><div className="flex items-center"><span className="w-16 whitespace-nowrap font-bold">Municipio:</span> <Input className="border-b border-black border-dashed mx-1" /></div></Td>
            </tr>
            <tr>
              <Td colSpan={2}><div className="flex items-center"><span className="w-10 whitespace-nowrap font-bold">Urb:</span> <Input className="border-b border-black border-dashed mx-1" /></div></Td>
              <Td colSpan={2}><div className="flex items-center"><span className="w-12 whitespace-nowrap font-bold">Sector:</span> <Input className="border-b border-black border-dashed mx-1" /></div></Td>
              <Td colSpan={2}><div className="flex items-center"><span className="w-20 whitespace-nowrap font-bold">Ave, Calle:</span> <Input className="border-b border-black border-dashed mx-1" /></div></Td>
            </tr>

            {/* 3. USO DE LA EDIFICACION */}
            <tr><Th colSpan={6}>3. USO DE LA EDIFICACIÓN</Th></tr>
            <tr>
              <Td colSpan={6} className="p-0 border-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-1/4 border-r border-b border-black p-0"><CheckboxRow label="Gubernamental" /></td>
                      <td className="w-1/4 border-r border-b border-black p-0"><CheckboxRow label="Militar" /></td>
                      <td className="w-1/4 border-r border-b border-black p-0"><CheckboxRow label="Médico-Asistencial" /></td>
                      <td className="w-1/4 border-b border-black p-0"><CheckboxRow label="Industrial" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-b border-black p-0"><CheckboxRow label="Bomberos" /></td>
                      <td className="border-r border-b border-black p-0"><CheckboxRow label="Vivienda Popular" /></td>
                      <td className="border-r border-b border-black p-0"><CheckboxRow label="Educativo" /></td>
                      <td className="border-b border-black p-0"><CheckboxRow label="Comercial" /></td>
                    </tr>
                    <tr>
                      <td className="border-r border-black p-0"><CheckboxRow label="Protección Civil" /></td>
                      <td className="border-r border-black p-0"><CheckboxRow label="Vivienda Multifamiliar" /></td>
                      <td className="border-r border-black p-0"><CheckboxRow label="Deportivo-Recreativo" /></td>
                      <td className="p-0"><CheckboxRow label="Oficina" /></td>
                    </tr>
                  </tbody>
                </table>
              </Td>
            </tr>

            {/* 4. TIPO ESTRUCTURAL */}
            <tr><Th colSpan={6}>4. TIPO ESTRUCTURAL</Th></tr>
            <tr>
              <Td colSpan={6} className="p-0 border-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 font-bold text-center border-b border-black">
                      <td className="w-1/4 border-r border-black py-0.5 text-[10px]">CONCRETO ARMADO</td>
                      <td className="w-1/4 border-r border-black py-0.5 text-[10px]">ACERO</td>
                      <td className="w-1/4 border-r border-black py-0.5 text-[10px]">MAMPOSTERÍA</td>
                      <td className="w-1/4 py-0.5 text-[10px]">OTROS</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-r border-black align-top p-0">
                        <CheckboxRow label="Pórticos" />
                        <CheckboxRow label="Muros" />
                        <CheckboxRow label="Prefabricados" />
                      </td>
                      <td className="border-r border-black align-top p-0">
                        <CheckboxRow label="Pórticos arriostrados" />
                        <CheckboxRow label="Pórticos no arriostrados" />
                        <div className="text-center underline font-bold mt-1 text-[10px]">Conexiones</div>
                        <CheckboxRow label="Apernadas" />
                        <CheckboxRow label="Soldadas" />
                      </td>
                      <td className="border-r border-black align-top p-0">
                        <CheckboxRow label="Confinada" />
                        <CheckboxRow label="No confinada" />
                        <div className="text-center text-[9px] mt-1 px-1 leading-tight border-t border-black pt-1 bg-gray-50 h-full">Sistemas mixtos de pórticos de baja calidad</div>
                      </td>
                      <td className="align-top p-0">
                        <CheckboxRow label="Construcción precaria" />
                        <CheckboxRow label="Bahareque" />
                        <div className="mt-2 px-1 text-[10px]">Otros (Especifique): <Input className="border-b border-black mt-1" /></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Td>
            </tr>

            {/* 5. INSPECCION EXTERNA */}
            <tr><Th colSpan={6}>5. INSPECCIÓN EXTERNA SIN ACCESAR A LA EDIFICACIÓN</Th></tr>
            <tr>
              <Td colSpan={6} className="p-0 border-0">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 font-bold text-center border-b border-black">
                      <td className="w-5/12 border-r border-black py-0.5">Clasificación</td>
                      <td className="w-[19%] border-r border-black py-0.5">a</td>
                      <td className="w-[19%] border-r border-black py-0.5">b</td>
                      <td className="w-[19%] py-0.5">c</td>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Colapso de la estructura', 'No', 'Parcial', 'Total'],
                      ['Riesgo de edificios aledaños', 'No', 'Moderado', 'Elevado'],
                      ['Amenaza geológica', 'No', 'Moderada', 'Elevada'],
                      ['Asentamiento del edificio', '< 0,2 m', '0,2 m - 1 m', '> 1 m'],
                      ['Inclinación del edificio', '< 1 cm / 60 cm', '1/60 - 2/60', '> 2 cm / 60 cm']
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-black">
                        <td className="border-r border-black py-1 px-2 text-right font-bold text-[10px]">{row[0]}</td>
                        <td className="border-r border-black p-0"><CheckboxRow label={row[1]} /></td>
                        <td className="border-r border-black p-0"><CheckboxRow label={row[2]} /></td>
                        <td className="p-0"><CheckboxRow label={row[3]} /></td>
                      </tr>
                    ))}
                    
                    {/* 5.1 Nivel Riesgo Externo */}
                    <tr className="border-b border-black bg-gray-200">
                      <td colSpan={4} className="text-center font-bold text-[10px] py-0.5">5.1 NIVEL DE RIESGO EXTERNO</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="p-0">
                        <table className="w-full border-collapse">
                          <tbody>
                            <tr>
                              <td className="w-1/3 p-0"><CheckboxRow label="A (todos a)" className="font-bold" /></td>
                              <td className="w-1/3 p-0"><CheckboxRow label="B (b≥1)" className="font-bold" /></td>
                              <td className="w-1/3 p-0"><CheckboxRow label="C (c≥1)" className="font-bold" /></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Td>
            </tr>

            {/* 6. REQUIERE INTERNA & 7. CROQUIS */}
            <tr>
              <Td colSpan={6} className="p-0">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-black">
                      <td className="w-1/2 font-bold bg-gray-100 border-r border-black py-1 px-2 text-center text-[10px]">
                        6. ¿SE REQUIERE INSPECCIÓN INTERNA?
                      </td>
                      <td className="w-1/2 p-0">
                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td className="w-1/2 p-0 border-r border-gray-300"><CheckboxRow label="Si" className="font-bold pl-4" /></td>
                              <td className="w-1/2 p-0"><CheckboxRow label="No" className="font-bold pl-4" /></td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div className="bg-gray-200 text-center font-bold p-1 text-[11px] border-b border-black">
                  7. CROQUIS DE PLANTA (Piso Crítico)
                </div>
                {/* Lógica de Canvas interactivo */}
                <DrawingCanvas />
              </Td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* =========================================
          PÁGINA 2
          ========================================= */}
      <div className="w-full max-w-[850px] bg-white shadow-2xl p-4 sm:p-8 flex flex-col mb-24 print:shadow-none print:mt-0 page-break-before-always">
        
        {/* ENCABEZADO SIMPLIFICADO PAG 2 */}
        <div className="flex justify-between items-center mb-2">
           <div className="flex items-center gap-2">
            <div className="font-black text-[8px] bg-black text-white px-1 py-0.5 tracking-wide">
              INICIATIVA CIUDADANA
            </div>
            <div className="font-bold text-[10px] leading-tight border-l border-black pl-2">
              Digitalizado y Codificado
            </div>
          </div>
          <div className="text-[10px] font-serif italic text-right">Fundación Venezolana de Investigaciones Sismológicas</div>
        </div>

        {/* TABLA MASTER PAG 2 */}
        <table className="w-full border-collapse border-2 border-black table-fixed bg-white">
          <tbody>
            
            {/* 8. INSPECCIÓN INTERNA */}
            <tr><Th colSpan={10}>8. INSPECCIÓN INTERNA</Th></tr>
            <tr className="text-center font-bold bg-gray-100 text-[10px] leading-tight">
              <td className="border border-black w-[15%]" rowSpan={2}>Elemento Estructural</td>
              <td className="border border-black" colSpan={5}>Número de Elementos en el Piso Crítico<br/><span className="text-[8px] font-normal italic">Doble clic para auto-marcar (✓)</span></td>
              <td className="border border-black w-[8%]" rowSpan={2}>Total<br/>Elementos</td>
              <td className="border border-black" colSpan={3}>Porcentaje de daños</td>
            </tr>
            <tr className="text-center font-bold bg-gray-100 text-[10px]">
              <td className="border border-black w-[9%]">Sin daño<br/>(I)</td>
              <td className="border border-black w-[9%]">Leve<br/>(II)</td>
              <td className="border border-black w-[9%]">Moderado<br/>(III)</td>
              <td className="border border-black w-[9%]">Severo<br/>(IV)</td>
              <td className="border border-black w-[9%]">Completo<br/>(V)</td>
              <td className="border border-black w-[8%]">% con III</td>
              <td className="border border-black w-[8%]">% con IV</td>
              <td className="border border-black w-[8%]">% con V</td>
            </tr>
            {['Columna', 'Viga', 'Muro', 'Nodo / conexión', 'Losa', 'Mampostería'].map((el, i) => (
              <tr key={i} className="text-center">
                <td className="border border-black font-bold text-left px-1">{el}</td>
                <td className="border border-black p-0"><DualInput value={data[`${i}_1`]} onChange={(v:any)=>update(`${i}_1`,v)} /></td>
                <td className="border border-black p-0"><DualInput value={data[`${i}_2`]} onChange={(v:any)=>update(`${i}_2`,v)} /></td>
                <td className="border border-black p-0"><DualInput value={data[`${i}_3`]} onChange={(v:any)=>update(`${i}_3`,v)} /></td>
                <td className="border border-black p-0"><DualInput value={data[`${i}_4`]} onChange={(v:any)=>update(`${i}_4`,v)} /></td>
                <td className="border border-black p-0"><DualInput value={data[`${i}_5`]} onChange={(v:any)=>update(`${i}_5`,v)} /></td>
                <td className="border border-black bg-gray-50 p-0"><Input className="text-center w-full h-full p-1" /></td>
                <td className="border border-black bg-gray-50 p-0"><Input className="text-center w-full h-full p-1" /></td>
                <td className="border border-black bg-gray-50 p-0"><Input className="text-center w-full h-full p-1" /></td>
                <td className="border border-black bg-gray-50 p-0"><Input className="text-center w-full h-full p-1" /></td>
              </tr>
            ))}

            {/* 9. DAÑOS ESTRUCTURALES */}
            <tr><Th colSpan={10}>9. DAÑOS EN ELEMENTOS ESTRUCTURALES</Th></tr>
            <tr className="text-center bg-gray-100 font-bold text-[10px]">
              <td colSpan={4} className="border border-black">Porcentajes de daños</td>
              <td colSpan={2} className="border border-black">a</td>
              <td colSpan={2} className="border border-black">b</td>
              <td colSpan={2} className="border border-black">c</td>
            </tr>
            {[
              ['Porcentaje de daño III', '< 30%', '30-60%', '> 60%'],
              ['Porcentaje de daño IV', '< 10%', '10-30%', '> 30%'],
              ['Porcentaje de daño V', '< 1%', '1-10%', '> 10%']
            ].map((row, i) => (
              <tr key={i} className="text-center">
                <td colSpan={4} className="border border-black font-bold text-right pr-2">{row[0]}</td>
                <td colSpan={2} className="border border-black p-0"><CheckboxRow label={row[1]} /></td>
                <td colSpan={2} className="border border-black p-0"><CheckboxRow label={row[2]} /></td>
                <td colSpan={2} className="border border-black p-0"><CheckboxRow label={row[3]} /></td>
              </tr>
            ))}
            <tr>
              <td colSpan={10} className="p-0 border-0">
                <div className="bg-gray-200 border-b border-black text-center font-bold text-[10px] py-0.5">9.1 NIVEL DE RIESGO EN LA ESTRUCTURA</div>
                <table className="w-full border-collapse border-b border-black">
                  <tbody>
                    <tr>
                      <td className="w-1/3 p-0"><CheckboxRow label="A (todos a)" className="font-bold" /></td>
                      <td className="w-1/3 p-0"><CheckboxRow label="B (b=1 y c=0)" className="font-bold" /></td>
                      <td className="w-1/3 p-0"><CheckboxRow label="C (b≥2 o c≥1)" className="font-bold" /></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* 10. NO ESTRUCTURALES */}
            <tr><Th colSpan={10}>10. DAÑOS EN ELEMENTOS NO ESTRUCTURALES</Th></tr>
            <tr className="text-center bg-gray-100 font-bold text-[10px]">
              <td colSpan={4} className="border border-black">Elementos</td>
              <td colSpan={2} className="border border-black">a</td>
              <td colSpan={2} className="border border-black">b</td>
              <td colSpan={2} className="border border-black">c</td>
            </tr>
            {[
              ['Paredes / tabiquería', 'Sin o poco daño', 'Grietas, separación', 'Peligro de caída'],
              ['Escaleras', 'Sin o poco daño', 'Grietas extendidas', 'Peligro de caída'],
              ['Tanques / balcones', 'Sin o poco daño', 'Deformación visible', 'Peligro de caída'],
              ['Fachada / cielo raso', 'Sin o poco daño', 'Grietas, deformación', 'Peligro de caída']
            ].map((row, i) => (
              <tr key={i} className="text-center text-[10px]">
                <td colSpan={4} className="border border-black font-bold text-right pr-2">{row[0]}</td>
                <td colSpan={2} className="border border-black p-0"><CheckboxRow label={row[1]} /></td>
                <td colSpan={2} className="border border-black p-0"><CheckboxRow label={row[2]} /></td>
                <td colSpan={2} className="border border-black p-0"><CheckboxRow label={row[3]} /></td>
              </tr>
            ))}
             <tr>
              <td colSpan={10} className="p-0 border-0">
                <div className="bg-gray-200 border-b border-black text-center font-bold text-[10px] py-0.5">10.1 NIVEL DE RIESGO EN ELEMENTOS NO ESTRUCTURALES</div>
                <table className="w-full border-collapse border-b border-black">
                  <tbody>
                    <tr>
                      <td className="w-1/3 p-0"><CheckboxRow label="A (todos a o b≤2)" className="font-bold" /></td>
                      <td className="w-1/3 p-0"><CheckboxRow label="B (b≥3)" className="font-bold" /></td>
                      <td className="w-1/3 p-0"><CheckboxRow label="C (c≥1)" className="font-bold" /></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* 11. DECISION FINAL */}
            <tr>
              <Th colSpan={10}>
                11. DECISIÓN FINAL<br/>
                <span className="text-[9px] font-normal tracking-normal">(tomar el nivel de riesgo más desfavorable entre los puntos 5.1, 9.1 y 10.1)</span>
              </Th>
            </tr>
            <tr className="text-center bg-gray-100 font-bold text-sm">
              <td colSpan={3} className="border border-black">A</td>
              <td colSpan={4} className="border border-black">B</td>
              <td colSpan={3} className="border border-black">C</td>
            </tr>
            <tr className="text-center font-bold">
              <td colSpan={3} className="border border-black p-0 bg-green-50/50">
                <table className="w-full h-full"><tbody><tr>
                  <td className="p-2 text-center">Edificación Inspeccionada.<br/>Acceso Permitido<br/>(Etiqueta Verde)</td>
                  <td className="w-6 p-1 text-center align-middle"><Input type="checkbox" className="w-4 h-4" /></td>
                </tr></tbody></table>
              </td>
              <td colSpan={4} className="border border-black p-0 bg-yellow-50/50">
                 <table className="w-full h-full"><tbody><tr>
                  <td className="p-2 text-center">Acceso Restringido.<br/>Precaución al Entrar<br/>(Etiqueta Amarilla)</td>
                  <td className="w-6 p-1 text-center align-middle"><Input type="checkbox" className="w-4 h-4" /></td>
                </tr></tbody></table>
              </td>
              <td colSpan={3} className="border border-black p-0 bg-red-50/50">
                 <table className="w-full h-full"><tbody><tr>
                  <td className="p-2 text-center">Edificación Insegura.<br/>Acceso no Permitido<br/>(Etiqueta Roja)</td>
                  <td className="w-6 p-1 text-center align-middle"><Input type="checkbox" className="w-4 h-4" /></td>
                </tr></tbody></table>
              </td>
            </tr>
            <tr className="bg-gray-50 text-[10px] font-bold border-b border-black">
              <td colSpan={6} className="border-r border-black text-right pr-2 py-1 align-middle">11.1 Si hubo inspección previa, ¿cuál fue la etiqueta?</td>
              <td colSpan={4} className="p-0">
                <table className="w-full border-collapse h-full">
                  <tbody>
                    <tr>
                      <td className="w-1/3 p-0 border-r border-gray-300"><CheckboxRow label="Verde" /></td>
                      <td className="w-1/3 p-0 border-r border-gray-300"><CheckboxRow label="Amarilla" /></td>
                      <td className="w-1/3 p-0"><CheckboxRow label="Roja" /></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* 12. RECOMENDACIONES */}
            <tr><Th colSpan={10}>12. RECOMENDACIONES</Th></tr>
            <tr>
              <td colSpan={10} className="p-0 border-0 border-b border-black">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-1/4 border-r border-b border-black p-1 font-bold bg-gray-100 text-center">Inspección especializada</td>
                      <td className="w-1/4 border-r border-b border-black p-0"><CheckboxRow label="Estructura" /></td>
                      <td className="w-1/4 border-r border-b border-black p-0"><CheckboxRow label="Geotecnia" /></td>
                      <td className="w-1/4 border-b border-black p-0"><CheckboxRow label="Servicios Públicos" /></td>
                    </tr>
                    <tr>
                      <td className="w-1/4 border-r border-black p-1 font-bold bg-gray-100 text-center">Intervención de</td>
                      <td className="w-1/4 border-r border-black p-0"><CheckboxRow label="PC o bomberos" /></td>
                      <td className="w-1/4 border-r border-black p-0"><CheckboxRow label="Policía - Ejército" /></td>
                      <td className="w-1/4 p-0"><CheckboxRow label="Autoridades" /></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>

            {/* 13. MEDIDAS DE SEGURIDAD */}
            <tr><Th colSpan={10}>13. MEDIDAS DE SEGURIDAD</Th></tr>
            <tr>
              <td colSpan={10} className="p-0 border-0 border-b border-black">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-1/3 border-r border-b border-black p-0"><CheckboxRow label="Restringir paso peatonal" /></td>
                      <td className="w-1/3 border-r border-b border-black p-0"><CheckboxRow label="Desconectar agua" /></td>
                      <td className="w-1/3 border-b border-black p-0"><CheckboxRow label="Apuntalar" /></td>
                    </tr>
                    <tr>
                      <td className="w-1/3 border-r border-b border-black p-0"><CheckboxRow label="Restringir tráfico vehicular" /></td>
                      <td className="w-1/3 border-r border-b border-black p-0"><CheckboxRow label="Desconectar energía" /></td>
                      <td className="w-1/3 border-b border-black p-0"><CheckboxRow label="Demoler elementos" /></td>
                    </tr>
                    <tr>
                      <td className="w-1/3 border-r border-black p-0"><CheckboxRow label="Manejo sust. peligrosas" /></td>
                      <td className="w-1/3 border-r border-black p-0"><CheckboxRow label="Desconectar gas" /></td>
                      <td className="w-1/3 p-0"><CheckboxRow label="Evacuar edificio vecino" /></td>
                    </tr>
                  </tbody>
                </table>
                <div className="border-t border-black p-1.5 text-[10px] flex items-center font-bold">
                  Indique lugares del edificio para aplicar medidas: <Input className="border-b border-black border-dashed flex-1 ml-2" />
                </div>
              </td>
            </tr>

            {/* 14. OBSERVACIONES */}
            <tr>
              <Th colSpan={7}>14. OBSERVACIONES</Th>
              <td colSpan={3} className="border border-black bg-gray-200 font-bold px-2 text-[11px] whitespace-nowrap">Hora Culminación: <Input type="time" className="w-20 bg-transparent border-b border-black ml-1" /></td>
            </tr>
            <tr>
              <td colSpan={10} className="border border-black p-1 h-20 align-top">
                <textarea className="w-full h-full bg-transparent outline-none resize-none text-[11px]" />
              </td>
            </tr>
            <tr>
              <td colSpan={10} className="border border-black text-[9px] p-1 font-bold text-gray-700 leading-tight">
                Fotos a tomar: Identificación de la edificación - Fachadas - Pendiente del terreno - Talud cercano - Tipo estructural - Deslizamiento o derrumbes - Asentamiento(s) diferencial(es) - Grietas en fachada - Detalles del Piso crítico: Vigas - Columnas - Losas - Juntas - Nodos o conexiones - Observaciones - Daños en elementos no estructurales - Pandeo y deformaciones en elementos de acero - Estado de servicios públicos
              </td>
            </tr>

            {/* ADJUNTO FOTOGRÁFICO DIGITAL (Solo visible en pantalla) */}
            <tr className="print:hidden">
              <td colSpan={10} className="border border-black p-3 bg-blue-50/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-sm text-blue-900 flex items-center gap-2">
                      <Camera size={16} /> Anexo Fotográfico Digital
                    </div>
                    <div className="text-[10px] text-blue-700">Sube imágenes de la galería o abre la cámara del móvil.</div>
                  </div>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md cursor-pointer shadow-sm transition-colors text-xs uppercase tracking-wide flex items-center gap-2">
                    <Camera size={14} /> <span>Tomar / Subir Fotos</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      capture="environment" 
                      className="hidden" 
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          alert(`Has adjuntado ${files.length} foto(s).`);
                        }
                      }} 
                    />
                  </label>
                </div>
              </td>
            </tr>

          </tbody>
        </table>

      </div>

    </main>
  );
}
