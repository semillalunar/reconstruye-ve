# Reconstruye VE 🇻🇪

**Plataforma de Mapeo y Triaje de Daños Estructurales (Post-Sismo)**

> *Frente a las emergencias, la organización civil y el conocimiento técnico son nuestras mejores herramientas para ayudar de forma eficiente.*

Esta es una iniciativa independiente, colaborativa y sin fines de lucro. El objetivo es crear un sistema para mapear daños estructurales reportados por ciudadanos y cruzarlos con contratos estatales para detonar alertas tempranas de corrupción (Índice de Riesgo de Desvío).

## 🚀 Arquitectura del Proyecto (Prueba de Concepto)

El proyecto está diseñado bajo un enfoque **Anti-Censura** y **Zero-Knowledge** para proteger a los ciudadanos en entornos hostiles.

### 1. Frontend (Captura Ciudadana de Fricción Cero)
*   **Stack:** Next.js (App Router), React, TailwindCSS, TypeScript.
*   **Concepto:** Una PWA "Mobile-First" que simula la experiencia de tomar una "Story". El ciudadano toma 3 fotos, responde un Árbol de Decisión Binario (Paredes vs Estructura) y el sistema asigna un nivel de gravedad (🟢 🟡 🔴).
*   **Ubicación:** Carpeta `/frontend`

### 2. Backend (Guerrilla OCR & Grafos)
*   **Stack:** Python, FastAPI, Tesseract (OCR), Integración con LLM local (Ollama).
*   **Concepto:** Un pipeline que ingesta Gacetas Oficiales opacas en PDF, extrae entidades mediante IA (Montos, Obras, Contratistas) y las estructura.
*   **Ubicación:** Carpeta `/backend`

### 3. Infraestructura de Datos (Docker)
*   **Relacional (PostgreSQL + PostGIS):** Para almacenar el mapa de reportes ciudadanos verificados y sus coordenadas geoespaciales.
*   **Grafos (Neo4j):** Para modelar las redes de relaciones (Empresa -> Funcionario -> Obra) y detectar Nepotismo o Desvío de Fondos mediante algoritmos de grafos.
*   **Ubicación:** Raíz (`docker-compose.yml`, `db_init.sql`, `db_init.cypher`)

## 🛠️ ¿Cómo colaborar?

¡Estamos buscando Ingenieros Civiles y Desarrolladores (Web/Datos)! Si quieres aportar código:

1.  Asegúrate de tener **Docker** y **Node.js** instalados.
2.  Clona este repositorio.
3.  Levanta las bases de datos: `docker compose up -d`
4.  Levanta el Frontend: `cd frontend && npm install && npm run dev`
5.  Revisa los issues abiertos para tomar tareas de diseño, validación o backend.

---
*La tecnología no es neutral, es defensiva.*
