/**
 * Improved B2 Reading Part 5 & Part 7 content for exams 1–6.
 */
import { mcq, match, PART7_INTRO } from './b2ReadingContentHelpers.mjs';
import { EXAMS_456_READING } from './b2ReadingExams456Content.mjs';

export const IMPROVED_B2_READING = {
  1: {
    part5: {
      partTitle: 'Reading and Use of English Part 5',
      directions:
        'You are going to read an article about urban wildlife. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      title: 'When Cities Make Room for Wild Neighbours',
      passage: `For decades, urban planners treated wildlife as something that belonged elsewhere. Parks were manicured, rivers were channelled, and any fox or hawk appearing on a housing estate was treated as an amusing anomaly. Yet in the past fifteen years, a quieter shift has taken place. Biologists, architects and community groups have begun asking whether cities can function as habitats rather than obstacles — and whether residents might benefit from sharing space with species they once only saw on television.

The change is partly practical. As green belts shrink and commuting patterns alter where people live, many municipalities face rising temperatures and flash flooding. Strategically planted trees, pocket meadows and restored wetlands do not merely attract birds; they retain rainwater, filter air and reduce the need for expensive drainage upgrades. In Rotterdam, engineers have linked rooftop gardens with corridors of native planting so that pollinators can move across districts that would otherwise be deserts of concrete. Similar schemes in Bristol and Lyon were initially dismissed as cosmetic, yet monitoring has shown measurable increases in insect diversity within three seasons.

Not every initiative succeeds, and the author of a recent municipal review cautions against treating biodiversity as a branding exercise. When councils install a single "bee hotel" beside a car park while continuing to spray pesticides on roadside verges, residents quickly notice the contradiction. Genuine progress, the review argues, depends on long-term maintenance budgets and staff training, not on one-off publicity events. Even so, several neighbourhoods that committed to five-year plans report that volunteers who joined planting days later became advocates for slower traffic and darker night lighting — issues they had not previously connected with ecology.

Public attitudes are more nuanced than headlines suggest. Some homeowners welcome hedgehogs under their sheds; others worry about litter from feeding stations or the legal implications if a protected species nests on their property. Apartment dwellers without gardens often feel excluded from discussions that assume everyone has a lawn to rewild. Community organisers in Manchester addressed this by converting unused garage plots into shared beds, with evening workshops explaining which plants support which insects. Attendance was highest among parents who wanted children to recognise species names, though a minority attended primarily because the sessions offered a social alternative to screen-based leisure.

Scientists emphasise that urban wildlife is not a nostalgic novelty. Species adapting to cities can evolve different behaviours within a few generations, providing living laboratories for research that would be impossible in remote reserves. One ornithologist interviewed for the article noted that city blackbirds sing at higher pitches to compete with traffic noise — a detail that illustrates how intimately human infrastructure shapes evolution. Meanwhile, epidemiologists monitor whether greater contact with animals increases certain health risks, reminding policymakers that coexistence requires data as well as enthusiasm. Several cities now publish annual biodiversity audits alongside budget statements, a practice the writer welcomes as a sign that ecology is being treated as infrastructure rather than ornament. Even sceptical councillors admit that residents increasingly ask for planting plans when new housing is proposed.

The writer concludes that the most promising projects share a modest ambition: they do not promise to return cities to pre-industrial wilderness, but to weave small, resilient patches of life through places dominated by pavement. Whether that satisfies romantic expectations is doubtful; whether it improves everyday urban experience may be easier to demonstrate.`,
      questions: [
        mcq(31, 'inference', 'What can be inferred about early scepticism towards urban green corridors?', {
          A: 'Experts believed pollinators could not survive above street level.',
          B: 'Critics assumed the schemes were mainly decorative rather than functional.',
          C: 'Residents feared that any planting would attract dangerous predators.',
          D: 'Architects refused to cooperate because of strict height regulations.',
        }, 'B'),
        mcq(32, 'attitude', "The writer's attitude towards one-off publicity projects is best described as", {
          A: 'enthusiastic, because they raise awareness quickly.',
          B: 'neutral, because outcomes depend on local leadership.',
          C: 'sympathetic, because councils lack scientific expertise.',
          D: 'critical, because they may mask a lack of sustained commitment.',
        }, 'D'),
        mcq(33, 'reference', 'In the third paragraph, what does "the contradiction" refer to?', {
          A: 'Claiming to support wildlife while continuing harmful maintenance practices.',
          B: 'Spending on drainage upgrades instead of community workshops.',
          C: 'Encouraging volunteers but refusing to reduce traffic speed.',
          D: 'Promoting rooftop gardens that cannot retain rainwater.',
        }, 'A'),
        mcq(34, 'detail', 'What point is made about the Manchester workshops?', {
          A: 'They were designed exclusively for professional gardeners.',
          B: 'They replaced all pesticide use within one season.',
          C: 'They attracted some participants mainly for social reasons.',
          D: 'They focused on legal advice for protected species.',
        }, 'C'),
        mcq(35, 'purpose', 'Why does the writer include the example of city blackbirds?', {
          A: 'To argue that traffic noise should be eliminated immediately.',
          B: 'To show how urban infrastructure can directly influence animal behaviour.',
          C: 'To prove that remote reserves are no longer necessary for research.',
          D: 'To suggest that residents should avoid feeding birds near roads.',
        }, 'B'),
        mcq(36, 'global', "Which statement best summarises the writer's overall view?", {
          A: 'Cities should aim to recreate untouched natural landscapes.',
          B: 'Urban wildlife projects are doomed without national legislation.',
          C: 'Small, well-maintained habitats may realistically improve city life.',
          D: 'Public enthusiasm is the only factor that determines success.',
        }, 'C'),
      ],
    },
    part7: {
      partTitle: 'Reading and Use of English Part 7',
      directions:
        'You are going to read four short texts about people learning a musical instrument. For questions 43–52, choose from the people A–D. The people may be chosen more than once.',
      matchingIntro: PART7_INTRO,
      sections: [
        { letter: 'A', name: 'Nora Chen', text: `Until last year, Nora's evenings were dominated by project deadlines in a busy design studio. Although she had loved listening to her mother practise the violin as a child, she had never believed she had time to learn. When a colleague suggested they attend a community class together, Nora agreed mainly because she hoped it would help her unwind after stressful weeks. Initially she found reading notation painfully slow, yet she persisted because each small improvement felt tangible. She still becomes anxious before playing in front of others, even at informal gatherings, and prefers practising alone in her kitchen before she feels ready to join the group. Looking back, she says the instrument has become a way of rebuilding confidence rather than proving talent.` },
        { letter: 'B', name: 'Rafael Ortiz', text: `Rafael played drums in a school band, but after leaving university he sold his kit and focused on office work. A decade later, hearing a live jazz set reminded him how much he missed the physical rhythm of playing. He bought a second-hand kit and joined an evening ensemble, discovering that rehearsing with other musicians motivated him far more than solitary practice ever had. Although he occasionally watches tutorial videos when a passage is tricky, he relies mainly on the conductor's feedback. Rafael admits that fitting rehearsals around family life is demanding; nevertheless, he values the discipline of arriving prepared each week. Since returning to drumming, he has noticed he listens more attentively to subtle details in everyday sounds. He now encourages his daughter to try percussion at school, though he insists she should choose her own instrument.` },
        { letter: 'C', name: 'Priya Kapoor', text: `Priya began piano lessons at seven and recently decided to prepare for a graded exam after a long break from formal study. Her teachers are encouraging, yet she often feels intimidated when classmates perform fluently from memory. To balance exam requirements with enjoyment, she sets aside twenty minutes each morning for scales and spends longer weekend sessions on pieces she chooses herself. Priya appreciates the structure exams provide, though she worries that focusing on assessment criteria may narrow her repertoire. Meanwhile, she has started accompanying a local choir, an experience that has taught her to adapt when singers change tempo. She hopes the qualification will confirm progress she can already hear, even if performance nerves remain. Her parents attend recitals whenever they can, which helps her feel less alone on stage.` },
        { letter: 'D', name: 'Jonas Lindholm', text: `Jonas taught himself guitar using online platforms after a friend lent him an inexpensive instrument. Without a fixed teacher, he progressed unevenly: chord changes came quickly, but theory remained confusing until he discovered a structured video series. He enjoys composing short pieces more than reproducing famous songs, and he records ideas on his phone during commutes. Although he considered joining a class, he prefers learning at his own pace and revisiting difficult sections without embarrassment. Jonas occasionally compares his progress with professional musicians online, which can be discouraging; however, he reminds himself that he plays primarily for relaxation. Recently he uploaded a collaboration with a singer he met through a forum, a step that surprised friends who knew him as reserved.` },
      ],
      questions: [
        match(43, 'Who took up an instrument again after leaving it aside for many years?', 'B'),
        match(44, 'Who depends most on self-directed online material rather than a regular teacher?', 'D'),
        match(45, 'Who is working towards a formal qualification in their instrument?', 'C'),
        match(46, 'Who still feels uneasy about playing when others are listening?', 'A'),
        match(47, 'Who highlights the bodily aspect of making music?', 'B'),
        match(48, 'Who was reminded of the instrument through a family member\'s playing?', 'A'),
        match(49, 'Who is especially motivated by practising alongside other musicians?', 'B'),
        match(50, 'Who tries to combine structured requirements with pieces chosen for pleasure?', 'C'),
        match(51, 'Who is more interested in writing original music than copying existing works?', 'D'),
        match(52, 'Who describes learning mainly as a way to recover confidence after pressure at work?', 'A'),
      ],
    },
  },
  2: {
    part5: {
      partTitle: 'Reading and Use of English Part 5',
      directions:
        'You are going to read an article about light pollution. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      title: 'The Case for Darker Skies',
      passage: `On a clear night in many rural areas, the Milky Way still appears as a faint river of light. In suburbs and cities, however, the same view is increasingly rare. Street lamps, advertising boards, floodlit sports grounds and even domestic security lighting combine to scatter brightness upward, creating a permanent glow that astronomers call skyglow. For most residents the effect seems harmless — even reassuring — yet researchers argue that it carries ecological, economic and cultural costs that rarely appear on municipal balance sheets.

The biological evidence is accumulating. Nocturnal animals depend on darkness to hunt, migrate and avoid predators. When artificial light extends the functional day, insects cluster around lamps and become easy prey, disrupting food chains that gardeners and farmers rely on. Sea turtles hatch on bright beaches and crawl towards illumination instead of the ocean; migrating birds collide with illuminated towers. A long-term study in southern England found that robins near continuous lighting began singing earlier in the season, potentially desynchronising breeding with food availability. Conservation groups therefore urge councils to install downward-facing shields and motion sensors rather than all-night floodlighting.

Human health is also implicated, though the writer notes that headlines sometimes oversimplify the science. Exposure to bright light at night can suppress melatonin, the hormone that helps regulate sleep, and shift workers in permanently lit environments report higher rates of fatigue. Nevertheless, epidemiologists caution that individual sensitivity varies, and that blaming insomnia solely on street lighting ignores screen use and noise. Still, several hospitals now dim corridor lights after visiting hours, citing modest improvements in patient rest as justification for the change.

Economically, waste light represents energy thrown into the sky. Retrofitting older lamps with LEDs cut electricity bills in many towns, yet planners discovered that cheaper white-blue LEDs often increased perceived brightness, prompting residents to request even more fittings. The most successful programmes paired efficient bulbs with dimming schedules tied to traffic patterns, demonstrating that savings depend on design rather than technology alone. Tourism officials in a few national parks have begun marketing "dark sky" weekends, suggesting that absence of light can attract visitors as effectively as spectacle once did.

Cultural loss may be the hardest cost to quantify. For centuries, navigation, agriculture and storytelling were tied to celestial rhythms. Today children may recognise constellations only from apps, not from experience. Artists and philosophers interviewed for the article did not demand total darkness; instead they asked for places where wonder remains possible. One teacher described taking students to a hill outside town: within minutes of switching off torches, pupils who had mocked the excursion fell silent.

Opposition to change is predictable. Retailers fear dimmer streets will reduce evening trade; sports clubs resist limits on floodlights; homeowners equate bright gardens with safety. Campaigners respond that glare can actually hide hazards by casting harsh shadows, and that crime statistics do not always correlate with lighting levels. The debate, the writer suggests, is less about choosing darkness over light than about asking what kind of illumination serves both safety and the wider environment. Progress, when it occurs, tends to be incremental: a park trial, a revised planning guideline, a community star-count event that makes an abstract problem visible. Such steps may not restore pristine night skies, yet they can reopen a relationship with darkness that many cities forgot they had lost.`,
      questions: [
        mcq(31, 'detail', 'According to the text, what has research shown about robins near continuous lighting?', {
          A: 'They have stopped migrating altogether.',
          B: 'They began singing earlier than usual in the breeding season.',
          C: 'They have moved permanently into city centres.',
          D: 'They have become unable to recognise natural predators.',
        }, 'B'),
        mcq(32, 'attitude', 'How does the writer treat media reports linking lighting to health problems?', {
          A: 'They are dismissed as entirely unfounded.',
          B: 'They are accepted without any reservation.',
          C: 'They are treated as partly valid but potentially oversimplified.',
          D: 'They are preferred to peer-reviewed hospital studies.',
        }, 'C'),
        mcq(33, 'inference', 'What can be inferred about some early LED replacement schemes?', {
          A: 'They reduced brightness so much that roads became unsafe.',
          B: 'They unintentionally increased light levels because of bulb colour choices.',
          C: 'They were abandoned before any data could be collected.',
          D: 'They focused exclusively on domestic security lighting.',
        }, 'B'),
        mcq(34, 'purpose', "Why does the writer mention the teacher's hill trip?", {
          A: 'To prove that children no longer use digital devices outdoors.',
          B: 'To illustrate how direct experience can alter attitudes towards the night sky.',
          C: 'To argue that schools should replace science lessons with astronomy.',
          D: 'To show that rural areas are unaffected by skyglow.',
        }, 'B'),
        mcq(35, 'reference', 'In the final paragraph, what does "such steps" refer to?', {
          A: 'Turning off all public lighting immediately.',
          B: 'Gradual measures like trials and revised guidelines.',
          C: 'Banning sports floodlighting nationwide.',
          D: 'Installing brighter lamps with motion sensors.',
        }, 'B'),
        mcq(36, 'global', "Which title best captures the writer's main argument?", {
          A: 'Why cities should eliminate artificial light entirely',
          B: 'How retailers profit from brighter streets',
          C: 'Rethinking urban lighting to balance safety with environmental costs',
          D: 'The superiority of rural life for professional astronomers',
        }, 'C'),
      ],
    },
    part7: {
      partTitle: 'Reading and Use of English Part 7',
      directions:
        'You are going to read four short texts about people who volunteer for conservation projects. For questions 43–52, choose from the people A–D. The people may be chosen more than once.',
      matchingIntro: PART7_INTRO,
      sections: [
        { letter: 'A', name: 'Helena Voss', text: `Helena joined a river-cleaning group after noticing plastic trapped among reeds near her flat. Although she had no scientific background, she appreciated the organisers' patience when explaining how litter moved downstream after storms. Weekend sessions were physically tiring, yet Helena enjoyed seeing bags pile up at the end of each day. She initially volunteered alone, but soon persuaded a neighbour to come along, and they now cycle to meeting points together. Helena has also attended evening talks on wetland birds, though she admits she attends partly for the company. Since starting, she has become more cautious about single-use packaging, a change her family teased at first but gradually adopted. Last spring she helped design a poster campaign that encouraged local cafés to offer refill stations, an initiative that drew more volunteers than she expected.` },
        { letter: 'B', name: 'Marcus Adeyemi', text: `Marcus volunteered during a university placement year, monitoring tree seedlings in a reforestation plot. The work required early starts and careful note-taking in damp fields, which contrasted sharply with his previous retail job. He valued the mentorship of an ecologist who showed him how to distinguish healthy growth from disease. Although Marcus considered a full-time career in conservation, he returned to finance after graduation; nevertheless, he still spends one Saturday a month maintaining the same plot. He describes the routine as grounding when spreadsheets dominate his week. Recently he donated equipment he no longer needed, hoping it would help newer volunteers. On rainy mornings he sometimes arrives before anyone else, enjoying the quiet before the team gathers. He now shares monthly photos with the ecologist, who uses them in training materials for other sites.` },
        { letter: 'C', name: 'Yuki Tanaka', text: `Yuki travelled abroad specifically to join a marine survey, counting coastal species during a two-week expedition. The schedule was intense: long walks on rocky shores followed by evenings entering data. Yuki had expected glamorous travel photography but discovered that science involved repetition and cold winds. Despite that, observing how local guides interpreted subtle tide patterns fascinated her. After returning home, she organised a beach litter survey inspired by the trip, recruiting classmates who had never considered fieldwork. Yuki now plans to study environmental policy, though she acknowledges that funding such courses may delay her decision. She keeps a notebook of species sketches that she revisits when coursework feels abstract. Presentations at her former school have persuaded several pupils to join the next local survey.` },
        { letter: 'D', name: 'Claire Dubois', text: `Claire coordinates a community orchard planted on former industrial land. When the project began, sceptics predicted vandalism, yet fruit trees now thrive behind low fencing open on volunteer days. Claire spends evenings answering emails about composting workshops, which attract families who rarely joined earlier tree-planting events. She emphasises that success depends on neighbours feeling ownership rather than watching experts work. Although Claire once worked in marketing, she rarely mentions it unless asked about publicity strategies. Last autumn she felt rewarded when children recognised apple varieties they had grafted themselves, even though harvesting left her exhausted for days afterwards. She is currently negotiating with the council to extend irrigation pipes before the next dry summer. Neighbours who initially complained about noise now request extra workshop places each month.` },
      ],
      questions: [
        match(43, 'Who was introduced to volunteering by noticing pollution close to home?', 'A'),
        match(44, 'Who continues contributing to the same project despite working in an unrelated profession?', 'B'),
        match(45, 'Who organised a local activity after returning from an overseas expedition?', 'C'),
        match(46, 'Who focuses on helping residents feel responsible for a shared green space?', 'D'),
        match(47, 'Who found the work physically demanding but satisfying when seeing immediate results?', 'A'),
        match(48, 'Who received guidance from a specialist that influenced their understanding of the task?', 'B'),
        match(49, 'Who had initially expected the experience to be more glamorous than it was?', 'C'),
        match(50, 'Who uses skills from a previous job when promoting community events?', 'D'),
        match(51, 'Who persuaded someone else to start volunteering with them?', 'A'),
        match(52, 'Who felt particularly rewarded when young participants recognised their own contribution?', 'D'),
      ],
    },
  },
  3: {
    part5: {
      partTitle: 'Reading and Use of English Part 5',
      directions:
        'You are going to read an article about repair culture. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.',
      title: 'The Quiet Revival of Fixing Things',
      passage: `When a kettle stops working, the path of least resistance is to order a replacement before the water has cooled. For decades, manufacturers and retailers encouraged that reflex: appliances became cheaper, warranties shorter, and repair shops scarcer on high streets. Yet in workshops from Lisbon to Leeds, a different habit is re-emerging. Volunteers and small businesses are teaching people to mend clothes, electronics and furniture, arguing that repair is not nostalgia but a practical response to waste, cost and the unease many feel about disposable culture.

Repair cafés — community events where specialists assist visitors with broken items — have spread rapidly. Participants pay little or nothing beyond donations, and the emphasis is on transferring skills rather than providing a drop-off service. Organisers report that success depends as much on atmosphere as on tools: when people expect judgement for owning an old device, they may never attend. One coordinator in Glasgow noted that the busiest evenings followed local media stories about landfill costs, suggesting that environmental anxiety can motivate action when abstract statistics fail. Still, regulars often return because they enjoy problem-solving together, not because they feel obliged to save the planet.

The movement faces structural barriers. Modern gadgets may be sealed with proprietary screws, while software updates deliberately slow older models. Farmers and independent mechanics have campaigned for "right to repair" legislation requiring manufacturers to publish manuals and spare parts. Industry lobbyists counter that open designs could aid copying and compromise safety, a debate the writer presents as unresolved rather than one-sided. Even when parts exist, they can cost nearly as much as new products, discouraging rational consumers. Advocates therefore pair legal campaigning with pressure on councils to favour repairable equipment in public contracts.

Surprisingly, repair culture intersects with social inclusion. Several cafés partner with refugee support groups, offering language practice through collaborative tasks. Elderly participants sometimes teach stitching techniques abandoned by younger generations, reversing the usual direction of tech help. A survey cited in the article found that attendees valued "being useful" as highly as saving money, implying that dignity matters alongside sustainability. Nevertheless, organisers caution against romanticising unpaid labour: skilled volunteers burn out when demand exceeds capacity, and some items genuinely cannot be saved.

Retailers are responding unevenly. One electronics chain now advertises in-store repair bays, yet critics argue the service mainly retains customers within the brand ecosystem. Fashion labels promote "care guides" online while continuing to release low-priced garments designed for short lifespans. The writer suggests consumers remain sceptical until warranties lengthen and spare parts become routinely available. Meanwhile, schools in a few countries have reintroduced basic tool skills, treating them as literacy for a material world rather than vocational nostalgia. Apprenticeship schemes linking cafés with local colleges are also emerging, though funding remains uneven across regions. A few manufacturers have begun pilot programmes lending tools to community groups, which advocates describe as promising but insufficient without legal guarantees.

The concluding tone is cautiously optimistic. Repair will not single-handedly reverse climate emissions or revive every town centre, but it can shift expectations about ownership and expertise. Learning to fix a lamp does not make someone an electrician, yet it may reduce the mystique that leads people to discard rather than investigate. In that sense, the revival is less about perfect restoration than about reopening questions we stopped asking when convenience became the default answer.`,
      questions: [
        mcq(31, 'inference', 'What can be inferred about attendance at the Glasgow repair café?', {
          A: 'It depended mainly on compulsory school assignments.',
          B: 'Local news about waste may have prompted new visitors to try the service.',
          C: 'It declined once spare parts became easier to obtain.',
          D: 'It attracted only people with professional repair qualifications.',
        }, 'B'),
        mcq(32, 'attitude', "How does the writer present the manufacturers' arguments against right-to-repair laws?", {
          A: 'As obviously dishonest and without merit.',
          B: 'As legally irrelevant to consumer rights.',
          C: 'As one perspective in a debate that remains unsettled.',
          D: 'As fully supported by independent safety research.',
        }, 'C'),
        mcq(33, 'detail', 'According to the survey mentioned, what did many attendees value highly?', {
          A: 'The opportunity to feel they were contributing something worthwhile.',
          B: 'The chance to replace old items with discounted new models.',
          C: 'The guarantee that every broken object could be restored.',
          D: 'The promise of paid employment in repair workshops.',
        }, 'A'),
        mcq(34, 'purpose', 'Why does the writer mention schools reintroducing tool skills?', {
          A: 'To prove that vocational training has replaced academic subjects.',
          B: 'To suggest that practical competence is again being seen as essential knowledge.',
          C: 'To argue that children should repair appliances instead of studying science.',
          D: 'To show that manufacturers now fund all technology lessons.',
        }, 'B'),
        mcq(35, 'reference', 'In the penultimate paragraph, who are "critics" mainly concerned about?', {
          A: 'Repair volunteers who lack formal qualifications.',
          B: 'Retail repair services that may serve brand loyalty more than openness.',
          C: 'Schools that refuse to teach stitching techniques.',
          D: 'Consumers who demand unlimited free spare parts.',
        }, 'B'),
        mcq(36, 'global', "Which statement best reflects the writer's overall conclusion?", {
          A: 'Repair culture will completely replace modern manufacturing within a decade.',
          B: 'Convenience remains preferable for most people regardless of waste.',
          C: 'Mending items may gradually change attitudes even if it cannot solve every problem alone.',
          D: 'Legislation is unnecessary if volunteers provide free services.',
        }, 'C'),
      ],
    },
    part7: {
      partTitle: 'Reading and Use of English Part 7',
      directions:
        'You are going to read four short texts about people who have taken up endurance sports. For questions 43–52, choose from the people A–D. The people may be chosen more than once.',
      matchingIntro: PART7_INTRO,
      sections: [
        { letter: 'A', name: 'Sandra Okonkwo', text: `Sandra began running after her doctor suggested she needed a hobby that would take her away from her desk. Her first attempts left her breathless within minutes, yet she appreciated how measurable progress felt: an extra lap, a slower pulse. Although colleagues warned that marathons would consume too much time, Sandra entered a half-marathon six months later. She trains early in the morning to avoid missing family breakfasts, and she keeps a diary noting sleep and nutrition, habits she once dismissed as obsessive. Sandra still dislikes crowded races but tolerates them because the training structure helps her manage work stress. She recently volunteered as a marshal at a charity event, discovering she enjoyed supporting others without competing herself. On rest days she walks with her children instead, explaining that recovery matters as much as distance.` },
        { letter: 'B', name: 'Michael Bauer', text: `Michael cycled across Europe during a sabbatical, carrying minimal luggage and staying in hostels. The journey was less about speed than about observing how landscapes changed gradually, a contrast with his former finance routine. He documented routes online, and several readers asked for advice about long-distance touring on a modest budget. Since returning, Michael commutes by bike whenever weather permits, though he admits winter rain tests his motivation. He joined a local club mainly for maintenance workshops rather than racing. Friends tease him about discussing tyre pressure at dinner, yet Michael insists the sport taught him patience he lacked in meetings. He is planning a shorter trip next summer with his teenage niece, hoping she will learn to read maps confidently.` },
        { letter: 'C', name: 'Leila Mansour', text: `Leila took up open-water swimming after recovering from a minor injury that ended her gym membership. Initially she feared cold lakes, but a coach taught breathing techniques that made distances feel manageable. She values the sport's quietness: no playlists, only birds and the sound of strokes. Leila participates in summer events raising funds for hospital equipment, a cause that matters after her injury. Although she trains with a group once a week, she prefers solitary dawn sessions before work. Some friends worry about safety, so she shares location alerts during longer swims. Leila describes the activity as mental as much as physical, a space where work emails cannot interrupt her. She has started mentoring newcomers who hesitate at the water's edge.` },
        { letter: 'D', name: 'James Whitfield', text: `James discovered climbing at an indoor wall near his office and soon progressed to outdoor routes at weekends. He enjoys solving route problems, comparing each climb to a puzzle that demands planning rather than brute force. After a fall that caused only bruises, he invested in additional safety training, an experience that made him respect limits he once ignored. James occasionally films climbs to review technique, though he rarely posts videos publicly. He appreciates how the sport mixes social trust with personal focus: partners rely on each other completely, yet success still depends on individual decisions. James believes climbing changed how he approaches difficult projects at work, though he avoids mentioning this in performance reviews. He now volunteers one evening a month introducing beginners to knot work.` },
      ],
      questions: [
        match(43, 'Who started their sport partly on medical advice to reduce sedentary habits?', 'A'),
        match(44, 'Who uses the activity mainly as uninterrupted time for reflection?', 'C'),
        match(45, 'Who shares practical knowledge gained during an extended journey?', 'B'),
        match(46, 'Who treats the sport as a problem-solving challenge rather than pure endurance?', 'D'),
        match(47, 'Who schedules training carefully to protect family routines?', 'A'),
        match(48, 'Who combines participation in charity events with personal training?', 'C'),
        match(49, 'Who joined a club primarily to learn technical maintenance skills?', 'B'),
        match(50, 'Who changed their behaviour after a frightening but minor accident?', 'D'),
        match(51, 'Who prefers exercising alone despite also attending group sessions?', 'C'),
        match(52, 'Who recently supported other participants without competing?', 'A'),
      ],
    },
  },
};

export function getImprovedPart(examSlot, partNumber) {
  const exam = IMPROVED_B2_READING[examSlot] || EXAMS_456_READING[examSlot];
  if (!exam) return null;
  const part = partNumber === 5 ? exam.part5 : partNumber === 7 ? exam.part7 : null;
  if (!part) return null;
  const questions = part.questions.map(({ answer, ...q }) => q);
  const modelAnswers = part.questions.map((q) => ({
    id: q.id,
    number: q.number,
    answer: q.answer,
  }));
  return { ...part, questions, modelAnswers };
}
