import csv
import random
from neo4j import GraphDatabase
import os

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"
OUTPUT_PATH = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\data_lake\CrisisData.csv"

# Coordenadas base en Caracas / La Guaira para centros no geolocalizados
BASE_LAT = 10.4880
BASE_LNG = -66.8850

def exportar_csv():
    print("[*] Iniciando Exportación de la API Oficial para Unreal Engine...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        # Extraer densidad de personas DTV por Centro
        result = session.run('''
            MATCH (p:PersonaDTV)
            OPTIONAL MATCH (p)-[:ATENDIDA_EN]->(c:Centro)
            WITH COALESCE(c.nombre, "Desconocida") AS ubicacion, count(p) AS cantidad
            RETURN ubicacion, cantidad
            ORDER BY cantidad DESC
        ''')
        
        with open(OUTPUT_PATH, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            # Cabeceras requeridas por Unreal Engine DataTable (La primera columna es RowName)
            writer.writerow(["RowName", "LocationName", "Latitude", "Longitude", "VictimCount", "ThreatLevel"])
            
            row_index = 1
            for record in result:
                ubicacion = record['ubicacion']
                cantidad = record['cantidad']
                
                # Asignación de coordenadas simulada para la visualización holográfica
                # (En producción esto consumiría una API de Geocoding como Google Maps)
                if ubicacion == "Desconocida":
                    lat = 10.6015
                    lng = -66.9388
                else:
                    # Distribución aleatoria controlada alrededor de Caracas para mapear los 72 centros
                    lat = BASE_LAT + random.uniform(-0.05, 0.05)
                    lng = BASE_LNG + random.uniform(-0.05, 0.05)
                
                threat = "CRITICAL" if cantidad > 50 else "WARNING"
                
                # RowName debe ser único para Unreal Engine
                row_name = f"Loc_{row_index}"
                writer.writerow([row_name, ubicacion, lat, lng, cantidad, threat])
                row_index += 1
                
        print(f"[+] Exportación exitosa. Archivo CSV actualizado para Unreal Engine en: {OUTPUT_PATH}")
        print(f"[!] Importante: Se exportaron {row_index - 1} centros de acopio/hospitales.")
        
    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    exportar_csv()
