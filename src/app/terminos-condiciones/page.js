export const metadata = {
  title: 'Terminos y condiciones | Dralo',
  description: 'Condiciones de uso de la plataforma Dralo.',
};

export default function TerminosCondicionesPage() {
  return (
    <main className="legal-doc-page">
      <h1>Terminos y condiciones</h1>
      <p>
        Estos terminos regulan el acceso y uso de Dralo como plataforma de
        aprendizaje de ingles.
      </p>

      <section>
        <h2>1. Aceptacion</h2>
        <p>
          Al registrarte y usar la plataforma aceptas estos terminos y la
          normativa aplicable.
        </p>
      </section>

      <section>
        <h2>2. Uso permitido</h2>
        <ul>
          <li>Utilizar Dralo con fines formativos y de autoaprendizaje.</li>
          <li>No realizar usos ilicitos ni que perjudiquen el servicio.</li>
          <li>Mantener la confidencialidad de las credenciales de acceso.</li>
        </ul>
      </section>

      <section>
        <h2>3. Propiedad intelectual</h2>
        <p>
          Los contenidos, ejercicios y materiales de Dralo estan protegidos por
          derechos de propiedad intelectual. No esta permitida su reproduccion no
          autorizada.
        </p>
      </section>

      <section>
        <h2>4. Limitacion de responsabilidad</h2>
        <p>
          Dralo trabaja para mantener disponibilidad y seguridad, pero no puede
          garantizar ausencia total de interrupciones o errores puntuales.
        </p>
      </section>

      <section>
        <h2>5. Modificaciones</h2>
        <p>
          Podemos actualizar estos terminos cuando sea necesario por motivos
          legales, tecnicos u operativos.
        </p>
      </section>
    </main>
  );
}
