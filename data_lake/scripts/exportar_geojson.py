import json
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"
OUTPUT_FILE = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\catia_la_mar_crisis.geojson"

def exportar_geojson():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        print("[*] Obteniendo datos de Neo4j...")
        result = session.run('''
            MATCH (e:Edificio)
            OPTIONAL MATCH (r:Rescatado)-[:ENCONTRADO_EN]->(e)
            OPTIONAL MATCH (f:Fallecido)-[:RECUPERADO_EN]->(e)
            RETURN 
                e.nombre AS nombre, 
                e.latitud AS latitud, 
                e.longitud AS longitud,
                count(DISTINCT r) AS rescatados,
                count(DISTINCT f) AS fallecidos
        ''')
        
        features = []
        for record in result:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [record["longitud"], record["latitud"]] # GeoJSON is [Lng, Lat]
                },
                "properties": {
                    "Nombre_Edificio": record["nombre"],
                    "Rescatados": record["rescatados"],
                    "Fallecidos": record["fallecidos"]
                }
            }
            features.append(feature)
            
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(geojson, f, ensure_ascii=False, indent=2)
            
        print(f"[+] Archivo GeoJSON exportado exitosamente en: {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    exportar_geojson()
