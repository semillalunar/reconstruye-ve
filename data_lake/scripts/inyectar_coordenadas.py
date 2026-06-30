import random
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

# Centro de Catia La Mar aproximado
BASE_LAT = 10.6030
BASE_LNG = -67.0300

def inyectar_coordenadas():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        print("[*] Obteniendo edificios de Neo4j...")
        edificios = session.run("MATCH (e:Edificio) RETURN e.nombre AS nombre")
        nombres = [record["nombre"] for record in edificios]
        
        print("[*] Inyectando coordenadas a los edificios...")
        for nombre in nombres:
            # Generar offset aleatorio pequeño para simular cuadras distintas
            lat = BASE_LAT + random.uniform(-0.005, 0.005)
            lng = BASE_LNG + random.uniform(-0.005, 0.005)
            
            session.run('''
                MATCH (e:Edificio {nombre: $nombre})
                SET e.latitud = $lat, e.longitud = $lng
            ''', nombre=nombre, lat=lat, lng=lng)
            print(f"  -> {nombre}: Lat {lat:.5f}, Lng {lng:.5f}")
            
        print("[+] Coordenadas inyectadas exitosamente.")
    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    inyectar_coordenadas()
