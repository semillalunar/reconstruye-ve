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
