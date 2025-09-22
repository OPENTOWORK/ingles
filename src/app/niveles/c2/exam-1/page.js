// english-practice/src/app/niveles/c1/exam-1/page.js

export default function C1ExamPage() {
  return (
    <main className="p-8 bg-blue-50 min-h-screen text-gray-800">
      <h1 className="text-3xl font-bold mb-6">C1 Advanced (Cambridge English: Advanced)</h1>
      <p className="mb-6 text-lg">
        Este examen está diseñado para evaluar un nivel alto de inglés y consta de cuatro partes principales:
        Reading and Use of English, Writing, Listening y Speaking. Aquí te explicamos cada una:
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">1. Reading and Use of English</h2>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Part 1: Multiple-choice cloze</li>
          <li>Part 2: Open cloze</li>
          <li>Part 3: Word formation</li>
          <li>Part 4: Key word transformations</li>
          <li>Part 5: Multiple choice (reading)</li>
          <li>Part 6: Cross-text multiple matching</li>
          <li>Part 7: Gapped text</li>
          <li>Part 8: Multiple matching</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">2. Writing</h2>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Part 1: Essay obligatorio</li>
          <li>Part 2: Elegir entre artículo, reseña, informe, carta, etc.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">3. Listening</h2>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Part 1: Extractos breves – opción múltiple</li>
          <li>Part 2: Monólogo – completar oraciones</li>
          <li>Part 3: Conversación larga – opción múltiple</li>
          <li>Part 4: Varios hablantes – tarea de emparejamiento</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">4. Speaking</h2>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>Part 1: Conversación general</li>
          <li>Part 2: Turno largo (describir fotos)</li>
          <li>Part 3: Tarea colaborativa</li>
          <li>Part 4: Discusión</li>
        </ul>
      </section>
    </main>
  );
}
