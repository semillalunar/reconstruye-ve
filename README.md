# Reconstruye VE 🇻🇪

**Plataforma Open-Source de Triaje Estructural y Evaluación Rápida de Daños (Estándar ATC-20)**

> *Nuestra intención principal es colaborar en la recolección de datos precisos a través de reportes estandarizados, siguiendo estrictamente los protocolos internacionales (ATC-20 / FUNVISIS).*

Frente a la emergencia, la organización civil guiada por el rigor técnico es nuestra mejor herramienta. Este proyecto es una iniciativa independiente y de código abierto para dotar a los grupos de ingenieros voluntarios (y a la ciudadanía) de una plataforma descentralizada para mapear y certificar daños estructurales de forma rápida e in-situ.

## 🚀 Arquitectura y Módulos del Proyecto

El sistema está diseñado para capturar la realidad del terreno en dos niveles, utilizando un enfoque **Offline-First** y **PostGIS** para el análisis geoespacial.

### Fase 1: El Foco Inmediato (Recolección de Datos y Triaje)
Buscamos colaboración urgente para desarrollar y extender estos dos frentes de inspección:

#### A. Módulo Profesional: Planilla ATC-20 Digital (Inspección In-Situ)
*   **Concepto:** Digitalización exacta de la *"Planilla de Evaluación Rápida de Daños en Edificaciones"* (Adaptación Venezolana del ATC-20). Permite a los grupos de ingenieros certificados llenar la evaluación paso a paso en su teléfono, siguiendo el Manual de Entrenamiento oficial, y emitiendo Etiquetas (🟢 Verde, 🟡 Amarilla, 🔴 Roja) ancladas con GPS.
*   **Ruta Web:** `http://localhost:3000/evaluacion`
*   **Stack:** Next.js (Server Actions), React, PostgreSQL + PostGIS.

#### B. Módulo Ciudadano: Reporte de Fricción Cero
*   **Concepto:** Una interfaz ultra-simple para que cualquier persona afectada pueda reportar visualmente daños en paredes o estructuras mediante fotografías, proveyendo a los ingenieros de una "primera línea de alerta" antes de la inspección ATC-20.
*   **Ruta Web:** `http://localhost:3000/`
*   **Stack:** Next.js, TailwindCSS.

### Fase 2: Panel de Expertos y Auditoría Cívica
*   **Panel de Triaje Ciego:** Desarrollo pendiente para que 3 ingenieros validen remotamente las fotografías ciudadanas antes de enviar un equipo in-situ.
*   **Auditoría Anticorrupción:** Módulo en Python para cruzar ubicaciones de daños con registros públicos. (En prueba de concepto, nuestro foco actual es 100% la recolección de datos vitales).

## 🛠️ ¿Cómo colaborar?

¡Necesitamos Desarrolladores Web (React/Next.js), Expertos en Bases de Datos (Postgres/PostGIS) y **muy especialmente: Ingenieros Civiles y Arquitectos capacitados en el protocolo ATC-20**!

1.  Asegúrate de tener **Docker** y **Node.js** instalados.
2.  Clona este repositorio.
3.  Levanta las bases de datos (PostgreSQL/Neo4j): `docker compose up -d`
4.  Levanta el servidor web: `cd frontend && npm install && npm run dev`
5.  Abre `http://localhost:3000/evaluacion` para ver la planilla ATC-20 en acción.
6.  Revisa los *Issues* en GitHub o abre un *Pull Request* con tus mejoras.

---
*Organización ciudadana aplicada a la tecnología.*
