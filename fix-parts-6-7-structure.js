const fs = require('fs');
const path = require('path');

// Contenido correcto para Part 6 - Cross-text Multiple Matching
const part6Content = {
  title: "Part 6 - Cross-text Multiple Matching",
  description: "You are going to read four reviews of different films. For questions 37-42, choose from the reviews (A-G). The reviews may be chosen more than once.",
  readingText: `Film Reviews

A) "The Visual Spectacle"
This film delivers exactly what it promises - a visual feast that will leave audiences breathless. The special effects are nothing short of spectacular, creating a world that feels both fantastical and believable. While the plot may be somewhat predictable, the stunning cinematography and innovative use of CGI more than compensate for any narrative shortcomings. The director's vision comes through clearly in every frame, making this a must-see for fans of visual storytelling.

B) "The Unexpected Journey"
What starts as a seemingly straightforward drama quickly transforms into something entirely different. The narrative takes unexpected turns that will keep viewers guessing until the very end. The twist ending caught me completely off guard, and I found myself thinking about the film's implications long after leaving the cinema. The character development is subtle but effective, and the performances are uniformly excellent. This is the kind of film that rewards multiple viewings.

C) "The Emotional Core"
At its heart, this film is about human relationships and the complexities of love and loss. The emotional journey of the main character is both heartbreaking and uplifting, portrayed with remarkable sensitivity by the lead actor. The supporting cast brings depth to their roles, creating a rich tapestry of human experience. While the pacing is deliberately slow, it serves the story's emotional beats perfectly. This is a film that will resonate with anyone who has experienced the joys and sorrows of human connection.

D) "The Technical Achievement"
From a technical standpoint, this film represents a significant advancement in filmmaking technology. The seamless integration of practical and digital effects creates a viewing experience that's both immersive and believable. The sound design is particularly noteworthy, with every audio element carefully crafted to enhance the storytelling. The editing is crisp and purposeful, maintaining narrative momentum throughout. This film sets a new standard for technical excellence in cinema.

E) "The Musical Experience"
The soundtrack of this film deserves special recognition for how it enhances the emotional impact of every scene. The composer has created a score that perfectly complements the film's themes, from the haunting melodies that underscore moments of tension to the uplifting orchestral pieces that accompany the story's triumphs. The use of both original compositions and carefully selected existing music creates a rich auditory landscape that elevates the entire viewing experience.

F) "The Pacing Problem"
While this film has many strengths, including strong performances and an interesting premise, it suffers from significant pacing issues. The opening act is engaging and sets up the story well, but the middle section drags considerably, losing much of the initial momentum. The final act attempts to recapture the energy of the beginning, but by then, many viewers may have lost interest. With tighter editing, this could have been a much more effective film.

G) "The Genre Appeal"
Fans of psychological thrillers will find this film particularly engaging, as it delivers the kind of mind-bending narrative that defines the genre. The film plays with audience expectations in clever ways, subverting common tropes while still delivering the suspense and intrigue that thriller fans expect. The psychological elements are well-researched and presented with authenticity. This film successfully bridges the gap between entertainment and psychological insight.`,
  questions: [
    {
      id: 37,
      text: "Which reviewer mentions that the film might appeal to fans of a particular genre?",
      answer: "G",
      explanation: "Reviewer G mentions that fans of psychological thrillers will find this film particularly engaging, indicating it appeals to a specific genre."
    },
    {
      id: 38,
      text: "Which reviewer suggests the film's ending is unexpected?",
      answer: "B",
      explanation: "Reviewer B states that the twist ending caught them completely off guard, indicating an unexpected conclusion."
    },
    {
      id: 39,
      text: "Which reviewer criticizes the film's pacing?",
      answer: "F",
      explanation: "Reviewer F mentions that the film drags in the middle section, which is a criticism of pacing."
    },
    {
      id: 40,
      text: "Which reviewer praises the film's visual effects?",
      answer: "A",
      explanation: "Reviewer A specifically mentions that the visual effects are stunning and add to the film's impact."
    },
    {
      id: 41,
      text: "Which reviewer mentions the film's soundtrack?",
      answer: "E",
      explanation: "Reviewer E dedicates the entire review to discussing the film's soundtrack and musical elements."
    },
    {
      id: 42,
      text: "Which reviewer focuses on the emotional aspects of the film?",
      answer: "C",
      explanation: "Reviewer C emphasizes the emotional journey and human relationships as the core of the film."
    }
  ]
};

// Contenido correcto para Part 7 - Multiple Matching
const part7Content = {
  title: "Part 7 - Multiple Matching",
  description: "You are going to read four texts about different football stories. For questions 43-52, choose from the stories (A-D). The stories may be chosen more than once.",
  readingText: `Football Stories

A) "The Underdog's Triumph"
When the small-town football team qualified for the national championship, no one expected them to win. The team had struggled financially for years, with outdated equipment and a shoestring budget. However, their determination and teamwork proved stronger than their limitations. The coach, a former professional player who had returned to his hometown, instilled in his players the belief that anything was possible with hard work and dedication. Their victory in the final match, against a much more established team, became a symbol of hope for the entire community.

B) "The Comeback Kid"
After a career-threatening injury, many thought this player's professional days were over. The doctors were pessimistic about his chances of returning to competitive football. However, his rehabilitation process became a testament to human resilience and determination. He spent countless hours in physical therapy, often working when the facility was empty, pushing himself beyond what was recommended. His return to the field, stronger than ever, inspired not only his teammates but also young players facing their own challenges. His story became a lesson in perseverance and the power of never giving up.

C) "The Community Builder"
This football club's impact extended far beyond the pitch. Recognizing their responsibility to the local community, they established numerous programs for young people, including after-school activities, mentorship programs, and scholarships for promising students. The club's players regularly visited schools and community centers, using their platform to promote education and positive values. Their efforts transformed the neighborhood, reducing youth crime rates and providing opportunities for disadvantaged children. The club proved that football could be a force for social change and community development.

D) "The Innovation Pioneer"
This team revolutionized football training through the introduction of cutting-edge technology and scientific methods. They were among the first to use advanced analytics, wearable technology, and personalized nutrition plans. Their approach to player development combined traditional coaching methods with modern sports science, resulting in improved performance and reduced injury rates. Other teams began adopting their methods, and the club became a leader in football innovation. Their success demonstrated how embracing new technologies could give teams a competitive edge while also improving player welfare.`,
  questions: [
    {
      id: 43,
      text: "Which story mentions the use of modern technology in football?",
      answer: "D",
      explanation: "Story D discusses the introduction of cutting-edge technology, advanced analytics, and wearable technology in football training."
    },
    {
      id: 44,
      text: "Which story involves a player overcoming a serious injury?",
      answer: "B",
      explanation: "Story B focuses on a player's recovery from a career-threatening injury and his successful return to football."
    },
    {
      id: 45,
      text: "Which story describes a team with limited financial resources?",
      answer: "A",
      explanation: "Story A mentions the team's financial struggles, outdated equipment, and shoestring budget."
    },
    {
      id: 46,
      text: "Which story shows football's positive impact on society?",
      answer: "C",
      explanation: "Story C describes how the football club helped the community through various programs and social initiatives."
    },
    {
      id: 47,
      text: "Which story mentions the importance of teamwork?",
      answer: "A",
      explanation: "Story A emphasizes how the team's determination and teamwork helped them overcome their limitations."
    },
    {
      id: 48,
      text: "Which story involves a former professional player?",
      answer: "A",
      explanation: "Story A mentions that the coach was a former professional player who returned to his hometown."
    },
    {
      id: 49,
      text: "Which story discusses the influence on young people?",
      answer: "C",
      explanation: "Story C describes programs for young people and how players visited schools and community centers."
    },
    {
      id: 50,
      text: "Which story mentions scientific methods in training?",
      answer: "D",
      explanation: "Story D discusses the combination of traditional coaching with modern sports science and scientific methods."
    },
    {
      id: 51,
      text: "Which story involves inspiring others?",
      answer: "B",
      explanation: "Story B mentions how the player's comeback inspired teammates and young players facing challenges."
    },
    {
      id: 52,
      text: "Which story mentions reducing crime rates?",
      answer: "C",
      explanation: "Story C specifically mentions that the club's efforts helped reduce youth crime rates in the neighborhood."
    }
  ]
};

// Función para crear el contenido de Part 6
function createPart6Content() {
  const part6Path = 'src/app/niveles/c1/exam-1/part-6/page.js';
  
  const content = `'use client';

import { useExam } from '@/context/ExamContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ExamExitWarning from '@/components/ExamExitWarning';
import ExamTimer from '@/components/ExamTimer';
import AdvancedProgress from '@/components/AdvancedProgress';
import QuickNavigation from '@/components/QuickNavigation';
import EnhancedFeedback from '@/components/EnhancedFeedback';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-6';
const TOTAL_TIME = 90 * 60; // 90 minutes for Reading and Use of English parts

const questions = ${JSON.stringify(part6Content.questions, null, 2)};

const readingText = \`${part6Content.readingText}\`;

export default function Part6() {
  const { answers, setAnswers, globalStart, setGlobalStart } = useExam();
  const router = useRouter();
  const pathname = usePathname();
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Initialize part answers
  const partAnswers = answers[EXAM_ID]?.[PART_ID] || {};
  const setPartAnswers = (newAnswers) => {
    setAnswers(prev => ({
      ...prev,
      [EXAM_ID]: {
        ...prev[EXAM_ID],
        [PART_ID]: newAnswers
      }
    }));
  };

  useEffect(() => {
    if (!globalStart) {
      setGlobalStart(new Date());
    }
  }, [globalStart, setGlobalStart]);

  const handleAnswer = (questionId, answer) => {
    setPartAnswers({
      ...partAnswers,
      [questionId]: answer
    });
  };

  const handleShowResult = () => {
    setShowResult(true);
  };

  const handleNavigateToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    const element = document.getElementById(\`question-\${questions[questionIndex].id}\`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackToIndex = (e) => {
    e.preventDefault();
    const isExamRoute = /^\\/niveles\\/c1\\/exam-1\\/part-\\d+$/.test(pathname);
    if (isExamRoute && globalStart) {
      setPendingNavigation('/niveles/c1/exam-1');
      setShowExitWarning(true);
    } else {
      router.push('/niveles/c1/exam-1');
    }
  };

  const handleNavigation = (href) => {
    const isExamRoute = /^\\/niveles\\/c1\\/exam-1\\/part-\\d+$/.test(pathname);
    if (isExamRoute && globalStart) {
      setPendingNavigation(href);
      setShowExitWarning(true);
    } else {
      router.push(href);
    }
  };

  const handleSaveAndExit = () => {
    setShowExitWarning(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleExitWithoutSaving = () => {
    setShowExitWarning(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleTimeUp = () => {
    alert('⏰ Time is up! The exam part has ended.');
    setShowResult(true);
  };

  const handleTimerWarning = (timeLeft) => {
    if (timeLeft <= 300) { // 5 minutes
      alert(\`⚠️ Warning: Only \${Math.floor(timeLeft / 60)} minutes remaining!\`);
    }
  };

  const getSectionName = (partId) => {
    const sectionNames = {
      'part-6': 'Cross-text Multiple Matching'
    };
    return sectionNames[partId] || 'Reading and Use of English';
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (partAnswers[q.id] === q.answer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  const score = calculateScore();

  return (
    <>
      <ExamExitWarning
        isOpen={showExitWarning}
        onClose={() => setShowExitWarning(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
      />
      
      <div className="shell">
        <div className="exam-header">
          <div className="header">
            <h1>${part6Content.title}</h1>
            <p>${part6Content.description}</p>
          </div>
        </div>

        <div className="exam-content">
          <div className="progress-section">
            <ExamTimer
              totalTime={TOTAL_TIME}
              sectionName={getSectionName(PART_ID)}
              onTimeUp={handleTimeUp}
              onWarning={handleTimerWarning}
            />
            <AdvancedProgress
              questions={questions}
              answers={partAnswers}
              showResult={showResult}
              sectionName={getSectionName(PART_ID)}
            />
          </div>

          <div className="timer-section">
            <QuickNavigation
              questions={questions}
              answers={partAnswers}
              currentQuestion={currentQuestion}
              onNavigate={handleNavigateToQuestion}
              sectionName={getSectionName(PART_ID)}
            />
          </div>

          <div className="instructions-section">
            <div className="instructions-text">
              <p><strong>Instructions:</strong> Read the four film reviews below. For each question (37-42), choose the review (A-G) that best matches the description. You may use each review more than once.</p>
            </div>
          </div>

          <div className="reading-text-modern">
            <div className="text-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: '1.6' }}>{readingText}</pre>
            </div>
          </div>

          <div className="questions-section-header">
            <h2>Questions 37-42</h2>
          </div>

          <div className="questions-container">
            {questions.map((q, index) => {
              const selectedAnswer = partAnswers[q.id];
              const isCorrect = selectedAnswer === q.answer;
              const isAnswered = selectedAnswer !== undefined;
              
              return (
                <div key={q.id} id={\`question-\${q.id}\`} className="question">
                  <div className="question-header">
                    <h3>{q.id}</h3>
                    <div className="question-status">
                      <span className={\`status-badge \${isAnswered ? 'answered' : ''}\`}>
                        {isAnswered ? '✓ Answered' : '○ Unanswered'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="question-content">
                    <p>{q.text}</p>
                    
                    <div className="options">
                      {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((option) => (
                        <label key={option} className={\`option \${selectedAnswer === option ? 'selected' : ''} \${showResult && option === q.answer ? 'correct' : ''} \${showResult && selectedAnswer === option && selectedAnswer !== q.answer ? 'incorrect' : ''}\`}>
                          <input
                            type="radio"
                            name={\`question-\${q.id}\`}
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={() => handleAnswer(q.id, option)}
                            disabled={showResult}
                          />
                          <span className="option-letter">{option}</span>
                        </label>
                      ))}
                    </div>

                    {showResult && (
                      <div className="question-feedback">
                        <div className="result-indicator">
                          {isCorrect ? (
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Correct!</span>
                          ) : (
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ Incorrect</span>
                          )}
                        </div>
                        
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>Explanation:</h4>
                            <div className="explanation-status">
                              <span className={\`status-correct\`}>Correct Answer: {q.answer}</span>
                            </div>
                          </div>
                          <div className="explanation-content">
                            <div className="answer-section">
                              <p><strong>Your answer:</strong> <span className="user-answer">{selectedAnswer || 'Not answered'}</span></p>
                              <p><strong>Correct answer:</strong> <span className="correct-answer">{q.answer}</span></p>
                            </div>
                            <div className="explanation-text">
                              <p>{q.explanation}</p>
                            </div>
                            <div className="learning-tip">
                              <p><strong>💡 Tip:</strong> In cross-text multiple matching, look for specific details mentioned in the question and match them with the corresponding text. Pay attention to key words and phrases.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!showResult && (
            <div className="exam-navigation">
              <button 
                className="btn btn-secondary"
                onClick={handleShowResult}
                disabled={Object.keys(partAnswers).length === 0}
              >
                Check Answers
              </button>
            </div>
          )}

          {showResult && (
            <div className="score-section">
              <h3>Part 6 Results</h3>
              <div className="score-info">
                <div className={\`\${score.correct >= score.total * 0.6 ? 'score-passed' : 'score-failed'}\`}>
                  <p>Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)</p>
                  <p>{score.correct >= score.total * 0.6 ? '✅ Passed!' : '❌ Needs improvement'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="exam-navigation">
            <button className="btn btn-primary" onClick={() => handleNavigation('/niveles/c1/exam-1/part-5')}>
              ← Previous Part
            </button>
            <button className="btn btn-primary" onClick={() => handleNavigation('/niveles/c1/exam-1/part-7')}>
              Next Part →
            </button>
            <button className="btn btn-outline" onClick={handleBackToIndex}>
              Back to C1 Overview
            </button>
          </div>
        </div>
      </div>
    </>
  );
}`;

  fs.writeFileSync(part6Path, content);
  console.log('✅ Part 6 content updated successfully');
}

// Función para crear el contenido de Part 7
function createPart7Content() {
  const part7Path = 'src/app/niveles/c1/exam-1/part-7/page.js';
  
  const content = `'use client';

import { useExam } from '@/context/ExamContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ExamExitWarning from '@/components/ExamExitWarning';
import ExamTimer from '@/components/ExamTimer';
import AdvancedProgress from '@/components/AdvancedProgress';
import QuickNavigation from '@/components/QuickNavigation';
import EnhancedFeedback from '@/components/EnhancedFeedback';

const EXAM_ID = 'exam-1';
const PART_ID = 'part-7';
const TOTAL_TIME = 90 * 60; // 90 minutes for Reading and Use of English parts

const questions = ${JSON.stringify(part7Content.questions, null, 2)};

const readingText = \`${part7Content.readingText}\`;

export default function Part7() {
  const { answers, setAnswers, globalStart, setGlobalStart } = useExam();
  const router = useRouter();
  const pathname = usePathname();
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Initialize part answers
  const partAnswers = answers[EXAM_ID]?.[PART_ID] || {};
  const setPartAnswers = (newAnswers) => {
    setAnswers(prev => ({
      ...prev,
      [EXAM_ID]: {
        ...prev[EXAM_ID],
        [PART_ID]: newAnswers
      }
    }));
  };

  useEffect(() => {
    if (!globalStart) {
      setGlobalStart(new Date());
    }
  }, [globalStart, setGlobalStart]);

  const handleAnswer = (questionId, answer) => {
    setPartAnswers({
      ...partAnswers,
      [questionId]: answer
    });
  };

  const handleShowResult = () => {
    setShowResult(true);
  };

  const handleNavigateToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    const element = document.getElementById(\`question-\${questions[questionIndex].id}\`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBackToIndex = (e) => {
    e.preventDefault();
    const isExamRoute = /^\\/niveles\\/c1\\/exam-1\\/part-\\d+$/.test(pathname);
    if (isExamRoute && globalStart) {
      setPendingNavigation('/niveles/c1/exam-1');
      setShowExitWarning(true);
    } else {
      router.push('/niveles/c1/exam-1');
    }
  };

  const handleNavigation = (href) => {
    const isExamRoute = /^\\/niveles\\/c1\\/exam-1\\/part-\\d+$/.test(pathname);
    if (isExamRoute && globalStart) {
      setPendingNavigation(href);
      setShowExitWarning(true);
    } else {
      router.push(href);
    }
  };

  const handleSaveAndExit = () => {
    setShowExitWarning(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleExitWithoutSaving = () => {
    setShowExitWarning(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  const handleTimeUp = () => {
    alert('⏰ Time is up! The exam part has ended.');
    setShowResult(true);
  };

  const handleTimerWarning = (timeLeft) => {
    if (timeLeft <= 300) { // 5 minutes
      alert(\`⚠️ Warning: Only \${Math.floor(timeLeft / 60)} minutes remaining!\`);
    }
  };

  const getSectionName = (partId) => {
    const sectionNames = {
      'part-7': 'Multiple Matching'
    };
    return sectionNames[partId] || 'Reading and Use of English';
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      if (partAnswers[q.id] === q.answer) {
        correct++;
      }
    });
    return { correct, total: questions.length };
  };

  const score = calculateScore();

  return (
    <>
      <ExamExitWarning
        isOpen={showExitWarning}
        onClose={() => setShowExitWarning(false)}
        onSaveAndExit={handleSaveAndExit}
        onExitWithoutSaving={handleExitWithoutSaving}
      />
      
      <div className="shell">
        <div className="exam-header">
          <div className="header">
            <h1>${part7Content.title}</h1>
            <p>${part7Content.description}</p>
          </div>
        </div>

        <div className="exam-content">
          <div className="progress-section">
            <ExamTimer
              totalTime={TOTAL_TIME}
              sectionName={getSectionName(PART_ID)}
              onTimeUp={handleTimeUp}
              onWarning={handleTimerWarning}
            />
            <AdvancedProgress
              questions={questions}
              answers={partAnswers}
              showResult={showResult}
              sectionName={getSectionName(PART_ID)}
            />
          </div>

          <div className="timer-section">
            <QuickNavigation
              questions={questions}
              answers={partAnswers}
              currentQuestion={currentQuestion}
              onNavigate={handleNavigateToQuestion}
              sectionName={getSectionName(PART_ID)}
            />
          </div>

          <div className="instructions-section">
            <div className="instructions-text">
              <p><strong>Instructions:</strong> Read the four football stories below. For each question (43-52), choose the story (A-D) that best matches the description. You may use each story more than once.</p>
            </div>
          </div>

          <div className="reading-text-modern">
            <div className="text-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: '1.6' }}>{readingText}</pre>
            </div>
          </div>

          <div className="questions-section-header">
            <h2>Questions 43-52</h2>
          </div>

          <div className="questions-container">
            {questions.map((q, index) => {
              const selectedAnswer = partAnswers[q.id];
              const isCorrect = selectedAnswer === q.answer;
              const isAnswered = selectedAnswer !== undefined;
              
              return (
                <div key={q.id} id={\`question-\${q.id}\`} className="question">
                  <div className="question-header">
                    <h3>{q.id}</h3>
                    <div className="question-status">
                      <span className={\`status-badge \${isAnswered ? 'answered' : ''}\`}>
                        {isAnswered ? '✓ Answered' : '○ Unanswered'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="question-content">
                    <p>{q.text}</p>
                    
                    <div className="options">
                      {['A', 'B', 'C', 'D'].map((option) => (
                        <label key={option} className={\`option \${selectedAnswer === option ? 'selected' : ''} \${showResult && option === q.answer ? 'correct' : ''} \${showResult && selectedAnswer === option && selectedAnswer !== q.answer ? 'incorrect' : ''}\`}>
                          <input
                            type="radio"
                            name={\`question-\${q.id}\`}
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={() => handleAnswer(q.id, option)}
                            disabled={showResult}
                          />
                          <span className="option-letter">{option}</span>
                        </label>
                      ))}
                    </div>

                    {showResult && (
                      <div className="question-feedback">
                        <div className="result-indicator">
                          {isCorrect ? (
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Correct!</span>
                          ) : (
                            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ Incorrect</span>
                          )}
                        </div>
                        
                        <div className="explanation">
                          <div className="explanation-header">
                            <h4>Explanation:</h4>
                            <div className="explanation-status">
                              <span className={\`status-correct\`}>Correct Answer: {q.answer}</span>
                            </div>
                          </div>
                          <div className="explanation-content">
                            <div className="answer-section">
                              <p><strong>Your answer:</strong> <span className="user-answer">{selectedAnswer || 'Not answered'}</span></p>
                              <p><strong>Correct answer:</strong> <span className="correct-answer">{q.answer}</span></p>
                            </div>
                            <div className="explanation-text">
                              <p>{q.explanation}</p>
                            </div>
                            <div className="learning-tip">
                              <p><strong>💡 Tip:</strong> In multiple matching exercises, read all texts first to get a general understanding, then look for specific details mentioned in each question.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!showResult && (
            <div className="exam-navigation">
              <button 
                className="btn btn-secondary"
                onClick={handleShowResult}
                disabled={Object.keys(partAnswers).length === 0}
              >
                Check Answers
              </button>
            </div>
          )}

          {showResult && (
            <div className="score-section">
              <h3>Part 7 Results</h3>
              <div className="score-info">
                <div className={\`\${score.correct >= score.total * 0.6 ? 'score-passed' : 'score-failed'}\`}>
                  <p>Score: {score.correct}/{score.total} ({Math.round((score.correct / score.total) * 100)}%)</p>
                  <p>{score.correct >= score.total * 0.6 ? '✅ Passed!' : '❌ Needs improvement'}</p>
                </div>
              </div>
            </div>
          )}

          <div className="exam-navigation">
            <button className="btn btn-primary" onClick={() => handleNavigation('/niveles/c1/exam-1/part-6')}>
              ← Previous Part
            </button>
            <button className="btn btn-primary" onClick={() => handleNavigation('/niveles/c1/exam-1/part-8')}>
              Next Part →
            </button>
            <button className="btn btn-outline" onClick={handleBackToIndex}>
              Back to C1 Overview
            </button>
          </div>
        </div>
      </div>
    </>
  );
}`;

  fs.writeFileSync(part7Path, content);
  console.log('✅ Part 7 content updated successfully');
}

// Ejecutar las funciones
console.log('🔄 Updating Parts 6 and 7 with correct structure...');
createPart6Content();
createPart7Content();
console.log('✅ Parts 6 and 7 updated successfully!');


