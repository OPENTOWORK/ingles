"use client";

import { createContext, useContext, useState, useEffect, useRef, Suspense } from "react";
import { usePathname } from "next/navigation";
import { initializeExamData } from "@/utils/clearCorruptedData";

const ExamContext = createContext();
export const useExam = () => useContext(ExamContext);

const noop = () => {};
const DEFAULT_EXAM_CONTEXT = {
  answers: {},
  updateAnswer: noop,
  clearExamAnswers: noop,
  clearAllAnswers: noop,
  calculateScore: () => ({ total: 0, correct: 0, percentage: 0, passed: false }),
  globalStart: null,
  setGlobalStart: noop,
  sectionTimers: { reading: 0, writing: 0, listening: 0, speaking: 0 },
  lastSaved: null,
  isSaving: false,
};

/** Rutas que usan localStorage legacy del ExamContext (evita trabajo en B2 moderno, home, etc.). */
const LEGACY_EXAM_STORAGE_ROUTE =
  /\/niveles\/(a2|b1|b2|c1|c2)\/exam-1(\/|$)|\/niveles\/c1\/exam-1\/part-/;

export const ExamProvider = ({ children }) => (
  <Suspense
    fallback={<ExamContext.Provider value={DEFAULT_EXAM_CONTEXT}>{children}</ExamContext.Provider>}
  >
    <ExamProviderInner>{children}</ExamProviderInner>
  </Suspense>
);

function ExamProviderInner({ children }) {
  const pathname = usePathname();
  const usesLegacyExamStorage = LEGACY_EXAM_STORAGE_ROUTE.test(pathname || '');
  const lastSavedRef = useRef(null);

  const [answers, setAnswers] = useState({});
  const [globalStart, setGlobalStart] = useState(null);
  const [sectionTimers, setSectionTimers] = useState({
    reading: 0,
    writing: 0,
    listening: 0,
    speaking: 0,
  });
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Cargar datos desde localStorage solo en rutas de examen legacy
  useEffect(() => {
    if (typeof window === "undefined" || !usesLegacyExamStorage) return;

    initializeExamData();

    try {
      const savedAnswers = localStorage.getItem("examAnswers");
      if (savedAnswers) {
        const parsed = JSON.parse(savedAnswers);
        if (parsed && typeof parsed === 'object') {
          setAnswers(parsed);
        }
      }
    } catch (error) {
      console.warn('Error parsing exam answers from localStorage:', error);
      localStorage.removeItem("examAnswers");
    }

    try {
      const savedStart = localStorage.getItem("examGlobalStart");
      if (savedStart) {
        const date = new Date(savedStart);
        if (!isNaN(date.getTime())) {
          setGlobalStart(date);
        }
      }
    } catch (error) {
      console.warn('Error parsing exam start time from localStorage:', error);
      localStorage.removeItem("examGlobalStart");
    }

    try {
      const savedTimers = localStorage.getItem("examSectionTimers");
      if (savedTimers) {
        const parsed = JSON.parse(savedTimers);
        if (parsed && typeof parsed === 'object') {
          setSectionTimers(parsed);
        }
      }
    } catch (error) {
      console.warn('Error parsing exam timers from localStorage:', error);
      localStorage.removeItem("examSectionTimers");
    }
  }, [usesLegacyExamStorage]);

  // 💾 Guardar cambios en localStorage con debounce para evitar bucles
  useEffect(() => {
    if (typeof window === "undefined" || !usesLegacyExamStorage) return;
    
    // Evitar guardar si answers está vacío
    if (!answers || typeof answers !== 'object' || Object.keys(answers).length === 0) {
      return;
    }
    
    // Debounce para evitar guardados excesivos
    const timeoutId = setTimeout(() => {
      setIsSaving(true);
      try {
        localStorage.setItem("examAnswers", JSON.stringify(answers));
        const now = new Date();
        lastSavedRef.current = now;
        // Actualizar lastSaved solo si ha pasado suficiente tiempo
        setLastSaved(now);
      } catch (error) {
        console.error("Error saving exam answers:", error);
        try {
          localStorage.removeItem("examAnswers");
        } catch (cleanupError) {
          console.error("Error cleaning up localStorage:", cleanupError);
        }
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [answers, usesLegacyExamStorage]);

  useEffect(() => {
    if (typeof window === "undefined" || !usesLegacyExamStorage) return;
    
    if (!globalStart) {
      // Si no hay globalStart, limpiar el localStorage
      localStorage.removeItem("examGlobalStart");
      return;
    }
    
    try {
      let dateToSave;
      
      if (globalStart instanceof Date) {
        dateToSave = globalStart;
      } else if (typeof globalStart === 'string') {
        dateToSave = new Date(globalStart);
      } else if (typeof globalStart === 'number') {
        dateToSave = new Date(globalStart);
      } else {
        console.warn("Invalid globalStart type:", typeof globalStart, globalStart);
        return;
      }
      
      if (!isNaN(dateToSave.getTime())) {
        localStorage.setItem("examGlobalStart", dateToSave.toISOString());
      } else {
        console.warn("Invalid date for globalStart:", globalStart);
        localStorage.removeItem("examGlobalStart");
      }
    } catch (error) {
      console.error("Error saving global start time:", error);
      localStorage.removeItem("examGlobalStart");
    }
  }, [globalStart, usesLegacyExamStorage]);

  useEffect(() => {
    if (typeof window === "undefined" || !usesLegacyExamStorage) return;
    localStorage.setItem("examSectionTimers", JSON.stringify(sectionTimers));
  }, [sectionTimers, usesLegacyExamStorage]);

  // ⏱ Temporizador para cada sección
  useEffect(() => {
    if (!usesLegacyExamStorage || !globalStart) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now - globalStart) / 1000);

      setSectionTimers((prev) => {
        const newTimers = { ...prev };
        
        if (/\/part-[1-8]$/.test(pathname)) {
          newTimers.reading = elapsed;
        } else if (/\/part-(9|10)$/.test(pathname)) {
          newTimers.writing = elapsed;
        } else if (/\/part-1(1|2|3)$/.test(pathname)) {
          newTimers.listening = elapsed;
        } else if (/\/part-1(4|5|6|7)$/.test(pathname)) {
          newTimers.speaking = elapsed;
        }
        
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pathname, globalStart, usesLegacyExamStorage]);

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
        lastSaved,
        isSaving,
      }}
    >
      {children}
    </ExamContext.Provider>
  );
}
