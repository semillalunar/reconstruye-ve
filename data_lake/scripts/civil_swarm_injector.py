import json
import random
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

def run_swarm_injection():
    print("[*] Iniciando Inyección Masiva del Enjambre Civil...")
    
    # Simulación de datos extraídos por el enjambre de 5 plataformas
    fuentes = [
        "venezuelatebusca.com",
        "encuentramevzla.com",
        "civisvenezuela.com",
        "terremotovenezuela.com",
        "responsegrid.app"
    ]
    
    nombres_comunes = ["Daniel", "Lucia", "Andres", "Camila", "Diego", "Valentina", "Gabriel", "Sofia", "Ricardo", "Elena"]
    apellidos_comunes = ["Silva", "Mendoza", "Castillo", "Rojas", "Cordero", "Salazar", "Perez", "Gimenez", "Herrera", "Medina"]
    ubicaciones = ["Desconocida", "Hospital Perez Carreño", "Hospital Universitario de Caracas", "Campamento de Refugiados (Macuto)"]
    estatus_posibles = ["Desaparecido", "Localizado", "Rescatado", "Hospitalizado"]
    
    mock_database = []
    
    # Inyectamos 10 registros por plataforma (50 totales para la demostración del cruce)
    for fuente in fuentes:
        for i in range(10):
            n = random.choice(nombres_comunes)
            a = random.choice(apellidos_comunes)
            mock_database.append({
                "nombre": f"{n} {a}",
                "estatus": random.choice(estatus_posibles),
                "ubicacion": random.choice(ubicaciones),
                "fuente": fuente
            })

    # Forzamos un cruce de inteligencia para demostrar el poder de Neo4j
    mock_database.append({"nombre": "Orozco Yusbelis", "estatus": "Localizado", "ubicacion": "Campamento de Refugiados (Macuto)", "fuente": "responsegrid.app"})

    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    inyectados = 0
    try:
        for record in mock_database:
            session.run('''
                MERGE (p:Persona {nombre: $nombre})
                CREATE (r:Reporte {
                    fuente: $fuente,
                    fecha: '2026-06-28',
                    ubicacion: $ubicacion,
                    estatus: $estatus
                })
                MERGE (p)-[:VISTO_EN]->(r)
            ''', 
            nombre=record['nombre'], 
            ubicacion=record['ubicacion'], 
            estatus=record['estatus'],
            fuente=record['fuente'])
            inyectados += 1
            
        print(f"[+] {inyectados} registros de inteligencia civil inyectados masivamente en Neo4j.")
        
    except Exception as e:
        print(f"[-] Error en inyección Neo4j: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    run_swarm_injection()
