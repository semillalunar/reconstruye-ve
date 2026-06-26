# Reconstruye VE 🇻🇪

**Plataforma Open-Source de Triaje Estructural y Evaluación Cruzada**

> *Frente a las emergencias, la organización civil y el conocimiento técnico son nuestras mejores herramientas para ayudar de forma eficiente.*

Esta es una iniciativa independiente, colaborativa y sin fines de lucro enfocada en la emergencia post-sismo en Venezuela. Nuestro objetivo inmediato es proveer un sistema descentralizado donde los ciudadanos puedan reportar daños estructurales con "fricción cero", y un panel donde ingenieros voluntarios puedan validar la gravedad de esos daños a distancia, generando un mapa civil certificado de necesidades urgentes.

## 🚀 Arquitectura del Proyecto

El proyecto está diseñado bajo un enfoque **Offline-First** y de **Privacidad por Diseño** para proteger a los usuarios.

### Fase 1: El Foco Inmediato (Reporte y Triaje)
Buscamos colaboración urgente para desarrollar y pulir estos dos componentes críticos:

#### 1. Frontend (Captura Ciudadana de Fricción Cero)
*   **Stack:** Next.js (App Router), React, TailwindCSS, TypeScript.
*   **Concepto:** Una PWA "Mobile-First" (tipo *Story*). El ciudadano toma hasta 3 fotos, responde un Árbol de Decisión Binario muy simple (Paredes vs Estructura) y el sistema le pre-asigna un nivel de gravedad visual (🟢 🟡 🔴).
*   **Ubicación:** Carpeta `/frontend`

#### 2. Backend Relacional y Panel de Expertos
*   **Stack:** PostgreSQL + PostGIS (Docker).
*   **Concepto:** Almacenar el mapa de reportes ciudadanos y sus coordenadas geoespaciales. Desarrollar el backend y la UI de "Evaluación Cruzada" (Triaje Ciego) donde 3 ingenieros voluntarios revisan la misma foto para certificar el nivel de riesgo.
*   **Ubicación:** Raíz (`docker-compose.yml`, `db_init.sql`)

### Fase 2: Auditoría Cívica (Pipeline Anticorrupción)
*Actualmente en etapa de prueba de concepto.*
Un módulo en Python (FastAPI + OCR + Neo4j) diseñado para cruzar la ubicación de los daños estructurales verificados con los fondos públicos asignados a contratistas del Estado. Aunque el código base ya está en el repositorio (`/backend`), nuestro foco primario ahora mismo es consolidar la Fase 1 para asistir en la emergencia.

## 🛠️ ¿Cómo colaborar?

¡Estamos buscando Desarrolladores Web (React/Next.js), Desarrolladores Backend (Postgres/Python) y, sobre todo, **Ingenieros Civiles / Arquitectos** para calibrar el árbol de decisiones estructurales!

1.  Asegúrate de tener **Docker** y **Node.js** instalados.
2.  Clona este repositorio.
3.  Levanta la base de datos local: `docker compose up -d postgres`
4.  Levanta el Frontend: `cd frontend && npm install && npm run dev`
5.  Revisa la pestaña de *Issues* para tomar tareas o proponer mejoras en la interfaz.

---
*Organización ciudadana aplicada a la tecnología.*
