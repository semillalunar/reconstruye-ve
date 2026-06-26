# Reconstruye VE 🇻🇪

**Plataforma Open-Source de Triaje Estructural y Evaluación Rápida de Daños (Estándar ATC-20)**

> *Nuestra intención principal es colaborar en la recolección de datos precisos a través de reportes estandarizados, siguiendo estrictamente los protocolos internacionales (ATC-20 / FUNVISIS).*

Frente a la emergencia, la organización civil guiada por el rigor técnico es nuestra mejor herramienta. Este proyecto es una iniciativa independiente y de código abierto para dotar a los grupos de ingenieros voluntarios (y a la ciudadanía) de una plataforma descentralizada para mapear y certificar daños estructurales de forma rápida e in-situ.

## 🚀 Arquitectura y Módulos del Proyecto (Fase 1 Activa)

El sistema está diseñado para capturar la realidad del terreno en dos niveles, utilizando un enfoque **Offline-First**, captura de **Evidencia Fotográfica** y **PostGIS** para el análisis geoespacial.

### A. Módulo Profesional: Planilla ATC-20 Digital (Inspección In-Situ)
*   **Concepto:** Digitalización *línea por línea* de la "Planilla de Evaluación Rápida de Daños en Edificaciones". Ya no es un asistente, es una **Planilla Vertical Oficial** (Checklist) donde el ingeniero marca cada daño estructural (colapso, columnas, muros) y añade **Anotaciones** libres.
*   **Algoritmo en Vivo:** El sistema calcula automáticamente el Nivel de Riesgo (Bajo, Medio, Alto) por sección y sugiere la **Etiqueta Final (🟢 🟡 🔴)** según el protocolo oficial.
*   **Evidencia Oficial:** Permite al ingeniero capturar y adjuntar hasta 5 fotografías oficiales de los daños.
*   **Ruta Web:** `http://localhost:3000/evaluacion`

### B. Módulo Ciudadano: Solicitud de Inspección
*   **Concepto:** Un formulario amigable para que el dueño de la edificación afectada solicite ayuda técnica a las brigadas de ingenieros. 
*   **Geolocalización In-Situ:** Extrae las coordenadas GPS automáticamente al momento del envío para que la cuadrilla no se pierda.
*   **Micro-Guía Fotográfica:** Enseña al ciudadano cómo tomar fotos útiles (Max. 5) antes de enviarlas (Ej. *"Una general, una de la grieta, evite fotos borrosas"*).
*   **Ruta Web:** `http://localhost:3000/solicitud`
*   *(Nota: Se mantiene la ruta raíz `/` como experimento PWA de "Reporte Anónimo de Fricción Cero").*

### Fase 2: Auditoría Cívica (En desarrollo)
*   **Auditoría Anticorrupción:** Módulo en Python para cruzar las ubicaciones geolocalizadas de los daños severos con los registros públicos de obras y presupuestos asignados por el Estado. 

## 🛠️ ¿Cómo colaborar?

¡Necesitamos Desarrolladores Web (React/Next.js), Expertos en Bases de Datos (Postgres/PostGIS) y **muy especialmente: Ingenieros Civiles y Arquitectos capacitados en el protocolo ATC-20**!

1.  Asegúrate de tener **Docker** y **Node.js** instalados.
2.  Clona este repositorio.
3.  Levanta las bases de datos (PostgreSQL/Neo4j): `docker compose up -d`
4.  Levanta el servidor web: `cd frontend && npm install && npm run dev`
5.  Abre `http://localhost:3000/evaluacion` para ver el Checklist técnico.
6.  Revisa los *Issues* en GitHub o abre un *Pull Request* con tus mejoras.

---
*Organización ciudadana aplicada a la tecnología.*
