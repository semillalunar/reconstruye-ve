import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS solicitudes_inspeccion (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre_contacto VARCHAR(255) NOT NULL,
        telefono_contacto VARCHAR(50) NOT NULL,
        direccion_exacta TEXT NOT NULL,
        tipo_edificacion VARCHAR(100),
        descripcion_dano TEXT NOT NULL,
        hay_heridos BOOLEAN DEFAULT FALSE,
        coordenadas GEOMETRY(Point, 4326),
        evidencia_fotografica JSONB,
        creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        numero_apartamento VARCHAR(50),
        numero_personas INTEGER DEFAULT 0,
        numero_ninos INTEGER DEFAULT 0,
        numero_adultos_mayores INTEGER DEFAULT 0
      );

      ALTER TABLE solicitudes_inspeccion ADD COLUMN IF NOT EXISTS numero_apartamento VARCHAR(50);
      ALTER TABLE solicitudes_inspeccion ADD COLUMN IF NOT EXISTS numero_personas INTEGER DEFAULT 0;
      ALTER TABLE solicitudes_inspeccion ADD COLUMN IF NOT EXISTS numero_ninos INTEGER DEFAULT 0;
      ALTER TABLE solicitudes_inspeccion ADD COLUMN IF NOT EXISTS numero_adultos_mayores INTEGER DEFAULT 0;
    `;
    
    await pool.query(query);
    
    return NextResponse.json({ 
      success: true, 
      message: "Base de datos inicializada correctamente. La tabla 'solicitudes_inspeccion' está lista." 
    });
  } catch (error: any) {
    console.error("Error inicializando BD:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error al crear las tablas", 
      details: error.message 
    }, { status: 500 });
  }
}
