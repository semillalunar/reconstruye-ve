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
        creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
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
