export const metadata = {
  title: 'Politica de privacidad | Dralo',
  description: 'Informacion sobre el tratamiento de datos personales en Dralo.',
};

export default function PoliticaPrivacidadPage() {
  return (
    <main className="legal-doc-page">
      <h1>Politica de privacidad</h1>
      <p>
        En Dralo nos comprometemos a proteger la privacidad de los usuarios de la
        plataforma. Esta politica explica como recogemos, usamos y protegemos tus
        datos personales.
      </p>

      <section>
        <h2>1. Responsable del tratamiento</h2>
        <p>
          Responsable: Dralo. Para cualquier consulta relacionada con privacidad
          puedes usar la pagina de <a href="/contacto">contacto</a>.
        </p>
      </section>

      <section>
        <h2>2. Datos que tratamos</h2>
        <ul>
          <li>Datos de registro: nombre, correo electronico y credenciales.</li>
          <li>Datos de uso: progreso, resultados y actividad formativa.</li>
          <li>Datos de soporte: mensajes enviados al equipo de atencion.</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidades y base legal</h2>
        <ul>
          <li>Prestar el servicio educativo contratado.</li>
          <li>Gestionar autenticacion, seguridad y prevencion de fraude.</li>
          <li>Atender solicitudes y comunicaciones de soporte.</li>
          <li>Mejorar la experiencia de aprendizaje y la plataforma.</li>
        </ul>
      </section>

      <section>
        <h2>4. Conservacion de datos</h2>
        <p>
          Conservamos tus datos durante el tiempo necesario para prestar el
          servicio y cumplir obligaciones legales. Cuando dejan de ser necesarios,
          se eliminan o anonimizan de forma segura.
        </p>
      </section>

      <section>
        <h2>5. Derechos del usuario</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificacion, supresion,
          oposicion, limitacion y portabilidad solicitandolo a traves de nuestro
          canal de contacto.
        </p>
      </section>
    </main>
  );
}
