// TODOS LOS EJERCICIOS DE LISTENING - ORGANIZADOS POR DIFICULTAD Y NIVEL

export const A1_LISTENING = {
  basico: {
    level1: [
      {id:1,type:"multiple_choice",question:"Escucha y elige: ¿Qué dice?",audioUrl:"/audio/greetings/hello.mp3",options:["Hello","Goodbye","Please","Thank you"],correct:"Hello",explanation:"La palabra es 'Hello' (Hola)."},
      {id:2,type:"multiple_choice",question:"Escucha el saludo:",audioUrl:"/audio/greetings/good_morning.mp3",options:["Good morning","Good afternoon","Good evening","Good night"],correct:"Good morning",explanation:"Es el saludo matutino 'Good morning'."},
      {id:3,type:"multiple_choice",question:"¿Qué palabra escuchas?",audioUrl:"/audio/greetings/thank_you.mp3",options:["Please","Thank you","Sorry","Excuse me"],correct:"Thank you",explanation:"Se escucha 'Thank you' (Gracias)."},
      {id:4,type:"true_false",question:"Escucha y decide: ¿Es un saludo?",audioUrl:"/audio/greetings/goodbye.mp3",text:"¿Es un saludo?",correct:"false",explanation:"'Goodbye' es una despedida, no un saludo."},
      {id:5,type:"multiple_choice",question:"Escucha la pregunta:",audioUrl:"/audio/questions/how_are_you.mp3",options:["How are you?","Where are you?","What are you?","Who are you?"],correct:"How are you?",explanation:"Se escucha 'How are you?' (¿Cómo estás?)."},
      {id:6,type:"multiple_choice",question:"¿Qué número escuchas?",audioUrl:"/audio/numbers/one.mp3",options:["One","Two","Three","Four"],correct:"One",explanation:"Se escucha el número 'One' (Uno)."},
      {id:7,type:"multiple_choice",question:"Escucha el color:",audioUrl:"/audio/colors/red.mp3",options:["Red","Blue","Green","Yellow"],correct:"Red",explanation:"Se escucha el color 'Red' (Rojo)."},
      {id:8,type:"multiple_choice",question:"¿Qué palabra escuchas?",audioUrl:"/audio/family/mother.mp3",options:["Mother","Father","Sister","Brother"],correct:"Mother",explanation:"Se escucha 'Mother' (Madre)."},
      {id:9,type:"multiple_choice",question:"Escucha la frase completa:",audioUrl:"/audio/phrases/my_name_is.mp3",options:["My name is John","I am John","This is John","John is my name"],correct:"My name is John",explanation:"Se escucha 'My name is John'."},
      {id:10,type:"multiple_choice",question:"¿Qué escuchas al final?",audioUrl:"/audio/greetings/see_you_later.mp3",options:["See you later","See you soon","See you tomorrow","See you next time"],correct:"See you later",explanation:"Se escucha 'See you later' (Hasta luego)."}
    ],
    level2: [
      {id:1,type:"multiple_choice",question:"Escucha los números:",audioUrl:"/audio/numbers/counting.mp3",options:["One, two, three","Two, three, four","Three, four, five","Four, five, six"],correct:"One, two, three",explanation:"Se escucha la secuencia 'One, two, three'."},
      {id:2,type:"multiple_choice",question:"¿Qué color escuchas?",audioUrl:"/audio/colors/blue.mp3",options:["Blue","Red","Green","Yellow"],correct:"Blue",explanation:"Se escucha el color 'Blue' (Azul)."},
      {id:3,type:"multiple_choice",question:"Escucha la pregunta sobre edad:",audioUrl:"/audio/questions/how_old.mp3",options:["How old are you?","How are you?","Where are you?","What are you?"],correct:"How old are you?",explanation:"Se escucha 'How old are you?' (¿Cuántos años tienes?)."},
      {id:4,type:"multiple_choice",question:"Escucha la respuesta:",audioUrl:"/audio/answers/i_am_25.mp3",options:["I am 25 years old","I am 26 years old","I am 24 years old","I am 23 years old"],correct:"I am 25 years old",explanation:"Se escucha 'I am 25 years old'."},
      {id:5,type:"multiple_choice",question:"¿Qué día escuchas?",audioUrl:"/audio/days/monday.mp3",options:["Monday","Tuesday","Wednesday","Thursday"],correct:"Monday",explanation:"Se escucha el día 'Monday' (Lunes)."},
      {id:6,type:"multiple_choice",question:"Escucha la familia:",audioUrl:"/audio/family/father.mp3",options:["Father","Mother","Sister","Brother"],correct:"Father",explanation:"Se escucha 'Father' (Padre)."},
      {id:7,type:"multiple_choice",question:"¿Qué país escuchas?",audioUrl:"/audio/countries/spain.mp3",options:["Spain","France","Italy","Germany"],correct:"Spain",explanation:"Se escucha el país 'Spain' (España)."},
      {id:8,type:"multiple_choice",question:"Escucha la comida:",audioUrl:"/audio/food/pizza.mp3",options:["Pizza","Burger","Sandwich","Salad"],correct:"Pizza",explanation:"Se escucha la comida 'Pizza'."},
      {id:9,type:"multiple_choice",question:"¿Qué animal escuchas?",audioUrl:"/audio/animals/cat.mp3",options:["Cat","Dog","Bird","Fish"],correct:"Cat",explanation:"Se escucha el animal 'Cat' (Gato)."},
      {id:10,type:"multiple_choice",question:"Escucha la frase completa:",audioUrl:"/audio/phrases/i_like.mp3",options:["I like pizza","I love pizza","I want pizza","I eat pizza"],correct:"I like pizza",explanation:"Se escucha 'I like pizza' (Me gusta la pizza)."}
    ],
    level3: [
      {id:1,type:"multiple_choice",question:"Escucha la conversación corta:",audioUrl:"/audio/conversations/greeting.mp3",options:["Hello, how are you? - I'm fine, thank you","Good morning, how are you? - I'm good, thanks","Hi, how are you? - I'm okay, thank you","Hey, how are you? - I'm great, thanks"],correct:"Hello, how are you? - I'm fine, thank you",explanation:"Conversación básica de saludo y respuesta."},
      {id:2,type:"multiple_choice",question:"¿Qué hora escuchas?",audioUrl:"/audio/time/three_oclock.mp3",options:["3 o'clock","4 o'clock","2 o'clock","5 o'clock"],correct:"3 o'clock",explanation:"Se escucha '3 o'clock' (Las 3 en punto)."},
      {id:3,type:"multiple_choice",question:"Escucha la dirección:",audioUrl:"/audio/directions/turn_left.mp3",options:["Turn left","Turn right","Go straight","Go back"],correct:"Turn left",explanation:"Se escucha 'Turn left' (Gira a la izquierda)."},
      {id:4,type:"multiple_choice",question:"¿Qué profesión escuchas?",audioUrl:"/audio/jobs/teacher.mp3",options:["Teacher","Doctor","Student","Worker"],correct:"Teacher",explanation:"Se escucha la profesión 'Teacher' (Profesor)."},
      {id:5,type:"multiple_choice",question:"Escucha el tiempo:",audioUrl:"/audio/weather/sunny.mp3",options:["It's sunny","It's rainy","It's cloudy","It's windy"],correct:"It's sunny",explanation:"Se escucha 'It's sunny' (Está soleado)."},
      {id:6,type:"multiple_choice",question:"¿Qué actividad escuchas?",audioUrl:"/audio/activities/playing_football.mp3",options:["Playing football","Playing tennis","Playing basketball","Playing volleyball"],correct:"Playing football",explanation:"Se escucha 'Playing football' (Jugando fútbol)."},
      {id:7,type:"multiple_choice",question:"Escucha la emoción:",audioUrl:"/audio/emotions/happy.mp3",options:["I'm happy","I'm sad","I'm angry","I'm tired"],correct:"I'm happy",explanation:"Se escucha 'I'm happy' (Estoy feliz)."},
      {id:8,type:"multiple_choice",question:"¿Qué habitación escuchas?",audioUrl:"/audio/rooms/kitchen.mp3",options:["Kitchen","Bedroom","Bathroom","Living room"],correct:"Kitchen",explanation:"Se escucha la habitación 'Kitchen' (Cocina)."},
      {id:9,type:"multiple_choice",question:"Escucha la pregunta sobre gustos:",audioUrl:"/audio/questions/do_you_like.mp3",options:["Do you like music?","Do you like sports?","Do you like movies?","Do you like books?"],correct:"Do you like music?",explanation:"Se escucha 'Do you like music?' (¿Te gusta la música?)."},
      {id:10,type:"multiple_choice",question:"¿Qué respuesta escuchas?",audioUrl:"/audio/answers/yes_i_do.mp3",options:["Yes, I do","No, I don't","Yes, I like it","No, I don't like it"],correct:"Yes, I do",explanation:"Se escucha la respuesta 'Yes, I do' (Sí, me gusta)."}
    ]
  }
};

// Función para obtener ejercicios de listening
export const getListeningExercisesByPath = (level, difficulty, levelNum) => {
  let data;
  if (level === 'a1') {
    data = A1_LISTENING[difficulty]?.[`level${levelNum}`] || [];
  } else {
    data = [];
  }
  return data;
};
