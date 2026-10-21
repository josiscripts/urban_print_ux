import { useEffect, useRef, useState } from "react";
import { X, MessageCircle, Package, PenTool, HelpCircle, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Widget flotante de contacto por WhatsApp — Urban Print.
 *
 * FASE VISUAL: todavía no hay conexión real con WhatsApp.
 * Cuando el proyecto trabaje en local, basta con rellenar WHATSAPP_CONFIG
 * con el número real y los mensajes definitivos; la función
 * `abrirConversacionWhatsApp` centraliza la llamada a la API/enlace oficial
 * (p. ej. https://wa.me/<numero>?text=<mensaje>) en un único punto.
 */

// ────────────────────────────────────────────────────────────
// Configuración preparada para la conexión real (valores de prueba)
// ────────────────────────────────────────────────────────────
export const WHATSAPP_CONFIG = {
  /** Número en formato internacional sin "+", p. ej. "34600000000". Vacío = sin conectar. */
  whatsappNumber: "",
  /** Mensaje por defecto si el usuario elige "Otra consulta". */
  defaultMessage: "Hola Urban Print, tengo una consulta.",
  /** Mensaje para dudas sobre productos. */
  productMessage: "Hola Urban Print, tengo una duda sobre un producto.",
  /** Mensaje para consultas sobre pedidos. */
  orderMessage: "Hola Urban Print, quiero consultar el estado de un pedido.",
  /** Mensaje para ayuda con diseños. */
  designMessage: "Hola Urban Print, necesito ayuda con un diseño.",
  /** Mensaje general / fallback. */
  generalMessage: "Hola Urban Print, tengo otra consulta.",
} as const;

/**
 * Punto único de conexión con WhatsApp.
 * TODO (implementación real): cuando `whatsappNumber` esté configurado,
 * abrir `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`
 * en una pestaña nueva. De momento es un placeholder que no navega.
 */
function abrirConversacionWhatsApp(mensaje: string): void {
  const numero = WHATSAPP_CONFIG.whatsappNumber;
  if (!numero) {
    // Conexión pendiente: no hacemos nada todavía a propósito.
    return;
  }
  window.open(
    `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`,
    "_blank",
    "noopener,noreferrer",
  );
}

// ────────────────────────────────────────────────────────────
// Icono oficial de WhatsApp (SVG, sin dependencias externas)
// ────────────────────────────────────────────────────────────
function IconoWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.03a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.08 8.08 0 0 1-1.24-4.28c0-4.47 3.64-8.1 8.12-8.1a8.1 8.1 0 0 1 8.11 8.1 8.1 8.1 0 0 1-8.11 8.12Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.44-1.36-1.68-.14-.24-.01-.37.11-.5.11-.11.24-.28.37-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.42.06-.65.3-.22.24-.85.83-.85 2.03 0 1.2.87 2.35 1 2.51.12.16 1.71 2.62 4.15 3.67.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

type OpcionContacto = {
  id: string;
  etiqueta: string;
  icono: typeof ShoppingBag;
  mensaje: string;
};

const OPCIONES: OpcionContacto[] = [
  {
    id: "producto",
    etiqueta: "Tengo una duda sobre un producto",
    icono: ShoppingBag,
    mensaje: WHATSAPP_CONFIG.productMessage,
  },
  {
    id: "pedido",
    etiqueta: "Quiero consultar un pedido",
    icono: Package,
    mensaje: WHATSAPP_CONFIG.orderMessage,
  },
  {
    id: "diseno",
    etiqueta: "Necesito ayuda con un diseño",
    icono: PenTool,
    mensaje: WHATSAPP_CONFIG.designMessage,
  },
  {
    id: "otra",
    etiqueta: "Otra consulta",
    icono: HelpCircle,
    mensaje: WHATSAPP_CONFIG.generalMessage,
  },
];

export function WhatsAppWidget() {
  const [abierto, setAbierto] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);

  // Entrada suave del botón tras montar (sin animación llamativa).
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  // Cerrar con Escape y devolver el foco al botón.
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  const alternar = () => setAbierto((v) => !v);

  const elegirOpcion = (opcion: OpcionContacto) => {
    abrirConversacionWhatsApp(opcion.mensaje);
    setAbierto(false);
  };

  return (
    <div
      className={cn(
        "fixed z-40",
        // Márgenes de seguridad: respeta notch y barras del sistema.
        "bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))]",
        "sm:bottom-6 sm:right-6",
        "transition-all duration-500 ease-out motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {/* Panel de contacto */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="false"
        aria-label="Contacto por WhatsApp"
        aria-hidden={!abierto}
        className={cn(
          "absolute bottom-[calc(100%+0.75rem)] right-0",
          // Móvil: casi todo el ancho disponible, sin salirse nunca de pantalla.
          "w-[min(20.5rem,calc(100vw-2.5rem))] sm:w-[21.5rem]",
          "origin-bottom-right",
          "transition-all duration-200 ease-out motion-reduce:transition-none",
          abierto
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-2 scale-95 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
          {/* Cabecera del widget */}
          <div className="flex items-start gap-3 bg-primary px-4 py-3.5 text-primary-foreground">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
              <IconoWhatsApp className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm uppercase tracking-wide">
                ¿En qué podemos ayudarte?
              </p>
              <p className="mt-0.5 text-xs text-primary-foreground/80">
                Estamos aquí para ayudarte con cualquier consulta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar panel de contacto"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Opciones */}
          <div className="space-y-1.5 p-3">
            {OPCIONES.map((opcion) => {
              const Icono = opcion.icono;
              return (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => elegirOpcion(opcion)}
                  tabIndex={abierto ? 0 : -1}
                  className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-foreground">
                    <Icono className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">{opcion.etiqueta}</span>
                </button>
              );
            })}
            <p className="px-3 pb-1 pt-1 text-center text-xs text-muted-foreground">
              Te responderemos lo antes posible.
            </p>
          </div>
        </div>
      </div>

      {/* Botón flotante */}
      <button
        ref={botonRef}
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar chat de WhatsApp" : "Abrir chat de WhatsApp"}
        className={cn(
          "relative grid place-items-center rounded-full",
          // Táctil cómodo en móvil; ligeramente mayor en escritorio.
          "h-14 w-14 sm:h-[3.75rem] sm:w-[3.75rem]",
          "bg-[#25D366] text-white shadow-lg",
          "transition-transform duration-200 hover:scale-105 active:scale-95 motion-reduce:transform-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-all duration-200 motion-reduce:transition-none",
            abierto ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
          )}
        >
          <IconoWhatsApp className="h-7 w-7" />
        </span>
        <span
          className={cn(
            "absolute inset-0 grid place-items-center transition-all duration-200 motion-reduce:transition-none",
            abierto ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
          )}
        >
          <X className="h-6 w-6" />
        </span>
      </button>
    </div>
  );
}
