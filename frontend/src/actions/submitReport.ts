'use server';

import { pool } from '@/lib/db';
import { generarFraseSemilla } from '@/lib/seedGenerator';
import crypto from 'crypto';

export type ReportData = {
  tipo_infraestructura: string;
  gravedad_ciudadano: string;
  lat: number;
  lng: number;
  imagenes: string[];
};

export async function submitReportAction(data: ReportData) {
  try {
    // 1. Generar la Frase Semilla
    const seedPhrase = generarFraseSemilla();
    
    // 2. Hash de la frase semilla para Privacidad Zero-Knowledge (No guardamos la semilla pura)
    const hashDispositivo = crypto.createHash('sha256').update(seedPhrase).digest('hex');

    // 3. Query espacial usando PostGIS
    // ST_SetSRID(ST_MakePoint(lon, lat), 4326) crea el punto geográfico
    // IMPORTANTE: ST_MakePoint toma (Longitud, Latitud)
    const query = `
      INSERT INTO reportes_infraestructura (
        hash_dispositivo, 
        tipo_infraestructura, 
        gravedad_ciudadano, 
        coordenadas, 
        url_imagenes
      ) 
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6)
      RETURNING id
    `;

    const values = [
      hashDispositivo,
      data.tipo_infraestructura,
      data.gravedad_ciudadano,
      data.lng, // Longitud primero en PostGIS
      data.lat,
      data.imagenes
    ];

    const result = await pool.query(query, values);
    console.log("Reporte insertado exitosamente con ID:", result.rows[0].id);

    // 4. Retornar la Frase Semilla original al cliente para que la guarde
    return { 
      success: true, 
      seedPhrase: seedPhrase,
      reportId: result.rows[0].id 
    };

  } catch (error) {
    console.error("Error insertando el reporte en PostgreSQL:", error);
    return { success: false, error: 'Falla al guardar el reporte' };
  }
}
