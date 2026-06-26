'use server';

import { pool } from '@/lib/db';

export type ATC20Data = {
  inspector_nombre: string;
  inspector_cedula: string;
  lat: number;
  lng: number;
  direccion: string;
  nombre_edificacion: string;
  uso_predominante: string;
  numero_pisos: number;
  material_predominante: string;
  riesgo_externo: string; // 'A', 'B', 'C'
  piso_critico_riesgo: string;
  dano_moderado_riesgo: string;
  no_estructural_riesgo: string;
  etiqueta_final: 'VERDE' | 'AMARILLA' | 'ROJA';
  acciones_recomendadas: string[];
};

export async function submitATC20Action(data: ATC20Data) {
  try {
    const query = `
      INSERT INTO evaluaciones_atc20 (
        inspector_nombre, inspector_cedula, coordenadas, direccion,
        nombre_edificacion, uso_predominante, numero_pisos, material_predominante,
        riesgo_externo, piso_critico_riesgo, dano_moderado_riesgo, no_estructural_riesgo,
        etiqueta_final, acciones_recomendadas
      ) 
      VALUES (
        $1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13,
        $14, $15
      )
      RETURNING id
    `;

    const values = [
      data.inspector_nombre,
      data.inspector_cedula,
      data.lng, // Longitud primero en PostGIS
      data.lat,
      data.direccion,
      data.nombre_edificacion,
      data.uso_predominante,
      data.numero_pisos,
      data.material_predominante,
      data.riesgo_externo,
      data.piso_critico_riesgo,
      data.dano_moderado_riesgo,
      data.no_estructural_riesgo,
      data.etiqueta_final,
      data.acciones_recomendadas
    ];

    const result = await pool.query(query, values);
    console.log("Evaluación ATC-20 insertada con ID:", result.rows[0].id);

    return { success: true, id: result.rows[0].id };

  } catch (error) {
    console.error("Error insertando evaluación ATC-20:", error);
    return { success: false, error: 'Falla al guardar la evaluación en la base de datos' };
  }
}
