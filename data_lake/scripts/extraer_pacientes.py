import os
import docx
from neo4j import GraphDatabase

# Rutas y Constantes
DOCX_PATH = r"C:\Users\BICHOTA\.gemini\antigravity\scratch\reconstruye_ve\data_lake\drive_hospitales\LISTAS DE PERSONAS EN MULTIPLES HOSPITALES.docx"
NEO4J_URI = "bolt://localhost:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "adminpassword"

def extraer_datos_docx(ruta):
    print(f"[*] Leyendo documento: {ruta}")
    try:
        doc = docx.Document(ruta)
    except Exception as e:
        print(f"[-] Error abriendo docx: {e}")
        return []

    pacientes = []
    
    # Recorrer todas las tablas en el documento
    for i, table in enumerate(doc.tables):
        print(f"[*] Escaneando tabla {i+1}...")
        for row_idx, row in enumerate(table.rows):
            # Saltar el encabezado (asumimos que la primera fila es encabezado o que el encabezado dice "HOSPITAL")
            if row_idx == 0:
                continue
                
            cells = row.cells
            if len(cells) >= 4:
                # Nº | HOSPITAL | APELLIDOS Y NOMBRES | EDAD
                hospital = cells[1].text.strip()
                nombre = cells[2].text.strip()
                edad = cells[3].text.strip()
                
                if nombre and nombre.lower() != "apellidos y nombres" and hospital:
                    pacientes.append({
                        "hospital": hospital,
                        "nombre": nombre,
                        "edad": edad
                    })
    
    print(f"[+] Total de pacientes extraídos: {len(pacientes)}")
    return pacientes

def inyectar_en_neo4j(pacientes):
    print("[*] Conectando a Neo4j...")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    def add_paciente(tx, p):
        # Asegurar que el Hospital existe (Categoría Salud implícita)
        tx.run('''
            MERGE (h:Organizacion {nombre: $hospital})
            ON CREATE SET h.categoria = "Hospital (Automático)"
        ''', hospital=p['hospital'])
        
        # Crear Paciente y relacionarlo
        tx.run('''
            MERGE (pac:Paciente {nombre: $nombre, edad: $edad})
            WITH pac
            MATCH (h:Organizacion {nombre: $hospital})
            MERGE (pac)-[:INGRESADO_EN]->(h)
        ''', nombre=p['nombre'], edad=p['edad'], hospital=p['hospital'])

    try:
        with driver.session() as session:
            for p in pacientes:
                session.execute_write(add_paciente, p)
        print("[+] Inyección en Neo4j completada con éxito.")
    except Exception as e:
        print(f"[-] Error en la inyección de Neo4j: {e}")
    finally:
        driver.close()

if __name__ == "__main__":
    if not os.path.exists(DOCX_PATH):
        print("[-] El archivo DOCX no fue encontrado en la ruta.")
    else:
        pacientes_extraidos = extraer_datos_docx(DOCX_PATH)
        if pacientes_extraidos:
            inyectar_en_neo4j(pacientes_extraidos)
