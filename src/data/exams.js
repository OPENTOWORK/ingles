const exams = {
  c1: {
    "exam-1": {
      "part-1": {
        type: "multiple-choice-cloze",
        title: "Reading and Use of English - Part 1",
        instructions: "In this part, you read a short text with eight gaps. For each gap, there is a choice of four words (A, B, C, or D) to fill in. You must choose the word that fits best in the context of the sentence and the whole text.",
        timeLimit: 90 * 60, // 90 minutes total for parts 1-7
        passageTitle: "Genealogy",
        passage: "Genealogy is a **(1)** ........ of history. It concerns family history, **(2)** ........ than the national or world history studied at school. It doesn't merely involve drawing a family tree, however – tracing your family history can also **(3)** ........ in learning about your roots and your identity. The internet enables millions of people worldwide to **(4)** ........ information about their family history, without great **(5)** ........ .\n\nPeople who research their family history often **(6)** ........ that it's a fascinating hobby which **(7)** ........ a lot about where they come from and whether they have famous ancestors. According to a survey involving 900 people who had researched their family history, the chances of discovering a celebrity in your past are one in ten. The survey also concluded that the **(8)** ........ back you follow your family line, the more likely you are to find a relation who was much wealthier than you are.",
        questions: [
          { id: 1, text: "(1)", options: ["instead", "rather", "except", "sooner"], answer: "B" },
          { id: 2, text: "(2)", options: ["cause", "mean", "result", "lead"], answer: "D" },
          { id: 3, text: "(3)", options: ["accomplish", "access", "approach", "admit"], answer: "B" },
          { id: 4, text: "(4)", options: ["fee", "price", "charge", "expense"], answer: "D" },
          { id: 5, text: "(5)", options: ["describe", "define", "remark", "regard"], answer: "C" },
          { id: 6, text: "(6)", options: ["reveals", "opens", "begins", "arises"], answer: "A" },
          { id: 7, text: "(7)", options: ["older", "greater", "higher", "further"], answer: "D" },
          { id: 8, text: "(8)", options: ["attended", "participated", "included", "associated"], answer: "B" }
        ]
      },
      "part-2": {
        type: "open-cloze",
        title: "Reading and Use of English - Part 2", 
        instructions: "In this part, you read a text with gaps. Each gap requires a single word. You must write a grammatically and lexically correct word that fits the context.",
        timeLimit: 90 * 60,
        passageTitle: "Motorbike stunt rider",
        passage: "I work **(0)** **as** a motorbike stunt rider – that is, I do tricks on my motorbike at shows. The Le Mans race track in France was **(9)** ........ I first saw some guys doing motorbike stunts. I'd never seen anyone riding a motorbike using just the back wheel before and I was **(10)** ........ impressed I went straight home and taught **(11)** ........ to do the same.\n\nI have a degree **(12)** ........ mechanical engineering; this helps me to look at the physics **(13)** ........ lies behind each stunt. In addition to being responsible for design changes to the motorbike, I have to work **(14)** ........ every stunt I do. Apart **(15)** ........ some minor mechanical problem happening occasionally, I never feel in **(16)** ........ kind of danger because I'm very experienced.",
        questions: [
          { id: 9, answer: "where" },
          { id: 10, answer: "so" },
          { id: 11, answer: "myself" },
          { id: 12, answer: "in" },
          { id: 13, answer: "that" },
          { id: 14, answer: "on" },
          { id: 15, answer: "from" },
          { id: 16, answer: "any" }
        ]
      },
      "part-3": {
        type: "word-formation",
        title: "Reading and Use of English - Part 3",
        instructions: "In this part, you will read a short text containing eight gaps. Each gap corresponds to a word that needs to be formed from a given base word. You must use the correct form of the word to complete the sentence meaningfully and grammatically. This exercise tests your understanding of word families, prefixes, suffixes, and spelling.",
        timeLimit: 90 * 60,
        passageTitle: "An Incredible Vegetable",
        passage: "Garlic, a member of the Liliaceae family which also includes onions, is **(0)** **commonly** used in cooking all around the world. China is currently the largest **(17)** ........ of garlic, which is particularly associated with the dishes of northern Africa and southern Europe. It is native to central Asia and has long had a history as a health-giving food, used both to prevent and cure **(18)** ........ .\n\nIn Ancient Egypt, workers building the pyramids were given garlic to keep them strong, while Olympic athletes in Greece ate it to increase their resistance to infection.\n\nThe forefather of antibiotic medicine, Louis Pasteur, claimed garlic was as **(19)** ........ as penicillin in treating infections. Modern-day **(20)** ........ have proved that garlic can indeed kill bacteria and even some viruses, so it can be very useful for people who have coughs and colds.\n\nIn **(21)** ........ , some doctors believe that garlic can reduce blood **(22)** ........ .\n\nThe only **(23)** ........ to this truly amazing food is that the strong and rather **(24)** ........ smell of garlic is not the most pleasant!",
        questions: [
          { id: 17, baseWord: "PRODUCT", answer: "producer" },
          { id: 18, baseWord: "ILL", answer: "illness" },
          { id: 19, baseWord: "EFFECT", answer: "effective" },
          { id: 20, baseWord: "SCIENCE", answer: "scientists" },
          { id: 21, baseWord: "ADD", answer: "addition" },
          { id: 22, baseWord: "PRESS", answer: "pressure" },
          { id: 23, baseWord: "ADVANTAGE", answer: "disadvantage" },
          { id: 24, baseWord: "SPICE", answer: "spicy" }
        ]
      },
      "part-4": {
        type: "key-word-transformation",
        title: "Reading and Use of English - Part 4",
        instructions: "For questions 25-30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and six words, including the word given.",
        timeLimit: 90 * 60,
        questions: [
          { 
            id: 25, 
            text: "Joan was in favour of visiting the museum.", 
            keyword: "IDEA", 
            secondSentence: "Joan thought it would be .................................................. to the museum.", 
            answer: "A GOOD IDEA TO GO" 
          },
          { 
            id: 26, 
            text: "Arthur has the talent to become a concert pianist.", 
            keyword: "THAT", 
            secondSentence: "Arthur is so .................................................. could become a concert pianist.", 
            answer: "TALENTED THAT HE" 
          },
          { 
            id: 27, 
            text: "'Do you know when the match starts, Sally?' asked Mary.", 
            keyword: "IF", 
            secondSentence: "Mary asked Sally .................................................. time the match started.", 
            answer: "IF SHE KNEW WHAT" 
          },
          { 
            id: 28, 
            text: "I knocked for ages at Ruth's door but I got no reply.", 
            keyword: "LONG", 
            secondSentence: "I .................................................. knocking at Ruth's door but I got no reply.", 
            answer: "KNOCKED FOR A LONG TIME" 
          },
          { 
            id: 29, 
            text: "Everyone says that the band is planning to go on a world tour next year.", 
            keyword: "SAID", 
            secondSentence: "The band .................................................. planning to go on a world tour next year.", 
            answer: "IS SAID TO BE" 
          },
          { 
            id: 30, 
            text: "I'd prefer not to cancel the meeting.", 
            keyword: "CALL", 
            secondSentence: "I'd rather .................................................. the meeting.", 
            answer: "NOT CALL OFF" 
          }
        ]
      },
      "part-5": {
        type: "reading-comprehension",
        title: "Reading and Use of English - Part 5",
        instructions: "You are going to read a text. For questions 31-36, choose the answer (A, B, C or D) which you think fits best according to the text.",
        timeLimit: 90 * 60,
        passage: "We live on the island of Hale. It's about four kilometres long and two kilometres wide at its broadest point, and it's joined to the mainland by a causeway called the Stand – a narrow road built across the mouth of the river which separates us from the rest of the country. Most of the time you wouldn't know we're on an island because the river mouth between us and the mainland is just a vast stretch of tall grasses and brown mud. But when there's a high tide and the water rises a half a metre or so above the road and nothing can pass until the tide goes out again a few hours later, then you know it's an island.\n\nWe were on our way back from the mainland. My older brother, Dominic, had just finished his first year at university in a town 150 km away. Dominic's train was due in at five and he'd asked for a lift back from the station. Now, Dad normally hates being disturbed when he's writing (which is just about all the time), and he also hates having to go anywhere, but despite the typical sighs and moans – why can't he get a taxi? what's wrong with the bus? – I could tell by the sparkle in his eyes that he was really looking forward to seeing Dominic.\n\nSo, anyway, Dad and I had driven to the mainland and picked up Dominic from the station. He had been talking non-stop from the moment he'd slung his rucksack in the boot and got in the car. University this, university that, writers, books, parties, people, money, gigs…. And when I say talking, I don't mean talking as in having a conversation, I mean talking as in jabbering like a mad thing. I didn't like it … the way he spoke and waved his hands around as if he was some kind of intellectual or something. It was embarrassing. It made me feel uncomfortable – that kind of discomfort you feel when someone you like, someone close to you, suddenly starts acting like a complete idiot. And I didn't like the way he was ignoring me, either. For all the attention I was getting I might as well not have been there. I felt a stranger in my own car.\n\nAs we approached the island on that Friday afternoon, the tide was low and the Stand welcomed us home, stretched out before us, clear and dry, beautifully hazy in the heat – a raised strip of grey concrete bound by white railings and a low footpath on either side, with rough cobbled banks leading down to the water. Beyond the railings, the water was glinting with that wonderful silver light we sometimes get here in the late afternoon which lazes through to the early evening.\n\nWe were about halfway across when I saw the boy. My first thought was how odd it was to see someone walking on the Stand. You don't often see people walking around here. Between Hale and Moulton (the nearest town about thirty kilometres away on the mainland), there's nothing but small cottages, farmland, heathland and a couple of hills. So islanders don't walk because of that. If they're going to Moulton they tend to take the bus. So the only pedestrians you're likely to see around here are walkers or bird-watchers. But even from a distance I could tell that the figure ahead didn't fit into either of these categories. I wasn't sure how I knew, I just did.\n\nAs we drew closer, he became clearer. He was actually a young man rather than a boy. Although he was on the small side, he wasn't as slight as I'd first thought. He wasn't exactly muscular, but he wasn't weedy-looking either. It's hard to explain. There was just something sleek about him, a graceful strength that showed in his balance, the way he held himself, the way he walked…",
        questions: [
          {
            number: 31,
            question: "In the first paragraph, what is Caitlin's main point about the island?",
            options: {
              A: "It can be dangerous to try to cross from the mainland.",
              B: "It is much smaller than it looks from the mainland.",
              C: "It is only completely cut off at certain times.",
              D: "It can be a difficult place for people to live in."
            },
            answer: "C"
          },
          {
            number: 32,
            question: "What does Caitlin suggest about her father?",
            options: {
              A: "His writing prevents him from doing things he wants to with his family.",
              B: "His initial reaction to his son's request is different from usual.",
              C: "His true feelings are easily hidden from his daughter.",
              D: "His son's arrival is one event he will take time off for."
            },
            answer: "B"
          },
          {
            number: 33,
            question: "Caitlin emphasises her feelings of discomfort because she",
            options: {
              A: "is embarrassed that she doesn't understand what her brother is talking about.",
              B: "feels confused about why she can't relate to her brother any more.",
              C: "is upset by the unexpected change in her brother's behaviour.",
              D: "feels foolish that her brother's attention is so important to her."
            },
            answer: "C"
          },
          {
            number: 34,
            question: "In the fourth paragraph, what is Caitlin's purpose in describing the island?",
            options: {
              A: "To express her positive feelings about it",
              B: "To explain how the road was built",
              C: "To illustrate what they could see",
              D: "To describe her brother's reaction"
            },
            answer: "A"
          },
          {
            number: 35,
            question: "What point does Caitlin make about the island in the fifth paragraph?",
            options: {
              A: "locals think it is odd to walk anywhere.",
              B: "it is easier for people to take the bus than walk.",
              C: "people have everything they need on the island.",
              D: "there is nowhere in particular to walk to from the island."
            },
            answer: "B"
          },
          {
            number: 36,
            question: "What do we learn about Caitlin's reactions to the boy?",
            options: {
              A: "She felt his air of confidence contrasted with his physical appearance.",
              B: "She was able to come up with a reason for him being there.",
              C: "She realised her first impression of him was inaccurate.",
              D: "She thought she had seen him somewhere before."
            },
            answer: "A"
          }
        ]
      },
      "part-6": {
        type: "gapped-text",
        title: "Reading and Use of English - Part 6",
        instructions: "Choose the correct sentence (A–G) for each gap. One option is extra. This part tests your ability to understand the structure and cohesion of a text.",
        timeLimit: 90 * 60,
        passageTitle: "Ballet Training",
        passageDescription: "A former classical ballet dancer explains what ballet training actually involves.",
        passage: "What we ballet dancers do is instinctive, but instinct learnt through a decade of training... **(37)** ...capacity of the healthy human body.\n\nOver the course of my dancing life... **(38)** ...while maximum flexibility can still be achieved.\n\nThose first classes I took... **(39)** Even the leading dancers have to do it.\n\nThese classes serve two distinct purposes... **(40)** ...angles impossible to the average person.\n\nThe human body is designed to adapt... **(41)** This level of physical fluency doesn't hurt; it feels good.\n\n**(42)** But they should not be misled: there is a difference between hard work and hardship.",
        correctAnswers: {
          37: 'G',
          38: 'B', 
          39: 'F',
          40: 'A',
          41: 'E',
          42: 'D'
        },
        options: {
          A: "Through endless tries at the usual exercises and frequent failures, ballet dancers develop the neural pathways in the brain necessary to control accurate, fast and smooth movement.",
          B: "The ballet shoe offers some support, but the real strength is in the muscles, built up through training.",
          C: "As technology takes away activity from the lives of many, perhaps the ballet dancer's physicality is ever more difficult for most people to imagine.",
          D: "Ballet technique is certainly extreme but it is not, in itself, dangerous.",
          E: "The principle is identical in the gym – pushing yourself to the limit, but not beyond, will eventually bring the desired result.",
          F: "No one avoids this: it is ballet's great democratiser, the well established members of the company working alongside the newest recruits.",
          G: "It takes at least a decade of high-quality, regular practice to become an expert in any physical discipline."
        }
      },
      "part-7": {
        type: "multiple-matching",
        title: "Reading and Use of English - Part 7",
        instructions: "You are going to read a newspaper article about a young professional footballer. For questions 43–52, choose from the sections (A–D). The sections may be chosen more than once.",
        timeLimit: 90 * 60,
        passageTitle: "Young Professional Footballer",
        passageDescription: "A newspaper article about a young professional footballer and his father.",
        passages: {
          A: "It's my first time driving to Chelsea's training ground and I turn off slightly too early... career was nearly all over before it began.",
          B: "Gavin, himself a fine footballer – a member of the national team in his time – and now a professional coach... and got much stronger as well.",
          C: "Duncan takes up the story: 'The first half of that season I played in the youth team... you have to use your brain a lot more.'",
          D: "Not every kid gets advice from an ex-England player over dinner, nor their own private training sessions... That's for somebody else to decide.'"
        },
        correctAnswers: {
          43: 'A',
          44: 'C',
          45: 'B',
          46: 'D',
          47: 'C',
          48: 'B',
          49: 'C',
          50: 'B',
          51: 'D',
          52: 'D'
        },
        questions: {
          43: "states how surprised the writer was at Duncan's early difficulties?",
          44: "says that Duncan sometimes seems much more mature than he really is?",
          45: "describes the frustration felt by Duncan's father?",
          46: "says that Duncan is on course to reach a high point in his profession?",
          47: "suggests that Duncan caught up with his team-mates in terms of physical development?",
          48: "explains how Duncan was a good all-round sportsperson?",
          49: "gives an example of how Gavin reassured his son?",
          50: "mentions Duncan's current club's low opinion of him at one time?",
          51: "mentions a personal success despite a failure for the team?",
          52: "explains how Duncan and his father are fulfilling a similar role?"
        }
      }
    }
  }
};

export default exams;