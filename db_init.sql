-- Habilitar la extensión geoespacial para mapeo de sismos
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de Reportes Ciudadanos (Anonimato Zero-Knowledge)
CREATE TABLE reportes_infraestructura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash_dispositivo TEXT NOT NULL, -- Llave derivada de la Frase Semilla (No IP, No Email)
    tipo_infraestructura VARCHAR(50) NOT NULL, -- Hospital, Escuela, Edificio, etc.
    gravedad_ciudadano VARCHAR(20) NOT NULL, -- Verde, Amarillo, Rojo
    coordenadas GEOMETRY(Point, 4326) NOT NULL, -- PostGIS Geo-coordenadas (Lat, Lon)
    url_imagenes TEXT[] NOT NULL, -- Array de URLs a IPFS/Almacenamiento descentralizado
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Campos de Moderación Técnica (Workflow Asíncrono)
    estatus_validacion VARCHAR(30) DEFAULT 'Pendiente', -- Pendiente, En Revisión, Validado, Rechazado
    gravedad_tecnica VARCHAR(20), -- Asignado por el ingeniero
    votos_consenso INT DEFAULT 0
);

-- Índice geoespacial para consultas rápidas en el mapa de calor
CREATE INDEX idx_reportes_geometria ON reportes_infraestructura USING gist(coordenadas);

-- Tabla de Evaluaciones Rápidas ATC-20 (In-Situ por Ingenieros)
CREATE TABLE evaluaciones_atc20 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Inspector
    inspector_nombre VARCHAR(150) NOT NULL,
    inspector_cedula VARCHAR(50) NOT NULL,
    -- Localización
    coordenadas GEOMETRY(Point, 4326) NOT NULL,
    direccion TEXT,
    -- Datos Edificación
    nombre_edificacion VARCHAR(150),
    uso_predominante VARCHAR(50),
    numero_pisos INT,
    material_predominante VARCHAR(50),
    -- Resultados de la Evaluación (A, B o C según manual)
    riesgo_externo VARCHAR(10), 
    piso_critico_riesgo VARCHAR(10),
    dano_moderado_riesgo VARCHAR(10),
    no_estructural_riesgo VARCHAR(10),
    -- Decisión Final (Algoritmo ATC-20)
    etiqueta_final VARCHAR(20) NOT NULL, -- VERDE, AMARILLA, ROJA
    acciones_recomendadas TEXT[],
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evaluaciones_geometria ON evaluaciones_atc20 USING gist(coordenadas);
