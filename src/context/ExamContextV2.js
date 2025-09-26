"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeExamData } from "@/utils/clearCorruptedData";

const ExamContext = createContext();
export const useExam = () => useContext(ExamContext);

export const ExamProvider = ({ children }) => {
  const pathname = usePathname();

  // Estado para múltiples exámenes
  const [examData, setExamData] = useState({});
  const [lastSaved, setLastSaved] = useState({});
  const [isSaving, setIsSaving] = useState({});

  // Función para obtener el ID del examen actual desde la URL
  const getCurrentExamId = () => {
    const match = pathname.match(/\/exam-(\d+)/);
    return match ? `exam-${match[1]}` : null;
  };

  // Función para obtener claves específicas del examen
  const getExamKeys = (examId) => ({
    answers: `examAnswers_${examId}`,
    globalStart: `examGlobalStart_${examId}`,
    sectionTimers: `examSectionTimers_${examId}`,
    lastSaved: `examLastSaved_${examId}`
  });

  // ✅ Cargar datos desde localStorage solo en el cliente
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inicializar y limpiar datos corruptos
    initializeExamData();

    // Cargar datos de todos los exámenes
    const loadedData = {};
    const loadedLastSaved = {};
    const loadedIsSaving = {};

    // Buscar todos los exámenes guardados
    for (let i = 1; i <= 12; i++) {
      const examId = `exam-${i}`;
      const keys = getExamKeys(examId);

      try {
        // Cargar respuestas
        const savedAnswers = localStorage.getItem(keys.answers);
        if (savedAnswers) {
          const parsed = JSON.parse(savedAnswers);
          if (parsed && typeof parsed === 'object') {
            loadedData[examId] = {
              ...loadedData[examId],
              answers: parsed
            };
          }
        }

        // Cargar tiempo de inicio global
        const savedStart = localStorage.getItem(keys.globalStart);
        if (savedStart) {
          const parsed = JSON.parse(savedStart);
          if (parsed && typeof parsed === 'object') {
            loadedData[examId] = {
              ...loadedData[examId],
              globalStart: parsed
            };
          }
        }

        // Cargar timers de sección
        const savedTimers = localStorage.getItem(keys.sectionTimers);
        if (savedTimers) {
          const parsed = JSON.parse(savedTimers);
          if (parsed && typeof parsed === 'object') {
            loadedData[examId] = {
              ...loadedData[examId],
              sectionTimers: parsed
            };
          }
        }

        // Cargar último guardado
        const savedLastSaved = localStorage.getItem(keys.lastSaved);
        if (savedLastSaved) {
          const date = new Date(savedLastSaved);
          if (!isNaN(date.getTime())) {
            loadedLastSaved[examId] = date;
          }
        }

        // Inicializar estado de guardado
        loadedIsSaving[examId] = false;

      } catch (error) {
        console.warn(`Error loading data for ${examId}:`, error);
        // Limpiar datos corruptos para este examen específico
        Object.values(keys).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    }

    setExamData(loadedData);
    setLastSaved(loadedLastSaved);
    setIsSaving(loadedIsSaving);
  }, []);

  // Función para actualizar respuestas
  const updateAnswer = (examId, partId, questionId, answer) => {
    setExamData(prev => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        answers: {
          ...prev[examId]?.answers,
          [partId]: {
            ...prev[examId]?.answers?.[partId],
            [questionId]: answer
          }
        }
      }
    }));
  };

  // Función para establecer tiempo de inicio global
  const setGlobalStart = (examId, startTime) => {
    setExamData(prev => ({
      ...prev,
      [examId]: {
        ...prev[examId],
        globalStart: startTime
      }
    }));
  };

  // Función para limpiar datos de un examen específico
  const clearExamData = (examId) => {
    setExamData(prev => {
      const newData = { ...prev };
      delete newData[examId];
      return newData;
    });

    setLastSaved(prev => {
      const newLastSaved = { ...prev };
      delete newLastSaved[examId];
      return newLastSaved;
    });

    // Limpiar localStorage para este examen
    if (typeof window !== 'undefined') {
      const keys = getExamKeys(examId);
      Object.values(keys).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  };

  // Función para obtener datos del examen actual
  const getCurrentExamData = () => {
    const examId = getCurrentExamId();
    return examId ? examData[examId] || {} : {};
  };

  // Auto-guardado cuando cambian los datos
  useEffect(() => {
    if (typeof window === 'undefined') return;

    Object.entries(examData).forEach(([examId, data]) => {
      const keys = getExamKeys(examId);
      
      if (data.answers) {
        setIsSaving(prev => ({ ...prev, [examId]: true }));
        try {
          localStorage.setItem(keys.answers, JSON.stringify(data.answers));
        } catch (error) {
          console.error(`Error saving answers for ${examId}:`, error);
        }
        setIsSaving(prev => ({ ...prev, [examId]: false }));
        setLastSaved(prev => ({ ...prev, [examId]: new Date() }));
        
        // Guardar timestamp
        localStorage.setItem(keys.lastSaved, new Date().toISOString());
      }

      if (data.globalStart) {
        try {
          localStorage.setItem(keys.globalStart, JSON.stringify(data.globalStart));
        } catch (error) {
          console.error(`Error saving global start for ${examId}:`, error);
        }
      }

      if (data.sectionTimers) {
        try {
          localStorage.setItem(keys.sectionTimers, JSON.stringify(data.sectionTimers));
        } catch (error) {
          console.error(`Error saving section timers for ${examId}:`, error);
        }
      }
    });
  }, [examData]);

  // Función para obtener respuestas del examen actual
  const getAnswers = () => {
    const examId = getCurrentExamId();
    return examId ? examData[examId]?.answers || {} : {};
  };

  // Función para obtener tiempo de inicio global del examen actual
  const getGlobalStart = () => {
    const examId = getCurrentExamId();
    return examId ? examData[examId]?.globalStart || null : null;
  };

  // Función para obtener timers de sección del examen actual
  const getSectionTimers = () => {
    const examId = getCurrentExamId();
    return examId ? examData[examId]?.sectionTimers || { reading: 0, writing: 0, listening: 0, speaking: 0 } : { reading: 0, writing: 0, listening: 0, speaking: 0 };
  };

  // Función para obtener último guardado del examen actual
  const getLastSaved = () => {
    const examId = getCurrentExamId();
    return examId ? lastSaved[examId] || null : null;
  };

  // Función para obtener estado de guardado del examen actual
  const getIsSaving = () => {
    const examId = getCurrentExamId();
    return examId ? isSaving[examId] || false : false;
  };

  // Función para limpiar datos del examen actual
  const clearAllAnswers = () => {
    const examId = getCurrentExamId();
    if (examId) {
      clearExamData(examId);
    }
  };

  const value = {
    // Funciones principales
    updateAnswer,
    setGlobalStart,
    clearAllAnswers,
    clearExamData,
    
    // Getters específicos del examen actual
    answers: getAnswers(),
    globalStart: getGlobalStart(),
    sectionTimers: getSectionTimers(),
    lastSaved: getLastSaved(),
    isSaving: getIsSaving(),
    
    // Funciones auxiliares
    getCurrentExamId,
    getExamKeys,
    getCurrentExamData,
    
    // Datos completos (para debugging)
    examData,
    lastSavedAll: lastSaved,
    isSavingAll: isSaving
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};


