"use client";
import { useState } from 'react';
import Link from 'next/link';

const exercises = [
  {id:1,type:"matching",question:"Empareja: head ↔ ?",options:["cabeza","mano","ojos","pies"],correct:"cabeza",explanation:"'Head' significa cabeza."},
  {id:2,type:"multiple-choice",question:"Completa: 'You see with your ___'",options:["eyes","ears","mouth","nose"],correct:"eyes",explanation:"Ves con tus ojos."},
  {id:3,type:"odd-one-out",question:"¿Cuál NO pertenece al grupo?",options:["leg","arm","chair","nose"],correct:"chair",explanation:"'Chair' no es parte del cuerpo."},
  {id:4,type:"true-false",question:"Verdadero o falso: 'Finger' = dedo",options:["Verdadero","Falso"],correct:"Verdadero",explanation:"'Finger' significa dedo."},
  {id:5,type:"ordering",question:"Ordena las letras: M A H D N",options:["HAND","DAMN","AHDM","MAHN"],correct:"HAND",explanation:"Forma 'HAND' - sobra una letra."},
  {id:6,type:"multiple-choice",question:"Selecciona: 'You walk with your ___'",options:["legs","ears","hands","eyes"],correct:"legs",explanation:"Caminas con tus piernas."},
  {id:7,type:"multiple-choice",question:"Completa: 'Brush your ___'",options:["teeth","shoes","head","table"],correct:"teeth",explanation:"Cepilla tus dientes."},
  {id:8,type:"error-correction",question:"Encuentra el error: 'nee'",options:["nee → knee","nee → nea","nee → knee","nee → nie"],correct:"nee → knee",explanation:"La forma correcta es 'knee' (rodilla)."},
  {id:9,type:"multiple-choice",question:"Selecciona: 'I have two ___'",options:["hands","eyes","hairs","heads"],correct:"hands",explanation:"Tengo dos manos (o dos ojos también es válido)."},
  {id:10,type:"multiple-choice",question:"Completa: 'He broke his ___'",options:["arm","table","chair","bread"],correct:"arm",explanation:"Se rompió el brazo."}
];
  {
    "id": 1,
    "type": "matching",
    "question": "Empareja: head ↔ ?",
    "options": [
      "cabeza",
      "mano",
      "ojos",
      "pies."
    ],
    "correct": "cabeza",
    "explanation": "'head'."
  },
  {
    "id": 2,
    "type": "multiple-choice",
    "question": "Select:",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "correct": "A",
    "explanation": "Correct."
  },
  {
    "id": 3,
    "type": "odd-one-out",
    "question": "¿Cuál NO pertenece al grupo?",
    "options": [
      "leg",
      "arm",
      "chair",
      "nose"
    ],
    "correct": "nose",
    "explanation": "Correct."
  },
  {
    "id": 4,
    "type": "true-false",
    "question": "Verdadero o falso: “Finger” = dedo",
    "options": [
      "Verdadero",
      "Falso"
    ],
    "correct": "Verdadero",
    "explanation": "Correct."
  },
  {
    "id": 5,
    "type": "ordering",
    "question": "Ordena las letras: M A H D N",
    "options": [
      "WORD",
      "DROW",
      "ROWD",
      "OWRD"
    ],
    "correct": "WORD",
    "explanation": "Correct."
  },
  {
    "id": 6,
    "type": "multiple-choice",
    "question": "Select:",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "correct": "A",
    "explanation": "Correct."
  },
  {
    "id": 7,
    "type": "multiple-choice",
    "question": "Select:",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "correct": "A",
    "explanation": "Correct."
  },
  {
    "id": 8,
    "type": "error-correction",
    "question": "Encuentra el error: 'error'",
    "options": [
      "error → correct",
      "opt2",
      "opt3",
      "opt4"
    ],
    "correct": "error → correct",
    "explanation": "Correct."
  },
  {
    "id": 9,
    "type": "multiple-choice",
    "question": "Select:",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "correct": "A",
    "explanation": "Correct."
  },
  {
    "id": 10,
    "type": "multiple-choice",
    "question": "Select:",
    "options": [
      "A",
      "B",
      "C",
      "D"
    ],
    "correct": "A",
    "explanation": "Correct."
  }
];

export default function A1VocabularyBasicoLevel9Page() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const exercise = exercises[currentExercise];
  
  const checkAnswer = () => {
    const isCorrect = selectedOption === exercise.correct;
    if (isCorrect) setScore(score + 1);
    setShowResult(true);
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedOption('');
      setShowResult(false);
    }
  };

  const resetExercise = () => {
    setCurrentExercise(0);
    setSelectedOption('');
    setShowResult(false);
    setScore(0);
  };

  return (<main style={{padding:"2rem",fontFamily:"Segoe UI,sans-serif",background:"linear-gradient(to right,#f0f8ff,#e6f0ff)",minHeight:"100vh",textAlign:"center"}}><div style={{maxWidth:"600px",margin:"0 auto",backgroundColor:"#fff",borderRadius:"16px",padding:"2rem",boxShadow:"0 8px 32px rgba(0,0,0,0.1)"}}><div style={{marginBottom:"2rem"}}><h1 style={{color:"#2563eb",marginBottom:"0.5rem"}}>🧠 Vocabulary Level 9</h1><p style={{color:"#64748b"}}>Exercise {currentExercise + 1} of {exercises.length}</p><div style={{width:"100%",height:"8px",backgroundColor:"#e2e8f0",borderRadius:"4px",marginTop:"1rem"}}><div style={{width:`${((currentExercise+1)/exercises.length)*100}%`,height:"100%",backgroundColor:"#3b82f6",borderRadius:"4px",transition:"width 0.3s"}}></div></div></div><div style={{backgroundColor:"#f8fafc",borderRadius:"12px",padding:"2rem",marginBottom:"2rem"}}><h2 style={{marginBottom:"1rem",color:"#1e293b"}}>Exercise {exercise.id}</h2><p style={{marginBottom:"1rem",fontWeight:"bold",color:"#1e293b"}}>{exercise.question}</p><div style={{display:"grid",gap:"0.5rem"}}>{exercise.options.map((option, index) => (<button key={index} onClick={() => setSelectedOption(option)} style={{padding:"1rem",backgroundColor:selectedOption === option?"#dbeafe":"#fff",border:selectedOption === option?"2px solid #3b82f6":"2px solid #e2e8f0",borderRadius:"8px",cursor:"pointer",transition:"all 0.2s",fontSize:"16px"}}>{option}</button>))}</div>{!showResult && (<button onClick={checkAnswer} disabled={!selectedOption} style={{backgroundColor:"#10b981",color:"white",border:"none",borderRadius:"8px",padding:"1rem 2rem",fontSize:"16px",fontWeight:"bold",cursor:"pointer",marginTop:"1rem",opacity:!selectedOption?0.5:1}}>Check Answer</button>)}{showResult && (<div style={{marginTop:"1rem",padding:"1rem",backgroundColor:"#f0f9ff",borderRadius:"8px",border:"1px solid #0ea5e9"}}><p style={{fontWeight:"bold",marginBottom:"0.5rem"}}>{selectedOption === exercise.correct ? "✅ Correct!" : "❌ Incorrect"}</p><p style={{fontSize:"14px",color:"#64748b"}}>{exercise.explanation}</p>{currentExercise < exercises.length - 1 ? (<button onClick={nextExercise} style={{backgroundColor:"#3b82f6",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",marginTop:"1rem"}}>Next Exercise</button>) : (<div style={{marginTop:"1rem"}}><p style={{fontWeight:"bold",marginBottom:"1rem"}}>🎉 Score: {score}/{exercises.length}</p><button onClick={resetExercise} style={{backgroundColor:"#8b5cf6",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",marginRight:"1rem"}}>Try Again</button><Link href="/training/a1/vocabulary/basico/level-10" style={{backgroundColor:"#10b981",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",textDecoration:"none",display:"inline-block"}}>Next</Link></div>)}</div>)}</div><div style={{marginTop:"2rem"}}><Link href="/training/a1/vocabulary/basico" style={{backgroundColor:"#6b7280",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",textDecoration:"none",display:"inline-block"}}>← Back</Link></div></div></main>);
}