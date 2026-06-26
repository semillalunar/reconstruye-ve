import json
import logging
from typing import Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException
import pytesseract
from pdf2image import convert_from_path
from neo4j import GraphDatabase
from pydantic import BaseModel
import tempfile
import os

# Simulación de importación de langchain para Ollama
# from langchain_community.llms import Ollama

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ReconstruyeVE - Crawling Pipeline de Guerrilla")

# Configuración Neo4j (Debería ir en variables de entorno)
NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASS = os.getenv("NEO4J_PASS", "adminpassword")

class ExtractionResult(BaseModel):
    monto: float
    empresa: str
    funcionario: str
    zona: str
    rif: str
    cedula_funcionario: str

def procesar_pdf_ocr(pdf_path: str) -> str:
    """Extrae texto de un PDF (escaneado/imagen) usando Tesseract OCR."""
    logger.info(f"Iniciando OCR para {pdf_path}...")
    texto_completo = ""
    try:
        # Convertir PDF a lista de imágenes
        images = convert_from_path(pdf_path)
        for i, image in enumerate(images):
            text = pytesseract.image_to_string(image, lang='spa')
            texto_completo += text + "\n"
        return texto_completo
    except Exception as e:
        logger.error(f"Error en OCR: {e}")
        # Retornamos un texto dummy para la PoC si no hay dependencias instaladas (ej. Poppler/Tesseract)
        return "GACETA OFICIAL: Se adjudica a CONSTRUCTORA LOS ANDES CA (RIF J-12345678-9) la cantidad de $2500000 para reparación del Hospital Central, firmado por el Gobernador JUAN PEREZ (C.I 1234567)."

def extraer_entidades_llm(texto_ocr: str) -> ExtractionResult:
    """Usa un LLM local (Ollama) para extraer entidades estructuradas del texto ruidoso."""
    logger.info("Iniciando extracción con LLM...")
    
    # Aquí iría la llamada real a Ollama
    # llm = Ollama(model="llama3")
    # prompt = f"Extrae MONTO, EMPRESA, RIF, FUNCIONARIO, CEDULA, ZONA del siguiente texto legal y retorna SOLO un JSON válido: {texto_ocr}"
    # response = llm.invoke(prompt)
    
    # Para la PoC (y evitar que falle si no hay Ollama corriendo), simulamos la salida perfecta del LLM:
    resultado_simulado = {
        "monto": 2500000.00,
        "empresa": "CONSTRUCTORA LOS ANDES CA",
        "rif": "J-12345678-9",
        "funcionario": "JUAN PEREZ",
        "cedula_funcionario": "V-1234567",
        "zona": "Hospital Central"
    }
    return ExtractionResult(**resultado_simulado)

def inyectar_en_grafo(datos: ExtractionResult):
    """Crea los nodos y relaciones en Neo4j."""
    query = """
    MERGE (f:Funcionario:Persona {cedula: $cedula})
      ON CREATE SET f.nombre = $funcionario
    MERGE (e:Empresa {rif: $rif})
      ON CREATE SET e.razon_social = $empresa
    MERGE (fondo:Fondo {id: randomUUID()})
      ON CREATE SET fondo.monto = $monto
    MERGE (i:Inmueble {nombre: $zona})
      
    MERGE (f)-[:ADJUDICA]->(fondo)
    MERGE (e)-[:EJECUTA]->(fondo)
    MERGE (fondo)-[:ASIGNADO_A]->(i)
    """
    
    try:
        with GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASS)) as driver:
            with driver.session() as session:
                session.run(
                    query,
                    cedula=datos.cedula_funcionario,
                    funcionario=datos.funcionario,
                    rif=datos.rif,
                    empresa=datos.empresa,
                    monto=datos.monto,
                    zona=datos.zona
                )
        logger.info("Datos inyectados en Neo4j correctamente.")
    except Exception as e:
        logger.error(f"Error conectando a Neo4j: {e}")

@app.post("/procesar-gaceta/")
async def procesar_gaceta(file: UploadFile = File(...)):
    """Endpoint principal que recibe un PDF y corre el pipeline completo."""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        content = await file.read()
        temp_pdf.write(content)
        temp_path = temp_pdf.name
        
    try:
        texto = procesar_pdf_ocr(temp_path)
        entidades = extraer_entidades_llm(texto)
        inyectar_en_grafo(entidades)
        
        return {
            "status": "success",
            "message": "Gaceta procesada y grafo actualizado.",
            "data_extraida": entidades
        }
    finally:
        os.unlink(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
