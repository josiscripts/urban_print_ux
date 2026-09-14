import { cn } from "@/lib/utils";

/**
 * Thumbnail de producto con soporte para imagen real.
 * Si existe imagen: muestra fotografía de WooCommerce.
 * Si no existe: muestra placeholder neutro con la identidad corporativa.
 */
export function ProductThumb({
  name,
  image,
  className,
  ratio = "square",
}: {
  name: string;
  image?: string | null;
  className?: string;
  ratio?: "square" | "wide";
}) {
  // Si existe imagen, mostrar fotografía
  if (image) {
    return (
      <div
        className={cn(
          "relative overflow-hidden border border-border bg-muted",
          ratio === "square" ? "aspect-square" : "aspect-[16/9]",
          className,
        )}
        role="img"
        aria-label={name}
      >
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback: placeholder si no hay imagen
  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden border border-border bg-muted",
        ratio === "square" ? "aspect-square" : "aspect-[16/9]",
        className,
      )}
      role="img"
      aria-label={name}
    >
      <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent,transparent_14px,color-mix(in_oklab,var(--color-ink)_5%,transparent)_14px,color-mix(in_oklab,var(--color-ink)_5%,transparent)_28px)]" />
      <span className="absolute top-0 left-0 h-1 w-16 bg-primary" />
      <p className="relative z-10 w-full p-4 font-display text-sm leading-tight tracking-wide text-muted-foreground uppercase">
        {name}
      </p>
    </div>
  );
}
