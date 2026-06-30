from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

def inyectar_macro_datos():
    print("[*] Inyectando Inteligencia Global (ReliefWeb / ONU)...")
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    try:
        session.run('''
            MERGE (m:MacroCrisis {evento: 'Terremoto Venezuela 2026'})
            SET m.fallecidos_oficiales = 164,
                m.heridos_oficiales = 971,
                m.magnitud = 7.5,
                m.fuente = 'ReliefWeb (ONU)',
                m.fecha_actualizacion = '2026-06-25'
        ''')
        print("[+] Macro-Datos inyectados exitosamente en la Bóveda Neo4j.")
    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    inyectar_macro_datos()
