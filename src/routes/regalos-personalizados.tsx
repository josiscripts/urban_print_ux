import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/regalos-personalizados")({
  head: () => ({
    meta: [
      { title: "Regalos Personalizados | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Regalos personalizados en Orihuela: tazas, cojines, fotolienzos, puzzles, chapas y detalles únicos para cada ocasión.",
      },
      { property: "og:title", content: "Regalos Personalizados | Urban Print" },
      { property: "og:description", content: "Detalles únicos con tus fotos, nombres y frases." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Regalos Personalizados",
        intro:
          "Convertimos fotos, nombres y frases en un regalo que emociona. Ideal para cumpleaños, aniversarios y fechas especiales.",
        categoria: "regalos-personalizados",
        bloques: [
          {
            titulo: "Foto regalo",
            texto:
              "Tazas mágicas, fotolienzos, marcos, puzzles, cojines y calendarios impresos con tus mejores imágenes.",
          },
          {
            titulo: "Detalles con mensaje",
            texto:
              "Chapas, imanes, llaveros, láminas y placas grabadas con dedicatorias, fechas o frases que significan algo.",
          },
          {
            titulo: "Fechas señaladas",
            texto:
              "Colecciones especiales para Navidad, Día de la Madre y del Padre, San Valentín, comuniones y jubilaciones.",
          },
        ],
        ventajas: [
          "Producción rápida, incluso el mismo día",
          "Vista previa del diseño antes de imprimir",
          "Unidades sueltas sin mínimos",
          "Envoltorio de regalo disponible",
        ],
      }}
    />
  ),
});
