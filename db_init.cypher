// 1. Crear restricciones de unicidad para evitar duplicados en el scraping
CREATE CONSTRAINT unique_empresa_rif IF NOT EXISTS FOR (e:Empresa) REQUIRE e.rif IS UNIQUE;
CREATE CONSTRAINT unique_persona_id IF NOT EXISTS FOR (p:Persona) REQUIRE p.cedula IS UNIQUE;
CREATE CONSTRAINT unique_inmueble_id IF NOT EXISTS FOR (i:Inmueble) REQUIRE i.id IS UNIQUE;
CREATE CONSTRAINT unique_fondo_id IF NOT EXISTS FOR (f:Fondo) REQUIRE f.id IS UNIQUE;

// 2. Simulación de consulta para detectar Nepotismo/Conflictos de Interés (La Alerta)
// Busca si un funcionario que ADJUDICÓ un fondo comparte apellido o dirección con un ACCIONISTA de la empresa que EJECUTA ese mismo fondo.
// (Esta consulta se guarda como referencia para cuando se inyecten los datos)
/*
MATCH (p1:Persona)-[:ADJUDICA]->(f:Fondo)-[:ASIGNADO_A]->(i:Inmueble)
MATCH (e:Empresa)-[:EJECUTA]->(f)
MATCH (p2:Persona)-[:ACCIONISTA_DE]->(e)
WHERE p1.apellidos = p2.apellidos OR p1.direccion_fiscal = e.direccion_fiscal
RETURN p1.nombre AS Funcionario, p2.nombre AS Contratista, e.razon_social AS Empresa, f.monto AS DineroAsignado, i.id AS InmuebleAfectado;
*/
