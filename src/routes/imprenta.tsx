import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/imprenta")({
  head: () => ({
    meta: [
      { title: "Imprenta General | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Imprenta en Orihuela: tarjetas de visita, flyers, catálogos, papelería corporativa, adhesivos y sellos personalizados.",
      },
      { property: "og:title", content: "Imprenta General | Urban Print" },
      { property: "og:description", content: "Papelería, flyers, catálogos y adhesivos con acabados profesionales." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Imprenta",
        intro:
          "Toda la impresión offset y digital que tu negocio necesita, con acabados profesionales y plazos ajustados.",
        categoria: "imprenta-general",
        bloques: [
          {
            titulo: "Papelería corporativa",
            texto:
              "Tarjetas de visita, hojas membretadas, sobres, carpetas y talonarios con acabados mate, brillo, soft touch o estampación.",
          },
          {
            titulo: "Publicidad impresa",
            texto:
              "Flyers, dípticos, trípticos, catálogos y carteles en distintos gramajes y formatos, con tiradas desde pocas unidades.",
          },
          {
            titulo: "Adhesivos y etiquetas",
            texto:
              "Etiquetas troqueladas, pegatinas en bobina o plancha y vinilos para producto, packaging y escaparate.",
          },
        ],
        ventajas: [
          "Tiradas cortas y largas",
          "Amplia carta de papeles y acabados",
          "Pruebas físicas antes de tirada",
          "Recogida en tienda en Orihuela",
        ],
      }}
    />
  ),
});
