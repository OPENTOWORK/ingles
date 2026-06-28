/**
 * Improved B2 Reading Part 5 & Part 7 content for exams 4–6.
 * Imported by b2ReadingImprovedContent.mjs — validate before apply.
 */
import { mcq, match, PART7_INTRO } from './b2ReadingContentHelpers.mjs';

export const EXAMS_456_READING = {
  4: {
    part5: {
      partTitle: 'Reading and Use of English Part 5',
      directions:
        'You are going to read an article about urban food markets. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      title: 'When Markets Become Neighbourhood Anchors',
      passage: `For many city residents, the weekly market is less a shopping trip than a social calendar. Stalls that appear only on Saturday mornings transform empty squares into corridors of colour, noise and negotiation. Vendors call out prices in two languages, teenagers linger for street food after sport, and elderly couples walk the same route they have followed for decades. Unlike supermarkets optimised for speed, markets reward slowing down: you may discover that the olive seller remembers your preference for sharper oil, or that a baker will set aside a loaf if you are running late from work.

Urban planners once treated markets as picturesque leftovers from pre-modern commerce. Today, however, several municipalities regard them as infrastructure for community cohesion. When a covered market reopened after renovation in a mid-sized Spanish city, footfall in surrounding shops rose within months, suggesting that people who came for vegetables stayed for coffee. Researchers studying public space argue that regular face-to-face contact between neighbours — even brief greetings across a cheese counter — builds trust that no online forum can replicate. Markets therefore appear in urban strategies not merely as food sources but as places where strangers become familiar.

The economic case is more contested. Supporters note that small producers gain access to customers without expensive retail rents, while shoppers compare quality directly rather than trusting packaging. Critics counter that prices can exceed supermarket offers, excluding low-income families unless vouchers or subsidised stalls are provided. Some traders worry that popular markets attract investors who raise rents on nearby housing, turning authenticity into a marketing slogan. The writer acknowledges these tensions, emphasising that "community" should not become an excuse for ignoring affordability.

Environmental arguments have also entered the debate. Shorter supply chains can reduce transport emissions when producers sell within the region, though this benefit disappears if exotic fruit is flown in for spectacle. Reusable bags and minimal packaging appeal to environmentally conscious shoppers, yet market waste — damaged produce, disposable tasting cups — still accumulates. A pilot composting scheme linked to one weekly market reported promising results when stallholders agreed to separate organic material, illustrating that logistics matter as much as intentions.

Not every market thrives. Out-of-town retail parks and delivery apps have reduced casual visitors, and ageing vendor populations struggle to find successors willing to wake before dawn. Successful initiatives often combine tradition with adaptation: card payments beside cash-only habits, cooking demonstrations that attract younger crowds, partnerships with schools teaching children where food originates. When markets fail, the loss is felt culturally as much as commercially; residents describe empty squares as oddly silent, as if a rhythm has stopped.

Health departments have begun studying whether open-air trading affects diet in unexpected ways. When fresh produce is visible and affordable, some households report cooking more meals from scratch, though researchers stress that location alone cannot reverse processed-food habits. Market managers in one port city introduced tasting sessions for unfamiliar vegetables, pairing recipes in simple leaflets; uptake was modest but encouraged traders to source locally when possible. Such experiments suggest that markets can nudge behaviour without lecturing shoppers, provided information feels practical rather than moralising.

The writer concludes that markets survive when they offer more than transaction. They work best as flexible public rooms where commerce, conversation and local identity overlap — imperfect, noisy, sometimes expensive, yet capable of reminding cities that neighbourhoods are made of repeated small encounters rather than anonymous efficiency alone.`,
      questions: [
        mcq(31, 'inference', 'What can be inferred about how some planners used to view urban markets?', {
          A: 'They considered them essential for reducing online shopping.',
          B: 'They saw them mainly as charming relics rather than serious urban assets.',
          C: 'They believed markets could replace all supermarket supply chains.',
          D: 'They feared markets would prevent international tourism.',
        }, 'B'),
        mcq(32, 'attitude', 'How does the writer treat the idea of markets as symbols of "community"?', {
          A: 'It is rejected as meaningless in every context.',
          B: 'It is praised without acknowledging any drawbacks.',
          C: 'It is accepted only when affordability is also considered.',
          D: 'It is dismissed as irrelevant to environmental policy.',
        }, 'C'),
        mcq(33, 'reference', 'In the third paragraph, what does "these tensions" refer to?', {
          A: 'Conflicts between composting schemes and packaging rules.',
          B: 'Disagreements about whether markets help or harm low-income shoppers and local housing costs.',
          C: 'Arguments between teenagers and elderly customers.',
          D: 'Disputes over which language vendors should use.',
        }, 'B'),
        mcq(34, 'detail', 'What made the composting pilot successful according to the text?', {
          A: 'Stallholders agreed to separate organic waste consistently.',
          B: 'Shoppers stopped buying imported fruit entirely.',
          C: 'The council banned all disposable cups immediately.',
          D: 'Delivery apps were removed from the district.',
        }, 'A'),
        mcq(35, 'purpose', 'Why does the writer mention ageing vendors and fewer successors?', {
          A: 'To prove that markets are illegal in modern cities.',
          B: 'To illustrate a threat to the long-term survival of market culture.',
          C: 'To argue that only young entrepreneurs should receive licences.',
          D: 'To show that cooking demonstrations are ineffective.',
        }, 'B'),
        mcq(36, 'global', "Which statement best summarises the writer's overall view?", {
          A: 'Markets succeed when they function as social spaces as well as places to buy food.',
          B: 'Supermarkets should be banned to protect traditional traders.',
          C: 'Environmental benefits alone justify any market expansion.',
          D: 'Online forums have completely replaced face-to-face trust.',
        }, 'A'),
      ],
    },
    part7: {
      partTitle: 'Reading and Use of English Part 7',
      directions:
        'You are going to read four short texts about people who joined local clubs or groups. For questions 43–52, choose from the people A–D. The people may be chosen more than once.',
      matchingIntro: PART7_INTRO,
      sections: [
        { letter: 'A', name: 'Elena Marquez', text: `Elena had walked past the library noticeboard for months before finally copying the book club number. She joined hoping structured reading would pull her away from late-night scrolling, though she initially felt out of place among members who quoted novels from memory. The group meets fortnightly in a back room where tea arrives in chipped mugs and discussions occasionally drift far from the chosen chapter. Elena appreciates that nobody expects polished reviews; hesitant speakers are encouraged with genuine questions rather than judgement. She has started recommending titles to colleagues, a habit that has unexpectedly renewed conversations at work. Although she sometimes finishes books only hours before meetings, she values the deadline as motivation. Last month she volunteered to lead a session on a translated novel, an experience that left her nervous yet proud when members asked thoughtful follow-up questions.` },
        { letter: 'B', name: 'Tomás Reid', text: `Tomás received a camera as a birthday gift and asked at the community centre desk about beginners' groups before discovering a neighbourhood club that met upstairs. Members range from teenagers documenting skate parks to retirees photographing garden birds. Tomás learns as much from informal critiques as from occasional workshops on lighting. He admits comparing his images with experienced exhibitors can be discouraging, yet mentors remind him progress matters more than instant perfection. The club organises seasonal exhibitions in a café gallery, and Tomás felt astonished when strangers paused before his portrait of a street musician. He now carries his camera on daily walks, noticing details he previously ignored. Balancing editing sessions with family life remains challenging, but his partner supports the hobby after seeing how calmly he returns from outings. He recently helped organise a beginners' outing to the riverfront.` },
        { letter: 'C', name: 'Amira Hassan', text: `Amira sang in a school choir but had not performed publicly for years until a colleague mentioned an open rehearsal needing altos. She almost left during the warm-up, convinced her voice had rusted, yet the conductor's patient pacing persuaded her to stay. Weekly practices demand punctuality Amira sometimes struggles to maintain when work deadlines collide with Thursday evenings. Still, blending harmonies with strangers quickly became the highlight of her week. She describes the choir as socially broader than her usual circles, bringing together nurses, shop assistants and retired mechanics united by shared scores. Performances at care homes feel especially meaningful, though stage nerves persist before larger concerts. Amira has improved her breathing technique and sleeps better on practice nights. She recently encouraged her nephew to attend a youth session, hoping he might discover confidence she found unexpectedly herself.` },
        { letter: 'D', name: "Finn O'Brien", text: `Finn retired from plumbing with time he did not initially know how to fill. A neighbour invited him to a local historical society meeting where volunteers catalogued photographs of vanished shop fronts. Finn assumed the topic would bore him until he recognised the building that once housed his father's hardware store. He now spends mornings scanning documents and recording oral histories from older residents whose memories would otherwise disappear. Finn enjoys practical tasks — repairing display boards, arranging chairs — as much as research itself. Some members prefer academic lectures, yet Finn believes ordinary trades shaped the district as much as famous events. He occasionally leads walks pointing out architectural details commuters ignore. His grandchildren joined one walk and later asked questions he happily answered. Finn says belonging to the group gave retirement a rhythm he had not anticipated when leaving full-time work.` },
      ],
      questions: [
        match(43, 'Who joined after repeatedly seeing information posted in a public place?', 'A'),
        match(44, 'Who located a suitable group by asking staff at a local community centre?', 'B'),
        match(45, 'Who was drawn in after recognising a family connection to local history?', 'D'),
        match(46, 'Who nearly abandoned the first session because of lost confidence?', 'C'),
        match(47, 'Who has encouraged a younger relative to try a similar activity?', 'C'),
        match(48, 'Who feels especially rewarded when performing for audiences outside the group?', 'C'),
        match(49, 'Who contributes practical skills to support meetings and displays?', 'D'),
        match(50, 'Who has noticed colleagues responding positively to hobby-related suggestions?', 'A'),
        match(51, 'Who sometimes feels discouraged when comparing themselves with more experienced members?', 'B'),
        match(52, 'Who believes everyday local trades deserve as much attention as major historical events?', 'D'),
      ],
    },
  },
  5: {
    part5: {
      partTitle: 'Reading and Use of English Part 5',
      directions:
        'You are going to read an article about outdoor learning. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      title: 'Lessons the Landscape Can Teach',
      passage: `For generations, classrooms were assumed to be rooms with desks facing a board. Yet educators in several countries are re-examining that assumption, arguing that regular time outdoors can deepen understanding rather than distract from it. Nature-based learning does not mean abandoning curriculum goals; instead, teachers use parks, gardens and nearby waterways as living laboratories where abstract concepts acquire texture. A geometry lesson measured tree shadows; a literacy task recorded bird behaviour in precise verbs; a chemistry class tested soil acidity before planting seedlings. Students who struggled to sit still indoors often engage differently when movement is purposeful.

Advocates cite research suggesting that contact with green spaces can reduce stress and improve concentration, though the writer cautions against treating trees as miracle cures for underfunding. Outdoor programmes require planning: weather contingencies, safety briefings, transport costs and clothing policies all influence whether excursions happen once a term or every week. Schools with limited budgets partner with local environmental charities, sharing equipment and trained volunteers. Where such partnerships exist, attendance on field days often rises, partly because lessons feel novel and partly because parents remember their own childhood explorations fondly.

Sceptics raise legitimate concerns. Standardised tests still dominate accountability systems, and some head teachers fear losing instruction time if buses run late or wellies are forgotten. Teachers without science backgrounds may feel unprepared to manage risk outdoors, especially near water or steep paths. Professional development therefore matters as much as enthusiasm: workshops on facilitation techniques help staff translate outdoor experiences into assessable outcomes rather than unstructured play, however enjoyable play may be.

Equity issues also appear. Urban schools with little nearby green space cannot replicate the woodland programmes available to rural counterparts unless cities invest in pocket parks and rooftop beds. Critics note that photographing students among leaves can become promotional material without addressing chronic indoor overcrowding. Proponents respond that even small planted courtyards host insects and seasonal change worth observing, and that virtual simulations cannot replace the unpredictability of weather and wildlife.

The most sustainable programmes embed outdoor time into routine rather than treating it as a special treat. When students return weekly to the same plot, they notice growth cycles, failures and recovery — metaphors teachers exploit when discussing resilience. Community volunteers sometimes maintain gardens during holidays, preventing abandonment when term ends. A secondary school cited in the article reported fewer disciplinary incidents on days with scheduled outdoor modules, though researchers warned against attributing causality without longer studies.

Pilot projects in coastal towns have extended outdoor learning beyond biology. History classes mapped erosion using old photographs; language students interviewed park gardeners about seasonal vocabulary; art pupils sketched cloud formations before writing reflective journals. Teachers involved in these pilots report that cross-curricular links emerge naturally once staff share planning time, though timetabling remains a bureaucratic hurdle. Parents attending open afternoons often express surprise at how confidently quieter pupils explain observations when standing beside plants they tended themselves.

The writer concludes that outdoor learning succeeds when it is integrated, inclusive and honestly resourced. It will not replace every textbook, nor should it be marketed as a cheap alternative to repairing leaky roofs. Yet when students measure rain instead of only reading about it, education reconnects with the sensory world many had begun to forget behind screens and sealed windows. That reconnection, the writer suggests, is reason enough to keep trying.`,
      questions: [
        mcq(31, 'detail', 'According to the text, what happened in schools with environmental charity partnerships?', {
          A: 'Standardised tests were abolished immediately.',
          B: 'Attendance on field days often increased.',
          C: 'Teachers stopped using indoor classrooms entirely.',
          D: 'Transport costs disappeared completely.',
        }, 'B'),
        mcq(32, 'attitude', "How does the writer treat claims that green spaces automatically solve educational problems?", {
          A: 'They are treated as potentially helpful but not sufficient on their own.',
          B: 'They are accepted without reservation.',
          C: 'They are dismissed as pseudoscience.',
          D: 'They are preferred to all classroom teaching.',
        }, 'A'),
        mcq(33, 'inference', 'What can be inferred about head teachers who worry about losing instruction time?', {
          A: 'They oppose all contact with nature on principle.',
          B: 'They operate within systems that prioritise measurable test performance.',
          C: 'They refuse to allow students to wear outdoor clothing.',
          D: 'They believe gardens are too expensive for any school.',
        }, 'B'),
        mcq(34, 'reference', 'In the fourth paragraph, what does "such partnerships" refer to?', {
          A: 'Collaborations between schools and environmental charities.',
          B: 'Agreements between urban and rural head teachers.',
          C: 'Contracts with virtual simulation companies.',
          D: 'Deals with photographers promoting leaf imagery.',
        }, 'A'),
        mcq(35, 'purpose', 'Why does the writer mention a secondary school reporting fewer disciplinary incidents?', {
          A: 'To prove outdoor learning eliminates all behavioural problems permanently.',
          B: 'To provide an example while noting that causality remains uncertain.',
          C: 'To argue that discipline should replace academic assessment.',
          D: 'To suggest that test results are unrelated to behaviour.',
        }, 'B'),
        mcq(36, 'global', "Which title best reflects the writer's overall argument?", {
          A: 'Why schools should abandon textbooks forever',
          B: 'How rural schools outperform urban ones naturally',
          C: 'Integrating outdoor experience into education when properly planned and funded',
          D: 'The dangers of allowing students near water',
        }, 'C'),
      ],
    },
    part7: {
      partTitle: 'Reading and Use of English Part 7',
      directions:
        'You are going to read four short texts about people changing how they use technology. For questions 43–52, choose from the people A–D. The people may be chosen more than once.',
      matchingIntro: PART7_INTRO,
      sections: [
        { letter: 'A', name: 'Patricia Lowe', text: `Patricia accepted a colleague's challenge to spend one weekend without checking work email or social feeds. She expected boredom but instead finished a novel she had abandoned months earlier and cooked meals without photographing them. Returning online on Monday felt deliberately chosen rather than automatic. Patricia now keeps phones out of the bedroom and deletes non-essential notifications each month. Colleagues tease her about "digital detoxing," yet she notices meetings start more promptly when laptops stay closed. She still relies on messaging for family logistics and would not call herself anti-technology. Nevertheless, she schedules offline blocks in her calendar as seriously as appointments. Patricia recently lent a paperback to a friend who usually reads only on a tablet, sparking a conversation about attention spans. She admits relapses occur during stressful projects but treats them as signals to reset boundaries rather than personal failure.` },
        { letter: 'B', name: 'Omar Sait', text: `Omar's desk once displayed three screens simultaneously; today he carries a paper notebook for drafting reports. He switched after noticing he reread the same paragraph repeatedly without retaining details. Handwriting slowed his note-taking initially, yet Omar found ideas connected more clearly when he could sketch arrows between concepts. He still uses software for final versions but blocks distracting sites during focused hours with an app he can override in emergencies. Omar's manager questioned whether clients would perceive paper notes as outdated; Omar responded that delivery quality mattered more than visible gadgets. He occasionally photographs notebook pages to archive them digitally, a hybrid method that satisfies compliance requirements. Younger teammates ask whether the change saves time; Omar answers honestly that it trades speed for depth. He recently led a workshop sharing techniques for reducing context-switching during complex tasks.` },
        { letter: 'C', name: 'Greta Nielsen', text: `Greta removed social media applications from her phone after realising she opened them whenever conversation paused. The first week felt oddly quiet: no trending topics to reference, no photos from acquaintances she barely knew. Gradually she replaced scrolling with evening walks and calls to friends she had previously only liked online. Greta still uses a laptop for news and professional networking, distinguishing between tools that inform and habits that fragment attention. She joined a community sports team advertised on a physical noticeboard, an irony she laughs about with teammates. Family members worried she would miss event invitations; Greta established a group chat limited to close relatives instead. She does not preach to others about deleting apps, recognising that her job involves less public self-promotion than some careers demand. Still, she sleeps earlier and reports fewer headaches since the change.` },
        { letter: 'D', name: 'Luis Fernandez', text: `Luis teaches basic video-call skills to residents at a sheltered housing complex where many felt left behind by digital services. He volunteered after helping his grandfather join a medical appointment online, an experience that revealed how intimidating menus and passwords can be. Luis prepares laminated guides with large screenshots and repeats exercises patiently, celebrating small victories like successful mute buttons. Some learners progress to messaging grandchildren abroad; others prefer only essential tasks. Luis acknowledges frustration when updates rearrange interfaces overnight, forcing him to revise materials. He balances volunteering with a full-time warehouse job, often practising explanations during lunch breaks. Local council funding recently supplied tablets, though Luis argues training hours matter as much as hardware. He remains optimistic when a previously reluctant participant initiates a call independently, describing those moments as worth more than any statistics.` },
      ],
      questions: [
        match(43, 'Who changed habits after accepting a short-term challenge from someone at work?', 'A'),
        match(44, 'Who now uses handwriting for initial drafting despite previously relying on multiple screens?', 'B'),
        match(45, 'Who removed applications from a mobile device to break an automatic checking habit?', 'C'),
        match(46, 'Who helps others overcome difficulty with interfaces designed for frequent users?', 'D'),
        match(47, 'Who combines offline methods with occasional digital archiving of their work?', 'B'),
        match(48, 'Who found offline activities filled time previously spent on passive scrolling?', 'C'),
        match(49, 'Who treats scheduled offline periods as formally as other commitments?', 'A'),
        match(50, 'Who began volunteering after assisting a relative with an online appointment?', 'D'),
        match(51, 'Who has shared practical strategies with colleagues for maintaining focus?', 'B'),
        match(52, 'Who deliberately avoids telling others they should copy their exact approach?', 'C'),
      ],
    },
  },
  6: {
    part5: {
      partTitle: 'Reading and Use of English Part 5',
      directions:
        'You are going to read an article about small museums. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      title: 'Small Rooms, Big Memories',
      passage: `National institutions dominate headlines with blockbuster exhibitions, yet thousands of small museums operate in converted houses, former workshops and railway stations too modest for tourist brochures. These collections often began when a local enthusiast refused to let tools, uniforms or handwritten ledgers disappear into skips. What they lack in scale they frequently compensate for in specificity: a museum devoted to regional clockmaking may hold prototypes never displayed elsewhere; another preserves the daily records of a fishing cooperative whose boats no longer sail. Visitors expecting interactive screens sometimes find handwritten labels and creaking floorboards instead, an atmosphere defenders describe as authentic rather than outdated.

Running such museums demands improvisation. Paid staff are rare; retired teachers, engineers and shopkeepers volunteer as guides, opening doors on afternoons when funding allows. Grants cover roof repairs intermittently, so damp threatens paper archives unless dehumidifiers donated by supporters arrive in time. Partnerships with schools can revive interest: pupils interviewing elderly donors for oral history projects produce material curators could never gather alone. When collaborations work, children treat the museum as a living classroom rather than a dusty annex of homework.

The economic model is fragile. Admission fees stay low or disappear entirely on community days, reflecting a belief that local heritage should remain accessible. Gift shops sell modest postcards rather than lavish catalogues. Some councils provide small annual subsidies; others redirect budgets toward flagship attractions that advertise the city internationally. Advocates argue that small museums anchor districts visitors otherwise bypass, generating custom for cafés and bus routes. Detractors question whether public money should support collections with narrow appeal, suggesting digitisation could replace physical upkeep. Curators respond that handling an object — the weight of a helmet, the texture of a sampler — conveys meaning photographs flatten.

Duplication poses another challenge. When a town possesses both a general history museum and a themed textile archive, competition for volunteers and visitors can divide already limited resources. Successful regions coordinate open days, shared ticketing and rotating loans rather than treating each site as an island. A network in northern England reported increased repeat visits after museums cross-promoted temporary displays about industrial heritage, demonstrating that cooperation can amplify visibility without merging identities.

Digital presence helps but cannot substitute entirely for place. Virtual tours reached audiences abroad during closures, yet donations fell when footfall disappeared, revealing dependence on local loyalty. Crowdfunding campaigns occasionally fund urgent conservation, though organisers admit fatigue sets in if emergencies recur yearly. The writer notes that small museums survive through layered support: passionate individuals, cautious councils, curious schools and visitors who value continuity over spectacle.

Several curators interviewed for the article described unexpected emotional responses from visitors. A woman wept quietly before a display of miners' lamps because her grandfather had carried a similar model; a teenager admitted he had never considered how street names reflected forgotten industries. Such moments rarely occur in large institutions where crowds move quickly. Volunteers learn to allow silence rather than filling it with commentary, trusting objects to speak when labels provide context without overwhelming detail. Training sessions therefore emphasise listening skills alongside factual accuracy, a balance newcomers sometimes find difficult until they witness how visitors connect personal memories with modest exhibits.

The concluding argument is modest rather than triumphalist. These institutions will not replace major galleries, nor should they attempt identical ambitions. Their strength lies in preserving ordinary stories that national narratives overlook — the shift patterns of mill workers, the signage of vanished grocers, the hobbies recorded in club minute books. Keeping such memories visible requires ongoing attention, yet communities that invest often discover pride returning to streets they had begun to see only as backgrounds to daily commuting.`,
      questions: [
        mcq(31, 'inference', 'What can be inferred about some visitors\' initial reactions to small museums?', {
          A: 'They tend to assume the displays will match the scale of national institutions.',
          B: 'They may find them old-fashioned compared with high-tech exhibitions.',
          C: 'They may expect digital interactives and be surprised by simpler presentation.',
          D: 'They expect every collection to focus on international art.',
        }, 'C'),
        mcq(32, 'detail', 'According to the text, what happened when museums in northern England coordinated promotions?', {
          A: 'Repeat visits increased across participating sites.',
          B: 'All museums merged into a single building.',
          C: 'School partnerships were abolished.',
          D: 'Admission fees doubled permanently.',
        }, 'A'),
        mcq(33, 'attitude', 'How does the writer present the suggestion that digitisation could replace physical museums?', {
          A: 'It is treated as obviously correct for every collection.',
          B: 'It is praised as cheaper than any volunteer programme.',
          C: 'It is rejected because virtual tours rarely attract donors.',
          D: 'It is considered inadequate for conveying certain physical experiences.',
        }, 'D'),
        mcq(34, 'reference', 'In the final paragraph, what does "such memories" refer to?', {
          A: 'Blockbuster exhibitions in national galleries.',
          B: 'Everyday local histories that larger narratives tend to omit.',
          C: 'Digital fundraising campaigns abroad.',
          D: 'Interactive screens installed in railway stations.',
        }, 'B'),
        mcq(35, 'purpose', 'Why does the writer mention pupils interviewing elderly donors?', {
          A: 'To prove that homework should replace museum visits.',
          B: 'To show how schools can contribute material and renewed interest.',
          C: 'To argue that children should manage museum budgets.',
          D: 'To demonstrate that oral history is legally prohibited.',
        }, 'B'),
        mcq(36, 'global', "Which statement best summarises the writer's overall view?", {
          A: 'Local collections preserve valuable ordinary stories but need sustained community support.',
          B: 'Small museums should compete directly with major galleries for funding.',
          C: 'Digitisation makes physical museums unnecessary everywhere.',
          D: 'Volunteers alone can fund all conservation without council help.',
        }, 'A'),
      ],
    },
    part7: {
      partTitle: 'Reading and Use of English Part 7',
      directions:
        'You are going to read four short texts about people preparing for public performances or events. For questions 43–52, choose from the people A–D. The people may be chosen more than once.',
      matchingIntro: PART7_INTRO,
      sections: [
        { letter: 'A', name: 'Diana Cho', text: `Diana had written poetry privately for years before a friend submitted her name to an open-mic night without asking. She considered refusing, yet curiosity outweighed embarrassment. Rehearsing at home felt safe; standing under café lights with a microphone revealed trembling hands she could not entirely hide. The audience applauded generously, though Diana fixated on one line she had rushed. She joined a small writers' circle that meets to critique drafts aloud, discovering that constructive feedback hurt less than she feared. Performing still drains her energy, so she limits public readings to quarterly events. Diana keeps a folder of printed programmes as reminders that courage accumulates gradually. She recently mentored a teenager nervous about reading at a school assembly, sharing breathing exercises that help her own pulse slow. Colleagues at the pharmacy where she works were surprised to learn about her hobby, which Diana prefers to keep separate from professional identity.` },
        { letter: 'B', name: 'Marco Bellini', text: `Marco auditioned for a village theatre group after retiring from accountancy, expecting light comedy and instead receiving a role requiring an emotional monologue. Memorising lines proved easier than conveying grief convincingly; the director assigned exercises borrowed from professional training courses. Marco rehearses in the garden shed so neighbours are not disturbed, timing pauses with a metronome he bought online. Opening night arrived with familiar faces in the front rows, a comfort and a pressure simultaneously. He stumbled once, recovered, and later received notes praising authenticity over perfection. Marco now handles props backstage when not acting, enjoying camaraderie during set construction. He believes amateur theatre succeeds when participants support one another rather than competing for applause. His daughter filmed a rehearsal for family abroad, a recording Marco watched once and deleted, preferring live memory.` },
        { letter: 'C', name: 'Isabel Wright', text: `Isabel volunteered to host a charity auction after organising school fundraisers for a decade. She underestimated how formal the venue would feel: spotlights, numbered paddles, an audience dressed for dinner rather than playground cake sales. Preparing introductions for each lot required researching donors' stories so bidding felt personal rather than transactional. Isabel practised transitions aloud while walking the dog, amused by her own seriousness. On the evening, a technical glitch silenced the microphone briefly; Isabel continued projecting until technicians restored sound, earning laughter and relief. The event raised enough to refurbish a community kitchen, a result she cites when friends ask why she invests time. She still prefers planning behind the scenes to being photographed, yet acknowledges public speaking skills help her advocate for local projects at council meetings.` },
        { letter: 'D', name: "Ryan O'Connell", text: `Ryan agreed to address supporters before a charity marathon though public speaking terrified him more than the distance itself. A coach suggested structuring the speech around three short stories rather than statistics alone. Ryan recorded practice versions on his phone, wincing at filler words but noticing improvement across repetitions. He focused on thanking volunteers explicitly, aware that audiences respond to gratitude when authentically expressed. On race morning, wind scattered his notes; Ryan abandoned the script and spoke briefly from memory, which listeners later described as sincere. Running the marathon afterward felt almost secondary, though finishing mattered personally. He posted no video online, preferring conversations with donors who attended. Ryan now trains newcomers to fundraising teams on simple presentation techniques, emphasising preparation without demanding theatrical flair.` },
      ],
      questions: [
        match(43, 'Who became involved in a public event without having chosen to enter initially?', 'A'),
        match(44, 'Who uses a private outbuilding to rehearse without disturbing neighbours?', 'B'),
        match(45, 'Who prepared spoken links by researching personal stories behind each item?', 'C'),
        match(46, 'Who adapted when equipment failed during the live event?', 'C'),
        match(47, 'Who structured a talk around narratives rather than figures alone?', 'D'),
        match(48, 'Who deliberately limits how often they appear in front of an audience?', 'A'),
        match(49, 'Who supports others backstage when not performing themselves?', 'B'),
        match(50, 'Who avoided keeping a video record of a rehearsal or speech?', 'B'),
        match(51, 'Who has guided someone younger through similar nerves about speaking?', 'A'),
        match(52, 'Who discovered that speaking skills later helped official advocacy work?', 'C'),
      ],
    },
  },
};
