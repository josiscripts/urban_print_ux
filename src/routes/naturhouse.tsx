import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/naturhouse")({
  head: () => ({
    meta: [
      { title: "Natur House | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Material gráfico y personalización para centros Natur House: cartelería, papelería, textil corporativo y campañas de temporada.",
      },
      { property: "og:title", content: "Natur House | Urban Print" },
      { property: "og:description", content: "Material gráfico y corporativo para centros Natur House." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Natur House",
        intro:
          "Servicio específico para centros Natur House: producimos todo el material gráfico respetando su manual de marca.",
        bloques: [
          {
            titulo: "Cartelería de centro",
            texto:
              "Vinilos de escaparate, carteles de promoción, expositores y señalética interior adaptados a cada campaña.",
          },
          {
            titulo: "Papelería y consulta",
            texto:
              "Fichas de seguimiento, tarjetas de cita, planes semanales, bolsas y todo el material de consulta personalizado.",
          },
          {
            titulo: "Textil corporativo",
            texto:
              "Batas, polos y camisetas con el logotipo bordado o impreso para el equipo del centro.",
          },
        ],
        ventajas: [
          "Respeto del manual de identidad",
          "Reposiciones rápidas por campaña",
          "Plantillas guardadas para nuevos pedidos",
          "Envío a varios centros",
        ],
      }}
    />
  ),
});
