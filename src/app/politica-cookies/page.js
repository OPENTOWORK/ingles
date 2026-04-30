export const metadata = {
  title: 'Politica de cookies | Dralo',
  description: 'Uso de cookies y tecnologias similares en Dralo.',
};

export default function PoliticaCookiesPage() {
  return (
    <main className="legal-doc-page">
      <h1>Politica de cookies</h1>
      <p>
        Esta politica describe que son las cookies, cuales usamos en Dralo y como
        puedes gestionarlas.
      </p>

      <section>
        <h2>1. Que son las cookies</h2>
        <p>
          Son pequenos archivos que se guardan en tu dispositivo para recordar
          informacion de navegacion y mejorar el funcionamiento del sitio.
        </p>
      </section>

      <section>
        <h2>2. Tipos de cookies que utilizamos</h2>
        <ul>
          <li>
            Tecnicas o necesarias: esenciales para inicio de sesion y seguridad.
          </li>
          <li>
            Preferencias: permiten recordar ajustes de visualizacion o idioma.
          </li>
          <li>
            Analiticas: nos ayudan a entender uso general para mejorar contenidos.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidad</h2>
        <ul>
          <li>Garantizar el correcto funcionamiento de la plataforma.</li>
          <li>Mejorar la experiencia del usuario.</li>
          <li>Analizar rendimiento y detectar incidencias tecnicas.</li>
        </ul>
      </section>

      <section>
        <h2>4. Gestion de cookies</h2>
        <p>
          Puedes borrar o bloquear cookies desde tu navegador. Ten en cuenta que
          ciertas funciones de la plataforma pueden verse afectadas si desactivas
          cookies necesarias.
        </p>
      </section>
    </main>
  );
}
