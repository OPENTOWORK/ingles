"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const ExamContext = createContext();
export const useExam = () => useContext(ExamContext);

export const ExamProvider = ({ children }) => {
  const pathname = usePathname();

  const [answers, setAnswers] = useState({});
  const [globalStart, setGlobalStart] = useState(null);
  const [sectionTimers, setSectionTimers] = useState({
    reading: 0,
    writing: 0,
    listening: 0,
    speaking: 0,
  });

  // ✅ Cargar datos desde localStorage solo en el cliente
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAnswers = localStorage.getItem("examAnswers");
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }

    const savedStart = localStorage.getItem("examGlobalStart");
    if (savedStart) {
      setGlobalStart(new Date(savedStart));
    }

    const savedTimers = localStorage.getItem("examSectionTimers");
    if (savedTimers) {
      setSectionTimers(JSON.parse(savedTimers));
    }
  }, []);

  // 💾 Guardar cambios en localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("examAnswers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    if (typeof window === "undefined" || !globalStart) return;
    localStorage.setItem("examGlobalStart", globalStart.toISOString());
  }, [globalStart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("examSectionTimers", JSON.stringify(sectionTimers));
  }, [sectionTimers]);

  // ⏱ Temporizador para cada sección
  useEffect(() => {
    const interval = setInterval(() => {
      if (!globalStart) return;

      const now = new Date();
      const elapsed = Math.floor((now - globalStart) / 1000);

      if (/\/part-[1-8]$/.test(pathname)) {
        setSectionTimers((prev) => ({ ...prev, reading: elapsed }));
      } else if (/\/part-(9|10)$/.test(pathname)) {
        setSectionTimers((prev) => ({ ...prev, writing: elapsed }));
      } else if (/\/part-1(1|2|3)$/.test(pathname)) {
        setSectionTimers((prev) => ({ ...prev, listening: elapsed }));
      } else if (/\/part-1(4|5|6|7)$/.test(pathname)) {
        setSectionTimers((prev) => ({ ...prev, speaking: elapsed }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pathname, globalStart]);

  // ⛔ Prevención antes de cerrar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const isOnExamPage = /^\/niveles\/c1\/exam-1\/part-\d+$/.test(pathname);
      if (isOnExamPage) {
        e.preventDefault();
        e.returnValue = "⚠️ Estás a punto de salir del examen.";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [pathname]);

  // 📝 Actualizar una respuesta
  const updateAnswer = (examId, part, questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [examId]: {
        ...(prev[examId] || {}),
        [part]: {
          ...(prev[examId]?.[part] || {}),
          [questionId]: value,
        },
      },
    }));
  };

  const clearAllAnswers = () => {
    setAnswers({});
    localStorage.removeItem("examAnswers");
    setGlobalStart(null);
    localStorage.removeItem("examGlobalStart");
    setSectionTimers({
      reading: 0,
      writing: 0,
      listening: 0,
      speaking: 0,
    });
    localStorage.removeItem("examSectionTimers");
  };

  const clearExamAnswers = (examId) => {
    const updated = { ...answers };
    delete updated[examId];
    setAnswers(updated);
    localStorage.setItem("examAnswers", JSON.stringify(updated));
  };

  const calculateScore = (examId, examData) => {
    const examAnswers = answers[examId];
    let total = 0;
    let correct = 0;

    Object.entries(examData).forEach(([part, { questions }]) => {
      questions.forEach((q) => {
        const userAnswer = examAnswers?.[part]?.[q.id];
        if (typeof userAnswer === "object" && userAnswer?.score !== undefined) {
          correct += userAnswer.score;
          total += userAnswer.max || 20;
        } else {
          if (userAnswer === q.answer) correct++;
          total++;
        }
      });
    });

    return {
      total,
      correct,
      percentage: total ? Math.round((correct / total) * 100) : 0,
      passed: correct >= Math.ceil(total * 0.6),
    };
  };

  return (
    <ExamContext.Provider
      value={{
        answers,
        updateAnswer,
        clearExamAnswers,
        clearAllAnswers,
        calculateScore,
        globalStart,
        setGlobalStart,
        sectionTimers,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
};
