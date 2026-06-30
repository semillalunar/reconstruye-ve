"use server";

export interface FUNVISISData {
  // 1. Datos Inspectores
  inspector_1_nombre: string;
  inspector_1_cedula: string;
  inspector_1_profesion: string;
  inspector_1_telefono: string;
  inspector_1_correo: string;
  
  // 2. Datos Generales
  nombre_edificacion: string;
  fecha: string;
  n_pisos: number;
  n_semisotanos: number;
  n_sotanos: number;
  hora_inicio: string;
  estado: string;
  ciudad: string;
  municipio: string;
  parroquia: string;
  urb_sector: string;
  ave_calle: string;
  coord_lat: number | null;
  coord_lng: number | null;

  // 3. Uso
  uso_edificacion: string[]; // ['Vivienda Multifamiliar', 'Comercial']

  // 4. Tipo Estructural
  tipo_estructural_concreto: string[];
  tipo_estructural_acero: string[];
  tipo_estructural_mamposteria: string[];
  tipo_estructural_otros: string[];

  // 5. Inspeccion Externa
  ext_colapso: 'a' | 'b' | 'c';
  ext_aledanos: 'a' | 'b' | 'c';
  ext_amenaza_geo: 'a' | 'b' | 'c';
  ext_asentamiento: 'a' | 'b' | 'c';
  ext_inclinacion: 'a' | 'b' | 'c';
  riesgo_externo: 'A' | 'B' | 'C'; // 5.1

  // 6.
  requiere_interna: 'Si' | 'No';

  // 7. Croquis (Base64)
  croquis_base64: string;

  // 9. Riesgo Estructura
  dano_porcentaje_3: 'a' | 'b' | 'c';
  dano_porcentaje_4: 'a' | 'b' | 'c';
  dano_porcentaje_5: 'a' | 'b' | 'c';
  riesgo_estructura: 'A' | 'B' | 'C'; // 9.1

  // 10. No Estructural
  no_est_paredes: 'a' | 'b' | 'c';
  no_est_escaleras: 'a' | 'b' | 'c';
  no_est_tanques: 'a' | 'b' | 'c';
  no_est_fachada: 'a' | 'b' | 'c';
  riesgo_no_estructural: 'A' | 'B' | 'C'; // 10.1

  // 11. Decision
  etiqueta_final: 'VERDE' | 'AMARILLA' | 'ROJA';

  // 14. Observaciones
  observaciones: string;
  hora_culminacion: string;
}

export async function submitFUNVISISAction(data: FUNVISISData) {
  try {
    // Aquí iría la lógica para conectar con Neo4j (Driver)
    // MATCH (e:Edificacion {lat: data.coord_lat...}) MERGE (i:InspeccionFUNVISIS) ...
    console.log("Recepción de Planilla Oficial FUNVISIS:", data.nombre_edificacion, data.etiqueta_final);
    
    // Simulamos un guardado exitoso
    await new Promise(resolve => setTimeout(resolve, 1500));

    return { success: true, message: "Planilla registrada en la base de datos nacional." };
  } catch (error) {
    console.error("Error al guardar planilla FUNVISIS:", error);
    return { success: false, message: "Fallo al conectar con el servidor principal." };
  }
}
