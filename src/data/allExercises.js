// TODOS LOS EJERCICIOS DE ALL TOGETHER - MEZCLA DE TODOS LOS SKILLS

export const A1_ALL = {
  basico: {
    level1: [
      {id:1,type:"multiple_choice",question:"Completa: ___ morning!",text:"___ morning!",options:["Good","Nice","Fine","Great"],correct:"Good",explanation:"'Good morning' es el saludo matutino estándar."},
      {id:2,type:"write",question:"Escribe con mayúscula: madrid",text:"madrid",correct:"Madrid",explanation:"Las ciudades siempre van con mayúscula."},
      {id:3,type:"matching",question:"Empareja: Hello ↔",pairs:[["Hello","Hola"],["Goodbye","Adiós"],["Please","Por favor"],["Thank you","Gracias"]],correct:"matched",explanation:"Saludos básicos en inglés."},
      {id:4,type:"speaking",question:"Presenta: Di tu nombre",situation:"Estás en una reunión. Presenta tu nombre.",prompt:"Say: 'Hello, my name is [tu nombre]'",correct:"Hello, my name is [nombre]",explanation:"Presentación básica con saludo y nombre."},
      {id:5,type:"reading",question:"Lee y elige: ¿Qué dice el texto?",text:"Hello! My name is Ana. I am from Spain.",options:["Ana is from Italy","Ana is from Spain","Ana is from France","Ana is from Germany"],correct:"Ana is from Spain",explanation:"El texto dice claramente 'I am from Spain'."},
      {id:6,type:"multiple_choice",question:"¿Qué número escuchas?",audioUrl:"/audio/numbers/one.mp3",options:["One","Two","Three","Four"],correct:"One",explanation:"Se escucha el número 'One' (Uno)."},
      {id:7,type:"write",question:"Corrige: i am ana",text:"i am ana",correct:"I am Ana",explanation:"'I' siempre va con mayúscula y los nombres propios también."},
      {id:8,type:"speaking",question:"Saluda: Di buenos días",situation:"Es por la mañana y ves a un compañero.",prompt:"Say: 'Good morning'",correct:"Good morning",explanation:"Saludo matutino estándar."},
      {id:9,type:"matching",question:"Empareja números y colores:",pairs:[["one","1"],["two","2"],["red","🔴"],["blue","🔵"]],correct:"matched",explanation:"Números básicos y colores primarios."},
      {id:10,type:"reading",question:"Lee y responde: ¿Cuál es el nombre?",text:"Hi! I'm John. I'm 25 years old.",options:["Ana","John","Peter","Mike"],correct:"John",explanation:"El texto dice 'I'm John'."}
    ],
    level2: [
      {id:1,type:"write",question:"Ordena y escribe: is / name / my / lucas",text:"is / name / my / lucas",correct:"My name is Lucas",explanation:"Orden correcto: sujeto + verbo + complemento."},
      {id:2,type:"speaking",question:"Pregunta: ¿Cómo estás?",situation:"Quieres saber cómo se siente tu amigo.",prompt:"Ask: 'How are you?'",correct:"How are you?",explanation:"Pregunta común sobre el estado de ánimo."},
      {id:3,type:"reading",question:"Lee el párrafo y responde:",text:"Hello! My name is Maria. I'm 28 years old. I'm from Mexico. I have a cat. I like reading books.",question:"¿Qué animal tiene Maria?",options:["A dog","A cat","A bird","A fish"],correct:"A cat",explanation:"El texto dice 'I have a cat'."},
      {id:4,type:"multiple_choice",question:"Completa: 3 + 4 = ___",text:"3 + 4 = ___",options:["seven","five","nine","six"],correct:"seven",explanation:"3 + 4 = 7, que se dice 'seven'."},
      {id:5,type:"write",question:"Completa: I am ___ years old.",text:"I am ___ years old.",correct:"I am [edad] years old",explanation:"Completa con tu edad."},
      {id:6,type:"speaking",question:"Responde: Estoy bien",situation:"Te preguntan cómo estás.",prompt:"Answer: 'I'm fine, thank you'",correct:"I'm fine, thank you",explanation:"Respuesta positiva a 'How are you?'."},
      {id:7,type:"matching",question:"Empareja familia:",pairs:[["mother","mamá"],["father","papá"],["sister","hermana"],["brother","hermano"]],correct:"matched",explanation:"Miembros básicos de la familia."},
      {id:8,type:"reading",question:"Lee y elige la información correcta:",text:"Good morning! I'm David. I'm 35. I work in a hospital. I'm a doctor. I live in New York.",question:"¿Dónde vive David?",options:["London","New York","Paris","Tokyo"],correct:"New York",explanation:"El texto dice 'I live in New York'."},
      {id:9,type:"multiple_choice",question:"¿Qué color escuchas?",audioUrl:"/audio/colors/blue.mp3",options:["Blue","Red","Green","Yellow"],correct:"Blue",explanation:"Se escucha el color 'Blue' (Azul)."},
      {id:10,type:"write",question:"Escribe la frase: I'm a student.",text:"I'm a student.",correct:"I'm a student",explanation:"Frase simple con contracción."}
    ],
    level3: [
      {id:1,type:"write",question:"Completa: I ___ a teacher.",text:"I ___ a teacher.",correct:"I am a teacher",explanation:"Verbo 'to be' en presente: I am."},
      {id:2,type:"speaking",question:"Describe tu familia",situation:"Hablas sobre tu familia con alguien.",prompt:"Say: 'I have a [familia]'",correct:"I have a [familia]",explanation:"Descripción básica de la familia."},
      {id:3,type:"reading",question:"Lee el texto completo y responde:",text:"Hello! My name is Jennifer. I'm 26 years old. I'm from Canada. I'm a graphic designer. I work in a design studio. I have a small apartment in Toronto. I like painting and photography. I have a cat named Whiskers. On weekends, I visit my parents who live outside the city.",question:"¿Cómo se llama el gato de Jennifer?",options:["Whiskers","Fluffy","Shadow","Mittens"],correct:"Whiskers",explanation:"El texto dice 'I have a cat named Whiskers'."},
      {id:4,type:"multiple_choice",question:"Escucha la conversación corta:",audioUrl:"/audio/conversations/greeting.mp3",options:["Hello, how are you? - I'm fine, thank you","Good morning, how are you? - I'm good, thanks","Hi, how are you? - I'm okay, thank you","Hey, how are you? - I'm great, thanks"],correct:"Hello, how are you? - I'm fine, thank you",explanation:"Conversación básica de saludo y respuesta."},
      {id:5,type:"write",question:"Escribe: You are my friend.",text:"You are my friend.",correct:"You are my friend",explanation:"Frase simple con verbo 'to be'."},
      {id:6,type:"speaking",question:"Pregunta sobre gustos",situation:"Quieres saber qué le gusta a alguien.",prompt:"Ask: 'Do you like [cosa]?'",correct:"Do you like [cosa]?",explanation:"Pregunta sobre gustos."},
      {id:7,type:"matching",question:"Empareja días y meses:",pairs:[["Monday","lunes"],["Friday","viernes"],["January","enero"],["July","julio"]],correct:"matched",explanation:"Días de la semana y meses del año."},
      {id:8,type:"reading",question:"Lee y responde:",text:"Hi there! I'm Sarah. I'm a student. I study English. I like music and movies.",question:"¿Qué estudia Sarah?",options:["Spanish","English","French","German"],correct:"English",explanation:"El texto dice 'I study English'."},
      {id:9,type:"multiple_choice",question:"¿Qué hora escuchas?",audioUrl:"/audio/time/three_oclock.mp3",options:["3 o'clock","4 o'clock","2 o'clock","5 o'clock"],correct:"3 o'clock",explanation:"Se escucha '3 o'clock' (Las 3 en punto)."},
      {id:10,type:"write",question:"Ordena y escribe: is / Anna / doctor / a",text:"is / Anna / doctor / a",correct:"Anna is a doctor",explanation:"Orden correcto: sujeto + verbo + artículo + profesión."}
    ]
  }
};

// Función para obtener ejercicios de all
export const getAllExercisesByPath = (level, difficulty, levelNum) => {
  let data;
  if (level === 'a1') {
    data = A1_ALL[difficulty]?.[`level${levelNum}`] || [];
  } else {
    data = [];
  }
  return data;
};
