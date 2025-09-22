"use client";

import { useState } from "react";
import { useExam } from "../context/ExamContext"; // ⚠️ usa ruta relativa correcta
import NavigationButtons from "./NavigationButtons";

export default function ExamPart({ examId, part, data }) {
  const { title, instructions, questions } = data;

  const { answers, updateAnswer } = useExam();
  const [submitted, setSubmitted] = useState(false);

  // Respuestas guardadas globalmente para esta parte del examen
  const partAnswers = answers?.[examId]?.[part] || {};

  const handleChange = (questionId, value) => {
    updateAnswer(examId, part, questionId, value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const total = questions.length;
  const correctCount = questions.filter(
    (q) => partAnswers[q.id] === q.answer
  ).length;
  const threshold = Math.ceil(total * 0.6);
  const passed = correctCount >= threshold;

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-semibold mb-4">{title}</h1>
        <p className="text-gray-700 mb-6">{instructions}</p>

        <form onSubmit={handleSubmit}>
          {questions.map((q) => (
            <div key={q.id} className="mb-5">
              <label htmlFor={`q-${q.id}`} className="block text-gray-800 mb-1">
                {q.id}. {q.text}
              </label>
              <select
                id={`q-${q.id}`}
                disabled={submitted}
                value={partAnswers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-200"
              >
                <option value="">— Elige una opción —</option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {!submitted && (
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Enviar
            </button>
          )}
        </form>

        {submitted && (
          <div className="mt-6 p-4 bg-gray-100 rounded">
            <p className="text-lg mb-1">
              Has acertado <span className="font-bold">{correctCount}</span> de{" "}
              <span className="font-bold">{total}</span>.
            </p>
            <p className={passed ? "text-green-600" : "text-red-600"}>
              {passed ? "🎉 ¡Has aprobado!" : "❌ Lo siento, no has aprobado."}
            </p>
          </div>
        )}

        {/* Navegación entre partes */}
        <NavigationButtons part={part} />
      </div>
    </div>
  );
}
