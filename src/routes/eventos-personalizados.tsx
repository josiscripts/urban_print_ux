import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";

export const Route = createFileRoute("/eventos-personalizados")({
  head: () => ({
    meta: [
      { title: "Eventos Personalizados y Candy Bar | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Decoración y personalización de eventos en Orihuela: candy bar, photocall, cartelería, etiquetas y detalles para invitados.",
      },
      { property: "og:title", content: "Eventos Personalizados | Urban Print" },
      { property: "og:description", content: "Candy bar, photocall y cartelería para tu celebración." },
    ],
  }),
  component: () => (
    <ServicePage
      contenido={{
        titulo: "Eventos Personalizados",
        intro:
          "Damos identidad a tu celebración: desde el cartel de bienvenida hasta la última etiqueta del candy bar.",
        categoria: "candy-bar",
        bloques: [
          {
            titulo: "Candy bar",
            texto:
              "Etiquetas para botes y botellas, banderines, toppers, bolsas de chuches y cartelería a juego con la temática elegida.",
          },
          {
            titulo: "Photocall y decoración",
            texto:
              "Photocalls impresos, marcos, letras corpóreas y vinilos de suelo para crear el rincón más fotografiado del evento.",
          },
          {
            titulo: "Señalética e invitados",
            texto:
              "Seating plan, números de mesa, minutas, marcasitios y detalles personalizados con el nombre de cada invitado.",
          },
        ],
        ventajas: [
          "Diseño coordinado en todo el evento",
          "Adaptamos cualquier temática o paleta",
          "Producción con antelación y refuerzos de última hora",
          "Asesoramiento presencial en tienda",
        ],
      }}
    />
  ),
});
