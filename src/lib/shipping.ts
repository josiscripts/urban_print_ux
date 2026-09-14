/**
 * Zonas a las que Urban Print no realiza envíos: Canarias, Ceuta y Melilla.
 */
export const MENSAJE_ZONA_EXCLUIDA =
  "Actualmente no realizamos envíos a Canarias, Ceuta ni Melilla.";

const PREFIJOS_CP_EXCLUIDOS = ["35", "38", "51", "52"];

const TERMINOS_EXCLUIDOS = [
  "canarias",
  "las palmas",
  "gran canaria",
  "tenerife",
  "santa cruz de tenerife",
  "lanzarote",
  "fuerteventura",
  "la palma",
  "la gomera",
  "el hierro",
  "ceuta",
  "melilla",
];

function normaliza(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function esZonaExcluida(input: {
  postal_code?: string | undefined;
  province?: string | undefined;
  city?: string | undefined;
}): boolean {
  const cp = (input.postal_code ?? "").replace(/\D/g, "");
  if (cp.length >= 2 && PREFIJOS_CP_EXCLUIDOS.includes(cp.slice(0, 2))) return true;
  const texto = normaliza(`${input.province ?? ""} ${input.city ?? ""}`);
  return TERMINOS_EXCLUIDOS.some((t) => texto.includes(t));
}
