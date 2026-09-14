import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/invitaciones-de-boda")({
  head: () => ({
    meta: [
      { title: "Invitaciones de Boda | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Invitaciones de boda personalizadas en Orihuela: diseño exclusivo, sobres, seating plan, minutas y detalles para invitados.",
      },
      { property: "og:title", content: "Invitaciones de Boda | Urban Print" },
      { property: "og:description", content: "Papelería de boda con diseño exclusivo y acabados especiales." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Invitaciones de Boda",
        intro:
          "Papelería de boda completa y coordinada, desde la invitación hasta el detalle que se llevan tus invitados.",
        categoria: "bodas-invitaciones",
        bloques: [
          {
            titulo: "Invitaciones a medida",
            texto:
              "Diseños clásicos, minimalistas, florales o ilustrados, con acabados en relieve, dorado, troquel o papeles especiales.",
          },
          {
            titulo: "Papelería del día B",
            texto:
              "Seating plan, minutas, números de mesa, marcasitios, libro de firmas y cartelería para cada rincón del enlace.",
          },
          {
            titulo: "Detalles para invitados",
            texto:
              "Abanicos, kits de supervivencia, etiquetas para regalos y bolsas personalizadas con vuestros nombres y fecha.",
          },
        ],
        ventajas: [
          "Prueba impresa antes de la tirada",
          "Coordinación de toda la papelería",
          "Acabados especiales y sobres a juego",
          "Atención personalizada en tienda",
        ],
      }}
    />
  ),
});
