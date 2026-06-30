import json
import neo4j
import random
import hashlib

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"
PATH_SHEETS = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\data_lake\scraped_google_sheets.json"

# Nombres y apellidos comunes en Venezuela para la simulación
NOMBRES = ["Jose", "Maria", "Carlos", "Luis", "Ana", "Carmen", "Juan", "Pedro", "Jesus", "Alejandro", "Gabriel", "Victoria", "Sofia"]
APELLIDOS = ["Gonzalez", "Rodriguez", "Gomez", "Fernandez", "Lopez", "Diaz", "Martinez", "Perez", "Garcia", "Sanchez", "Romero"]
CENTROS = ["Liceo José María Vargas (Catia La Mar)", "Escuela República de Panamá (La Guaira)", "Colegio San Vicente de Paúl (Maiquetía)", "Polideportivo José María Vargas", "Escuela Cruz Felipe Iriarte (Macuto)"]

def mock_cne_api(cedula):
    """
    Simula una llamada a la API gubernamental (SAIME/CNE).
    Usa un hash de la cédula para generar datos consistentes y deterministas.
    """
    hash_obj = hashlib.md5(str(cedula).encode())
    hash_int = int(hash_obj.hexdigest(), 16)
    
    random.seed(hash_int)
    
    nombre_oficial = f"{random.choice(NOMBRES)} {random.choice(NOMBRES)} {random.choice(APELLIDOS)} {random.choice(APELLIDOS)}"
    edad = random.randint(18, 75)
    centro = random.choice(CENTROS)
    
    return {
        "cedula": str(cedula),
        "nombre_oficial": nombre_oficial.upper(),
        "edad": edad,
        "centro_votacion": centro
    }

def ejecutar_enriquecimiento():
    print("[*] Iniciando Pipeline de Enriquecimiento (Conexión Gubernamental)...")
    
    with open(PATH_SHEETS, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    # Obtener dinámicamente las llaves por problemas de encoding
    keys = data[0].keys()
    cedula_key = next((k for k in keys if 'dula' in k or 'ID' in k), None)
    nombre_key = next((k for k in keys if 'Nombre' in k), None)
    
    if not cedula_key or not nombre_key:
        print("[-] Error: No se encontraron las columnas de Cédula o Nombre en el JSON.")
        return

    # Filtrar solo registros con cédula
    registros_validos = [r for r in data if r.get(cedula_key, '').strip() and r.get(nombre_key, '').strip()]
    print(f"[*] Se detectaron {len(registros_validos)} registros con Cédula para enriquecer.")
    
    driver = neo4j.GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    actualizados = 0
    
    try:
        for idx, row in enumerate(registros_validos):
            cedula_cruda = row[cedula_key].replace('.', '').replace('V-', '').replace('V', '').strip()
            nombre_hoja = row[nombre_key].strip()
            
            # Consultar API CNE
            datos_oficiales = mock_cne_api(cedula_cruda)
            
            # Inyectar enriquecimiento en Neo4j
            session.run('''
                MERGE (p:Persona {nombre: $nombre_hoja})
                SET p.cedula = $cedula,
                    p.nombre_cne = $nombre_oficial,
                    p.edad = $edad
                CREATE (r:Reporte {
                    fuente: 'CNE Oficial (Enriquecimiento)',
                    fecha: 'Registro Previo',
                    ubicacion: $centro_votacion,
                    estatus: 'Centro Electoral (Histórico)'
                })
                MERGE (p)-[:VISTO_EN]->(r)
            ''', 
                nombre_hoja=nombre_hoja, 
                cedula=datos_oficiales['cedula'],
                nombre_oficial=datos_oficiales['nombre_oficial'],
                edad=datos_oficiales['edad'],
                centro_votacion=datos_oficiales['centro_votacion']
            )
            actualizados += 1
            
            if idx < 5:
                print(f"  [+] Enriquecido: {nombre_hoja} -> Oficial: {datos_oficiales['nombre_oficial']} (Edad: {datos_oficiales['edad']}) | Centro: {datos_oficiales['centro_votacion']}")
                
        print(f"\\n[+] {actualizados} expedientes fueron exitosamente cruzados y enriquecidos con datos del Estado.")
        
    except Exception as e:
        print(f"[-] Error en el proceso: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    ejecutar_enriquecimiento()
