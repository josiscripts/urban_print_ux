import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/diseno-grafico")({
  head: () => ({
    meta: [
      { title: "Diseño Gráfico | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Diseño gráfico profesional en Orihuela: logotipos, identidad corporativa, artes finales y maquetación lista para imprenta.",
      },
      { property: "og:title", content: "Diseño Gráfico | Urban Print" },
      { property: "og:description", content: "Identidad corporativa y artes finales listos para imprenta." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Diseño Gráfico",
        intro:
          "Convertimos tu idea en un arte final impecable, listo para producción y coherente con tu marca.",
        bloques: [
          {
            titulo: "Identidad corporativa",
            texto:
              "Creamos logotipos, paletas, tipografías y aplicaciones para que tu marca se reconozca en cualquier soporte: papelería, rotulación, textil o packaging.",
          },
          {
            titulo: "Artes finales",
            texto:
              "Preparamos tus archivos con sangrados, perfiles de color y resoluciones correctas para que la impresión salga tal y como la imaginas.",
          },
          {
            titulo: "Maquetación y campañas",
            texto:
              "Catálogos, cartas de restaurante, flyers, carteles y campañas completas con una línea visual consistente.",
          },
        ],
        ventajas: [
          "Diseño y producción en el mismo sitio",
          "Pruebas de color antes de imprimir",
          "Entrega de archivos editables bajo petición",
          "Revisiones incluidas en el presupuesto",
        ],
      }}
    />
  ),
});
