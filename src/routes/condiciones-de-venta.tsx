import { createFileRoute } from "@tanstack/react-router";
import { LegalList, LegalPage, LegalSection, LegalSubtitle } from "@/components/LegalPage";
import { TITULAR } from "@/lib/site";

export const Route = createFileRoute("/condiciones-de-venta")({
  head: () => ({
    meta: [
      { title: "Condiciones Generales de Venta | Urban Print" },
      {
        name: "description",
        content:
          "Condiciones generales de venta de www.urbanprint.es: proceso de compra, precios, pago, entrega, devoluciones y garantías. Titular: Pedro Martinez García.",
      },
      { property: "og:title", content: "Condiciones Generales de Venta | Urban Print" },
      {
        property: "og:description",
        content:
          "Proceso de compra, precios, medios de pago, plazos de entrega, derecho de desistimiento y garantías en Urban Print.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CondicionesVentaPage,
});

function CondicionesVentaPage() {
  return (
    <LegalPage
      title="Condiciones generales de venta"
      intro="Condiciones que regulan el uso de www.urbanprint.es y la compra o adquisición de productos y servicios de impresión, gran formato, textil y personalización a través del mismo."
      updated="07/08/2026"
    >
      <LegalSection title="1. Información general">
        <p>
          La titularidad de este sitio web <strong>{TITULAR.web}</strong> (en adelante, Sitio Web) la
          ostenta <strong>{TITULAR.nombre}</strong>, con NIF <strong>{TITULAR.nif}</strong>, y cuyos
          datos de contacto son los siguientes:
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
        <p>
          Este documento (así como otros documentos que aquí se mencionen) regula las condiciones por
          las que se rige el uso de este Sitio Web y la compra o adquisición de productos y/o
          servicios en el mismo (en adelante, Condiciones).
        </p>
        <p>
          A efectos de estas Condiciones se entiende que la actividad que Urban Print desarrolla a
          través del Sitio Web comprende los servicios de imprenta online: imprenta general, gran
          formato, impresión textil, merchandising, regalos personalizados, eventos y bodas, sellos y
          diseño gráfico.
        </p>
        <p>
          Además de leer las presentes Condiciones, antes de acceder, navegar y/o usar esta página
          web, el Usuario ha de haber leído el Aviso Legal y las Condiciones Generales de Uso, así
          como la política de privacidad y de protección de datos de Urban Print. Al utilizar este
          Sitio Web o al hacer y/o solicitar la adquisición de un producto y/o servicio a través del
          mismo, el Usuario consiente quedar vinculado por estas Condiciones y por todo lo
          anteriormente mencionado, por lo que si no está de acuerdo con todo ello no debe usar este
          Sitio Web.
        </p>
        <p>
          Asimismo, se informa de que estas Condiciones podrían ser modificadas. El Usuario es
          responsable de consultarlas cada vez que acceda, navegue y/o use el Sitio Web, ya que serán
          aplicables aquellas que se encuentren vigentes en el momento en que se solicite la
          adquisición de productos y/o servicios.
        </p>
        <p>
          Para todas las preguntas que el Usuario pueda tener en relación con las Condiciones puede
          ponerse en contacto con el titular utilizando los datos de contacto facilitados más arriba
          o, en su caso, utilizando el formulario de contacto.
        </p>
      </LegalSection>

      <LegalSection title="2. El Usuario">
        <p>
          El acceso, la navegación y uso del Sitio Web confiere la condición de usuario (en adelante
          referido, indistintamente, individualmente como Usuario o conjuntamente como Usuarios), por
          lo que se aceptan, desde que se inicia la navegación por el Sitio Web, todas las
          Condiciones aquí establecidas, así como sus ulteriores modificaciones, sin perjuicio de la
          aplicación de la correspondiente normativa legal de obligado cumplimiento según el caso.
        </p>
        <p>El Usuario asume su responsabilidad de un uso correcto del Sitio Web, que se extenderá a:</p>
        <LegalList
          items={[
            "Hacer uso de este Sitio Web únicamente para realizar consultas y compras o adquisiciones legalmente válidas.",
            "No realizar ninguna compra falsa o fraudulenta. Si razonablemente se pudiera considerar que se ha hecho una compra de esta índole, podría ser anulada y se informaría a las autoridades pertinentes.",
            "Facilitar datos de contacto veraces y lícitos, por ejemplo, dirección de correo electrónico, dirección postal y/u otros datos.",
          ]}
        />
        <p>
          El Usuario declara ser mayor de 18 años y tener capacidad legal para celebrar contratos a
          través de este Sitio Web.
        </p>
        <p>
          El Sitio Web está dirigido principalmente a Usuarios residentes en España. Urban Print no
          asegura que el Sitio Web cumpla con legislaciones de otros países, ya sea total o
          parcialmente, y declina toda responsabilidad que se pueda derivar de dicho acceso, así como
          tampoco asegura envíos o prestación de servicios fuera de España.
        </p>
      </LegalSection>

      <LegalSection title="3. Proceso de compra o adquisición">
        <p>
          Los Usuarios debidamente registrados pueden comprar en el Sitio Web por los medios y formas
          establecidos. Deberán seguir el procedimiento de compra y/o adquisición online de{" "}
          {TITULAR.web}, durante el cual varios productos y/o servicios pueden ser seleccionados y
          añadidos al carrito, cesta o espacio final de compra y, finalmente, hacer clic en
          «Finalizar compra».
        </p>
        <p>
          Asimismo, el Usuario deberá rellenar y/o comprobar la información que en cada paso se le
          solicita, aunque, durante el proceso de compra y antes de realizar el pago, se pueden
          modificar los datos de la compra.
        </p>
        <p>
          Seguidamente, el Usuario recibirá un correo electrónico confirmando que Urban Print ha
          recibido su pedido o solicitud de compra y/o prestación del servicio, es decir, la
          confirmación del pedido. Y, en su caso, se le informará igualmente mediante correo
          electrónico cuando su compra esté siendo enviada. Estas informaciones también podrían
          ponerse a disposición del Usuario a través de su espacio personal de conexión al Sitio Web.
        </p>
        <p>
          Una vez el procedimiento de compra ha concluido, el Usuario consiente que el Sitio Web
          genere una factura electrónica que se le hará llegar a través del correo electrónico y, en
          su caso, a través de su espacio personal. Asimismo, el Usuario puede, si así lo desea,
          obtener una copia de su factura en papel solicitándolo a Urban Print utilizando los
          espacios de contacto del Sitio Web o a través de los datos de contacto facilitados más
          arriba.
        </p>
        <p>
          El Usuario reconoce estar al corriente, en el momento de la compra, de ciertas condiciones
          particulares de venta que conciernen al producto y/o servicio en cuestión y que se muestran
          junto a la presentación o imagen de este en su página del Sitio Web, indicando, a modo
          enunciativo pero no exhaustivo: nombre, precio, componentes, peso, cantidad, color,
          detalles de los productos o características, modo en el que se llevarán a cabo y/o coste de
          las prestaciones; y reconoce que la realización del pedido de compra materializa la
          aceptación plena y completa de las condiciones particulares de venta aplicables a cada
          caso.
        </p>
        <p>
          Las comunicaciones, órdenes de compra y pagos que intervengan durante las transacciones
          efectuadas en el Sitio Web podrían ser archivadas y conservadas en los registros
          informatizados de Urban Print con el fin de constituir un medio de prueba de las
          transacciones, respetando en todo caso las condiciones razonables de seguridad y las leyes
          y normativas vigentes, y particularmente el RGPD y la Ley Orgánica 3/2018, de 5 de
          diciembre, así como los derechos que asisten a los Usuarios conforme a la política de
          privacidad de este Sitio Web.
        </p>
        <p>
          A menos que se indique expresamente lo contrario, Urban Print no es el fabricante de todos
          los productos vendidos o que pudieran llegar a comercializarse en el Sitio Web. Si bien
          Urban Print realiza grandes esfuerzos para que la información mostrada en el Sitio Web sea
          correcta, en ocasiones el embalaje y/o los materiales y/o los componentes de los productos
          pueden contener información adicional o distinta de la que aparece en el Sitio Web. Por
          ello, el Usuario debe considerar no solo la información suministrada por el Sitio Web, sino
          también la disponible en el etiquetado, las advertencias y/o instrucciones que acompañen al
          producto.
        </p>
      </LegalSection>

      <LegalSection title="4. Disponibilidad">
        <p>
          Todos los pedidos de compra recibidos por Urban Print a través del Sitio Web están sujetos
          a la disponibilidad de los productos y/o a que ninguna circunstancia o causa de fuerza
          mayor (cláusula novena de estas Condiciones) afecte al suministro de los mismos y/o a la
          prestación de los servicios. Si se produjeran dificultades en cuanto al suministro de
          productos o no quedaran productos en stock, Urban Print se compromete a contactar con el
          Usuario y reembolsar cualquier cantidad que pudiera haber sido abonada en concepto de
          importe. Esto será igualmente aplicable en los casos en los que la prestación de un
          servicio deviniera irrealizable.
        </p>
      </LegalSection>

      <LegalSection title="5. Precios y pago">
        <p>
          Los precios exhibidos en el Sitio Web son los finales, en euros (€), e incluyen los
          impuestos, salvo que por exigencia legal, especialmente en lo relativo al IVA, se señale y
          aplique cuestión distinta.
        </p>
        <p>
          Salvo que se indique puntualmente otra cosa, los precios de los artículos ofrecidos
          excluyen los gastos de envío, en los que se pudiera incurrir, que se añadirán al importe
          total debido en el momento de gestionar el procedimiento de envío por parte del Usuario,
          donde este consultará los métodos y costes de envío disponibles y elegirá libremente el que
          más le convenga. Urban Print realiza los servicios de entrega y/o envío a través de
          Correos.
        </p>
        <p>
          En ningún caso el Sitio Web añadirá costes adicionales al precio de un producto o de un
          servicio de forma automática, sino solo aquellos que el Usuario haya seleccionado y elegido
          voluntaria y libremente.
        </p>
        <p>
          Los precios pueden cambiar en cualquier momento, pero los posibles cambios no afectarán a
          los pedidos o compras respecto de los que el Usuario ya haya finalizado el proceso de
          solicitud de compra y recibido una confirmación de pedido.
        </p>
        <p>Los medios de pago aceptados serán:</p>
        <LegalList
          items={[
            "Tarjeta de crédito.",
            "Tarjeta de débito.",
          ]}
        />
        <p>
          El pago con tarjeta de crédito o débito es el único medio de pago admitido en el Sitio
          Web. No se aceptan pagos mediante PayPal, transferencia bancaria ni contra reembolso.
        </p>
        <p>
          Urban Print utiliza todos los medios para garantizar la confidencialidad y la seguridad de
          los datos de pago transmitidos por el Usuario durante las transacciones a través del Sitio
          Web. Como tal, el Sitio Web utiliza un sistema de pago seguro SSL (Secure Socket Layer).
        </p>
        <p>
          Las tarjetas estarán sujetas a comprobaciones y autorizaciones por parte de la entidad
          bancaria emisora de las mismas; si dicha entidad no autorizase el pago, Urban Print no
          será responsable por ningún retraso o falta de entrega y no podrá formalizar ningún
          contrato con el Usuario.
        </p>
        <p>
          Una vez que Urban Print reciba la orden de compra por parte del Usuario a través del Sitio
          Web, se hará una preautorización en la tarjeta que corresponda para asegurar que existen
          fondos suficientes para completar la transacción. El cargo en la tarjeta se hará en el
          momento en que se envíe al Usuario la confirmación de envío y/o confirmación del servicio
          que se presta.
        </p>
        <p>
          En todo caso, al hacer clic en «Finalizar compra» el Usuario confirma que la tarjeta
          utilizada como método de pago es suya o que es su legítimo poseedor.
        </p>
      </LegalSection>

      <LegalSection title="6. Entrega">
        <p>
          En los casos en los que proceda realizar la entrega física del bien contratado, las
          entregas se efectuarán en el ámbito del siguiente territorio: España (Península y
          Baleares). Actualmente no realizamos envíos a Canarias, Ceuta ni Melilla.
        </p>

        <p>
          Exceptuando aquellos casos en los que existan circunstancias imprevistas o extraordinarias
          o, en su caso, derivadas de la personalización de los productos, el pedido consistente en
          los productos relacionados en cada confirmación de compra será entregado en el plazo
          señalado en el Sitio Web según el método de envío seleccionado por el Usuario y, en todo
          caso, en el plazo máximo de 30 días naturales a contar desde la fecha de la confirmación
          del pedido.
        </p>
        <p>
          Si por algún motivo que le fuera imputable Urban Print no pudiera cumplir con la fecha de
          entrega, contactará con el Usuario para informarle de esta circunstancia y este podrá
          elegir seguir adelante con la compra estableciendo una nueva fecha de entrega o bien anular
          el pedido con el reembolso total del precio pagado. En cualquier caso, las entregas a
          domicilio se realizan en días laborables.
        </p>
        <p>
          Si resultara imposible efectuar la entrega del pedido por ausencia del Usuario, el pedido
          podría ser devuelto al almacén. No obstante, el transportista dejaría un aviso explicando
          dónde se encuentra el pedido y cómo hacer para que sea entregado de nuevo. Si el Usuario no
          va a estar en el lugar de entrega en la franja horaria convenida, debe ponerse en contacto
          con Urban Print para convenir la entrega otro día.
        </p>
        <p>
          En caso de que transcurran 30 días desde que su pedido esté disponible para su entrega y no
          haya sido entregado por causa no imputable a Urban Print, se entenderá que el Usuario desea
          desistir del contrato y este se considerará resuelto. Como consecuencia, todos los pagos
          recibidos del Usuario le serán devueltos, a excepción de los gastos adicionales resultantes
          de la elección propia del Usuario de una modalidad de entrega diferente a la modalidad
          menos costosa de entrega ordinaria que ofrece el Sitio Web, sin ninguna demora indebida y,
          en cualquier caso, en el plazo máximo de 14 días naturales desde la fecha en que se
          considera resuelto el contrato. No obstante, el Usuario debe tener presente que el
          transporte derivado de la resolución puede tener un coste adicional que le podrá ser
          repercutido.
        </p>
        <p>
          A efectos de las presentes Condiciones, se entenderá que se ha producido la entrega o que
          el pedido ha sido entregado en el momento en el que el Usuario o un tercero indicado por el
          Usuario adquiera la posesión material de los productos, lo que se acreditará mediante la
          firma de la recepción del pedido en la dirección de entrega convenida.
        </p>
        <p>
          Los riesgos que de los productos se pudieran derivar serán a cargo del Usuario a partir del
          momento de su entrega. El Usuario adquiere la propiedad de los productos cuando Urban Print
          recibe el pago completo de todas las cantidades debidas en relación con la compra,
          incluidos los gastos de envío, o bien en el momento de la entrega, si esta tiene lugar en
          un momento posterior a la recepción completa del importe.
        </p>
        <p>
          De conformidad con lo dispuesto en la Ley 37/1992, de 28 de diciembre, del Impuesto sobre
          el Valor Añadido (IVA), los pedidos para su entrega y/o prestación se entenderán
          localizados en el territorio de aplicación del IVA español si la dirección de entrega está
          en territorio español, salvo Canarias, Ceuta y Melilla. El tipo de IVA aplicable será el
          legalmente vigente en cada momento en función del artículo concreto de que se trate.
        </p>
        <p>
          Urban Print no realiza envíos con destino a Canarias, Ceuta ni Melilla, por lo que no se
          admitirán pedidos con dirección de entrega en dichos territorios.
        </p>

      </LegalSection>

      <LegalSection title="7. Medios técnicos para corregir errores">
        <p>
          Se pone en conocimiento del Usuario que, en caso de que detecte que se ha producido un
          error al introducir datos necesarios para procesar su solicitud de compra en el Sitio Web,
          podrá modificarlos poniéndose en contacto con Urban Print a través de los espacios de
          contacto habilitados en el Sitio Web y/o utilizando los datos de contacto facilitados en la
          cláusula primera (Información general). Asimismo, estas informaciones también podrían
          subsanarse por el Usuario a través de su espacio personal de conexión al Sitio Web.
        </p>
        <p>
          En cualquier caso, el Usuario, antes de hacer clic en «Finalizar compra», tiene acceso al
          espacio, carrito o cesta donde se van anotando sus solicitudes de compra y puede hacer
          modificaciones.
        </p>
        <p>
          De igual forma, se remite al Usuario a consultar el Aviso Legal y Condiciones Generales de
          Uso y, en concreto, la Política de Privacidad, para recabar más información sobre cómo
          ejercer su derecho de rectificación según lo establecido en el RGPD y en la Ley Orgánica
          3/2018, de 5 de diciembre.
        </p>
      </LegalSection>

      <LegalSection title="8. Devoluciones">
        <LegalSubtitle>Derecho de desistimiento</LegalSubtitle>
        <p>
          El Usuario, en tanto que consumidor y usuario, realiza una compra en el Sitio Web y, por
          tanto, le asiste el derecho a desistir de dicha compra en un plazo de 14 días naturales sin
          necesidad de justificación.
        </p>
        <p>
          Este plazo de desistimiento expirará a los 14 días naturales del día en que el Usuario o un
          tercero autorizado por este, distinto del transportista, adquirió la posesión material de
          los bienes adquiridos en el Sitio Web de Urban Print o, en caso de que los bienes que
          componen su pedido se entreguen por separado, a los 14 días naturales del día en que
          adquirió la posesión material del último de esos bienes; o, en el caso de tratarse de un
          contrato de servicios, a los 14 días naturales desde el día de la celebración del contrato.
        </p>
        <p>
          Para ejercer este derecho de desistimiento, el Usuario deberá notificar su decisión a Urban
          Print. Podrá hacerlo a través de los espacios de contacto habilitados en el Sitio Web. El
          Usuario, independientemente del medio que elija para comunicar su decisión, debe expresar
          de forma clara e inequívoca que es su intención desistir del contrato de compra. En todo
          caso, el Usuario podrá utilizar el modelo de formulario de desistimiento que Urban Print
          pone a su disposición, si bien su uso no es obligatorio. Para cumplir el plazo de
          desistimiento, basta con que la comunicación sea enviada antes de que venza el plazo
          correspondiente.
        </p>
        <p>
          En caso de desistimiento, Urban Print reembolsará al Usuario todos los pagos recibidos,
          incluidos los gastos de envío (con la excepción de los gastos adicionales elegidos por el
          Usuario para una modalidad de envío diferente a la modalidad menos costosa ofrecida en el
          Sitio Web), sin ninguna demora indebida y, en todo caso, a más tardar en 14 días naturales
          a partir de la fecha en la que Urban Print es informado de la decisión de desistir.
        </p>
        <p>
          Urban Print reembolsará al Usuario utilizando el mismo método de pago que empleó este para
          realizar la transacción inicial de compra. Este reembolso no generará ningún coste
          adicional al Usuario. No obstante, Urban Print podría retener dicho reembolso hasta haber
          recibido los productos o hasta que el Usuario presente una prueba de la devolución de los
          mismos, según qué condición se cumpla primero.
        </p>
        <p>
          El Usuario puede devolver o enviar los productos a Urban Print en:{" "}
          <strong>{TITULAR.direccion}</strong>, sin ninguna demora indebida y, en cualquier caso, a
          más tardar en el plazo de 14 días naturales a partir de la fecha en que Urban Print fue
          informado de la decisión de desistimiento.
        </p>
        <p>
          El Usuario reconoce conocer que deberá asumir el coste directo de devolución (transporte,
          entrega) de los bienes, si se incurriera en alguno. Además, será responsable de la
          disminución de valor de los productos resultante de una manipulación distinta a la
          necesaria para establecer la naturaleza, las características y el funcionamiento de los
          bienes.
        </p>
        <p>
          El Usuario reconoce saber que existen excepciones al derecho de desistimiento, tal y como
          se recoge en el artículo 103 del Real Decreto Legislativo 1/2007, de 16 de noviembre, por
          el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores
          y Usuarios. De forma enunciativa y no exhaustiva, este sería el caso de: productos
          personalizados; productos que puedan deteriorarse o caducar con rapidez; productos que por
          razones de higiene o de salud van precintados y han sido desprecintados tras la entrega; y
          el suministro de contenido digital sin soporte físico.
        </p>
        <p>
          En este mismo sentido se rige la prestación de un servicio que el Usuario pudiera contratar
          en este Sitio Web, pues esta misma Ley establece que no asistirá el derecho de
          desistimiento a los Usuarios cuando la prestación del servicio haya sido completamente
          ejecutada, o cuando haya comenzado con el consentimiento expreso del consumidor y usuario y
          con el reconocimiento por su parte de que es consciente de que, una vez que el contrato
          haya sido completamente ejecutado por Urban Print, habrá perdido su derecho de
          desistimiento.
        </p>
        <p>
          En todo caso, no se hará ningún reembolso si el producto ha sido usado más allá de la mera
          apertura del mismo, de productos que no estén en las mismas condiciones en las que se
          entregaron o que hayan sufrido algún daño tras la entrega. Asimismo, se deben devolver los
          productos usando o incluyendo todos sus envoltorios originales, las instrucciones y demás
          documentos que en su caso los acompañen, además de una copia de la factura de compra.
        </p>
        <p>
          Puede descargar el modelo de formulario de desistimiento en el siguiente enlace:{" "}
          <a
            href="https://urbanprint.es/modelo-desestimiento"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-primary underline-offset-4 hover:text-primary"
          >
            urbanprint.es/modelo-desestimiento
          </a>
          .
        </p>

        <LegalSubtitle>Devolución de productos defectuosos o error en el envío</LegalSubtitle>
        <p>
          Se trata de todos aquellos casos en los que el Usuario considera que, en el momento de la
          entrega, el producto no se ajusta a lo estipulado en el contrato o pedido de compra, y que,
          por tanto, deberá ponerse en contacto con Urban Print inmediatamente y hacerle saber la
          disconformidad existente (defecto/error) por los mismos medios o utilizando los datos de
          contacto que se facilitan en el apartado anterior.
        </p>
        <p>
          El Usuario será entonces informado sobre cómo proceder a la devolución de los productos, y
          estos, una vez devueltos, serán examinados y se informará al Usuario, dentro de un plazo
          razonable, si procede el reembolso o, en su caso, la sustitución del mismo. El reembolso o
          la sustitución del producto se efectuará lo antes posible y, en cualquier caso, dentro de
          los 14 días siguientes a la fecha en la que se envíe un correo electrónico confirmando que
          procede el reembolso o la sustitución del artículo no conforme.
        </p>
        <p>
          El importe abonado por aquellos productos que sean devueltos a causa de algún defecto,
          cuando realmente exista, será reembolsado íntegramente, incluidos los gastos de entrega y
          los costes en que hubiera podido incurrir el Usuario para realizar la devolución. El
          reembolso se efectuará por el mismo medio de pago que el Usuario utilizó para pagar la
          compra. En todo caso, se estará siempre a los derechos reconocidos en la legislación
          vigente en cada momento para el Usuario, en tanto que consumidor y usuario.
        </p>

        <LegalSubtitle>Garantías</LegalSubtitle>
        <p>
          El Usuario, en tanto que consumidor y usuario, goza de garantías sobre los productos que
          pueda adquirir a través de este Sitio Web, en los términos legalmente establecidos para
          cada tipo de producto, respondiendo Urban Print, por tanto, por la falta de conformidad de
          los mismos que se manifieste en un plazo de tres años desde la entrega del producto.
        </p>
        <p>
          En este sentido, se entiende que los productos son conformes con el contrato siempre que se
          ajusten a la descripción realizada por Urban Print y posean las cualidades presentadas en
          la misma; sean aptos para los usos a que ordinariamente se destinan los productos del mismo
          tipo; y presenten la calidad y prestaciones habituales de un producto del mismo tipo y que
          sean fundamentalmente esperables del mismo. Cuando esto no sea así respecto de los
          productos entregados al Usuario, este deberá proceder tal y como se indica en el apartado
          «Devolución de productos defectuosos o error en el envío». No obstante, algunos de los
          productos que se comercializan en el Sitio Web podrían presentar características no
          homogéneas siempre y cuando estas deriven del tipo de material con el que se han fabricado,
          formando parte de la apariencia individual del producto y no constituyendo un defecto.
        </p>
        <p>
          Por otra parte, podría darse el caso de que el Usuario adquiera en el Sitio Web un producto
          de una marca o de fabricación por un tercero. En este caso, y considerando el Usuario que
          se trata de un producto defectuoso, también tiene la posibilidad de ponerse en contacto con
          la marca o fabricante responsable del producto para averiguar cómo ejercer su derecho de
          garantía legal directamente frente a los mismos durante los tres años siguientes a la
          entrega de dichos productos. Para ello, el Usuario debe haber conservado toda la
          información en relación con la garantía de los productos.
        </p>
        <p>
          Para conocer más sobre el servicio posventa que Urban Print pone al servicio de los
          Usuarios del Sitio Web, puede consultarlo en{" "}
          <a
            href="https://urbanprint.es/contacto"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-primary underline-offset-4 hover:text-primary"
          >
            urbanprint.es/contacto
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Exoneración de responsabilidad">
        <p>
          Salvo disposición legal en sentido contrario, Urban Print no aceptará ninguna
          responsabilidad por las siguientes pérdidas, con independencia de su origen:
        </p>
        <LegalList
          items={[
            "Cualesquiera pérdidas que no fueran atribuibles a incumplimiento alguno por su parte.",
            "Pérdidas empresariales (incluyendo lucro cesante, de ingresos, de contratos, de ahorros previstos, de datos, pérdida del fondo de comercio o gastos innecesarios incurridos).",
            "Toda otra pérdida indirecta que no fuera razonablemente previsible por ambas partes en el momento en que se formalizó el contrato de compraventa de los productos.",
          ]}
        />
        <p>Igualmente, Urban Print también limita su responsabilidad en cuanto a los siguientes casos:</p>
        <LegalList
          items={[
            "Urban Print aplica todas las medidas concernientes a proporcionar una visualización fiel del producto en el Sitio Web; sin embargo, no se responsabiliza por las mínimas diferencias o inexactitudes que puedan existir debido a la falta de resolución de la pantalla, problemas del navegador que se utilice u otros de esta índole.",
            "Urban Print actuará con la máxima diligencia a efectos de poner el producto a disposición de la empresa encargada del transporte. Sin embargo, no se responsabiliza por perjuicios provenientes de un mal funcionamiento del transporte, especialmente por causas como huelgas, retenciones en carreteras y, en general, cualesquiera otras propias del sector, que deriven en retrasos, pérdidas o hurtos del producto.",
            "Fallos técnicos que, por causas fortuitas o de otra índole, impidan un normal funcionamiento del servicio a través de internet; falta de disponibilidad del Sitio Web por razones de mantenimiento u otras. Urban Print pone todos los medios a su alcance a efectos de llevar a cabo el proceso de compra, pago y envío/entrega de los productos; no obstante, se exime de responsabilidad por causas que no le sean imputables, caso fortuito o fuerza mayor.",
            "Urban Print no se hará responsable del mal uso y/o del desgaste de los productos que hayan sido utilizados por el Usuario, ni de una devolución errónea realizada por el Usuario. Es responsabilidad del Usuario devolver el producto correcto.",
            "En general, Urban Print no se responsabilizará por ningún incumplimiento o retraso en el cumplimiento de alguna de las obligaciones asumidas cuando el mismo se deba a acontecimientos que están fuera de su control razonable, es decir, a causa de fuerza mayor.",
          ]}
        />
        <p>
          A modo enunciativo pero no exhaustivo, se considerarán causas de fuerza mayor: huelgas,
          cierres patronales u otras medidas reivindicativas; conmoción civil, revuelta, invasión,
          amenaza o ataque terrorista, guerra (declarada o no) o amenaza o preparativos de guerra;
          incendio, explosión, tormenta, inundación, terremoto, hundimiento, epidemia o cualquier
          otro desastre natural; imposibilidad de uso de trenes, barcos, aviones, transportes de
          motor u otros medios de transporte, públicos o privados; imposibilidad de utilizar sistemas
          públicos o privados de telecomunicaciones; y actos, decretos, legislación, normativa o
          restricciones de cualquier gobierno o autoridad pública.
        </p>
        <p>
          De esta forma, las obligaciones quedarán suspendidas durante el periodo en que la causa de
          fuerza mayor continúe, y Urban Print dispondrá de una ampliación en el plazo para
          cumplirlas por un periodo de tiempo igual al que dure dicha causa. Urban Print pondrá todos
          los medios razonables para encontrar una solución que le permita cumplir con sus
          obligaciones a pesar de la causa de fuerza mayor.
        </p>
      </LegalSection>

      <LegalSection title="10. Comunicaciones por escrito y notificaciones">
        <p>
          Mediante el uso de este Sitio Web, el Usuario acepta que la mayor parte de las
          comunicaciones con Urban Print sean electrónicas (correo electrónico o avisos publicados en
          el Sitio Web).
        </p>
        <p>
          A efectos contractuales, el Usuario consiente en usar este medio electrónico de
          comunicación y reconoce que todo contrato, notificación, información y demás comunicaciones
          que Urban Print envíe de forma electrónica cumplen con los requisitos legales de ser por
          escrito. Esta condición no afectará a los derechos reconocidos por ley al Usuario.
        </p>
        <p>
          El Usuario puede enviar notificaciones y/o comunicarse con Urban Print a través de los
          datos de contacto que en estas Condiciones se facilitan y, en su caso, a través de los
          espacios de contacto del Sitio Web. Igualmente, salvo que se estipule lo contrario, Urban
          Print puede contactar y/o notificar al Usuario en su correo electrónico o en la dirección
          postal facilitada.
        </p>
      </LegalSection>

      <LegalSection title="11. Renuncia">
        <p>
          Ninguna renuncia de Urban Print a un derecho o acción legal concreta, o la falta de
          requerimiento por Urban Print del cumplimiento estricto por el Usuario de alguna de sus
          obligaciones, supondrá una renuncia a otros derechos o acciones derivados de un contrato o
          de las Condiciones, ni exonerará al Usuario del cumplimiento de sus obligaciones.
        </p>
        <p>
          Ninguna renuncia de Urban Print a alguna de las presentes Condiciones o a los derechos o
          acciones derivados de un contrato surtirá efecto, a no ser que se establezca expresamente
          que es una renuncia y se formalice y se le comunique al Usuario por escrito.
        </p>
      </LegalSection>

      <LegalSection title="12. Nulidad">
        <p>
          Si alguna de las presentes Condiciones fuese declarada nula y sin efecto por resolución
          firme dictada por autoridad competente, el resto de las cláusulas permanecerán en vigor,
          sin que queden afectadas por dicha declaración de nulidad.
        </p>
      </LegalSection>

      <LegalSection title="13. Acuerdo completo">
        <p>
          Las presentes Condiciones y todo documento al que se haga referencia expresa en estas
          constituyen el acuerdo íntegro existente entre el Usuario y Urban Print en relación con el
          objeto de compraventa y sustituyen a cualquier otro pacto, acuerdo o promesa anterior
          convenida verbalmente o por escrito por las mismas partes.
        </p>
        <p>
          El Usuario y Urban Print reconocen haber consentido la celebración de un contrato sin haber
          confiado en ninguna declaración o promesa hecha por la otra parte, salvo aquello que figura
          expresamente mencionado en las presentes Condiciones.
        </p>
      </LegalSection>

      <LegalSection title="14. Protección de datos">
        <p>
          La información o datos de carácter personal que el Usuario facilite a Urban Print en el
          curso de una transacción en el Sitio Web serán tratados con arreglo a lo establecido en la
          Política de Privacidad o de protección de datos (contenida, en su caso, en el Aviso Legal y
          Condiciones Generales de Uso). Al acceder, navegar y/o usar el Sitio Web, el Usuario
          consiente el tratamiento de dicha información y datos y declara que toda la información o
          datos que facilita son veraces.
        </p>
      </LegalSection>

      <LegalSection title="15. Legislación aplicable y jurisdicción">
        <p>
          El acceso, navegación y/o uso de este Sitio Web y los contratos de compra de productos a
          través del mismo se regirán por la legislación española.
        </p>
        <p>
          Cualquier controversia, problema o desacuerdo que surja o esté relacionado con el acceso,
          navegación y/o uso del Sitio Web, o con la interpretación y ejecución de estas Condiciones,
          o con los contratos de venta entre Urban Print y el Usuario, será sometida a la
          jurisdicción no exclusiva de los juzgados y tribunales españoles.
        </p>
      </LegalSection>

      <LegalSection title="16. Quejas y reclamaciones">
        <p>
          El Usuario puede hacer llegar a Urban Print sus quejas, reclamaciones o todo otro
          comentario que desee realizar a través de los datos de contacto que se facilitan al
          principio de estas Condiciones (Información general).
        </p>
        <p>
          Además, Urban Print dispone de hojas oficiales de reclamación a disposición de los
          consumidores y usuarios, que estos pueden solicitar en cualquier momento utilizando los
          mismos datos de contacto.
        </p>
        <p>
          Asimismo, si de la celebración de este contrato de compra entre Urban Print y el Usuario
          emanara una controversia, el Usuario como consumidor puede solicitar una solución
          extrajudicial de controversias, de acuerdo con el Reglamento (UE) 524/2013 del Parlamento
          Europeo y del Consejo, de 21 de mayo de 2013, sobre resolución de litigios en línea en
          materia de consumo. Puede acceder a este método a través del siguiente sitio web:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noreferrer noopener"
            className="underline decoration-primary underline-offset-4 hover:text-primary"
          >
            ec.europa.eu/consumers/odr
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Actualización">
        <p>
          Este documento de Condiciones Generales de Venta ha sido actualizado el día 07/08/2026.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
