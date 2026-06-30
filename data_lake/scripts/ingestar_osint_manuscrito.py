import neo4j

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

# Datos extraídos visualmente de las imágenes de @movidacaracas (Hospital Domingo Luciani)
nombres_extraidos = [
    "Liscano Pedro", "Jennifer Luna", "Galindez Cristobal", "Vasquez Gladys", "Arreaza Mauricio",
    "Barrozo Thaida", "Deni Ruiz", "Mendez Astrid", "Escobar Yerrymar", "Valery Lopez",
    "Sebastian Santi", "Arnoldo Cordova", "Jesus Mayorca", "Neisy Fernandez", "Helary Rodriguez",
    "Jesus Martinez", "Isa Martinez", "Carmen Martinez", "Ricardo Andres Berrios", "Hilders Ana",
    "Cabarca Yenderly", "Arevalo Valery", "Jimenez Axiel", "Bradian Garcia", "Gonzalez Valery",
    "Silva Gualbert", "Frontado Miel", "Castillo Victoria", "Desmon Lewis", "Lilicet Velasquez",
    "Lopez Williams", "Sanchez Adolfo", "Amador Raquel", "Herrera Coladuiska", "Ray Gennael",
    "Camila Orellano", "Blanco Jessica", "Fabiana Rivas", "Gabriela Parra", "Anyeli Diaz",
    "Helen Salazar", "Doris Arrieta", "Isabel Vega", "Yuskeidy Fernandez", "Mariana Marrufa",
    "Gismely Moreno", "Rarrasquel Santiago", "Saul Cruz", "Luis Torrealba", "Gabriela Torres"
]

def ingestar_manuscritos():
    print(f"[*] Procesando {len(nombres_extraidos)} perfiles de Hospital Domingo Luciani (@movidacaracas)...")
    driver = neo4j.GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    eventos_nuevos = 0
    coincidencias = 0
    
    try:
        for nombre in nombres_extraidos:
            # Historial Inmutable: Crear nodo de reporte (Evento)
            session.run('''
                MERGE (p:Persona {nombre: $nombre})
                CREATE (r:Reporte {
                    fuente: 'Instagram OSINT (@movidacaracas) - Manuscrito',
                    fecha: '2026-06-28',
                    ubicacion: 'Hospital Domingo Luciani',
                    estatus: 'Hospitalizado/Atendido'
                })
                MERGE (p)-[:VISTO_EN]->(r)
            ''', nombre=nombre)
            eventos_nuevos += 1
            
        print(f"[+] {eventos_nuevos} eventos OSINT manuscritos inyectados en la Línea de Tiempo.")
        
        # === CRUCE DE INTELIGENCIA MASIVA ===
        result = session.run('''
            MATCH (p1:Persona)-[:VISTO_EN {fecha: '2026-06-28'}]->(r:Reporte {fuente: 'Instagram OSINT (@movidacaracas) - Manuscrito'})
            MATCH (p2)
            WHERE (p2:Rescatado OR p2:Fallecido OR p2:Desaparecido) 
              AND toLower(p1.nombre) = toLower(p2.nombre)
              AND id(p1) <> id(p2)
            RETURN DISTINCT p1.nombre AS nombre, labels(p2) AS verdad_campo, r.ubicacion AS ubicacion
        ''')
        
        records = list(result)
        coincidencias = len(records)
        print(f"\\n[!] SE ENCONTRARON {coincidencias} COINCIDENCIAS HISTÓRICAS CON LA VERDAD DE CAMPO.")
        for record in records:
            print(f"    - {record['nombre']} | Verdad Campo: {record['verdad_campo'][0]} | OSINT dice: Visto en {record['ubicacion']}")

    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    ingestar_manuscritos()
