import { NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';

const URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const USER = process.env.NEO4J_USER || 'neo4j';
const PASSWORD = process.env.NEO4J_PASSWORD || 'adminpassword';

export async function GET() {
  const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));
  const session = driver.session();

  try {
    // Consultar edificios y contar cuántos rescatados y fallecidos hay en cada uno
    const result = await session.run(`
      MATCH (e:Edificio)
      OPTIONAL MATCH (r:Rescatado)-[:ENCONTRADO_EN]->(e)
      OPTIONAL MATCH (f:Fallecido)-[:RECUPERADO_EN]->(e)
      RETURN 
        e.nombre AS nombre, 
        e.latitud AS latitud, 
        e.longitud AS longitud,
        count(DISTINCT r) AS rescatados,
        count(DISTINCT f) AS fallecidos
    `);

    const features = result.records.map(record => ({
      nombre: record.get('nombre'),
      latitud: record.get('latitud'),
      longitud: record.get('longitud'),
      stats: {
        rescatados: record.get('rescatados').toNumber(),
        fallecidos: record.get('fallecidos').toNumber()
      }
    }));

    return NextResponse.json({
      type: "FeatureCollection",
      features: features
    });

  } catch (error) {
    console.error('Error fetching geo data:', error);
    return NextResponse.json({ error: 'Database connection error' }, { status: 500 });
  } finally {
    await session.close();
    await driver.close();
  }
}
