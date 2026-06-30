"use client";

import React, { useEffect, useState } from 'react';

interface EntidadScrapeada {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  telefono?: string;
  instagram?: string;
  url_externa?: string;
  esOrganizacion: boolean;
  extraida_en: string;
}

export default function InteligenciaDashboard() {
  const [data, setData] = useState<EntidadScrapeada[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todas');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/inteligencia');
        const result = await res.json();
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Error cargando inteligencia:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Extraer categorías únicas para los filtros
  const categoriasUnicas = Array.from(new Set(data.map(item => item.categoria)));
  categoriasUnicas.unshift('Todas'); // Agregar la opción de ver todas

  const datosFiltrados = filtroCategoria === 'Todas' 
    ? data 
    : data.filter(item => item.categoria === filtroCategoria);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera */}
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
            Panel de Inteligencia 🕵️‍♂️
          </h1>
          <p className="mt-2 text-slate-600">
            Base de datos civil extraída automáticamente para análisis y auditoría.
          </p>
        </header>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-blue-600">{data.length}</span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-2">Total Extraídos</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-green-600">
              {data.filter(d => d.telefono).length}
            </span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-2">Con Teléfono Directo</span>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-purple-600">
              {categoriasUnicas.length - 1}
            </span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide mt-2">Categorías Detectadas</span>
          </div>
        </div>

        {/* Filtros Visuales */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Filtrar por Categoría:</h2>
          <div className="flex flex-wrap gap-2">
            {categoriasUnicas.map(cat => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filtroCategoria === cat 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Datos */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-semibold animate-pulse">
              Cargando Data Lake...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-600 text-sm">Entidad</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Categoría</th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">Contactos Extraídos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {datosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{item.nombre}</div>
                        <div className="text-xs text-slate-500 mt-1 max-w-md line-clamp-2" title={item.descripcion}>
                          {item.descripcion}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold tracking-wide">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2 flex-wrap">
                        {item.telefono && (
                          <a href={item.telefono} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-50 text-green-700 rounded text-xs font-bold border border-green-200 hover:bg-green-100">
                            📞 Llamar
                          </a>
                        )}
                        {item.instagram && (
                          <a href={item.instagram} target="_blank" rel="noreferrer" className="px-3 py-1 bg-pink-50 text-pink-700 rounded text-xs font-bold border border-pink-200 hover:bg-pink-100">
                            📸 Instagram
                          </a>
                        )}
                        {item.url_externa && (
                          <a href={item.url_externa} target="_blank" rel="noreferrer" className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold border border-slate-300 hover:bg-slate-200">
                            🔗 Abrir Enlace
                          </a>
                        )}
                        {!item.telefono && !item.instagram && !item.url_externa && (
                          <span className="text-xs text-slate-400 italic">No extraído</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {datosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500">
                        No hay datos en esta categoría.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
