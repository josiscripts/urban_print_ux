import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/gran-formato")({
  head: () => ({
    meta: [
      { title: "Gran Formato | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Impresión de gran formato en Orihuela: lonas, vinilos, roll-ups, carteles, rotulación de vehículos y escaparates.",
      },
      { property: "og:title", content: "Gran Formato | Urban Print" },
      { property: "og:description", content: "Lonas, vinilos, roll-ups y rotulación con máxima durabilidad." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Gran Formato",
        intro:
          "Comunicación visual de gran tamaño para que tu marca se vea desde lejos, en interior y exterior.",
        categoria: "gran-formato",
        bloques: [
          {
            titulo: "Lonas y carteles",
            texto:
              "Lonas microperforadas, mesh y frontlit con ojales o dobladillo, listas para colgar en fachadas, vallas y eventos.",
          },
          {
            titulo: "Vinilos y rotulación",
            texto:
              "Vinilo de corte e impreso para escaparates, cristales, suelos y vehículos, con laminados de protección.",
          },
          {
            titulo: "Displays y stands",
            texto:
              "Roll-ups, photocalls, banderolas y paneles rígidos en foam, PVC o cartón pluma para ferias y presentaciones.",
          },
        ],
        ventajas: [
          "Tintas resistentes a la intemperie",
          "Montaje e instalación bajo presupuesto",
          "Formatos y medidas a medida",
          "Materiales para interior y exterior",
        ],
      }}
    />
  ),
});
