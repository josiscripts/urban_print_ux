import { createFileRoute } from "@tanstack/react-router";
import { LegalList, LegalPage, LegalSection, LegalSubtitle } from "@/components/LegalPage";
import { TITULAR } from "@/lib/site";

export const Route = createFileRoute("/politica-de-privacidad")({
  head: () => ({
    meta: [
      { title: "Política de Privacidad | Urban Print" },
      {
        name: "description",
        content:
          "Política de privacidad y protección de datos de www.urbanprint.es. Responsable del tratamiento: Pedro Martinez García, NIF 48481947 - V, Orihuela (Alicante).",
      },
      { property: "og:title", content: "Política de Privacidad | Urban Print" },
      {
        property: "og:description",
        content:
          "Información sobre el tratamiento de datos personales en Urban Print conforme al RGPD y a la LOPD-GDD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacidadPage,
});

function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de privacidad"
      intro="Información sobre el tratamiento de los datos personales recogidos en www.urbanprint.es, conforme al Reglamento (UE) 2016/679 (RGPD) y a la Ley Orgánica 3/2018 (LOPD-GDD)."
      updated="07/08/2026"
    >
      <LegalSection title="I. Política de privacidad y protección de datos">
        <p>
          Respetando lo establecido en la legislación vigente, Urban Print (en adelante, también
          Sitio Web) se compromete a adoptar las medidas técnicas y organizativas necesarias, según
          el nivel de seguridad adecuado al riesgo de los datos recogidos.
        </p>

        <LegalSubtitle>Leyes que incorpora esta política de privacidad</LegalSubtitle>
        <p>
          Esta política de privacidad está adaptada a la normativa española y europea vigente en
          materia de protección de datos personales en internet. En concreto, respeta las siguientes
          normas:
        </p>
        <LegalList
          items={[
            "El Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las personas físicas en lo que respecta al tratamiento de datos personales y a la libre circulación de estos datos (RGPD).",
            "La Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPD-GDD).",
            "El Real Decreto 1720/2007, de 21 de diciembre, por el que se aprueba el Reglamento de desarrollo de la Ley Orgánica 15/1999, de 13 de diciembre, de Protección de Datos de Carácter Personal (RDLOPD).",
            "La Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).",
          ]}
        />

        <LegalSubtitle>
          Identidad del responsable del tratamiento de los datos personales
        </LegalSubtitle>
        <p>
          El responsable del tratamiento de los datos personales recogidos en Urban Print es{" "}
          <strong>{TITULAR.nombre}</strong>, con NIF <strong>{TITULAR.nif}</strong> (en adelante,
          Responsable del tratamiento). Sus datos de contacto son los siguientes:
        </p>
        <LegalList
          items={[
            <>
              <strong>Responsable:</strong> {TITULAR.nombre}
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

        <LegalSubtitle>Registro de datos de carácter personal</LegalSubtitle>
        <p>
          En cumplimiento de lo establecido en el RGPD y la LOPD-GDD, le informamos de que los datos
          personales recabados por Urban Print mediante los formularios extendidos en sus páginas
          quedarán incorporados y serán tratados en nuestro fichero con el fin de poder facilitar,
          agilizar y cumplir los compromisos establecidos entre Urban Print y el Usuario, o el
          mantenimiento de la relación que se establezca en los formularios que este rellene, o para
          atender una solicitud o consulta del mismo. Asimismo, de conformidad con lo previsto en el
          RGPD y la LOPD-GDD, salvo que sea de aplicación la excepción prevista en el artículo 30.5
          del RGPD, se mantiene un registro de actividades de tratamiento que especifica, según sus
          finalidades, las actividades de tratamiento llevadas a cabo y las demás circunstancias
          establecidas en el RGPD.
        </p>

        <LegalSubtitle>Principios aplicables al tratamiento de los datos personales</LegalSubtitle>
        <p>
          El tratamiento de los datos personales del Usuario se someterá a los siguientes principios
          recogidos en el artículo 5 del RGPD y en el artículo 4 y siguientes de la Ley Orgánica
          3/2018, de 5 de diciembre:
        </p>
        <LegalList
          items={[
            "Principio de licitud, lealtad y transparencia: se requerirá en todo momento el consentimiento del Usuario previa información completamente transparente de los fines para los cuales se recogen los datos personales.",
            "Principio de limitación de la finalidad: los datos personales serán recogidos con fines determinados, explícitos y legítimos.",
            "Principio de minimización de datos: los datos personales recogidos serán únicamente los estrictamente necesarios en relación con los fines para los que son tratados.",
            "Principio de exactitud: los datos personales deben ser exactos y estar siempre actualizados.",
            "Principio de limitación del plazo de conservación: los datos personales solo serán mantenidos de forma que se permita la identificación del Usuario durante el tiempo necesario para los fines de su tratamiento.",
            "Principio de integridad y confidencialidad: los datos personales serán tratados de manera que se garantice su seguridad y confidencialidad.",
            "Principio de responsabilidad proactiva: el Responsable del tratamiento será responsable de asegurar que los principios anteriores se cumplen.",
          ]}
        />

        <LegalSubtitle>Categorías de datos personales</LegalSubtitle>
        <p>
          Las categorías de datos que se tratan en Urban Print son únicamente datos identificativos.
          En ningún caso se tratan categorías especiales de datos personales en el sentido del
          artículo 9 del RGPD.
        </p>

        <LegalSubtitle>Base legal para el tratamiento de los datos personales</LegalSubtitle>
        <p>
          La base legal para el tratamiento de los datos personales es el consentimiento. Urban Print
          se compromete a recabar el consentimiento expreso y verificable del Usuario para el
          tratamiento de sus datos personales para uno o varios fines específicos.
        </p>
        <p>
          El Usuario tendrá derecho a retirar su consentimiento en cualquier momento. Será tan fácil
          retirar el consentimiento como darlo. Como regla general, la retirada del consentimiento no
          condicionará el uso del Sitio Web.
        </p>
        <p>
          En las ocasiones en las que el Usuario deba o pueda facilitar sus datos a través de
          formularios para realizar consultas, solicitar información o por motivos relacionados con
          el contenido del Sitio Web, se le informará en caso de que la cumplimentación de alguno de
          ellos sea obligatoria debido a que los mismos sean imprescindibles para el correcto
          desarrollo de la operación realizada.
        </p>

        <LegalSubtitle>Fines del tratamiento a que se destinan los datos personales</LegalSubtitle>
        <p>
          Los datos personales son recabados y gestionados por Urban Print con la finalidad de poder
          facilitar, agilizar y cumplir los compromisos establecidos entre el Sitio Web y el Usuario,
          o el mantenimiento de la relación que se establezca en los formularios que este último
          rellene, o para atender una solicitud o consulta.
        </p>
        <p>
          Igualmente, los datos podrán ser utilizados con una finalidad comercial de personalización,
          operativa y estadística, y actividades propias del objeto social de Urban Print, así como
          para la extracción y almacenamiento de datos y estudios de marketing para adecuar el
          Contenido ofertado al Usuario, así como mejorar la calidad, funcionamiento y navegación por
          el Sitio Web.
        </p>
        <p>
          En el momento en que se obtengan los datos personales, se informará al Usuario acerca del
          fin o fines específicos del tratamiento a que se destinarán los datos personales.
        </p>

        <LegalSubtitle>Períodos de retención de los datos personales</LegalSubtitle>
        <p>
          Los datos personales solo serán retenidos durante el tiempo mínimo necesario para los fines
          de su tratamiento y, en todo caso, únicamente durante el siguiente plazo: 12 meses, o hasta
          que el Usuario solicite su supresión.
        </p>
        <p>
          En el momento en que se obtengan los datos personales, se informará al Usuario acerca del
          plazo durante el cual se conservarán los datos personales o, cuando eso no sea posible, los
          criterios utilizados para determinar este plazo.
        </p>

        <LegalSubtitle>Destinatarios de los datos personales</LegalSubtitle>
        <p>
          Los datos personales del Usuario serán compartidos con los siguientes destinatarios o
          categorías de destinatarios: <strong>Google Analytics</strong> e <strong>IONOS</strong>,
          como proveedores de analítica y de alojamiento del Sitio Web.
        </p>
        <p>
          En caso de que el Responsable del tratamiento tenga la intención de transferir datos
          personales a un tercer país u organización internacional, en el momento en que se obtengan
          los datos personales se informará al Usuario acerca del tercer país u organización
          internacional al cual se tiene la intención de transferir los datos, así como de la
          existencia o ausencia de una decisión de adecuación de la Comisión.
        </p>

        <LegalSubtitle>Datos personales de menores de edad</LegalSubtitle>
        <p>
          Respetando lo establecido en los artículos 8 del RGPD y 7 de la Ley Orgánica 3/2018, de 5
          de diciembre, solo los mayores de 14 años podrán otorgar su consentimiento para el
          tratamiento de sus datos personales de forma lícita por Urban Print. Si se trata de un
          menor de 14 años, será necesario el consentimiento de los padres o tutores para el
          tratamiento, y este solo se considerará lícito en la medida en la que los mismos lo hayan
          autorizado.
        </p>

        <LegalSubtitle>Secreto y seguridad de los datos personales</LegalSubtitle>
        <p>
          Urban Print se compromete a adoptar las medidas técnicas y organizativas necesarias, según
          el nivel de seguridad adecuado al riesgo de los datos recogidos, de forma que se garantice
          la seguridad de los datos de carácter personal y se evite la destrucción, pérdida o
          alteración accidental o ilícita de datos personales transmitidos, conservados o tratados de
          otra forma, o la comunicación o acceso no autorizados a dichos datos.
        </p>
        <p>
          El Sitio Web cuenta con un certificado SSL (Secure Socket Layer), que asegura que los datos
          personales se transmiten de forma segura y confidencial, al ser la transmisión de los datos
          entre el servidor y el Usuario, y en retroalimentación, totalmente cifrada o encriptada.
        </p>
        <p>
          Sin embargo, debido a que Urban Print no puede garantizar la inexpugnabilidad de internet
          ni la ausencia total de accesos fraudulentos a los datos personales, el Responsable del
          tratamiento se compromete a comunicar al Usuario sin dilación indebida cuando ocurra una
          violación de la seguridad de los datos personales que sea probable que entrañe un alto
          riesgo para los derechos y libertades de las personas físicas.
        </p>
        <p>
          Los datos personales serán tratados como confidenciales por el Responsable del tratamiento,
          quien se compromete a informar de ello y a garantizar, por medio de una obligación legal o
          contractual, que dicha confidencialidad sea respetada por sus empleados, asociados y toda
          persona a la cual le haga accesible la información.
        </p>

        <LegalSubtitle>Derechos derivados del tratamiento de los datos personales</LegalSubtitle>
        <p>
          El Usuario tiene sobre Urban Print y podrá, por tanto, ejercer frente al Responsable del
          tratamiento los siguientes derechos reconocidos en el RGPD y la Ley Orgánica 3/2018:
        </p>
        <LegalList
          items={[
            "Derecho de acceso: obtener confirmación de si Urban Print está tratando o no sus datos personales y, en caso afirmativo, obtener información sobre sus datos concretos de carácter personal y del tratamiento realizado, así como sobre el origen de dichos datos y los destinatarios de las comunicaciones realizadas o previstas.",
            "Derecho de rectificación: que se modifiquen sus datos personales que resulten ser inexactos o, teniendo en cuenta los fines del tratamiento, incompletos.",
            "Derecho de supresión («el derecho al olvido»): obtener la supresión de sus datos personales cuando estos ya no sean necesarios para los fines para los cuales fueron recogidos o tratados; cuando haya retirado su consentimiento y el tratamiento no cuente con otra base legal; cuando se oponga al tratamiento y no exista otro motivo legítimo; cuando los datos hayan sido tratados ilícitamente; cuando deban suprimirse en cumplimiento de una obligación legal; o cuando hayan sido obtenidos producto de una oferta directa de servicios de la sociedad de la información a un menor de 14 años.",
            "Derecho a la limitación del tratamiento: limitar el tratamiento de sus datos personales cuando impugne su exactitud; cuando el tratamiento sea ilícito; cuando el Responsable ya no necesite los datos pero el Usuario los necesite para hacer reclamaciones; y cuando el Usuario se haya opuesto al tratamiento.",
            "Derecho a la portabilidad de los datos: recibir sus datos personales en un formato estructurado, de uso común y lectura mecánica, y transmitirlos a otro responsable del tratamiento.",
            "Derecho de oposición: que no se lleve a cabo el tratamiento de sus datos de carácter personal o se cese el mismo por parte de Urban Print.",
            "Derecho a no ser objeto de una decisión basada únicamente en el tratamiento automatizado, incluida la elaboración de perfiles, salvo que la legislación vigente establezca lo contrario.",
          ]}
        />
        <p>
          Así pues, el Usuario podrá ejercitar sus derechos mediante comunicación escrita dirigida al
          Responsable del tratamiento con la referencia «RGPD-www.urbanprint.es», especificando:
        </p>
        <LegalList
          items={[
            "Nombre y apellidos del Usuario y copia del DNI. En los casos en que se admita la representación, será también necesaria la identificación por el mismo medio de la persona que representa al Usuario, así como el documento acreditativo de la representación. La fotocopia del DNI podrá ser sustituida por cualquier otro medio válido en derecho que acredite la identidad.",
            "Petición con los motivos específicos de la solicitud o información a la que se quiere acceder.",
            "Domicilio a efecto de notificaciones.",
            "Fecha y firma del solicitante.",
            "Todo documento que acredite la petición que formula.",
          ]}
        />
        <p>
          Esta solicitud y todo otro documento adjunto podrá enviarse a la siguiente dirección y/o
          correo electrónico:
        </p>
        <LegalList
          items={[
            <>
              <strong>Dirección postal:</strong> {TITULAR.direccion}
            </>,
            <>
              <strong>Correo electrónico:</strong>{" "}
              <a href={`mailto:${TITULAR.email}`} className="hover:text-primary">
                {TITULAR.email}
              </a>
            </>,
          ]}
        />

        <LegalSubtitle>Enlaces a sitios web de terceros</LegalSubtitle>
        <p>
          El Sitio Web puede incluir hipervínculos o enlaces que permiten acceder a páginas web de
          terceros distintos de Urban Print, y que por tanto no son operados por Urban Print. Los
          titulares de dichos sitios web dispondrán de sus propias políticas de protección de datos,
          siendo ellos mismos, en cada caso, responsables de sus propios ficheros y de sus propias
          prácticas de privacidad.
        </p>

        <LegalSubtitle>Reclamaciones ante la autoridad de control</LegalSubtitle>
        <p>
          En caso de que el Usuario considere que existe un problema o infracción de la normativa
          vigente en la forma en la que se están tratando sus datos personales, tendrá derecho a la
          tutela judicial efectiva y a presentar una reclamación ante una autoridad de control, en
          particular en el Estado en el que tenga su residencia habitual, lugar de trabajo o lugar de
          la supuesta infracción. En el caso de España, la autoridad de control es la Agencia
          Española de Protección de Datos (
          <a
            href="https://www.aepd.es/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-primary underline-offset-4 hover:text-primary"
          >
            www.aepd.es
          </a>
          ).
        </p>
      </LegalSection>

      <LegalSection title="II. Aceptación y cambios en esta política de privacidad">
        <p>
          Es necesario que el Usuario haya leído y esté conforme con las condiciones sobre la
          protección de datos de carácter personal contenidas en esta Política de Privacidad, así
          como que acepte el tratamiento de sus datos personales para que el Responsable del
          tratamiento pueda proceder al mismo en la forma, durante los plazos y para las finalidades
          indicadas. El uso del Sitio Web implicará la aceptación de la Política de Privacidad del
          mismo.
        </p>
        <p>
          Urban Print se reserva el derecho a modificar su Política de Privacidad, de acuerdo con su
          propio criterio, o motivado por un cambio legislativo, jurisprudencial o doctrinal de la
          Agencia Española de Protección de Datos. Los cambios o actualizaciones de esta Política de
          Privacidad no serán notificados de forma explícita al Usuario. Se recomienda al Usuario
          consultar esta página de forma periódica para estar al tanto de los últimos cambios o
          actualizaciones.
        </p>
        <p>
          Esta Política de Privacidad fue actualizada para adaptarse al Reglamento (UE) 2016/679 del
          Parlamento Europeo y del Consejo, de 27 de abril de 2016, relativo a la protección de las
          personas físicas en lo que respecta al tratamiento de datos personales y a la libre
          circulación de estos datos (RGPD), y a la Ley Orgánica 3/2018, de 5 de diciembre, de
          Protección de Datos Personales y garantía de los derechos digitales.
        </p>
      </LegalSection>

      <LegalSection title="Actualización">
        <p>Esta Política de Privacidad fue actualizada el día 07/08/2026.</p>
      </LegalSection>
    </LegalPage>
  );
}
