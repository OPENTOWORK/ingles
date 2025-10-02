"use client";
import { useState } from 'react';
import Link from 'next/link';

const exercises = [
  {id:1,type:"matching",question:"Empareja: mother ↔ ?",options:["mamá","papá","hermana","hermano"],correct:"mamá",explanation:"'Mother' significa mamá."},
  {id:2,type:"multiple-choice",question:"Completa: 'This is my ___'",options:["mother","table","school","car"],correct:"mother",explanation:"'This is my mother'."},
  {id:3,type:"odd-one-out",question:"¿Cuál NO pertenece al grupo?",options:["uncle","cousin","chair","aunt"],correct:"chair",explanation:"'Chair' no es familia."},
  {id:4,type:"true-false",question:"Verdadero o falso: 'Nephew' = sobrino",options:["Verdadero","Falso"],correct:"Verdadero",explanation:"'Nephew' significa sobrino."},
  {id:5,type:"ordering",question:"Ordena las letras: T H R O B R E",options:["BROTHER","BROTHRE","BROTEHR","BROTHEER"],correct:"BROTHER",explanation:"Forma 'BROTHER'."},
  {id:6,type:"multiple-choice",question:"Selecciona: 'My ___ is my father's wife.'",options:["mother","aunt","sister","cousin"],correct:"mother",explanation:"Tu madre es la esposa de tu padre."},
  {id:7,type:"multiple-choice",question:"Completa: 'He is my mother's father. He is my ___'",options:["grandfather","uncle","brother","father"],correct:"grandfather",explanation:"El padre de tu madre es tu abuelo."},
  {id:8,type:"error-correction",question:"Encuentra el error: 'cosin'",options:["cosin → cousin","cosin → cosen","cosin → cousin","cosin → couson"],correct:"cosin → cousin",explanation:"La forma correcta es 'cousin'."},
  {id:9,type:"multiple-choice",question:"Selecciona: 'I have two ___'",options:["brothers","brother","brotheres","brotherz"],correct:"brothers",explanation:"Plural de 'brother'."},
  {id:10,type:"multiple-choice",question:"Completa: 'My ___ is married to my aunt.'",options:["uncle","cousin","nephew","brother"],correct:"uncle",explanation:"Tu tío está casado con tu tía."}
];
  {
    "id": 1,
    "type": "matching",
    "question": "Empareja: mother ↔ ?",
    "options": [
      "mamá",
      "papá",
      "hermana",
      "hermano."
    ],
    "correct": "mamá",
    "explanation": "'mother'."
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
      "uncle",
      "cousin",
      "chair",
      "aunt"
    ],
    "correct": "aunt",
    "explanation": "Correct."
  },
  {
    "id": 4,
    "type": "true-false",
    "question": "Verdadero o falso: “Nephew” = sobrino",
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
    "question": "Ordena las letras: T H R O B R E",
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

export default function A1VocabularyBasicoLevel3Page() {
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

  return (<main style={{padding:"2rem",fontFamily:"Segoe UI,sans-serif",background:"linear-gradient(to right,#f0f8ff,#e6f0ff)",minHeight:"100vh",textAlign:"center"}}><div style={{maxWidth:"600px",margin:"0 auto",backgroundColor:"#fff",borderRadius:"16px",padding:"2rem",boxShadow:"0 8px 32px rgba(0,0,0,0.1)"}}><div style={{marginBottom:"2rem"}}><h1 style={{color:"#2563eb",marginBottom:"0.5rem"}}>🧠 Vocabulary Level 3</h1><p style={{color:"#64748b"}}>Exercise {currentExercise + 1} of {exercises.length}</p><div style={{width:"100%",height:"8px",backgroundColor:"#e2e8f0",borderRadius:"4px",marginTop:"1rem"}}><div style={{width:`${((currentExercise+1)/exercises.length)*100}%`,height:"100%",backgroundColor:"#3b82f6",borderRadius:"4px",transition:"width 0.3s"}}></div></div></div><div style={{backgroundColor:"#f8fafc",borderRadius:"12px",padding:"2rem",marginBottom:"2rem"}}><h2 style={{marginBottom:"1rem",color:"#1e293b"}}>Exercise {exercise.id}</h2><p style={{marginBottom:"1rem",fontWeight:"bold",color:"#1e293b"}}>{exercise.question}</p><div style={{display:"grid",gap:"0.5rem"}}>{exercise.options.map((option, index) => (<button key={index} onClick={() => setSelectedOption(option)} style={{padding:"1rem",backgroundColor:selectedOption === option?"#dbeafe":"#fff",border:selectedOption === option?"2px solid #3b82f6":"2px solid #e2e8f0",borderRadius:"8px",cursor:"pointer",transition:"all 0.2s",fontSize:"16px"}}>{option}</button>))}</div>{!showResult && (<button onClick={checkAnswer} disabled={!selectedOption} style={{backgroundColor:"#10b981",color:"white",border:"none",borderRadius:"8px",padding:"1rem 2rem",fontSize:"16px",fontWeight:"bold",cursor:"pointer",marginTop:"1rem",opacity:!selectedOption?0.5:1}}>Check Answer</button>)}{showResult && (<div style={{marginTop:"1rem",padding:"1rem",backgroundColor:"#f0f9ff",borderRadius:"8px",border:"1px solid #0ea5e9"}}><p style={{fontWeight:"bold",marginBottom:"0.5rem"}}>{selectedOption === exercise.correct ? "✅ Correct!" : "❌ Incorrect"}</p><p style={{fontSize:"14px",color:"#64748b"}}>{exercise.explanation}</p>{currentExercise < exercises.length - 1 ? (<button onClick={nextExercise} style={{backgroundColor:"#3b82f6",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",marginTop:"1rem"}}>Next Exercise</button>) : (<div style={{marginTop:"1rem"}}><p style={{fontWeight:"bold",marginBottom:"1rem"}}>🎉 Score: {score}/{exercises.length}</p><button onClick={resetExercise} style={{backgroundColor:"#8b5cf6",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",marginRight:"1rem"}}>Try Again</button><Link href="/training/a1/vocabulary/basico/level-4" style={{backgroundColor:"#10b981",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",textDecoration:"none",display:"inline-block"}}>Next</Link></div>)}</div>)}</div><div style={{marginTop:"2rem"}}><Link href="/training/a1/vocabulary/basico" style={{backgroundColor:"#6b7280",color:"white",border:"none",borderRadius:"8px",padding:"0.75rem 1.5rem",fontSize:"14px",fontWeight:"bold",cursor:"pointer",textDecoration:"none",display:"inline-block"}}>← Back</Link></div></div></main>);
}