from flask import Flask, jsonify
from neo4j import GraphDatabase

app = Flask(__name__)

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

# Diccionario táctico de geolocalización (Coordenadas aproximadas en Caracas/La Guaira)
# Esto convierte los nombres de texto en ubicaciones reales en el mapa 3D
GPS_DATABASE = {
    "Hospital Universitario de Caracas": {"lat": 10.4878, "lng": -66.8853},
    "CRUZ ROJA": {"lat": 10.5056, "lng": -66.9036},
    "PERIFÉRICO DE CATIA": {"lat": 10.5144, "lng": -66.9458},
    "HOSPITAL DOMINGO LUCIANI": {"lat": 10.4731, "lng": -66.8115},
    "HOSPITAL PÉREZ CARREÑO": {"lat": 10.4735, "lng": -66.9416},
    "Desconocida": {"lat": 10.6015, "lng": -66.9388} # Coordenada default (La Guaira epicentro)
}

@app.route('/api/v1/mapa/crisis', methods=['GET'])
def get_hologram_data():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        # Extraer densidad de personas por ubicación
        result = session.run('''
            MATCH (r:Reporte)
            WITH r.ubicacion AS ubicacion, count(r) AS cantidad
            RETURN ubicacion, cantidad
            ORDER BY cantidad DESC
        ''')
        
        hologram_nodes = []
        for record in result:
            ubicacion = record['ubicacion'].upper().strip()
            # Buscar coordenadas en la base de datos (fuzzy match simple)
            coords = GPS_DATABASE.get("Desconocida")
            for key, val in GPS_DATABASE.items():
                if key.upper() in ubicacion:
                    coords = val
                    break
            
            hologram_nodes.append({
                "LocationName": record['ubicacion'],
                "Latitude": coords['lat'],
                "Longitude": coords['lng'],
                "VictimCount": record['cantidad'],
                # Si hay más de 50 personas, el pilar será rojo oscuro (Alta Prioridad)
                "ThreatLevel": "CRITICAL" if record['cantidad'] > 50 else "WARNING"
            })
            
        return jsonify({
            "status": "success",
            "active_nodes": len(hologram_nodes),
            "data": hologram_nodes
        })
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        session.close()
        driver.close()

if __name__ == '__main__':
    print("[*] Iniciando Puente Holográfico (Unreal Engine Bridge)...")
    print("[+] Servidor escuchando en: http://localhost:5000/api/v1/mapa/crisis")
    app.run(host='0.0.0.0', port=5000)
