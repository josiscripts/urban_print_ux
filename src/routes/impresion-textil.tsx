import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/impresion-textil")({
  head: () => ({
    meta: [
      { title: "Impresión Textil | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Impresión textil en Orihuela: camisetas, sudaderas, polos y ropa laboral personalizada con vinilo, DTF o bordado.",
      },
      { property: "og:title", content: "Impresión Textil | Urban Print" },
      { property: "og:description", content: "Camisetas, sudaderas y ropa laboral personalizada." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Impresión Textil",
        intro:
          "Personalizamos prendas para equipos, empresas, peñas y eventos con acabados duraderos lavado tras lavado.",
        categoria: "impresion-textil",
        bloques: [
          {
            titulo: "Técnicas disponibles",
            texto:
              "Vinilo textil, DTF a todo color, serigrafía para tiradas grandes y bordado para un acabado más premium.",
          },
          {
            titulo: "Prendas y tallas",
            texto:
              "Camisetas, polos, sudaderas, gorras, chalecos y ropa laboral en tallas de niño y adulto, con amplio catálogo de colores.",
          },
          {
            titulo: "Pedidos de grupo",
            texto:
              "Gestionamos listados con nombres y dorsales para equipos deportivos, despedidas, colegios y uniformes de empresa.",
          },
        ],
        ventajas: [
          "Desde 1 unidad",
          "Acabados resistentes al lavado",
          "Muestra previa de la personalización",
          "Asesoramiento en tejidos y tallas",
        ],
      }}
    />
  ),
});
