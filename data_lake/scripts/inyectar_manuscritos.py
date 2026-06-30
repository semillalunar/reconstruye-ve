import json
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"
DATA_PATH = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\data_lake\reportes_dra_vera.json"

def inyectar_manuscritos():
    print("[*] Leyendo datos estructurados desde imágenes...")
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        personas = json.load(f)
        
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        print("[*] Inyectando datos en Neo4j...")
        for p in personas:
            # 1. Crear Edificio/Ubicación
            session.run('''
                MERGE (e:Edificio {nombre: $ubicacion})
                SET e.zona = "Zona de Desastre"
            ''', ubicacion=p['ubicacion'])
            
            # 2. Crear Nodo de Persona según Estado
            if p['estado'] == 'Fallecido':
                session.run('''
                    MERGE (n:Fallecido {nombre: $nombre})
                    WITH n
                    MATCH (e:Edificio {nombre: $ubicacion})
                    MERGE (n)-[:RECUPERADO_EN]->(e)
                ''', nombre=p['nombre'], ubicacion=p['ubicacion'])
            else:
                session.run('''
                    MERGE (n:Rescatado {nombre: $nombre})
                    SET n.estado_actual = $estado
                    WITH n
                    MATCH (e:Edificio {nombre: $ubicacion})
                    MERGE (n)-[:ENCONTRADO_EN]->(e)
                ''', nombre=p['nombre'], estado=p['estado'], ubicacion=p['ubicacion'])
                
        print(f"[+] ¡Éxito! Se inyectaron {len(personas)} personas desde las notas a mano.")
    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    inyectar_manuscritos()
