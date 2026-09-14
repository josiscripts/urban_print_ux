import { createFileRoute } from "@tanstack/react-router";
import { LegalList, LegalPage, LegalSection, LegalSubtitle } from "@/components/LegalPage";
import { TITULAR } from "@/lib/site";

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [
      { title: "Aviso Legal y Condiciones de Uso | Urban Print" },
      {
        name: "description",
        content:
          "Aviso legal y condiciones generales de uso de www.urbanprint.es, titularidad de Pedro Martinez García (NIF 48481947 - V), Orihuela (Alicante).",
      },
      { property: "og:title", content: "Aviso Legal y Condiciones de Uso | Urban Print" },
      {
        property: "og:description",
        content: "Información general, términos de uso, política de enlaces y propiedad intelectual del sitio web de Urban Print.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AvisoLegalPage,
});

function AvisoLegalPage() {
  return (
    <LegalPage
      title="Aviso legal y condiciones generales de uso"
      intro="Condiciones que regulan el acceso, la navegación y el uso del sitio web www.urbanprint.es, en cumplimiento de la Ley 34/2002 de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE)."
      updated="07/08/2026"
    >
      <LegalSection title="I. Información general">
        <p>
          En cumplimiento con el deber de información dispuesto en la Ley 34/2002 de Servicios de la
          Sociedad de la Información y el Comercio Electrónico (LSSI-CE) de 11 de julio, se facilitan
          a continuación los siguientes datos de información general de este sitio web:
        </p>
        <p>
          La titularidad de este sitio web, <strong>{TITULAR.web}</strong> (en adelante, Sitio Web),
          la ostenta <strong>{TITULAR.nombre}</strong>, con NIF <strong>{TITULAR.nif}</strong>, y
          cuyos datos de contacto son los siguientes:
        </p>
        <LegalList
          items={[
            <>
              <strong>Titular:</strong> {TITULAR.nombre}
            </>,
            <>
              <strong>NIF:</strong> {TITULAR.nif}
            </>,
            <>
              <strong>Dirección:</strong> {TITULAR.direccion}
            </>,
            <>
              <strong>Teléfono de contacto:</strong>{" "}
              <a href="tel:+34966578345" className="hover:text-primary">
                {TITULAR.telefono}
              </a>
            </>,
            <>
              <strong>Email de contacto:</strong>{" "}
              <a href={`mailto:${TITULAR.email}`} className="hover:text-primary">
                {TITULAR.email}
              </a>
            </>,
            <>
              <strong>Sitio Web:</strong> {TITULAR.web}
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="II. Términos y condiciones generales de uso">
        <LegalSubtitle>El objeto de las condiciones: el Sitio Web</LegalSubtitle>
        <p>
          El objeto de las presentes Condiciones Generales de Uso (en adelante, Condiciones) es
          regular el acceso y la utilización del Sitio Web. A los efectos de las presentes
          Condiciones se entenderá como Sitio Web: la apariencia externa de los interfaces de
          pantalla, tanto de forma estática como de forma dinámica, es decir, el árbol de navegación;
          y todos los elementos integrados tanto en los interfaces de pantalla como en el árbol de
          navegación (en adelante, Contenidos) y todos aquellos servicios o recursos en línea que en
          su caso ofrezca a los Usuarios (en adelante, Servicios).
        </p>
        <p>
          Urban Print se reserva la facultad de modificar, en cualquier momento y sin aviso previo,
          la presentación y configuración del Sitio Web y de los Contenidos y Servicios que en él
          pudieran estar incorporados. El Usuario reconoce y acepta que en cualquier momento Urban
          Print pueda interrumpir, desactivar y/o cancelar cualquiera de estos elementos que se
          integran en el Sitio Web o el acceso a los mismos.
        </p>
        <p>
          El acceso al Sitio Web por el Usuario tiene carácter libre y, por regla general, es
          gratuito, sin que el Usuario tenga que proporcionar una contraprestación para poder
          disfrutar de ello, salvo en lo relativo al coste de conexión a través de la red de
          telecomunicaciones suministrada por el proveedor de acceso que hubiere contratado el
          Usuario.
        </p>
        <p>
          Aparte del coste de conexión, algunos de los Contenidos o Servicios ofrecidos por Urban
          Print o, en su caso, por terceros a través del Sitio Web, pueden encontrarse sujetos a la
          contratación previa del Contenido o Servicio, en cuyo caso se especificará de forma clara
          y/o se pondrán a disposición del Usuario las correspondientes Condiciones Generales o
          Particulares por las que esto se rija.
        </p>
        <p>
          La utilización de alguno de los Contenidos o Servicios del Sitio Web podrá hacerse mediante
          la suscripción o registro previo del Usuario. La simple consulta de los Contenidos no
          requiere previa suscripción o registro alguno.
        </p>

        <LegalSubtitle>El Usuario</LegalSubtitle>
        <p>
          El acceso, la navegación y uso del Sitio Web, así como de los espacios habilitados para
          interactuar entre los Usuarios, y entre el Usuario y Urban Print, como los comentarios y/o
          espacios de blogging, confiere la condición de Usuario, por lo que se aceptan, desde que se
          inicia la navegación por el Sitio Web, todas las Condiciones aquí establecidas, así como
          sus ulteriores modificaciones, sin perjuicio de la aplicación de la correspondiente
          normativa legal de obligado cumplimiento según el caso. Dada la relevancia de lo anterior,
          se recomienda al Usuario leerlas cada vez que visite el Sitio Web.
        </p>
        <p>
          El Sitio Web de Urban Print proporciona gran diversidad de información, servicios y datos.
          El Usuario asume su responsabilidad para realizar un uso correcto del Sitio Web. Esta
          responsabilidad se extenderá a:
        </p>
        <LegalList
          items={[
            "Un uso de la información, Contenidos y/o Servicios y datos ofrecidos por Urban Print sin que sea contrario a lo dispuesto por las presentes Condiciones, la Ley, la moral o el orden público, o que de cualquier otro modo puedan suponer lesión de los derechos de terceros o del mismo funcionamiento del Sitio Web.",
            "La veracidad y licitud de las informaciones aportadas por el Usuario en los formularios extendidos por Urban Print para el acceso a ciertos Contenidos o Servicios ofrecidos por el Sitio Web. En todo caso, el Usuario notificará de forma inmediata a Urban Print acerca de cualquier hecho que permita el uso indebido de la información registrada en dichos formularios, tales como, pero no solo, el robo, extravío o el acceso no autorizado a identificadores y/o contraseñas, con el fin de proceder a su inmediata cancelación.",
          ]}
        />
        <p>
          Urban Print se reserva el derecho de retirar todos aquellos comentarios y aportaciones que
          vulneren la ley, el respeto a la dignidad de la persona, que sean discriminatorios,
          xenófobos, racistas, pornográficos, spamming, que atenten contra la juventud o la infancia,
          el orden o la seguridad pública o que, a su juicio, no resultaran adecuados para su
          publicación.
        </p>
        <p>
          En cualquier caso, Urban Print no será responsable de las opiniones vertidas por los
          Usuarios a través de comentarios u otras herramientas de blogging o de participación que
          pueda haber.
        </p>
        <p>
          El mero acceso a este Sitio Web no supone entablar ningún tipo de relación de carácter
          comercial entre Urban Print y el Usuario.
        </p>
        <p>
          El Usuario declara ser mayor de edad y disponer de la capacidad jurídica suficiente para
          vincularse por las presentes Condiciones. Por lo tanto, este Sitio Web no se dirige a
          menores de edad. Urban Print declina cualquier responsabilidad por el incumplimiento de
          este requisito.
        </p>
        <p>
          El Sitio Web está dirigido principalmente a Usuarios residentes en España. Urban Print no
          asegura que el Sitio Web cumpla con legislaciones de otros países, ya sea total o
          parcialmente. Si el Usuario reside o está domiciliado en otro lugar y decide acceder y/o
          navegar en el Sitio Web lo hará bajo su propia responsabilidad, deberá asegurarse de que
          tal acceso y navegación cumple con la legislación local que le es aplicable, no asumiendo
          Urban Print responsabilidad alguna que se pueda derivar de dicho acceso.
        </p>
      </LegalSection>

      <LegalSection title="III. Acceso y navegación en el Sitio Web: exclusión de garantías y responsabilidad">
        <p>
          Urban Print no garantiza la continuidad, disponibilidad y utilidad del Sitio Web, ni de los
          Contenidos o Servicios. Urban Print hará todo lo posible por el buen funcionamiento del
          Sitio Web; sin embargo, no se responsabiliza ni garantiza que el acceso a este Sitio Web no
          vaya a ser interrumpido o que esté libre de error.
        </p>
        <p>
          Tampoco se responsabiliza o garantiza que el contenido o software al que pueda accederse a
          través de este Sitio Web esté libre de error o cause un daño al sistema informático
          (software y hardware) del Usuario. En ningún caso Urban Print será responsable por las
          pérdidas, daños o perjuicios de cualquier tipo que surjan por el acceso, navegación y uso
          del Sitio Web, incluyéndose, pero no limitándose, a los ocasionados a los sistemas
          informáticos o los provocados por la introducción de virus.
        </p>
        <p>
          Urban Print tampoco se hace responsable de los daños que pudiesen ocasionarse a los
          usuarios por un uso inadecuado de este Sitio Web. En particular, no se hace responsable en
          modo alguno de las caídas, interrupciones, falta o defecto de las telecomunicaciones que
          pudieran ocurrir.
        </p>
      </LegalSection>

      <LegalSection title="IV. Política de enlaces">
        <p>
          Se informa de que el Sitio Web de Urban Print pone o puede poner a disposición de los
          Usuarios medios de enlace (como, entre otros, links, banners, botones), directorios y
          motores de búsqueda que permiten a los Usuarios acceder a sitios web pertenecientes y/o
          gestionados por terceros.
        </p>
        <p>
          La instalación de estos enlaces, directorios y motores de búsqueda en el Sitio Web tiene
          por objeto facilitar a los Usuarios la búsqueda y el acceso a la información disponible en
          Internet, sin que pueda considerarse una sugerencia, recomendación o invitación para la
          visita de los mismos.
        </p>
        <p>
          Urban Print no ofrece ni comercializa por sí ni por medio de terceros los productos y/o
          servicios disponibles en dichos sitios enlazados. Tampoco garantizará la disponibilidad
          técnica, exactitud, veracidad, validez o legalidad de sitios ajenos a su propiedad a los
          que se pueda acceder por medio de los enlaces.
        </p>
        <p>
          Urban Print en ningún caso revisará o controlará el contenido de otros sitios web, así como
          tampoco aprueba, examina ni hace propios los productos y servicios, contenidos, archivos y
          cualquier otro material existente en los referidos sitios enlazados, y no asume ninguna
          responsabilidad por los daños y perjuicios que pudieran producirse por el acceso, uso,
          calidad o licitud de sus contenidos, comunicaciones, opiniones, productos y servicios.
        </p>
        <p>
          El Usuario o tercero que realice un hipervínculo desde otro sitio web al Sitio Web de Urban
          Print deberá saber que:
        </p>
        <LegalList
          items={[
            "No se permite la reproducción —total o parcial— de ninguno de los Contenidos y/o Servicios del Sitio Web sin autorización expresa de Urban Print.",
            "No se permite ninguna manifestación falsa, inexacta o incorrecta sobre el Sitio Web de Urban Print, ni sobre los Contenidos y/o Servicios del mismo.",
            "A excepción del hipervínculo, el sitio web en el que se establezca dicho hiperenlace no contendrá ningún elemento de este Sitio Web protegido como propiedad intelectual por el ordenamiento jurídico español, salvo autorización expresa de Urban Print.",
            "El establecimiento del hipervínculo no implicará la existencia de relaciones entre Urban Print y el titular del sitio web desde el cual se realice, ni el conocimiento y aceptación por parte de Urban Print de los contenidos, servicios y/o actividades ofrecidas en dicho sitio web, y viceversa.",
          ]}
        />
      </LegalSection>

      <LegalSection title="V. Propiedad intelectual e industrial">
        <p>
          Urban Print, por sí o como parte cesionaria, es titular de todos los derechos de propiedad
          intelectual e industrial del Sitio Web, así como de los elementos contenidos en el mismo (a
          título enunciativo y no exhaustivo: imágenes, sonido, audio, vídeo, software o textos,
          marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales
          usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).
          Serán, por consiguiente, obras protegidas como propiedad intelectual por el ordenamiento
          jurídico español, siéndoles aplicables tanto la normativa española y comunitaria en este
          campo como los tratados internacionales relativos a la materia y suscritos por España.
        </p>
        <p>
          Todos los derechos reservados. En virtud de lo dispuesto en la Ley de Propiedad
          Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la
          comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o
          parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y
          por cualquier medio técnico, sin la autorización de Urban Print.
        </p>
        <p>
          El Usuario se compromete a respetar los derechos de propiedad intelectual e industrial de
          Urban Print. Podrá visualizar los elementos del Sitio Web o incluso imprimirlos, copiarlos
          y almacenarlos en el disco duro de su ordenador o en cualquier otro soporte físico siempre
          y cuando sea, exclusivamente, para su uso personal. El Usuario, sin embargo, no podrá
          suprimir, alterar o manipular cualquier dispositivo de protección o sistema de seguridad
          que estuviera instalado en el Sitio Web.
        </p>
        <p>
          En caso de que el Usuario o un tercero considere que cualquiera de los Contenidos del Sitio
          Web supone una violación de los derechos de protección de la propiedad intelectual, deberá
          comunicarlo inmediatamente a Urban Print a través de los datos de contacto del apartado
          I. Información general de este Aviso Legal y Condiciones Generales de Uso.
        </p>
      </LegalSection>

      <LegalSection title="VI. Acciones legales, legislación aplicable y jurisdicción">
        <p>
          Urban Print se reserva la facultad de presentar las acciones civiles o penales que
          considere necesarias por la utilización indebida del Sitio Web y Contenidos, o por el
          incumplimiento de las presentes Condiciones.
        </p>
        <p>
          La relación entre el Usuario y Urban Print se regirá por la normativa vigente y de
          aplicación en el territorio español. De surgir cualquier controversia en relación con la
          interpretación y/o aplicación de estas Condiciones, las partes someterán sus conflictos a
          la jurisdicción ordinaria, sometiéndose a los jueces y tribunales que correspondan conforme
          a derecho.
        </p>
      </LegalSection>

      <LegalSection title="Actualización">
        <p>
          Este documento de Aviso Legal y Condiciones Generales de uso del sitio web ha sido
          actualizado el día 07/08/2026.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
