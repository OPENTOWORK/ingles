'use client';
import React from 'react';
import TheoryLayout from '@/components/theory/TheoryLayout';
import { 
  TheorySection, 
  Example, 
  Rule, 
  Tip, 
  GrammarTable, 
  QuickReference 
} from '@/components/theory/TheoryContent';
import { 
  MultipleChoiceExercise, 
  FillBlanksExercise, 
  TrueFalseExercise 
} from '@/components/theory/ExerciseComponents';

const FalseFriendsPage = () => {
  const theoryContent = (
    <div>
      <TheorySection title="¿Qué son los False Friends?" icon="👥">
        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Los <strong>false friends</strong> (falsos amigos) son palabras que se parecen mucho en inglés y español 
          pero tienen significados completamente diferentes. Son una de las fuentes más comunes de errores para 
          hispanohablantes, ya que pueden parecer familiares pero en realidad significan algo distinto.
        </p>
        
        <QuickReference items={[
          "Palabras que se parecen pero significan diferente",
          "Fuente común de errores",
          "Pueden confundir a los hispanohablantes",
          "Es importante memorizar las diferencias",
          "Contexto ayuda a identificar el significado"
        ]} />
      </TheorySection>

      <TheorySection title="False Friends Comunes - Parte 1" icon="📚">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Algunos de los false friends más comunes y confusos.
        </p>

        <GrammarTable
          caption="False Friends Comunes"
          headers={["Palabra Inglés", "Significado Inglés", "Palabra Español", "Significado Español"]}
          rows={[
            ["actual", "real, current", "actual", "current, present"],
            ["actually", "really, in fact", "actualmente", "currently, now"],
            ["assist", "help, attend", "asistir", "attend, be present"],
            ["attend", "go to, be present", "atender", "serve, take care of"],
            ["carpet", "floor covering", "carpeta", "folder, file"],
            ["casual", "informal, relaxed", "casual", "by chance, accidental"],
            ["complexion", "skin appearance", "complexión", "physical build"],
            ["constipated", "having bowel problems", "constipado", "having a cold"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="La situación actual es difícil"
            english="The actual situation is difficult"
            translation="La situación real es difícil"
          />
          <Example 
            spanish="Actualmente estoy trabajando"
            english="I'm actually working"
            translation="Realmente estoy trabajando"
          />
          <Example 
            spanish="Voy a asistir a la reunión"
            english="I'm going to attend the meeting"
            translation="Voy a asistir a la reunión"
          />
        </div>

        <Rule 
          title="Consejos para Identificar False Friends"
          description="Para evitar confusiones:"
          examples={[
            "No asumas que significan lo mismo",
            "Verifica siempre el contexto",
            "Usa diccionarios bilingües",
            "Aprende los pares más comunes"
          ]}
        />

        <Tip type="warning">
          <strong>¡Cuidado!</strong> 'Actual' en inglés significa 'real', no 'actual' (current). Usa 'current' para 'actual'.
        </Tip>
      </TheorySection>

      <TheorySection title="False Friends Comunes - Parte 2" icon="📖">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Más false friends que pueden causar confusión.
        </p>

        <GrammarTable
          caption="Más False Friends"
          headers={["Palabra Inglés", "Significado Inglés", "Palabra Español", "Significado Español"]}
          rows={[
            ["deceive", "trick, mislead", "decepcionar", "disappoint"],
            ["disappoint", "let down", "desapuntar", "remove from target"],
            ["embarrassed", "ashamed", "embarazada", "pregnant"],
            ["exit", "way out", "éxito", "success"],
            ["fabric", "material, cloth", "fábrica", "factory"],
            ["library", "place with books", "librería", "bookstore"],
            ["mayor", "head of city", "mayor", "older, bigger"],
            ["miserable", "very unhappy", "miserable", "mean, stingy"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Estoy decepcionado con los resultados"
            english="I'm disappointed with the results"
            translation="Estoy decepcionado con los resultados"
          />
          <Example 
            spanish="Estoy embarazada (pregnant)"
            english="I'm pregnant"
            translation="Estoy embarazada"
          />
          <Example 
            spanish="El éxito de la película fue grande"
            english="The movie's success was great"
            translation="El éxito de la película fue grande"
          />
        </div>

        <Tip type="error">
          <strong>Error común:</strong> 'Embarrassed' no significa 'embarazada'. Significa 'avergonzado' o 'con vergüenza'.
        </Tip>
      </TheorySection>

      <TheorySection title="False Friends Comunes - Parte 3" icon="📝">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Más pares de false friends para completar tu conocimiento.
        </p>

        <GrammarTable
          caption="False Friends Adicionales"
          headers={["Palabra Inglés", "Significado Inglés", "Palabra Español", "Significado Español"]}
          rows={[
            ["nervous", "anxious, worried", "nervioso", "anxious, worried"],
            ["notice", "observe, see", "noticia", "news"],
            ["parents", "mother and father", "parientes", "relatives"],
            ["policy", "plan, rules", "policía", "police"],
            ["realize", "understand, become aware", "realizar", "carry out, do"],
            ["record", "document, evidence", "recordar", "remember"],
            ["resume", "continue, CV", "resumir", "summarize"],
            ["sensible", "reasonable, practical", "sensible", "sensitive"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me di cuenta de mi error"
            english="I realized my mistake"
            translation="Me di cuenta de mi error"
          />
          <Example 
            spanish="Recordé la cita"
            english="I remembered the appointment"
            translation="Recordé la cita"
          />
          <Example 
            spanish="Es una persona sensible"
            english="He's a sensitive person"
            translation="Es una persona sensible"
          />
        </div>

        <Rule 
          title="Estrategias para Recordar"
          description="Técnicas útiles:"
          examples={[
            "Crea asociaciones mentales",
            "Practica con oraciones",
            "Usa tarjetas de memoria",
            "Lee en contexto"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> 'Realize' significa 'darse cuenta', no 'realizar'. Para 'realizar' usa 'carry out' o 'do'.
        </Tip>
      </TheorySection>

      <TheorySection title="False Friends con Pronunciación Similar" icon="🔊">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          Palabras que suenan parecido pero significan cosas diferentes.
        </p>

        <GrammarTable
          caption="False Friends por Pronunciación"
          headers={["Palabra Inglés", "Pronunciación", "Significado", "Confusión con"]}
          rows={[
            ["dessert", "/dɪˈzɜːrt/", "sweet food after meal", "desert (desierto)"],
            ["dessert", "/ˈdezərt/", "dry, sandy area", "dessert (postre)"],
            ["loose", "/luːs/", "not tight", "lose (perder)"],
            ["lose", "/luːz/", "not win, misplace", "loose (suelto)"],
            ["advice", "/ədˈvaɪs/", "recommendation", "advise (aconsejar)"],
            ["advise", "/ədˈvaɪz/", "give advice", "advice (consejo)"],
            ["effect", "/ɪˈfekt/", "result, consequence", "affect (afectar)"],
            ["affect", "/əˈfekt/", "influence, impact", "effect (efecto)"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="Me gusta el postre"
            english="I like dessert"
            translation="Me gusta el postre"
          />
          <Example 
            spanish="El desierto es muy seco"
            english="The desert is very dry"
            translation="El desierto es muy seco"
          />
          <Example 
            spanish="Necesito consejo"
            english="I need advice"
            translation="Necesito consejo"
          />
          <Example 
            spanish="Te aconsejo estudiar"
            english="I advise you to study"
            translation="Te aconsejo estudiar"
          />
        </div>

        <Tip type="info">
          <strong>Consejo:</strong> 'Advice' es sustantivo (consejo), 'advise' es verbo (aconsejar). La diferencia está en la 's' y la 'c'.
        </Tip>
      </TheorySection>

      <TheorySection title="Contexto y Uso" icon="🎯">
        <p style={{ fontSize: '1rem', lineHeight: 1.6, color: '#4a5568', marginBottom: '1rem' }}>
          El contexto es clave para identificar y usar correctamente las palabras.
        </p>

        <GrammarTable
          caption="Estrategias de Contexto"
          headers={["Estrategia", "Ejemplo", "Explicación"]}
          rows={[
            ["Leer la oración completa", "The actual problem is...", "Contexto ayuda a entender 'real'"],
            ["Buscar palabras relacionadas", "Library books are...", "Libros indica lugar de lectura"],
            ["Considerar el tema", "Fabric production...", "Producción indica industria textil"],
            ["Verificar con diccionario", "When in doubt, check", "Siempre verificar significado"]
          ]}
        />

        <div style={{ display: 'grid', gap: '1rem' }}>
          <Example 
            spanish="El problema actual es la inflación"
            english="The current problem is inflation"
            translation="El problema actual es la inflación"
          />
          <Example 
            spanish="Voy a la biblioteca para estudiar"
            english="I go to the library to study"
            translation="Voy a la biblioteca para estudiar"
          />
          <Example 
            spanish="Esta fábrica produce telas"
            english="This factory produces fabrics"
            translation="Esta fábrica produce telas"
          />
        </div>

        <Rule 
          title="Reglas de Contexto"
          description="Para usar el contexto efectivamente:"
          examples={[
            "Lee toda la oración",
            "Considera las palabras circundantes",
            "Piensa en el tema general",
            "Si no estás seguro, verifica"
          ]}
        />

        <Tip type="success">
          <strong>Consejo:</strong> El contexto es tu mejor amigo para evitar errores con false friends.
        </Tip>
      </TheorySection>

      <TheorySection title="Errores Comunes" icon="⚠️">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Tip type="error">
            <strong>Error:</strong> Usar 'actual' para 'current' ❌<br/>
            <strong>Correcto:</strong> 'Actual' = real, 'Current' = actual ✅<br/>
            <em>My actual job → My current job</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'library' para 'bookstore' ❌<br/>
            <strong>Correcto:</strong> 'Library' = biblioteca, 'Bookstore' = librería ✅<br/>
            <em>I buy books at the library → I buy books at the bookstore</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'realize' para 'carry out' ❌<br/>
            <strong>Correcto:</strong> 'Realize' = darse cuenta, 'Carry out' = realizar ✅<br/>
            <em>I realized the project → I carried out the project</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'embarrassed' para 'pregnant' ❌<br/>
            <strong>Correcto:</strong> 'Embarrassed' = avergonzado, 'Pregnant' = embarazada ✅<br/>
            <em>She is embarrassed → She is pregnant</em>
          </Tip>

          <Tip type="error">
            <strong>Error:</strong> Usar 'exit' para 'success' ❌<br/>
            <strong>Correcto:</strong> 'Exit' = salida, 'Success' = éxito ✅<br/>
            <em>The exit of the movie → The success of the movie</em>
          </Tip>
        </div>
      </TheorySection>

      <TheorySection title="Reglas Importantes" icon="⚡">
        <div style={{ display: 'grid', gap: '1rem' }}>
          <Rule 
            title="1. No asumas similitudes"
            description="Las palabras que se parecen pueden significar cosas muy diferentes."
            examples={[
              "Verifica siempre el significado",
              "No traduzcas literalmente",
              "Usa diccionarios confiables",
              "Practica en contexto"
            ]}
          />

          <Rule 
            title="2. Contexto es clave"
            description="El contexto te ayuda a entender el significado correcto."
            examples={[
              "Lee oraciones completas",
              "Considera el tema general",
              "Busca palabras relacionadas",
              "Piensa lógicamente"
            ]}
          />

          <Rule 
            title="3. Aprende los pares más comunes"
            description="Memoriza los false friends más frecuentes."
            examples={[
              "Actual vs Current",
              "Library vs Bookstore",
              "Realize vs Carry out",
              "Embarrassed vs Pregnant",
              "Exit vs Success"
            ]}
          />
        </div>
      </TheorySection>
    </div>
  );

  const exercises = [
    <MultipleChoiceExercise
      key="1"
      question="Complete: 'The _____ situation is difficult.' (presente/actual)"
      options={[
        "actual",
        "current",
        "real",
        "true"
      ]}
      correctAnswer={1}
      explanation="'Current' significa actual/presente. 'Actual' en inglés significa real/verdadero."
    />,

    <MultipleChoiceExercise
      key="2"
      question="What does 'actual' mean in English?"
      options={[
        "current",
        "real, existing",
        "present",
        "modern"
      ]}
      correctAnswer={1}
      explanation="'Actual' in English means 'real' or 'existing', not 'current'. For 'current' or 'present', use 'current'."
    />,

    <TrueFalseExercise
      key="3"
      statements={[
        {
          text: "'Library' in English means the same as 'librería' in Spanish.",
          isTrue: false,
          explanation: "Incorrect. 'Library' in English means 'biblioteca' (place with books to borrow), while 'librería' means 'bookstore' (place to buy books)."
        },
        {
          text: "'Realize' means 'to become aware of something' in English.",
          isTrue: true,
          explanation: "Correct. 'Realize' means 'to become aware of' or 'to understand'. It does not mean 'to carry out' (realizar)."
        },
        {
          text: "'Embarrassed' means 'pregnant' in English.",
          isTrue: false,
          explanation: "Incorrect. 'Embarrassed' means 'ashamed' or 'feeling shame'. 'Pregnant' means 'embarazada'."
        },
        {
          text: "False friends are words that look similar but have different meanings.",
          isTrue: true,
          explanation: "Correct. False friends are words that appear similar in two languages but have different meanings."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="4"
      question="Which word means 'to carry out' or 'to do' in English?"
      options={[
        "realize",
        "carry out",
        "actual",
        "library"
      ]}
      correctAnswer={1}
      explanation="'Carry out' means 'to do' or 'to execute'. 'Realize' means 'to become aware of', 'actual' means 'real', and 'library' means 'biblioteca'."
    />,

    <MultipleChoiceExercise
      key="5"
      question="What is the correct English word for 'éxito' (success)?"
      options={[
        "exit",
        "success",
        "access",
        "excess"
      ]}
      correctAnswer={1}
      explanation="The correct English word for 'éxito' (success) is 'success'. 'Exit' means 'salida' (way out)."
    />,

    <TrueFalseExercise
      key="6"
      statements={[
        {
          text: "'Success' in English means the same as 'suceso' in Spanish.",
          isTrue: false,
          explanation: "Incorrecto. 'Success' significa éxito, mientras que 'suceso' significa event o occurrence."
        },
        {
          text: "'Fabric' in English refers to cloth or textile material.",
          isTrue: true,
          explanation: "Correcto. 'Fabric' significa tela o material textil, no fábrica (factory)."
        },
        {
          text: "'Sensible' in English means the same as 'sensible' in Spanish.",
          isTrue: false,
          explanation: "Incorrecto. 'Sensible' en inglés significa practical/reasonable, no sensitive (sensible en español)."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="7"
      question="Complete: 'She is very _____ about her appearance.' (sensitive)"
      options={[
        "sensible",
        "sensitive",
        "sensual",
        "sense"
      ]}
      correctAnswer={1}
      explanation="'Sensitive' significa sensible (que se ofende fácilmente). 'Sensible' significa practical/reasonable."
    />,

    <MultipleChoiceExercise
      key="8"
      question="What does 'exit' mean in English?"
      options={[
        "success",
        "way out",
        "entrance",
        "failure"
      ]}
      correctAnswer={1}
      explanation="'Exit' significa salida (way out). 'Éxito' en español es 'success' en inglés."
    />,

    <TrueFalseExercise
      key="9"
      statements={[
        {
          text: "'Attend' in English means to be present at an event.",
          isTrue: true,
          explanation: "Correcto. 'Attend' significa asistir a un evento, no atender (serve/help)."
        },
        {
          text: "'Carpet' and 'carpeta' refer to the same object.",
          isTrue: false,
          explanation: "Incorrecto. 'Carpet' es alfombra, 'carpeta' es folder en inglés."
        }
      ]}
    />,

    <MultipleChoiceExercise
      key="10"
      question="Complete: 'I need to _____ the meeting tomorrow.' (asistir)"
      options={[
        "assist",
        "attend",
        "help",
        "support"
      ]}
      correctAnswer={1}
      explanation="'Attend' significa asistir a un evento. 'Assist' significa ayudar."
    />
  ];

  return (
    <TheoryLayout
      title="False Friends"
      description="Domina los falsos amigos entre inglés y español. Aprende a evitar confusiones comunes y usar las palabras correctas para cada contexto."
      level="B1-B2-C1-C2"
      theoryContent={theoryContent}
      exercises={exercises}
      prerequisites={["Basic vocabulary", "Understanding of word formation"]}
      estimatedTime="75 min"
    />
  );
};

export default FalseFriendsPage;