import json
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

PATH_OSINT = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\data_lake\osint_hospitales_instagram.json"
PATH_SHEETS = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\data_lake\scraped_google_sheets.json"

def procesar_historial():
    print("[*] Iniciando Motor de Fusión Histórica...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()

    try:
        # === 1. INYECTAR OSINT (Instagram) ===
        print("[*] Procesando capa OSINT (Instagram)...")
        with open(PATH_OSINT, 'r', encoding='utf-8') as f:
            osint_data = json.load(f)
        
        eventos_osint = 0
        for panel in osint_data:
            hospital = panel['hospital']
            fecha = panel['fecha_reporte']
            fuente = panel['fuente']
            for nombre in panel['personas']:
                # Historial Inmutable: Crear nodo de reporte (Evento)
                session.run('''
                    MERGE (p:Persona {nombre: $nombre})
                    CREATE (r:Reporte {
                        fuente: $fuente,
                        fecha: $fecha,
                        ubicacion: $hospital,
                        estatus: 'Hospitalizado'
                    })
                    MERGE (p)-[:VISTO_EN]->(r)
                ''', nombre=nombre, fuente=fuente, fecha=fecha, hospital=hospital)
                eventos_osint += 1
        print(f"[+] {eventos_osint} eventos OSINT inyectados en la Línea de Tiempo.")

        # === 2. INYECTAR GOOGLE SHEETS ===
        print("[*] Procesando capa Google Sheets...")
        with open(PATH_SHEETS, 'r', encoding='utf-8') as f:
            sheets_data = json.load(f)
        
        eventos_sheets = 0
        for row in sheets_data:
            # Encontrar la llave de nombre dinámicamente debido a problemas de encoding
            nombre_key = next((k for k in row.keys() if 'Nombres' in k), None)
            hospital_key = next((k for k in row.keys() if 'Hospital' in k or 'Centro' in k), None)
            fecha_key = next((k for k in row.keys() if 'Marca temporal' in k), None)
            
            if not nombre_key or not row[nombre_key]: continue
            
            nombre = row[nombre_key]
            hospital = row.get(hospital_key, 'Desconocido')
            fecha = row.get(fecha_key, 'Desconocida')
            
            session.run('''
                MERGE (p:Persona {nombre: $nombre})
                CREATE (r:Reporte {
                    fuente: 'Google Sheets Voluntarios',
                    fecha: $fecha,
                    ubicacion: $hospital,
                    estatus: 'Hospitalizado/Atendido'
                })
                MERGE (p)-[:VISTO_EN]->(r)
            ''', nombre=nombre, fecha=fecha, hospital=hospital)
            eventos_sheets += 1
            
        print(f"[+] {eventos_sheets} eventos de Google Sheets inyectados en la Línea de Tiempo.")
        
        # === 3. CRUCE DE INTELIGENCIA MASIVA ===
        print("[*] Ejecutando Cruce Automático de Historiales...")
        # Buscar coincidencias entre las nuevas personas inyectadas y nuestra "Verdad de Campo" (Rescatados/Fallecidos iniciales)
        result = session.run('''
            MATCH (p1:Persona)-[:VISTO_EN]->(r:Reporte)
            MATCH (p2)
            WHERE (p2:Rescatado OR p2:Fallecido OR p2:Desaparecido) 
              AND toLower(p1.nombre) = toLower(p2.nombre)
              AND id(p1) <> id(p2)
            RETURN DISTINCT p1.nombre AS nombre, labels(p2) AS verdad_campo, r.ubicacion AS ubicacion, r.fuente AS fuente
        ''')
        
        coincidencias = list(result)
        print(f"\n[!] SE ENCONTRARON {len(coincidencias)} COINCIDENCIAS HISTÓRICAS CON LA VERDAD DE CAMPO.")
        for record in coincidencias[:10]: # Mostrar solo 10 para no saturar consola
            print(f"    - {record['nombre']} | Verdad Campo: {record['verdad_campo'][0]} | OSINT dice: Visto en {record['ubicacion']} ({record['fuente']})")
            
        if len(coincidencias) > 10:
            print(f"    - ... y {len(coincidencias) - 10} más.")

    except Exception as e:
        print(f"[-] Error grave en el motor de fusión: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    procesar_historial()
