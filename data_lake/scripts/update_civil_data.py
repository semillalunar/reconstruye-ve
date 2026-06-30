import os
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

def update_database():
    print("[*] Conectando a Neo4j para inyección de Datos Civiles y FUNVISIS...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        # 1. Inyectar Estadísticas Globales del Dashboard Civil
        print("[*] Actualizando Cifras Maestras (Registro Civil)...")
        session.run('''
            MERGE (s:StatGlobal {fecha: "2026-06-29"})
            SET s.total_registros = 61876,
                s.sin_contacto = 46440,
                s.localizados = 15436,
                s.fuente = "desaparecidosterremotovenezuela.com"
        ''')
        
        # 2. Digitalización de Inspección Estructural FUNVISIS
        print("[*] Creando esquema de Inspección FUNVISIS para Residencias Park...")
        session.run('''
            MERGE (e:Edificacion {nombre: "Residencias Park"})
            SET e.direccion = "Av. El Parque, Caracas",
                e.pisos = 7,
                e.sotanos = 0,
                e.coordenadas = "10.4900, -66.9050" // Aprox Caracas Centro

            MERGE (i:InspeccionEstructural {id_form: "FUNVISIS-001"})
            SET i.fecha = "2026-06-29",
                i.inspector = "Jose Silva",
                i.etiqueta = "Verde", // Acceso Permitido
                i.riesgo_externo = "B (Moderado)",
                i.danos_no_estructurales = ["Grietas en paredes", "Deformacion visible"],
                i.recomendaciones = ["Revisar fosa y sala de maquinas de ascensor", "Revisar fachada de PH", "Revision del gas"]
            
            MERGE (i)-[:EVALUA]->(e)
        ''')
        
        # 3. Insertar personas localizadas/desaparecidas del dashboard como muestra
        session.run('''
            MERGE (p1:Persona {nombre: "Egardo Corro"}) SET p1.estado = "Sin Contacto", p1.ubicacion = "La Guaira"
            MERGE (p2:Persona {nombre: "Amable Fraximides Hernandez"}) SET p2.estado = "Sin Contacto", p2.ubicacion = "Caraballeda"
            MERGE (p3:Persona {nombre: "Natasha Zamora"}) SET p3.estado = "Localizado", p3.ubicacion = "Catia La Mar"
            MERGE (p4:Persona {nombre: "Elias Isaac Lucena"}) SET p4.estado = "Sin Contacto", p4.ubicacion = "Caraballeda"
            MERGE (p5:Persona {nombre: "Carlos Gazaneo"}) SET p5.estado = "Localizado", p5.ubicacion = "La Guaira"
        ''')
        
        print("[+] Base de datos actualizada con éxito.")
        
    except Exception as e:
        print(f"[-] Error durante la inyección: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    update_database()
