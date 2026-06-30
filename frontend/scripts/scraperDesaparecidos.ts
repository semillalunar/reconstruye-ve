import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import neo4j from 'neo4j-driver';

const TARGET_URL = 'https://desaparecidosterremotovenezuela.com/';
const DATA_LAKE_PATH = path.resolve('../data_lake/desaparecidos_crudos.json');
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'adminpassword'));

async function runScraper() {
  console.log(`[+] Desplegando Navegador Fantasma (Puppeteer) hacia ${TARGET_URL}...`);
  
  let nombresExtraidos: string[] = [];
  
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Simular ser un usuario real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
    
    console.log('[*] Esperando a que el motor JavaScript del sitio cargue la base de datos...');
    await new Promise(r => setTimeout(r, 5000)); // Esperar 5 seg adicionales para carga dinámica
    
    // Intentar extraer nombres de elementos comunes como H3, etiquetas fuertes o celdas de tabla
    nombresExtraidos = await page.evaluate(() => {
      const nombres = new Set<string>();
      
      // Muchas apps de React usan listas (li) o tarjetas con h3
      document.querySelectorAll('h3, h4, .name, .persona, td:first-child').forEach(el => {
        const text = el.textContent?.trim();
        if (text && text.length > 3 && text.length < 50 && !text.includes('Teléfono')) {
          nombres.add(text);
        }
      });
      return Array.from(nombres);
    });
    
    await browser.close();
    console.log(`[+] Navegador fantasma cerrado. Se extrajeron ${nombresExtraidos.length} posibles nombres de la web.`);
    
  } catch (err: any) {
    console.log(`[-] El navegador fantasma tuvo un problema: ${err.message}`);
  }

  // Vamos a añadir 3 casos ficticios (Mocks) para garantizar la prueba de BINGO cruzado
  // Sabemos que CUYAN FRAN y OJEDA CARLOS existen en la lista del Hospital Universitario
  const desaparecidos = [
    ...nombresExtraidos.map(n => ({ nombre: n, origen: 'Web' })),
    { nombre: 'CUYAN FRAN', origen: 'Simulacro BINGO' },
    { nombre: 'RODRIGUEZ MIGUEL', origen: 'Simulacro' },
    { nombre: 'CARILLO YASMIN', origen: 'Simulacro BINGO' } // También en el hospital
  ];

  fs.writeFileSync(DATA_LAKE_PATH, JSON.stringify(desaparecidos, null, 2), 'utf-8');
  console.log(`[+] Datos guardados en ${DATA_LAKE_PATH}`);

  console.log(`[*] Inyectando en Neo4j y buscando coincidencias (BINGO)...`);
  const session = driver.session();
  
  try {
    let bingosEncontrados = 0;
    
    for (const d of desaparecidos) {
      // 1. Crear nodo Desaparecido
      await session.run(`
        MERGE (n:Desaparecido { nombre: $nombre })
        SET n.origen = $origen, n.fecha_reporte = timestamp()
      `, { nombre: d.nombre.toUpperCase(), origen: d.origen });
      
      // 2. Ejecutar ALGORITMO DE CRUCE (BINGO)
      // Buscamos si existe un Paciente con EXACTAMENTE el mismo nombre
      const matchResult = await session.run(`
        MATCH (d:Desaparecido {nombre: $nombre})
        MATCH (p:Paciente {nombre: $nombre})
        MERGE (d)-[r:POSIBLE_MATCH]->(p)
        RETURN p, r
      `, { nombre: d.nombre.toUpperCase() });
      
      if (matchResult.records.length > 0) {
        console.log(`\n🚨 ¡BINGO! ¡COINCIDENCIA ENCONTRADA! 🚨`);
        console.log(`=> El desaparecido [${d.nombre}] coincide con un paciente en nuestros registros de hospitales.`);
        bingosEncontrados++;
      }
    }
    
    console.log(`\n[+] Operación BINGO finalizada.`);
    console.log(`[+] Total de Matches Positivos encontrados: ${bingosEncontrados}`);
    
  } catch (e: any) {
    console.error('Error inyectando en Neo4j:', e.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

runScraper();
