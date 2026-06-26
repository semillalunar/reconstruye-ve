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

-- Tabla de Evaluaciones Rápidas ATC-20 Completa (Formato Planilla Detallada)
CREATE TABLE evaluaciones_atc20_completa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- 1. INFORMACIÓN GENERAL
    inspector_nombre VARCHAR(150) NOT NULL,
    inspector_cedula VARCHAR(50) NOT NULL,
    coordenadas GEOMETRY(Point, 4326) NOT NULL,
    direccion TEXT,
    nombre_edificacion VARCHAR(150),
    uso_predominante VARCHAR(50),
    numero_pisos INT,
    material_predominante VARCHAR(50),
    
    -- 2. INSPECCIÓN EXTERNA
    ext_colapso VARCHAR(20),
    ext_aledanos VARCHAR(20),
    ext_geologico VARCHAR(20),
    ext_asentamiento VARCHAR(20),
    ext_inclinacion VARCHAR(20),
    riesgo_externo VARCHAR(5),

    -- 3. PISO CRÍTICO Y DAÑO SEVERO
    critico_acceso VARCHAR(20),
    critico_piso VARCHAR(50),
    sev_columnas INT DEFAULT 0,
    sev_muros_conc INT DEFAULT 0,
    sev_muros_mamp INT DEFAULT 0,
    sev_vigas INT DEFAULT 0,
    piso_critico_riesgo VARCHAR(5),

    -- 4. DAÑO MODERADO
    mod_tipo_elemento VARCHAR(50),
    mod_examinados INT DEFAULT 0,
    mod_danados INT DEFAULT 0,
    dano_moderado_riesgo VARCHAR(5),

    -- 5. NO ESTRUCTURAL
    noest_losas VARCHAR(20),
    noest_paredes VARCHAR(20),
    noest_tanques VARCHAR(20),
    noest_gas VARCHAR(20),
    noest_ascensores VARCHAR(20),
    no_estructural_riesgo VARCHAR(5),

    -- 6. RIESGO ASOCIADO Y ETIQUETA FINAL
    etiqueta_final VARCHAR(20) NOT NULL,
    
    -- 7. ACCIONES Y ANOTACIONES
    acciones_recomendadas TEXT[],
    comentarios TEXT,
    evidencia_fotografica TEXT[],

    creado_el TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evaluaciones_completa_geo ON evaluaciones_atc20_completa USING gist(coordenadas);

-- Tabla de Solicitudes de Inspección (Ciudadanos Afectados)
CREATE TABLE solicitudes_inspeccion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_contacto VARCHAR(150) NOT NULL,
    telefono_contacto VARCHAR(50) NOT NULL,
    direccion_exacta TEXT NOT NULL,
    tipo_edificacion VARCHAR(50) NOT NULL,
    descripcion_dano TEXT NOT NULL,
    hay_heridos BOOLEAN DEFAULT FALSE,
    coordenadas GEOMETRY(Point, 4326) NOT NULL,
    evidencia_fotografica TEXT[],
    estado VARCHAR(20) DEFAULT 'PENDIENTE', -- PENDIENTE, EN_REVISION, INSPECCIONADO
    creado_el TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_solicitudes_geo ON solicitudes_inspeccion USING gist(coordenadas);
