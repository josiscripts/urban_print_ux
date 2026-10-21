import { cn } from "@/lib/utils";

/**
 * Placeholder neutro con la identidad corporativa.
 * Sustituible por fotografía real sin tocar el resto del layout.
 */
export function ProductThumb({
  name,
  className,
  ratio = "square",
}: {
  name: string;
  className?: string;
  ratio?: "square" | "wide";
}) {
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
