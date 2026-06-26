// Generador simple de frase semilla (DID)
const PALABRAS = [
  'ALFA', 'BETA', 'GAMMA', 'DELTA', 'ECHO', 'ZULU',
  'TIGRE', 'LEON', 'AGUILA', 'HALCON', 'PUMA', 'LOBO',
  'PUENTE', 'MURO', 'ROCA', 'ACERO', 'VIGA', 'CEMENTO',
  'CARACAS', 'ANDES', 'LLANO', 'COSTA', 'MAR', 'RIO'
];

export function generarFraseSemilla(): string {
  const p1 = PALABRAS[Math.floor(Math.random() * 6)]; // Primera categoría
  const p2 = PALABRAS[Math.floor(Math.random() * 6) + 6]; // Segunda categoría
  const p3 = PALABRAS[Math.floor(Math.random() * 6) + 12]; // Tercera categoría
  
  return `${p1} - ${p2} - ${p3}`;
}
