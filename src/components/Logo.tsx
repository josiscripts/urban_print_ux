import { cn } from "@/lib/utils";

const BLACK = "/logo-urban-print-black.svg";
const WHITE = "/logo-urban-print-white.svg";

type LogoProps = {
  /**
   * Selección del archivo SVG según el FONDO sobre el que se coloca el logo:
   * - "light": fondo claro/blanco → logo negro (siempre, aunque el tema sea oscuro).
   * - "dark": fondo oscuro/negro/carbón → logo blanco (siempre, aunque el tema sea claro).
   * - "theme": el fondo sigue al tema (superficie `background`) → negro en claro, blanco en oscuro.
   */
  background?: "light" | "dark" | "theme";
  className?: string;
  alt?: string;
};

export function Logo({ background = "theme", className, alt = "Urban Print" }: LogoProps) {
  const common = cn("w-auto transition-opacity duration-200", className);

  if (background === "light") {
    return <img src={BLACK} alt={alt} className={common} width={765} height={67} />;
  }

  if (background === "dark") {
    return <img src={WHITE} alt={alt} className={common} width={765} height={67} />;
  }

  // Fondo = superficie del tema: mismo tamaño en ambos casos, sin salto de layout.
  return (
    <>
      <img src={BLACK} alt={alt} className={cn(common, "dark:hidden")} width={765} height={67} />
      <img
        src={WHITE}
        alt={alt}
        aria-hidden
        className={cn(common, "hidden dark:block")}
        width={765}
        height={67}
      />
    </>
  );
}
