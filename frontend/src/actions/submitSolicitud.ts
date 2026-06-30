'use server';

import { pool } from '@/lib/db';

export type SolicitudData = {
  nombre_contacto: string;
  telefono_contacto: string;
  direccion_exacta: string;
  numero_apartamento?: string;
  numero_personas?: number;
  numero_ninos?: number;
  numero_adultos_mayores?: number;
  tipo_edificacion: string;
  descripcion_dano: string;
  hay_heridos: boolean;
  evidencia_fotografica: string[];
  lat: number;
  lng: number;
};

export async function submitSolicitudAction(data: SolicitudData) {
  try {
    const query = `
      INSERT INTO solicitudes_inspeccion (
        nombre_contacto, telefono_contacto, direccion_exacta,
        tipo_edificacion, descripcion_dano, hay_heridos, coordenadas, evidencia_fotografica,
        numero_apartamento, numero_personas, numero_ninos, numero_adultos_mayores
      ) 
      VALUES (
        $1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326), $9,
        $10, $11, $12, $13
      )
      RETURNING id
    `;

    const values = [
      data.nombre_contacto,
      data.telefono_contacto,
      data.direccion_exacta,
      data.tipo_edificacion,
      data.descripcion_dano,
      data.hay_heridos,
      data.lng,
      data.lat,
      data.evidencia_fotografica,
      data.numero_apartamento || null,
      data.numero_personas || 0,
      data.numero_ninos || 0,
      data.numero_adultos_mayores || 0
    ];

    const result = await pool.query(query, values);
    console.log("Solicitud ciudadana insertada con ID:", result.rows[0].id);

    return { success: true, id: result.rows[0].id };
  } catch (error) {
    console.error("Error insertando solicitud ciudadana:", error);
    return { success: false, error: 'Falla al guardar la solicitud en la base de datos' };
  }
}
