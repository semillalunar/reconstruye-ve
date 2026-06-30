import json
from neo4j import GraphDatabase

URI = "bolt://localhost:7687"
USER = "neo4j"
PASSWORD = "adminpassword"

# Lista de desaparecidos extraída del PDF (28-6VenezuelaSeBusca.pdf)
nombres_pdf = [
    "Angel García", "Ysmael Peña Pérez", "Santiago Abraham Longart", "Mirla Mercedes Vasquez",
    "Carlos Alfredo esaa Gonzalez", "Niulka Oheris Moreno Valdés", "Noris Diaz Bajares", 
    "Royni Alexander", "Eduardo osal", "Luis Manuel Iguaro", "Eduardo José osal mujica", 
    "Fernando urbina", "Servulo Eduardo Guillermo", "Ibis Suleime Sampallo Grimon", 
    "Carlos Daniel Rondon Reyes", "Ainoha Chaparro", "Zoimar Carolina Mendoza Perez", 
    "Jorge Emilio Gomez Portas", "Geibe Carrillo Nuñez", "Siso Edul", 
    "Félix Rubén Velázquez González", "Marisol Escalona", "Diego tovar", "Lizmar Rodríguez", 
    "Odalis del Carmen Marín Maitan", "Miguel Antonio Silva Colmenarez", "Ezequías Ballesteros", 
    "Alexander lopez", "Yadira Coromoto Gómez", "Ainhoa Nazareth Principal", "Alejandro Barrios", 
    "José del pilar Valero Rumbos", "Carlos Eduardo Ceballos", "Luisa Amelia Griman de Oropeza", 
    "Leda Quintero", "Jhonatan Gregorio Lamus Gracia", "Daniel alejandro nuñez ramirez", 
    "Aura Ysabel Serrano Romero", "Kleiber Daniel Navarro Montagut", "Yexsy vargas", 
    "Samuel Capriles Guerrero", "Wilmer José Pérez Galeano", "Regulo Reyes", "Andy Maldonado", 
    "Andreu Santiago j.lopez", "Vallejo Triviño Karol Vanessa", "Sacha josefina chagua", 
    "Ingrid Gisela Medina Garcia"
]

def ingestar_pdf():
    driver = GraphDatabase.driver(URI, auth=(USER, PASSWORD))
    session = driver.session()
    
    print(f"[*] Procesando {len(nombres_pdf)} perfiles del PDF VenezuelaSeBusca...")
    matches = 0
    
    try:
        for nombre in nombres_pdf:
            # Buscar coincidencia
            result = session.run('''
                MATCH (p)
                WHERE (p:Rescatado OR p:Fallecido) AND toLower(p.nombre) CONTAINS toLower($nombre_corto)
                RETURN labels(p) AS etiqueta, p.nombre AS nombre_db, p.ubicacion AS ubicacion
            ''', nombre_corto=nombre.split(' ')[0]) # Búsqueda flexible por primer nombre o coincidencia parcial
            
            records = list(result)
            
            # Si hay coincidencia exacta o muy cercana
            match_found = False
            for record in records:
                # Comprobación más estricta en Python si es necesario, pero confiaremos en la base de datos por ahora
                # Solo para simplificar, si el nombre del PDF está en la DB o viceversa
                db_name = record["nombre_db"].lower()
                if nombre.lower() in db_name or db_name in nombre.lower():
                    print(f"[!] COINCIDENCIA REAL DETECTADA: {nombre}")
                    print(f"    -> En nuestra BD es: {record['nombre_db']} ({record['etiqueta'][0]} en {record['ubicacion']})")
                    
                    # Registrar reporte web obsoleto/falso
                    session.run('''
                        MATCH (p {nombre: $nombre_db})
                        MERGE (r:ReporteWeb {plataforma: 'VenezuelaSeBusca PDF', estatus: 'Desaparecido'})
                        MERGE (p)-[:TIENE_REPORTE_WEB {estado_real: $etiqueta}]->(r)
                    ''', nombre_db=record["nombre_db"], etiqueta=record["etiqueta"][0])
                    matches += 1
                    match_found = True
                    break
            
            if not match_found:
                # Insertar como nuevo desaparecido si no existe
                session.run('''
                    MERGE (p:Desaparecido {nombre: $nombre})
                    MERGE (r:ReporteWeb {plataforma: 'VenezuelaSeBusca PDF', estatus: 'Desaparecido'})
                    MERGE (p)-[:TIENE_REPORTE_WEB]->(r)
                ''', nombre=nombre)
                
        print(f"\\n[+] Ingesta de PDF finalizada. Se agregaron los nuevos desaparecidos a la BD.")
        print(f"[+] Se encontraron {matches} coincidencias con la verdad de campo.")
    except Exception as e:
        print(f"[-] Error: {e}")
    finally:
        session.close()
        driver.close()

if __name__ == "__main__":
    ingestar_pdf()
