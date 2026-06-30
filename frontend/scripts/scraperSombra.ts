import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const TARGET_URL = 'https://directorio-sismo.netlify.app/';
const DATA_LAKE_PATH = path.resolve('../data_lake/scraped_directorio.json');

// NOTA: Para Neo4j, lo mantendremos comentado si Docker no está corriendo, 
import neo4j from 'neo4j-driver';
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'adminpassword'));

interface EntidadScrapeada {
  id: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  telefono?: string;
  instagram?: string;
  url_externa?: string;
  esOrganizacion: boolean;
  extraida_en: string;
}

async function runScraper() {
  console.log(`[+] Iniciando Operación Sombra (Scraping de ${TARGET_URL})...`);
  
  try {
    const response = await axios.get(TARGET_URL);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const entidades: EntidadScrapeada[] = [];

    // Iterar sobre todas las tarjetas de la página
    $('.tarjeta').each((index, element) => {
      const card = $(element);
      
      const categoria = card.find('.tarjeta-cat').text().trim() || 'General';
      const nombre = card.find('h3').text().trim();
      const descripcion = card.find('p').text().trim();
      
      // Buscar enlaces para IG o teléfonos
      let instagram = undefined;
      let telefono = undefined;
      let url_externa = undefined;
      
      card.find('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href?.includes('instagram.com')) {
          instagram = href;
        } else if (href?.includes('wa.me') || href?.includes('tel:')) {
          telefono = href;
        } else if (href && !href.startsWith('#')) {
          // Si es un enlace a otra web (Google Drive, etc.) y no es solo un ancla
          url_externa = href;
        }
      });
      
      // Si la tarjeta es de tipo teléfono directo (clase tarjeta-tel)
      if (card.hasClass('tarjeta-tel')) {
        const numTxt = card.find('.tarjeta-tel-numero').text().trim();
        if (numTxt) telefono = numTxt;
      }

      if (nombre) {
        entidades.push({
          id: `ent-${index}-${Date.now()}`,
          nombre,
          categoria,
          descripcion,
          telefono,
          instagram,
          url_externa,
          esOrganizacion: categoria.toLowerCase().includes('acopio') || categoria.toLowerCase().includes('refugio') || categoria.toLowerCase().includes('ong'),
          extraida_en: new Date().toISOString()
        });
      }
    });

    console.log(`[+] Se extrajeron ${entidades.length} entidades con éxito.`);

    // 1. Guardar en Data Lake (JSON Crudo)
    fs.writeFileSync(DATA_LAKE_PATH, JSON.stringify(entidades, null, 2), 'utf-8');
    console.log(`[+] Volcado guardado en: ${DATA_LAKE_PATH}`);

    // 2. Intentar inyectar en Neo4j (Grafo Anticorrupción)
    console.log(`[+] Intentando inyección en Neo4j...`);
    const session = driver.session();
    try {
      let nodosCreados = 0;
      for (const ent of entidades) {
        // Crear nodo de Organización o Contacto
        const label = ent.esOrganizacion ? 'Organizacion' : 'Contacto';
        await session.run(`
          MERGE (n:${label} { nombre: $nombre })
          SET n.categoria = $categoria,
              n.descripcion = $descripcion,
              n.telefono = $telefono,
              n.instagram = $instagram,
              n.url_externa = $url_externa,
              n.extraida_en = $extraida_en
          RETURN n
        `, {
          nombre: ent.nombre,
          categoria: ent.categoria,
          descripcion: ent.descripcion,
          telefono: ent.telefono || '',
          instagram: ent.instagram || '',
          url_externa: ent.url_externa || '',
          extraida_en: ent.extraida_en
        });
        
        // Relacionar con la Categoría como un concepto principal
        await session.run(`
          MATCH (n {nombre: $nombre})
          MERGE (c:Categoria { nombre: $categoria })
          MERGE (n)-[:PERTENECE_A]->(c)
        `, {
          nombre: ent.nombre,
          categoria: ent.categoria
        });
        nodosCreados++;
      }
      console.log(`[+] Se insertaron/actualizaron ${nodosCreados} nodos en el grafo de Inteligencia.`);
    } catch (dbError: any) {
      console.warn(`[!] Advertencia: No se pudo conectar a Neo4j (¿Docker apagado?). Los datos están seguros en el JSON. Detalle: ${dbError.message}`);
    } finally {
      await session.close();
      await driver.close();
    }

  } catch (error) {
    console.error('[-] Error fatal durante el scraping:', error);
  }
}

runScraper();
