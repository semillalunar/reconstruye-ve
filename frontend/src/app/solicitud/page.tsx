"use client";
import { useState } from 'react';
import { submitSolicitudAction, SolicitudData } from '@/actions/submitSolicitud';

export default function SolicitudInspeccion() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [data, setData] = useState<Partial<SolicitudData>>({
    nombre_contacto: '',
    telefono_contacto: '',
    direccion_exacta: '',
    tipo_edificacion: 'Casa',
    descripcion_dano: '',
    hay_heridos: false,
    evidencia_fotografica: []
  });

  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const updateData = (fields: Partial<SolicitudData>) => setData(prev => ({ ...prev, ...fields }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGpsLoading(true);
    
    const submitToServer = async (lat: number, lng: number) => {
      setGpsLoading(false);
      // Las imágenes ya están en data.evidencia_fotografica en formato base64
      const finalData = { ...data, lat, lng } as SolicitudData;
      const result = await submitSolicitudAction(finalData);
      if (result.success) setSubmitted(true);
      else alert('Error al enviar la solicitud. Intente nuevamente.');
      setIsSubmitting(false);
    };

    // Intentar obtener Geolocalización real para ayudar a los ingenieros a llegar
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => submitToServer(pos.coords.latitude, pos.coords.longitude),
        err => {
          console.warn("GPS falló, usando ubicación genérica", err);
          submitToServer(10.4806, -66.9036);
        },
        { timeout: 5000 }
      );
    } else {
      submitToServer(10.4806, -66.9036);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    
    Promise.all(files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    })).then(base64Images => {
      setPreviewImages(base64Images);
      updateData({ evidencia_fotografica: base64Images });
    });
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl text-center border-t-8 border-green-500">
          <div className="text-7xl mb-4">🙏</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Solicitud Recibida</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Hemos registrado la ubicación de tu vivienda y la descripción de los daños. Un grupo de ingenieros voluntarios revisará esta alerta para organizar una ruta de inspección estructural.
          </p>
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-6 border border-blue-100">
            <strong>Importante:</strong> Si el riesgo de colapso es inminente o hay heridos graves, llama inmediatamente a los Bomberos o Protección Civil.
          </div>
          <button onClick={() => window.location.reload()} className="text-blue-600 font-bold hover:underline">
            Enviar otra solicitud
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-900 flex flex-col items-center py-10 px-4">
      
      <div className="w-full max-w-lg mb-6 text-center">
        <h1 className="text-3xl font-black text-white tracking-wide mb-2">Solicitar Inspección</h1>
        <p className="text-blue-200">
          Si su vivienda o edificio presenta grietas graves, hundimientos o daños tras el sismo, llene este formulario para que ingenieros voluntarios puedan acudir a evaluarlo.
        </p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 text-yellow-800 text-sm rounded-r-xl">
            <strong>Recuerda:</strong> Este servicio es prestado por ciudadanos voluntarios. Mantén la calma y siéntate en un lugar seguro mientras llenas el reporte.
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Nombre Completo</label>
            <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ej: María Pérez" value={data.nombre_contacto} onChange={e => updateData({ nombre_contacto: e.target.value })} />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Teléfono de Contacto</label>
            <input required type="tel" className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ej: 0414-1234567" value={data.telefono_contacto} onChange={e => updateData({ telefono_contacto: e.target.value })} />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Tipo de Vivienda / Edificación</label>
            <select className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={data.tipo_edificacion} onChange={e => updateData({ tipo_edificacion: e.target.value })}>
              <option>Casa Independiente</option>
              <option>Edificio Residencial</option>
              <option>Local Comercial</option>
              <option>Colegio / Institución</option>
              <option>Hospital / Clínica</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">Dirección Exacta</label>
            <textarea required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-20" placeholder="Ej: Sector El Carmen, Calle 4, Casa Nro 12. Punto de referencia: Frente a la panadería." value={data.direccion_exacta} onChange={e => updateData({ direccion_exacta: e.target.value })}></textarea>
            <p className="text-xs text-gray-500 mt-2">📍 Tu teléfono también guardará la coordenada GPS exacta al enviar.</p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">¿Qué tipo de daños observas?</label>
            <textarea required className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24" placeholder="Ej: Hay una grieta en forma de X en la pared de la sala, y la columna del estacionamiento se rompió." value={data.descripcion_dano} onChange={e => updateData({ descripcion_dano: e.target.value })}></textarea>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">📷 Evidencia Fotográfica (Max 5)</h3>
            <p className="text-sm text-blue-700 mb-4">
              <strong>Micro-Guía:</strong> Ayude al ingeniero tomando buenas fotos:
              <br/>1. Una foto general del edificio desde la calle.
              <br/>2. Una foto de la grieta o daño principal.
              <br/>3. Evite fotos borrosas.
            </p>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" />
            
            {previewImages.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {previewImages.map((src, idx) => (
                  <img key={idx} src={src} alt="Evidencia" className="h-16 w-16 object-cover rounded shadow" />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center bg-red-50 p-4 rounded-xl border border-red-100">
            <input type="checkbox" id="heridos" className="w-6 h-6 text-red-600 rounded focus:ring-red-500" checked={data.hay_heridos} onChange={e => updateData({ hay_heridos: e.target.checked })} />
            <label htmlFor="heridos" className="ml-3 text-red-900 font-bold">
              Hay personas heridas o atrapadas en esta dirección.
            </label>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 text-lg mt-4">
            {gpsLoading ? 'Obteniendo GPS...' : isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Ayuda'}
            {gpsLoading ? '📡' : isSubmitting ? '⏳' : '🚀'}
          </button>
        </form>
      </div>
    </main>
  );
}
