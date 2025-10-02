// Script para generar todos los ejercicios de Writing A2 faltantes

const generateWritingExercises = () => {
  const exercises = {
    basico: {
      // Niveles 6-12 para básico
      level6: [
        {id:1,type:"write",question:"Escribe: 'I should study more for the exam.'",text:"I should study more for the exam.",correct:"I should study more for the exam",explanation:"Usa 'should' para consejos: should + verbo base."},
        {id:2,type:"write",question:"Completa: You ___ (should) eat more vegetables.",text:"You ___ (should) eat more vegetables.",correct:"You should eat more vegetables",explanation:"Consejo: should + eat para recomendaciones."},
        {id:3,type:"write",question:"Escribe la pregunta: 'Should I call the doctor?'",text:"Should I call the doctor?",correct:"Should I call the doctor?",explanation:"Pregunta con 'should': Should + sujeto + verbo base?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'Yes, you should.'",text:"Yes, you should.",correct:"Yes, you should",explanation:"Respuesta afirmativa corta: Yes + sujeto + should."},
        {id:5,type:"write",question:"Escribe: 'You shouldn't smoke.'",text:"You shouldn't smoke.",correct:"You shouldn't smoke",explanation:"Negativa: shouldn't + verbo base para prohibiciones."},
        {id:6,type:"write",question:"Completa: ___ (What) should I do?",text:"___ (What) should I do?",correct:"What should I do?",explanation:"Pregunta con 'What': What + should + sujeto + verbo?"},
        {id:7,type:"write",question:"Corrige: he should to go home",text:"he should to go home",correct:"He should go home",explanation:"Después de 'should' no uses 'to', solo verbo base."},
        {id:8,type:"write",question:"Escribe: 'I should visit my parents more often.'",text:"I should visit my parents more often.",correct:"I should visit my parents more often",explanation:"Consejo: should + visit para sugerencias."},
        {id:9,type:"write",question:"Completa: We ___ (shouldn't) waste water.",text:"We ___ (shouldn't) waste water.",correct:"We shouldn't waste water",explanation:"Negativa: shouldn't + waste para consejos negativos."},
        {id:10,type:"write",question:"Escribe: 'Should we leave now?'",text:"Should we leave now?",correct:"Should we leave now?",explanation:"Pregunta: Should + we + leave para consultas."}
      ],
      level7: [
        {id:1,type:"write",question:"Escribe: 'I must finish this report today.'",text:"I must finish this report today.",correct:"I must finish this report today",explanation:"Usa 'must' para obligación: must + verbo base."},
        {id:2,type:"write",question:"Completa: You ___ (must) wear a seatbelt.",text:"You ___ (must) wear a seatbelt.",correct:"You must wear a seatbelt",explanation:"Obligación: must + wear para reglas."},
        {id:3,type:"write",question:"Escribe la pregunta: 'Must I pay now?'",text:"Must I pay now?",correct:"Must I pay now?",explanation:"Pregunta con 'must': Must + sujeto + verbo base?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'Yes, you must.'",text:"Yes, you must.",correct:"Yes, you must",explanation:"Respuesta afirmativa corta: Yes + sujeto + must."},
        {id:5,type:"write",question:"Escribe: 'You mustn't smoke here.'",text:"You mustn't smoke here.",correct:"You mustn't smoke here",explanation:"Prohibición: mustn't + verbo base."},
        {id:6,type:"write",question:"Completa: ___ (What) must I bring to the meeting?",text:"___ (What) must I bring to the meeting?",correct:"What must I bring to the meeting?",explanation:"Pregunta con 'What': What + must + sujeto + verbo?"},
        {id:7,type:"write",question:"Corrige: she must to arrive early",text:"she must to arrive early",correct:"She must arrive early",explanation:"Después de 'must' no uses 'to', solo verbo base."},
        {id:8,type:"write",question:"Escribe: 'I must call my mother tonight.'",text:"I must call my mother tonight.",correct:"I must call my mother tonight",explanation:"Obligación: must + call para compromisos."},
        {id:9,type:"write",question:"Completa: They ___ (mustn't) be late for school.",text:"They ___ (mustn't) be late for school.",correct:"They mustn't be late for school",explanation:"Prohibición: mustn't + be para reglas."},
        {id:10,type:"write",question:"Escribe: 'Must we wait here?'",text:"Must we wait here?",correct:"Must we wait here?",explanation:"Pregunta: Must + we + wait para consultas."}
      ],
      level8: [
        {id:1,type:"write",question:"Escribe: 'I have to wake up early tomorrow.'",text:"I have to wake up early tomorrow.",correct:"I have to wake up early tomorrow",explanation:"Usa 'have to' para obligación: have to + verbo base."},
        {id:2,type:"write",question:"Completa: She ___ (has to) work on weekends.",text:"She ___ (has to) work on weekends.",correct:"She has to work on weekends",explanation:"Obligación: has to + work (tercera persona)."},
        {id:3,type:"write",question:"Escribe la pregunta: 'Do you have to go now?'",text:"Do you have to go now?",correct:"Do you have to go now?",explanation:"Pregunta con 'have to': Do + sujeto + have to + verbo?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'Yes, I do.'",text:"Yes, I do.",correct:"Yes, I do",explanation:"Respuesta afirmativa corta: Yes + sujeto + do."},
        {id:5,type:"write",question:"Escribe: 'I don't have to work tomorrow.'",text:"I don't have to work tomorrow.",correct:"I don't have to work tomorrow",explanation:"No obligación: don't have to + verbo base."},
        {id:6,type:"write",question:"Completa: ___ (What) do you have to do today?",text:"___ (What) do you have to do today?",correct:"What do you have to do today?",explanation:"Pregunta con 'What': What + do + sujeto + have to + verbo?"},
        {id:7,type:"write",question:"Corrige: he have to study",text:"he have to study",correct:"He has to study",explanation:"Tercera persona usa 'has to', no 'have to'."},
        {id:8,type:"write",question:"Escribe: 'We have to be at the airport by 6 AM.'",text:"We have to be at the airport by 6 AM.",correct:"We have to be at the airport by 6 AM",explanation:"Obligación: have to + be para compromisos."},
        {id:9,type:"write",question:"Completa: They ___ (don't have to) wear uniforms.",text:"They ___ (don't have to) wear uniforms.",correct:"They don't have to wear uniforms",explanation:"No obligación: don't have to + wear."},
        {id:10,type:"write",question:"Escribe: 'Does she have to finish this today?'",text:"Does she have to finish this today?",correct:"Does she have to finish this today?",explanation:"Pregunta: Does + sujeto + have to + verbo?"}
      ],
      level9: [
        {id:1,type:"write",question:"Escribe: 'I would like to travel to Japan.'",text:"I would like to travel to Japan.",correct:"I would like to travel to Japan",explanation:"Usa 'would like to' para deseos: would like to + verbo."},
        {id:2,type:"write",question:"Completa: She ___ (would like to) learn Spanish.",text:"She ___ (would like to) learn Spanish.",correct:"She would like to learn Spanish",explanation:"Deseo: would like to + learn para aspiraciones."},
        {id:3,type:"write",question:"Escribe la pregunta: 'Would you like some coffee?'",text:"Would you like some coffee?",correct:"Would you like some coffee?",explanation:"Pregunta cortés: Would + sujeto + like + objeto?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'Yes, I would.'",text:"Yes, I would.",correct:"Yes, I would",explanation:"Respuesta afirmativa corta: Yes + sujeto + would."},
        {id:5,type:"write",question:"Escribe: 'I wouldn't like to live in a big city.'",text:"I wouldn't like to live in a big city.",correct:"I wouldn't like to live in a big city",explanation:"Negativa: wouldn't like to + verbo base."},
        {id:6,type:"write",question:"Completa: ___ (What) would you like to do this weekend?",text:"___ (What) would you like to do this weekend?",correct:"What would you like to do this weekend?",explanation:"Pregunta con 'What': What + would + sujeto + like to + verbo?"},
        {id:7,type:"write",question:"Corrige: he would like go home",text:"he would like go home",correct:"He would like to go home",explanation:"Usa 'to' después de 'would like': would like to + go."},
        {id:8,type:"write",question:"Escribe: 'I would like to visit my grandparents.'",text:"I would like to visit my grandparents.",correct:"I would like to visit my grandparents",explanation:"Deseo: would like to + visit para planes."},
        {id:9,type:"write",question:"Completa: They ___ (wouldn't like to) work on Sundays.",text:"They ___ (wouldn't like to) work on Sundays.",correct:"They wouldn't like to work on Sundays",explanation:"Negativa: wouldn't like to + work."},
        {id:10,type:"write",question:"Escribe: 'Would you like to come with us?'",text:"Would you like to come with us?",correct:"Would you like to come with us?",explanation:"Invitación cortés: Would + sujeto + like to + come?"}
      ],
      level10: [
        {id:1,type:"write",question:"Escribe: 'I used to play football when I was young.'",text:"I used to play football when I was young.",correct:"I used to play football when I was young",explanation:"Usa 'used to' para hábitos pasados: used to + verbo base."},
        {id:2,type:"write",question:"Completa: She ___ (used to) live in London.",text:"She ___ (used to) live in London.",correct:"She used to live in London",explanation:"Hábito pasado: used to + live para situaciones anteriores."},
        {id:3,type:"write",question:"Escribe la pregunta: 'Did you use to smoke?'",text:"Did you use to smoke?",correct:"Did you use to smoke?",explanation:"Pregunta con 'used to': Did + sujeto + use to + verbo?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'Yes, I did.'",text:"Yes, I did.",correct:"Yes, I did",explanation:"Respuesta afirmativa corta: Yes + sujeto + did."},
        {id:5,type:"write",question:"Escribe: 'I didn't use to like vegetables.'",text:"I didn't use to like vegetables.",correct:"I didn't use to like vegetables",explanation:"Negativa: didn't use to + verbo base."},
        {id:6,type:"write",question:"Completa: ___ (Where) did you use to work?",text:"___ (Where) did you use to work?",correct:"Where did you use to work?",explanation:"Pregunta con 'Where': Where + did + sujeto + use to + verbo?"},
        {id:7,type:"write",question:"Corrige: he used to went to school",text:"he used to went to school",correct:"He used to go to school",explanation:"Después de 'used to' usa verbo base, no pasado."},
        {id:8,type:"write",question:"Escribe: 'We used to visit our grandparents every Sunday.'",text:"We used to visit our grandparents every Sunday.",correct:"We used to visit our grandparents every Sunday",explanation:"Hábito pasado: used to + visit para rutinas anteriores."},
        {id:9,type:"write",question:"Completa: They ___ (didn't use to) watch TV much.",text:"They ___ (didn't use to) watch TV much.",correct:"They didn't use to watch TV much",explanation:"Negativa: didn't use to + watch."},
        {id:10,type:"write",question:"Escribe: 'Did she use to play the piano?'",text:"Did she use to play the piano?",correct:"Did she use to play the piano?",explanation:"Pregunta: Did + sujeto + use to + play?"}
      ],
      level11: [
        {id:1,type:"write",question:"Escribe: 'I was born in 1990.'",text:"I was born in 1990.",correct:"I was born in 1990",explanation:"Usa 'was born' para fecha de nacimiento."},
        {id:2,type:"write",question:"Completa: She ___ (was born) in Paris.",text:"She ___ (was born) in Paris.",correct:"She was born in Paris",explanation:"Lugar de nacimiento: was born + in + lugar."},
        {id:3,type:"write",question:"Escribe la pregunta: 'When were you born?'",text:"When were you born?",correct:"When were you born?",explanation:"Pregunta fecha nacimiento: When + were + sujeto + born?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'I was born in 1985.'",text:"I was born in 1985.",correct:"I was born in 1985",explanation:"Respuesta: I was born + in + año."},
        {id:5,type:"write",question:"Escribe: 'Where were you born?'",text:"Where were you born?",correct:"Where were you born?",explanation:"Pregunta lugar nacimiento: Where + were + sujeto + born?"},
        {id:6,type:"write",question:"Completa: ___ (What) is your date of birth?",text:"___ (What) is your date of birth?",correct:"What is your date of birth?",explanation:"Pregunta formal: What + is + your + date of birth?"},
        {id:7,type:"write",question:"Corrige: he was born on 1995",text:"he was born on 1995",correct:"He was born in 1995",explanation:"Usa 'in' para años, 'on' para fechas específicas."},
        {id:8,type:"write",question:"Escribe: 'My birthday is on March 15th.'",text:"My birthday is on March 15th.",correct:"My birthday is on March 15th",explanation:"Fecha específica: on + mes + día + th/st/nd/rd."},
        {id:9,type:"write",question:"Completa: They ___ (were born) in the same year.",text:"They ___ (were born) in the same year.",correct:"They were born in the same year",explanation:"Plural: were born + in + the same year."},
        {id:10,type:"write",question:"Escribe: 'I'm turning 25 next month.'",text:"I'm turning 25 next month.",correct:"I'm turning 25 next month",explanation:"Cumpleaños futuro: I'm turning + edad + tiempo."}
      ],
      level12: [
        {id:1,type:"write",question:"Escribe: 'I have been living here for two years.'",text:"I have been living here for two years.",correct:"I have been living here for two years",explanation:"Presente perfecto continuo: have been + ing + for + tiempo."},
        {id:2,type:"write",question:"Completa: She ___ (has been working) here since 2020.",text:"She ___ (has been working) here since 2020.",correct:"She has been working here since 2020",explanation:"Perfecto continuo: has been + working + since + fecha."},
        {id:3,type:"write",question:"Escribe la pregunta: 'How long have you been studying English?'",text:"How long have you been studying English?",correct:"How long have you been studying English?",explanation:"Pregunta duración: How long + have + sujeto + been + ing?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'I have been studying for three years.'",text:"I have been studying for three years.",correct:"I have been studying for three years",explanation:"Respuesta: I have been + ing + for + tiempo."},
        {id:5,type:"write",question:"Escribe: 'I have been waiting for an hour.'",text:"I have been waiting for an hour.",correct:"I have been waiting for an hour",explanation:"Acción continua: have been + waiting + for + duración."},
        {id:6,type:"write",question:"Completa: ___ (What) have you been doing lately?",text:"___ (What) have you been doing lately?",correct:"What have you been doing lately?",explanation:"Pregunta reciente: What + have + sujeto + been + doing?"},
        {id:7,type:"write",question:"Corrige: he has been work here",text:"he has been work here",correct:"He has been working here",explanation:"Perfecto continuo: has been + working (con -ing)."},
        {id:8,type:"write",question:"Escribe: 'We have been talking about this for hours.'",text:"We have been talking about this for hours.",correct:"We have been talking about this for hours",explanation:"Acción continua: have been + talking + for + tiempo."},
        {id:9,type:"write",question:"Completa: They ___ (have been living) in this city for five years.",text:"They ___ (have been living) in this city for five years.",correct:"They have been living in this city for five years",explanation:"Perfecto continuo: have been + living + for + duración."},
        {id:10,type:"write",question:"Escribe: 'I have been feeling tired lately.'",text:"I have been feeling tired lately.",correct:"I have been feeling tired lately",explanation:"Estado continuo: have been + feeling + lately."}
      ]
    },
    intermedio: {
      // Niveles 2-12 para intermedio
      level2: [
        {id:1,type:"write",question:"Escribe: 'I'm going to be studying all night.'",text:"I'm going to be studying all night.",correct:"I'm going to be studying all night",explanation:"Futuro continuo con 'going to': going to be + ing."},
        {id:2,type:"write",question:"Completa: They ___ (are going to be) traveling next week.",text:"They ___ (are going to be) traveling next week.",correct:"They are going to be traveling next week",explanation:"Futuro continuo: are going to be + traveling."},
        {id:3,type:"write",question:"Escribe la pregunta: 'Are you going to be working tomorrow?'",text:"Are you going to be working tomorrow?",correct:"Are you going to be working tomorrow?",explanation:"Pregunta futuro continuo: Are + sujeto + going to be + ing?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'Yes, I am.'",text:"Yes, I am.",correct:"Yes, I am",explanation:"Respuesta afirmativa corta: Yes + sujeto + am."},
        {id:5,type:"write",question:"Escribe: 'I'm not going to be home this evening.'",text:"I'm not going to be home this evening.",correct:"I'm not going to be home this evening",explanation:"Negativa futuro continuo: not going to be + lugar."},
        {id:6,type:"write",question:"Completa: ___ (What) are you going to be doing this weekend?",text:"___ (What) are you going to be doing this weekend?",correct:"What are you going to be doing this weekend?",explanation:"Pregunta con 'What': What + are + sujeto + going to be + doing?"},
        {id:7,type:"write",question:"Corrige: she is going to be work",text:"she is going to be work",correct:"She is going to be working",explanation:"Futuro continuo: going to be + working (con -ing)."},
        {id:8,type:"write",question:"Escribe: 'We're going to be celebrating all day.'",text:"We're going to be celebrating all day.",correct:"We're going to be celebrating all day",explanation:"Futuro continuo: going to be + celebrating."},
        {id:9,type:"write",question:"Completa: I ___ (am going to be) waiting for you at the station.",text:"I ___ (am going to be) waiting for you at the station.",correct:"I am going to be waiting for you at the station",explanation:"Futuro continuo: am going to be + waiting."},
        {id:10,type:"write",question:"Escribe: 'He's going to be playing football at 3 PM.'",text:"He's going to be playing football at 3 PM.",correct:"He's going to be playing football at 3 PM",explanation:"Futuro continuo con hora específica."}
      ]
    },
    avanzado: {
      // Niveles 1-12 para avanzado (ya tengo level1)
      level2: [
        {id:1,type:"write",question:"Escribe: 'I had been working there for five years before I quit.'",text:"I had been working there for five years before I quit.",correct:"I had been working there for five years before I quit",explanation:"Pasado perfecto continuo: had been + ing + for + tiempo + before."},
        {id:2,type:"write",question:"Completa: She ___ (had been studying) English since 2018.",text:"She ___ (had been studying) English since 2018.",correct:"She had been studying English since 2018",explanation:"Pasado perfecto continuo: had been + studying + since + fecha."},
        {id:3,type:"write",question:"Escribe la pregunta: 'How long had you been waiting?'",text:"How long had you been waiting?",correct:"How long had you been waiting?",explanation:"Pregunta duración: How long + had + sujeto + been + ing?"},
        {id:4,type:"write",question:"Escribe la respuesta: 'I had been waiting for two hours.'",text:"I had been waiting for two hours.",correct:"I had been waiting for two hours",explanation:"Respuesta: I had been + ing + for + duración."},
        {id:5,type:"write",question:"Escribe: 'They had been living in London before they moved.'",text:"They had been living in London before they moved.",correct:"They had been living in London before they moved",explanation:"Pasado perfecto continuo: had been + living + before + acción."},
        {id:6,type:"write",question:"Completa: ___ (What) had you been doing before I arrived?",text:"___ (What) had you been doing before I arrived?",correct:"What had you been doing before I arrived?",explanation:"Pregunta con 'What': What + had + sujeto + been + doing?"},
        {id:7,type:"write",question:"Corrige: he had been work here",text:"he had been work here",correct:"He had been working here",explanation:"Pasado perfecto continuo: had been + working (con -ing)."},
        {id:8,type:"write",question:"Escribe: 'I had been feeling sick for days before I went to the doctor.'",text:"I had been feeling sick for days before I went to the doctor.",correct:"I had been feeling sick for days before I went to the doctor",explanation:"Estado continuo: had been + feeling + for + tiempo + before."},
        {id:9,type:"write",question:"Completa: We ___ (had been planning) this trip for months.",text:"We ___ (had been planning) this trip for months.",correct:"We had been planning this trip for months",explanation:"Pasado perfecto continuo: had been + planning + for + tiempo."},
        {id:10,type:"write",question:"Escribe: 'She had been teaching for ten years when she retired.'",text:"She had been teaching for ten years when she retired.",correct:"She had been teaching for ten years when she retired",explanation:"Duración hasta momento específico: had been + teaching + when."}
      ]
    }
  };

  return exercises;
};

module.exports = { generateWritingExercises };







