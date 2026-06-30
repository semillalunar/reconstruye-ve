import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Resolver la ruta hacia la carpeta data_lake en la raíz del proyecto
    const dataPath = path.resolve(process.cwd(), '../data_lake/scraped_directorio.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: 'Data Lake no encontrado', data: [] }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error leyendo Data Lake:', error);
    return NextResponse.json({ error: 'Error interno leyendo los datos', data: [] }, { status: 500 });
  }
}
