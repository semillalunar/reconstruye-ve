import os
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

def update_declaraciones():
    print("[*] Conectando a Neo4j para inyección de Declaración Oficial en Vivo...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        print("[*] Creando esquema de Declaración Oficial...")
        session.run('''
            MERGE (d:DeclaracionOficial {id: "AN-29JUN-01"})
            SET d.vocero = "Jorge Rodriguez",
                d.cargo = "Presidente de la Asamblea Nacional",
                d.fecha_hora = "2026-06-29",
                d.canal = "Transmisión de Radio Oficial",
                d.resumen = "Réplica de moderada intensidad (4.6) sin daños adicionales reportados. Cifra oficial de fallecidos actualizada a 1817.",
                d.fallecidos_reportados = 1817
        ''')
        
        # Opcional: Relacionar esta declaración con el evento del Sismo 29 Jun si existe, 
        # o crear un nodo para el sismo del 29.
        session.run('''
            MERGE (s:Sismo {id: "SISMO-29JUN"})
            SET s.fecha = "2026-06-29",
                s.magnitud = 4.6,
                s.ubicacion = "Caraballeda, La Guaira"
            
            WITH s
            MATCH (d:DeclaracionOficial {id: "AN-29JUN-01"})
            MERGE (d)-[:SE_REFIERE_A]->(s)
        ''')
        
        print("[+] Declaración oficial inyectada en la base de datos civil con éxito.")
        
    except Exception as e:
        print(f"[-] Error durante la inyección: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    update_declaraciones()
