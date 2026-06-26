'use server';

import { pool } from '@/lib/db';

export type ATC20CompletaData = {
  inspector_nombre: string;
  inspector_cedula: string;
  lat: number;
  lng: number;
  direccion: string;
  nombre_edificacion: string;
  uso_predominante: string;
  numero_pisos: number;
  material_predominante: string;
  
  ext_colapso: string;
  ext_aledanos: string;
  ext_geologico: string;
  ext_asentamiento: string;
  ext_inclinacion: string;
  riesgo_externo: string;

  critico_acceso: string;
  critico_piso: string;
  sev_columnas: number;
  sev_muros_conc: number;
  sev_muros_mamp: number;
  sev_vigas: number;
  piso_critico_riesgo: string;

  mod_tipo_elemento: string;
  mod_examinados: number;
  mod_danados: number;
  dano_moderado_riesgo: string;

  noest_losas: string;
  noest_paredes: string;
  noest_tanques: string;
  noest_gas: string;
  noest_ascensores: string;
  no_estructural_riesgo: string;

  etiqueta_final: 'VERDE' | 'AMARILLA' | 'ROJA';
  acciones_recomendadas: string[];
  comentarios: string;
};

export async function submitATC20Action(data: ATC20CompletaData) {
  try {
    const query = `
      INSERT INTO evaluaciones_atc20_completa (
        inspector_nombre, inspector_cedula, coordenadas, direccion,
        nombre_edificacion, uso_predominante, numero_pisos, material_predominante,
        ext_colapso, ext_aledanos, ext_geologico, ext_asentamiento, ext_inclinacion, riesgo_externo,
        critico_acceso, critico_piso, sev_columnas, sev_muros_conc, sev_muros_mamp, sev_vigas, piso_critico_riesgo,
        mod_tipo_elemento, mod_examinados, mod_danados, dano_moderado_riesgo,
        noest_losas, noest_paredes, noest_tanques, noest_gas, noest_ascensores, no_estructural_riesgo,
        etiqueta_final, acciones_recomendadas, comentarios
      ) 
      VALUES (
        $1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5,
        $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22,
        $23, $24, $25, $26,
        $27, $28, $29, $30, $31, $32,
        $33, $34, $35
      )
      RETURNING id
    `;

    const values = [
      data.inspector_nombre, data.inspector_cedula, data.lng, data.lat, data.direccion,
      data.nombre_edificacion, data.uso_predominante, data.numero_pisos, data.material_predominante,
      data.ext_colapso, data.ext_aledanos, data.ext_geologico, data.ext_asentamiento, data.ext_inclinacion, data.riesgo_externo,
      data.critico_acceso, data.critico_piso, data.sev_columnas, data.sev_muros_conc, data.sev_muros_mamp, data.sev_vigas, data.piso_critico_riesgo,
      data.mod_tipo_elemento, data.mod_examinados, data.mod_danados, data.dano_moderado_riesgo,
      data.noest_losas, data.noest_paredes, data.noest_tanques, data.noest_gas, data.noest_ascensores, data.no_estructural_riesgo,
      data.etiqueta_final, data.acciones_recomendadas, data.comentarios
    ];

    const result = await pool.query(query, values);
    console.log("Evaluación ATC-20 (Completa) insertada con ID:", result.rows[0].id);

    return { success: true, id: result.rows[0].id };

  } catch (error) {
    console.error("Error insertando evaluación ATC-20:", error);
    return { success: false, error: 'Falla al guardar la evaluación en la base de datos' };
  }
}
