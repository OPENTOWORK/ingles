"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useExam } from "@/context/ExamContext";

export default function ExitWarning() {
  const pathname = usePathname();
  const router = useRouter();
  const { globalStart, clearAllAnswers } = useExam();

  useEffect(() => {
    const isExamPart = /^\/niveles\/c1\/exam-1\/part-\d+$/.test(pathname);

    const handleBeforeUnload = (e) => {
      if (isExamPart && globalStart) {
        e.preventDefault();
        e.returnValue = "Estás a punto de salir del examen. Perderás todo el progreso.";
      }
    };

    const handleRouteChange = (url) => {
      const leavingExam = !/^\/niveles\/c1\/exam-1\/part-\d+$/.test(url);
      if (isExamPart && leavingExam && globalStart) {
        const confirmLeave = window.confirm("⚠️ Vas a salir del examen. ¿Deseas abandonar? Perderás el progreso.");
        if (!confirmLeave) {
          router.push(pathname); // evita salir
          throw "Navigation cancelled"; // detiene
        } else {
          clearAllAnswers();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events?.on?.("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events?.off?.("routeChangeStart", handleRouteChange);
    };
  }, [pathname, globalStart]);

  return null;
}
