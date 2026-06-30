import { pool } from '@/lib/db';
import React from 'react';

// Forzar que esta página se renderice dinámicamente y no se quede en caché estático
export const dynamic = 'force-dynamic';

export default async function AdminCondominio() {
  let solicitudes = [];
  let error = null;

  try {
    const result = await pool.query(`
      SELECT 
        id, 
        nombre_contacto, 
        telefono_contacto, 
        direccion_exacta, 
        tipo_edificacion, 
        descripcion_dano, 
        hay_heridos, 
        evidencia_fotografica,
        creado_en,
        numero_apartamento,
        numero_personas,
        numero_ninos,
        numero_adultos_mayores
      FROM solicitudes_inspeccion 
      ORDER BY creado_en DESC
    `);
    solicitudes = result.rows;
  } catch (err) {
    console.error("Error cargando solicitudes de condominio:", err);
    error = "No se pudo conectar a la base de datos. Asegúrate de haber configurado Vercel Postgres.";
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Junta de Condominio</h1>
            <p className="text-gray-600 mt-1">Panel de control de reportes de daños estructurales</p>
          </div>
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold shadow-sm">
            Total Reportes: {solicitudes.length}
          </div>
        </header>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p className="font-bold">Error de Base de Datos</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solicitudes.map((sol: any) => (
            <div key={sol.id} className={`bg-white rounded-2xl shadow-md overflow-hidden border-t-4 ${sol.hay_heridos ? 'border-red-500' : 'border-blue-500'}`}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{sol.numero_apartamento ? sol.numero_apartamento : sol.direccion_exacta}</h2>
                  {sol.hay_heridos && (
                    <span className="bg-red-100 text-red-800 text-xs font-black px-2 py-1 rounded-full uppercase tracking-wider">
                      Urgente (Heridos)
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">{sol.tipo_edificacion}</p>
                
                <div className="space-y-3">
                  
                  {/* Etiqueta del Censo */}
                  <div className="bg-blue-50 border border-blue-100 p-2 rounded-lg flex justify-between text-xs text-blue-800 font-medium">
                    <div><span className="font-bold">👥 Hab:</span> {sol.numero_personas || 0}</div>
                    <div><span className="font-bold">👦 Niños:</span> {sol.numero_ninos || 0}</div>
                    <div><span className="font-bold">👴 Abuelos:</span> {sol.numero_adultos_mayores || 0}</div>
                  </div>

                  <div>
                    <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Reportado por</h3>
                    <p className="text-gray-800 font-medium">{sol.nombre_contacto}</p>
                    <p className="text-gray-600 text-sm">📞 {sol.telefono_contacto}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Daño Reportado</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-sm italic border border-gray-100 mt-1">
                      "{sol.descripcion_dano}"
                    </p>
                  </div>
                  
                  {sol.evidencia_fotografica && sol.evidencia_fotografica.length > 0 && (
                    <div>
                      <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider mb-2">Evidencia Fotográfica ({sol.evidencia_fotografica.length})</h3>
                      <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                        {sol.evidencia_fotografica.map((foto: string, idx: number) => (
                          <a href={foto} target="_blank" rel="noreferrer" key={idx} className="shrink-0 snap-start">
                            <img src={foto} alt={`Evidencia ${idx+1}`} className="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-80 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 text-xs text-gray-400 flex justify-between border-t border-gray-100">
                <span>ID: {sol.id.substring(0, 8)}...</span>
                <span>{new Date(sol.creado_en).toLocaleString()}</span>
              </div>
            </div>
          ))}
          
          {solicitudes.length === 0 && !error && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="text-5xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-gray-700">No hay reportes todavía</h3>
              <p className="text-gray-500 mt-2">Los apartamentos que llenen el reporte aparecerán automáticamente aquí.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
