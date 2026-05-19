// Simple CEFR placement test dataset
// Each question has: id, text, options, answer, difficulty (A1..C2)

export const placementQuestions = [
  // A1 basics
  { id: 1, difficulty: "A1", text: "I _____ a student.", options: ["am", "is", "are", "be"], answer: "am" },
  { id: 2, difficulty: "A1", text: "She _____ from Spain.", options: ["are", "am", "is", "be"], answer: "is" },
  { id: 3, difficulty: "A1", text: "We _____ tennis every weekend.", options: ["play", "plays", "played", "playing"], answer: "play" },
  { id: 4, difficulty: "A1", text: "There _____ two books on the table.", options: ["is", "are", "be", "been"], answer: "are" },
  { id: 5, difficulty: "A1", text: "Can you _____ me your name?", options: ["say", "tell", "talk", "speak"], answer: "tell" },

  // A2 fundamentals
  { id: 6, difficulty: "A2", text: "They were _____ when I arrived.", options: ["study", "studying", "studied", "to study"], answer: "studying" },
  { id: 7, difficulty: "A2", text: "He _____ to work by bus yesterday.", options: ["go", "goes", "went", "gone"], answer: "went" },
  { id: 8, difficulty: "A2", text: "I have lived here _____ 2019.", options: ["since", "for", "from", "by"], answer: "since" },
  { id: 9, difficulty: "A2", text: "This is the _____ movie I've ever seen.", options: ["more interesting", "most interesting", "interestinger", "very interesting"], answer: "most interesting" },
  { id: 10, difficulty: "A2", text: "I'm looking forward _____ you soon.", options: ["see", "to see", "to seeing", "seeing to"], answer: "to seeing" },

  // B1 intermediate
  { id: 11, difficulty: "B1", text: "He has _____ his homework.", options: ["do", "did", "done", "does"], answer: "done" },
  { id: 12, difficulty: "B1", text: "If I _____ more time, I would travel.", options: ["have", "had", "has", "having"], answer: "had" },
  { id: 13, difficulty: "B1", text: "She suggested _____ to the museum.", options: ["to go", "go", "going", "gone"], answer: "going" },
  { id: 14, difficulty: "B1", text: "We need to put _____ the meeting until next week.", options: ["off", "out", "up", "in"], answer: "off" },
  { id: 15, difficulty: "B1", text: "By the time we arrived, they _____.", options: ["left", "had left", "were leaving", "leave"], answer: "had left" },

  // B2 upper-intermediate
  { id: 16, difficulty: "B2", text: "By this time tomorrow, we _____ the report.", options: ["finish", "will finish", "will have finished", "have finished"], answer: "will have finished" },
  { id: 17, difficulty: "B2", text: "It's high time you _____ to the doctor.", options: ["go", "went", "had gone", "would go"], answer: "went" },
  { id: 18, difficulty: "B2", text: "I'd rather you _____ here.", options: ["don't smoke", "didn't smoke", "not smoke", "won't smoke"], answer: "didn't smoke" },
  { id: 19, difficulty: "B2", text: "The book, _____ I bought yesterday, is fascinating.", options: ["that", "which", "what", "who"], answer: "which" },
  { id: 20, difficulty: "B2", text: "Scarcely _____ when the phone rang.", options: ["we had sat down", "had we sat down", "we sat down", "we have sat down"], answer: "had we sat down" },

  // C1 advanced
  { id: 21, difficulty: "C1", text: "Hardly _____ the bell rung when the class started.", options: ["has", "have", "had", "having"], answer: "had" },
  { id: 22, difficulty: "C1", text: "Were I _____, I would invest earlier.", options: ["know", "knew", "known", "knowing"], answer: "knew" },
  { id: 23, difficulty: "C1", text: "No sooner _____ than it started raining.", options: ["we left", "had we left", "we had left", "left we had"], answer: "had we left" },
  { id: 24, difficulty: "C1", text: "If only he _____ more carefully.", options: ["drives", "drove", "had driven", "has driven"], answer: "had driven" },
  { id: 25, difficulty: "C1", text: "Rarely _____ such dedication.", options: ["you see", "do you see", "are you seeing", "you are seeing"], answer: "do you see" },

  // C2 mastery
  { id: 26, difficulty: "C2", text: "I wish I _____ you earlier.", options: ["told", "had told", "have told", "was telling"], answer: "had told" },
  { id: 27, difficulty: "C2", text: "Were it not for his _____, the plan would have failed.", options: ["ingenuity", "ingenious", "ingeniousness", "ingenuous"], answer: "ingenuity" },
  { id: 28, difficulty: "C2", text: "So breathtaking _____ that the audience fell silent.", options: ["was the performance", "the performance was", "had the performance been", "the performance had been"], answer: "was the performance" },
  { id: 29, difficulty: "C2", text: "Seldom _____ a statesman speak so candidly.", options: ["one hears", "does one hear", "hears one", "one does hear"], answer: "does one hear" },
  { id: 30, difficulty: "C2", text: "Only by working together _____ the crisis.", options: ["we can overcome", "can we overcome", "could we overcame", "we overcame"], answer: "can we overcome" },
];

export function levelFromScore(score, total = 30) {
  const t = Math.max(1, Number(total) || 30);
  const s = Number(score) || 0;
  const pct = s / t;
  // Mismos umbrales proporcionales que el test de 30 preguntas
  if (pct <= 6 / 30) return 'A1';
  if (pct <= 12 / 30) return 'A2';
  if (pct <= 18 / 30) return 'B1';
  if (pct <= 24 / 30) return 'B2';
  if (pct <= 28 / 30) return 'C1';
  return 'C2';
}

export const levelRecommendations = {
  A1: {
    title: "Nivel A1 (Principiante)",
    link: "/training/a1",
  },
  A2: {
    title: "Nivel A2 (Elemental)",
    link: "/training/a2",
  },
  B1: {
    title: "Nivel B1 (Intermedio)",
    link: "/training/b1",
  },
  B2: {
    title: "Nivel B2 (Intermedio Alto)",
    link: "/training/b2",
  },
  C1: {
    title: "Nivel C1 (Avanzado)",
    link: "/training/c1",
  },
  C2: {
    title: "Nivel C2 (Maestría)",
    link: "/training/c2",
  },
};


