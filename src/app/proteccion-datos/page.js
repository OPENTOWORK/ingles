export const metadata = {
  title: 'Proteccion de datos | Dralo',
  description: 'Compromisos de seguridad y proteccion de datos en Dralo.',
};

export default function ProteccionDatosPage() {
  return (
    <main className="legal-doc-page">
      <h1>Proteccion de datos</h1>
      <p>
        En Dralo aplicamos medidas tecnicas y organizativas para proteger la
        confidencialidad, integridad y disponibilidad de los datos.
      </p>

      <section>
        <h2>1. Medidas de seguridad</h2>
        <ul>
          <li>Control de acceso y autenticacion de usuarios.</li>
          <li>Cifrado de comunicaciones mediante HTTPS.</li>
          <li>Revision periodica de incidencias y registros de actividad.</li>
        </ul>
      </section>

      <section>
        <h2>2. Acceso interno a la informacion</h2>
        <p>
          Solo el personal autorizado accede a los datos estrictamente necesarios
          para prestar soporte, mantenimiento y operacion del servicio.
        </p>
      </section>

      <section>
        <h2>3. Gestion de brechas de seguridad</h2>
        <p>
          Si detectamos una incidencia con impacto en datos personales, activamos
          un protocolo de respuesta y notificamos cuando la normativa lo exige.
        </p>
      </section>

      <section>
        <h2>4. Contacto</h2>
        <p>
          Para cualquier duda sobre proteccion de datos, puedes escribirnos desde
          la pagina de <a href="/contacto">contacto</a>.
        </p>
      </section>
    </main>
  );
}
