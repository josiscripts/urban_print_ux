import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/merchandising")({
  head: () => ({
    meta: [
      { title: "Merchandising | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Merchandising personalizado en Orihuela: bolígrafos, tazas, bolsas, llaveros, libretas y packs promocionales para empresas.",
      },
      { property: "og:title", content: "Merchandising | Urban Print" },
      { property: "og:description", content: "Artículos promocionales personalizados para tu marca." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Merchandising",
        intro:
          "Artículos promocionales que ponen tu marca en las manos de tus clientes todos los días.",
        categoria: "merchandising",
        bloques: [
          {
            titulo: "Regalo de empresa",
            texto:
              "Bolígrafos, libretas, tazas, botellas, power banks, paraguas y sets de bienvenida para clientes y empleados.",
          },
          {
            titulo: "Ferias y eventos",
            texto:
              "Bolsas, lanyards, pulseras, abanicos y todo lo necesario para que tu stand destaque y se recuerde.",
          },
          {
            titulo: "Packs a medida",
            texto:
              "Diseñamos packs combinando varios artículos, con caja y tarjeta personalizada, listos para entregar.",
          },
        ],
        ventajas: [
          "Amplio catálogo de proveedores",
          "Personalización en color o grabado láser",
          "Presupuestos por volumen",
          "Control de stock para reposiciones",
        ],
      }}
    />
  ),
});
