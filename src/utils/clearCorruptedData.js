// Utilidad para limpiar datos corruptos del examen
export const clearCorruptedExamData = () => {
  if (typeof window === 'undefined') return;

  try {
    // Limpiar datos corruptos del examen
    const examKeys = ['examAnswers', 'examGlobalStart', 'examSectionTimers'];
    
    examKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          // Intentar parsear para verificar si está corrupto
          if (key === 'examGlobalStart') {
            const date = new Date(data);
            if (isNaN(date.getTime())) {
              console.warn(`Removing corrupted ${key} from localStorage`);
              localStorage.removeItem(key);
            }
          } else {
            JSON.parse(data);
          }
        }
      } catch (error) {
        console.warn(`Removing corrupted ${key} from localStorage:`, error.message);
        localStorage.removeItem(key);
      }
    });

    // Limpiar datos de teoría corruptos
    try {
      const theoryData = localStorage.getItem('theory_progress_data');
      if (theoryData) {
        JSON.parse(theoryData);
      }
    } catch (error) {
      console.warn('Removing corrupted theory data from localStorage:', error.message);
      localStorage.removeItem('theory_progress_data');
    }

    // Limpiar cualquier clave que contenga 'exam' y esté corrupta
    Object.keys(localStorage).forEach(key => {
      if (key.includes('exam') || key.includes('theory')) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            JSON.parse(data);
          }
        } catch (error) {
          console.warn(`Removing corrupted ${key} from localStorage:`, error.message);
          localStorage.removeItem(key);
        }
      }
    });

    console.log('✅ Corrupted exam data cleared');
  } catch (error) {
    console.error('Error clearing corrupted data:', error);
  }
};

// Función para verificar y limpiar datos al inicializar
export const initializeExamData = () => {
  if (typeof window === 'undefined') return;

  // Limpiar datos corruptos
  clearCorruptedExamData();

  // Inicializar datos por defecto si no existen
  const defaultTimers = {
    reading: 0,
    writing: 0,
    listening: 0,
    speaking: 0,
  };

  try {
    const timers = localStorage.getItem('examSectionTimers');
    if (!timers) {
      localStorage.setItem('examSectionTimers', JSON.stringify(defaultTimers));
    }
  } catch (error) {
    console.warn('Error initializing exam timers:', error);
  }

  console.log('✅ Exam data initialized');
};




















