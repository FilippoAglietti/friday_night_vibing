import type {
  Curriculum,
  Module,
  Lesson,
  QuizQuestion,
  BonusResource,
} from "@/types/curriculum";

// ---------------------------------------------------------------------------
// Session 1 — Understand: Mapping the Problem Space
// ---------------------------------------------------------------------------

const session1Lessons: Lesson[] = [
  {
    id: "ds-l1-1",
    title: "Stakeholder Interviews That Actually Reveal Insights",
    description:
      "Learn how to conduct fast, structured interviews that surface the real problems hiding behind surface-level requests.",
    format: "interactive",
    durationMinutes: 50,
    order: 0,
    objectives: [
      "Conduct a 15-minute stakeholder interview using a structured script",
      "Identify hidden assumptions and unspoken constraints from interview notes",
    ],
    keyPoints: [
      "Start every interview with 'Tell me about the last time...' to ground answers in real events",
      "Use the 5 Whys technique to push past surface-level answers",
      "Capture direct quotes — they carry more weight than your interpretation",
      "Time-box interviews to 15 minutes to keep energy high and force prioritization",
    ],
    content: "",
    suggestedResources: [
      {
        title: "The Sprint Book — Interview Chapter",
        url: "https://www.thesprintbook.com",
        type: "book",
      },
      {
        title: "IDEO Design Kit: Interview Guide",
        url: "https://www.designkit.org/methods/interview",
        type: "article",
      },
    ],
  },
  {
    id: "ds-l1-2",
    title: "User Journey Mapping in 30 Minutes",
    description:
      "Build a shared, visual map of the user experience that exposes pain points, drop-offs, and moments of delight.",
    format: "project",
    durationMinutes: 50,
    order: 1,
    objectives: [
      "Create a complete user journey map from trigger event to goal completion",
      "Identify the top 3 pain points and opportunity areas on the map",
    ],
    keyPoints: [
      "A journey map is a story, not a flowchart — keep it linear and time-based",
      "Plot emotional highs and lows beneath each step to reveal friction",
      "Use real quotes from stakeholder interviews as evidence on the map",
      "Focus on the current experience first — save ideation for Session 2",
      "Color-code sticky notes: blue for actions, pink for pain points, green for opportunities",
    ],
    content: "",
    suggestedResources: [
      {
        title: "NNG: Journey Mapping 101",
        url: "https://www.nngroup.com/articles/journey-mapping-101/",
        type: "article",
      },
      {
        title: "FigJam Journey Map Template",
        url: "https://www.figma.com/community/file/journey-map-template",
        type: "template",
      },
    ],
  },
  {
    id: "ds-l1-3",
    title: "Writing 'How Might We' Questions That Drive Action",
    description:
      "Transform pain points into springboard questions that frame problems as opportunities worth solving.",
    format: "interactive",
    durationMinutes: 44,
    order: 2,
    objectives: [
      "Reframe pain points as actionable 'How Might We' questions",
      "Prioritize HMW questions by impact and feasibility",
    ],
    keyPoints: [
      "A good HMW question is narrow enough to act on but broad enough to allow creative solutions",
      "Avoid embedding solutions in the question — 'HMW build a chatbot' is too prescriptive",
      "Generate at least 10 HMWs before voting on the top 3",
      "The winning HMW becomes your sprint's design brief for Session 2",
    ],
    content: "",
    suggestedResources: [
      {
        title: "Google Design Sprint Kit — HMW",
        url: "https://designsprintkit.withgoogle.com/methodology/phase1-understand/how-might-we",
        type: "article",
      },
    ],
  },
];

const session1Quiz: QuizQuestion[] = [
  {
    id: "ds-q1-1",
    type: "multiple-choice",
    question:
      "During a stakeholder interview, which opening question is most likely to surface actionable insights?",
    options: [
      "What features would you like us to build?",
      "Tell me about the last time you experienced this problem.",
      "On a scale of 1-10, how important is this issue?",
      "Do you think the current solution works well?",
    ],
    correctAnswer:
      "Tell me about the last time you experienced this problem.",
    explanation:
      "Experience-based questions ground the conversation in real events rather than opinions or hypotheticals, producing concrete details you can design around.",
    points: 1,
  },
  {
    id: "ds-q1-2",
    type: "multiple-choice",
    question: "What makes a 'How Might We' question ineffective?",
    options: [
      "It references a specific user pain point",
      "It embeds a specific solution in the question",
      "It is narrow enough to act on within one sprint",
      "It mentions a measurable user outcome",
    ],
    correctAnswer: "It embeds a specific solution in the question",
    explanation:
      "A HMW question should frame the problem as an opportunity without prescribing the solution. Embedding a solution (e.g., 'HMW add a chatbot...') closes off creative exploration.",
    points: 1,
  },
  {
    id: "ds-q1-3",
    type: "multiple-choice",
    question:
      "On a user journey map, what does the emotional layer help you identify?",
    options: [
      "The technical architecture behind each step",
      "Which team owns each part of the process",
      "Moments of frustration and friction that are design opportunities",
      "The total number of clicks in the user flow",
    ],
    correctAnswer:
      "Moments of frustration and friction that are design opportunities",
    explanation:
      "The emotional layer transforms a process diagram into a design tool by revealing where users feel frustrated, confused, or delighted — the exact moments where design can make the biggest difference.",
    points: 1,
  },
];

const session1: Module = {
  id: "ds-m1",
  title: "Session 1: Understand — Mapping the Problem Space",
  description:
    "Ground your sprint in real user problems through structured interviews, journey mapping, and 'How Might We' framing. By the end of this session, your team will share a single, evidence-based understanding of the problem you are solving.",
  objectives: [
    "Conduct rapid stakeholder interviews that surface actionable insights",
    "Build a shared journey map that visualizes the current user experience",
    "Frame the sprint's design challenge as a focused 'How Might We' question",
  ],
  lessons: session1Lessons,
  quiz: session1Quiz,
  order: 0,
  durationMinutes: 144,
};

// ---------------------------------------------------------------------------
// Session 2 — Diverge: Generating Bold Solutions
// ---------------------------------------------------------------------------

const session2Lessons: Lesson[] = [
  {
    id: "ds-l2-1",
    title: "Lightning Demos: Stealing From the Best",
    description:
      "Scan the landscape for existing solutions — from competitors and completely different industries — to fuel your own ideas.",
    format: "discussion",
    durationMinutes: 45,
    order: 0,
    objectives: [
      "Identify 3-5 existing products or experiences that solve a related problem",
      "Extract reusable design patterns from lightning demo examples",
    ],
    keyPoints: [
      "Spend 3 minutes max per demo — brevity forces you to highlight only what matters",
      "Look outside your industry for the freshest inspiration",
      "Capture the 'big idea' from each demo on a sticky note for the team wall",
      "Lightning demos are about patterns, not copying — steal the principle, not the UI",
    ],
    content: "",
    suggestedResources: [
      {
        title: "Google Design Sprint Kit — Lightning Demos",
        url: "https://designsprintkit.withgoogle.com/methodology/phase2-sketch/lightning-demos",
        type: "article",
      },
      {
        title: "Sprint Book: Tuesday Chapter (Sketch)",
        url: "https://www.thesprintbook.com",
        type: "book",
      },
    ],
  },
  {
    id: "ds-l2-2",
    title: "Sketching Solutions: From Doodles to Concepts",
    description:
      "Use structured sketching techniques to turn abstract ideas into concrete, visual solution concepts that anyone on the team can understand.",
    format: "project",
    durationMinutes: 50,
    order: 1,
    objectives: [
      "Use the four-step sketching process to develop a detailed solution concept",
      "Create a solution sketch clear enough for someone outside your team to understand",
    ],
    keyPoints: [
      "Sketching is thinking, not art — stick figures and boxes are perfectly fine",
      "Work silently during the sketch phase to avoid groupthink",
      "Each sketch should tell a story: what does the user see, do, and feel at each step?",
      "Include annotations — arrows, labels, and notes that explain the flow",
      "Title your sketch with a memorable name so the team can reference it easily",
    ],
    content: "",
    suggestedResources: [
      {
        title: "NNG: UX Sketching",
        url: "https://www.nngroup.com/articles/ux-sketching/",
        type: "article",
      },
    ],
  },
  {
    id: "ds-l2-3",
    title: "Crazy 8s: Rapid Ideation Under Pressure",
    description:
      "Push past your first idea and explore wild alternatives with the Crazy 8s speed-sketching exercise.",
    format: "interactive",
    durationMinutes: 49,
    order: 2,
    objectives: [
      "Generate 8 distinct solution variations in 8 minutes",
      "Recognize how time pressure unlocks more creative and divergent thinking",
    ],
    keyPoints: [
      "Your first idea is rarely your best — Crazy 8s forces you past the obvious",
      "One minute per panel means you cannot overthink — trust your instincts",
      "Aim for variety, not quality — at least 3 of your 8 should feel 'out there'",
      "After Crazy 8s, circle the one panel that excites you most for your solution sketch",
    ],
    content: "",
    suggestedResources: [
      {
        title: "AJ&Smart: How to Crazy 8s",
        url: "https://www.ajsmart.com/crazy-eights",
        type: "article",
      },
      {
        title: "Design Sprint Kit — Crazy 8s",
        url: "https://designsprintkit.withgoogle.com/methodology/phase2-sketch/crazy-8s",
        type: "article",
      },
    ],
  },
];

const session2Quiz: QuizQuestion[] = [
  {
    id: "ds-q2-1",
    type: "multiple-choice",
    question:
      "What is the primary purpose of lightning demos in a design sprint?",
    options: [
      "To copy competitor features directly into your product",
      "To extract reusable design patterns from existing solutions across industries",
      "To prove that your idea has never been tried before",
      "To create a comprehensive competitive analysis document",
    ],
    correctAnswer:
      "To extract reusable design patterns from existing solutions across industries",
    explanation:
      "Lightning demos are about finding transferable patterns and principles, not copying UIs. The best inspiration often comes from outside your own industry.",
    points: 1,
  },
  {
    id: "ds-q2-2",
    type: "multiple-choice",
    question: "Why is the Crazy 8s exercise time-boxed to one minute per panel?",
    options: [
      "To save time so the sprint finishes early",
      "Because detailed sketches are not useful in design sprints",
      "To bypass the inner critic and force divergent, less obvious thinking",
      "To make sure everyone produces the same number of ideas",
    ],
    correctAnswer:
      "To bypass the inner critic and force divergent, less obvious thinking",
    explanation:
      "Extreme time pressure prevents overthinking and pushes participants past their first (usually safest) idea, unlocking more creative and unexpected solutions.",
    points: 1,
  },
  {
    id: "ds-q2-3",
    type: "multiple-choice",
    question:
      "During the solution sketch phase, why should participants work silently and individually?",
    options: [
      "Because talking wastes time in a sprint",
      "To prevent groupthink and ensure a diverse range of independent ideas",
      "Because sketching requires deep concentration and any noise is distracting",
      "To create a competitive atmosphere that motivates better work",
    ],
    correctAnswer:
      "To prevent groupthink and ensure a diverse range of independent ideas",
    explanation:
      "Silent, independent work ensures each person develops their own concept without being anchored by someone else's idea. Diversity of solutions is the goal of the diverge phase.",
    points: 1,
  },
];

const session2: Module = {
  id: "ds-m2",
  title: "Session 2: Diverge — Generating Bold Solutions",
  description:
    "Expand the solution space through structured inspiration gathering, rapid sketching, and the high-energy Crazy 8s exercise. By the end of this session, every team member will have a detailed solution sketch ready for voting.",
  objectives: [
    "Gather cross-industry inspiration through lightning demos",
    "Generate a wide range of solution concepts through structured sketching",
    "Develop a detailed solution sketch that answers the sprint's HMW question",
  ],
  lessons: session2Lessons,
  quiz: session2Quiz,
  order: 1,
  durationMinutes: 144,
};

// ---------------------------------------------------------------------------
// Session 3 — Converge: Deciding What to Build
// ---------------------------------------------------------------------------

const session3Lessons: Lesson[] = [
  {
    id: "ds-l3-1",
    title: "The Art Museum: Silent Critique and Dot Voting",
    description:
      "Review all solution sketches as a group using a structured, bias-free voting method that surfaces the strongest ideas without letting the loudest voice win.",
    format: "interactive",
    durationMinutes: 48,
    order: 0,
    objectives: [
      "Evaluate solution sketches objectively using heat-map dot voting",
      "Identify the strongest concepts and components across all team sketches",
    ],
    keyPoints: [
      "Display all sketches anonymously on the wall — no names, no pitches",
      "Use small dot stickers to vote on specific elements, not entire sketches",
      "Clusters of dots reveal which moments resonate across the team",
      "The decider's vote carries extra weight in breaking ties",
      "Silence during voting prevents anchoring bias",
    ],
    content: "",
    suggestedResources: [
      {
        title: "Design Sprint Kit — Decide Phase",
        url: "https://designsprintkit.withgoogle.com/methodology/phase3-decide",
        type: "article",
      },
    ],
  },
  {
    id: "ds-l3-2",
    title: "Storyboarding: Scripting the Prototype",
    description:
      "Combine the winning ideas into a single, step-by-step storyboard that serves as the blueprint for your prototype.",
    format: "project",
    durationMinutes: 50,
    order: 1,
    objectives: [
      "Build a 6-8 panel storyboard that sequences the complete user experience",
      "Translate abstract concepts into concrete, buildable screens and interactions",
    ],
    keyPoints: [
      "A storyboard is your prototype's blueprint — every panel becomes a screen or state",
      "Start with the opening scene: how does the user first encounter your solution?",
      "Include decision points where the user makes a choice",
      "End with the success moment and what happens after",
      "Keep it rough — detail comes in the prototype phase",
    ],
    content: "",
    suggestedResources: [
      {
        title: "Sprint Stories: Storyboarding for Design Sprints",
        url: "https://medium.com/design-sprint-academy/storyboarding-in-design-sprints-a24f5e5b6e3f",
        type: "article",
      },
      {
        title: "NNG: Storyboards in UX",
        url: "https://www.nngroup.com/articles/storyboards-visualize-ideas/",
        type: "article",
      },
    ],
  },
  {
    id: "ds-l3-3",
    title: "Decision Frameworks: When the Team Cannot Agree",
    description:
      "Learn practical decision-making frameworks that keep sprints moving when opinions diverge and stakes feel high.",
    format: "video",
    durationMinutes: 46,
    order: 2,
    objectives: [
      "Apply the 2x2 prioritization matrix to evaluate competing ideas",
      "Use the 'Note and Vote' technique to resolve team disagreements quickly",
    ],
    keyPoints: [
      "Disagreement is healthy — it means the team has diverse perspectives",
      "Use frameworks to make decisions transparent, not to avoid hard conversations",
      "The 2x2 matrix (Impact vs. Effort) is the fastest way to prioritize features",
      "When all else fails, the decider decides — that is their role in the sprint",
    ],
    content: "",
    suggestedResources: [
      {
        title: "NNG: Prioritization Matrices for UX",
        url: "https://www.nngroup.com/articles/prioritization-matrices/",
        type: "article",
      },
      {
        title: "Jake Knapp — Making Decisions in Sprints",
        url: "https://jakeknapp.com/sprint",
        type: "article",
      },
    ],
  },
];

const session3Quiz: QuizQuestion[] = [
  {
    id: "ds-q3-1",
    type: "multiple-choice",
    question:
      "In the Art Museum method, why are solution sketches displayed anonymously?",
    options: [
      "To save time during the presentation phase",
      "To prevent seniority bias and ensure ideas are judged on merit alone",
      "Because the sketches are too rough to attribute to anyone",
      "To create a fun guessing game for the team",
    ],
    correctAnswer:
      "To prevent seniority bias and ensure ideas are judged on merit alone",
    explanation:
      "Anonymous display ensures that a junior designer's brilliant idea gets the same consideration as the CEO's sketch. The goal is to evaluate concepts, not people.",
    points: 1,
  },
  {
    id: "ds-q3-2",
    type: "multiple-choice",
    question:
      "A storyboard panel shows 'and then the user gets value.' Why is this a problem?",
    options: [
      "It is too short for a storyboard panel",
      "It does not specify which team member builds it",
      "It is too vague to prototype — there is no concrete screen or interaction to build",
      "Storyboards should not mention users directly",
    ],
    correctAnswer:
      "It is too vague to prototype — there is no concrete screen or interaction to build",
    explanation:
      "Every storyboard panel must be concrete enough that a prototyper can build it without guessing. Vague panels create gaps that slow down the prototype phase.",
    points: 1,
  },
];

const session3: Module = {
  id: "ds-m3",
  title: "Session 3: Converge — Deciding What to Build",
  description:
    "Narrow the field of ideas through structured critique, democratic voting, and decisive storyboarding. By the end of this session, your team will have a clear, panel-by-panel blueprint for the prototype.",
  objectives: [
    "Evaluate solution sketches objectively using the Art Museum and dot voting methods",
    "Combine winning ideas into a single storyboard ready for prototyping",
  ],
  lessons: session3Lessons,
  quiz: session3Quiz,
  order: 2,
  durationMinutes: 144,
};

// ---------------------------------------------------------------------------
// Session 4 — Prototype: Building a Realistic Facade
// ---------------------------------------------------------------------------

const session4Lessons: Lesson[] = [
  {
    id: "ds-l4-1",
    title: "Rapid Prototyping Principles: Fake It Till You Test It",
    description:
      "Understand the philosophy behind sprint prototypes — they are disposable facades built to learn, not production-ready software.",
    format: "video",
    durationMinutes: 45,
    order: 0,
    objectives: [
      "Distinguish between a sprint prototype and a production MVP",
      "Apply the 'Goldilocks quality' principle — realistic enough to test, cheap enough to throw away",
    ],
    keyPoints: [
      "A sprint prototype is a facade, not a product — it only needs to look real for 30 minutes of testing",
      "Goldilocks quality: too polished wastes time, too rough confuses testers",
      "Divide and conquer — assign each team member a section of the storyboard to build",
      "Use real content (real text, real images) — Lorem Ipsum kills believability",
      "Plan for the 'happy path' first, then add one error state if time allows",
    ],
    content: "",
    suggestedResources: [
      {
        title: "Figma: Getting Started Guide",
        url: "https://help.figma.com/hc/en-us/categories/360002051613-Getting-Started",
        type: "tool",
      },
      {
        title: "Google Design Sprint Kit — Prototype",
        url: "https://designsprintkit.withgoogle.com/methodology/phase4-prototype",
        type: "article",
      },
    ],
  },
  {
    id: "ds-l4-2",
    title: "Figma for Sprint Prototypes: A Crash Course",
    description:
      "Learn the minimum set of Figma skills you need to build a clickable prototype in under 2 hours, even if you have never opened the tool before.",
    format: "interactive",
    durationMinutes: 55,
    order: 1,
    objectives: [
      "Create frames, add components, and build interactive links in Figma",
      "Build a 3-5 screen clickable prototype flow from your storyboard",
    ],
    keyPoints: [
      "Use Frames, not artboards — frames auto-resize and support auto-layout",
      "Figma Community has thousands of free UI kits — do not design from scratch",
      "Prototype mode lets you link hotspots between frames with simple click interactions",
      "Use the 'Smart Animate' transition for a polished feel with zero effort",
      "Share your prototype with a single link — no downloads, no installs for testers",
    ],
    content: "",
    suggestedResources: [
      {
        title: "Figma Prototyping Tutorial",
        url: "https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma",
        type: "tool",
      },
      {
        title: "Untitled UI — Free Figma UI Kit",
        url: "https://www.figma.com/community/file/1020079203222518115",
        type: "template",
      },
    ],
  },
  {
    id: "ds-l4-3",
    title: "Writing a Test Script: Preparing for User Interviews",
    description:
      "Craft a structured interview script that guides testers through your prototype while capturing honest, unbiased reactions.",
    format: "project",
    durationMinutes: 44,
    order: 2,
    objectives: [
      "Write a complete test script with introduction, tasks, and debrief questions",
      "Practice non-leading interview techniques that avoid biasing the tester",
    ],
    keyPoints: [
      "A test script ensures every user sees the same experience — consistency enables comparison",
      "Frame tasks as goals, not instructions: 'Find a weekend getaway' not 'Click the search button'",
      "Ask 'What are you thinking?' constantly — the think-aloud protocol is your best tool",
      "Never say 'Did you find it easy?' — ask 'How was that for you?' instead",
      "Prepare a brief intro that sets the tester at ease and clarifies you are testing the product, not them",
    ],
    content: "",
    suggestedResources: [
      {
        title: "NNG: Usability Testing 101",
        url: "https://www.nngroup.com/articles/usability-testing-101/",
        type: "article",
      },
      {
        title: "Steve Krug — Rocket Surgery Made Easy",
        url: "https://sensible.com/rocket-surgery-made-easy/",
        type: "book",
      },
    ],
  },
];

const session4Quiz: QuizQuestion[] = [
  {
    id: "ds-q4-1",
    type: "multiple-choice",
    question: "What does 'Goldilocks quality' mean for a sprint prototype?",
    options: [
      "The prototype should be pixel-perfect and ready for production",
      "The prototype should be as rough as possible to save time",
      "The prototype should be realistic enough to test but cheap enough to throw away",
      "The prototype should use only wireframes with no visual design",
    ],
    correctAnswer:
      "The prototype should be realistic enough to test but cheap enough to throw away",
    explanation:
      "Goldilocks quality means finding the sweet spot: polished enough that users react naturally, but not so polished that the team resists throwing it away based on test feedback.",
    points: 1,
  },
  {
    id: "ds-q4-2",
    type: "multiple-choice",
    question:
      "When writing a usability test task, which phrasing avoids leading the user?",
    options: [
      "Click the blue button to sign up",
      "Find the sign-up form in the top right corner",
      "You want to create an account. Go ahead and try.",
      "Use the sign-up feature we just built",
    ],
    correctAnswer: "You want to create an account. Go ahead and try.",
    explanation:
      "Tasks should describe the user's goal, not the specific UI elements or actions. This allows you to observe whether users can discover the path on their own.",
    points: 1,
  },
  {
    id: "ds-q4-3",
    type: "multiple-choice",
    question:
      "Why should you use real content instead of Lorem Ipsum in a sprint prototype?",
    options: [
      "Because real content looks more professional to stakeholders",
      "Because Lorem Ipsum is copyrighted material",
      "Because placeholder text prevents testers from reacting naturally to the experience",
      "Because search engines cannot index Lorem Ipsum",
    ],
    correctAnswer:
      "Because placeholder text prevents testers from reacting naturally to the experience",
    explanation:
      "Real content helps testers engage with the prototype as if it were a real product. Placeholder text breaks immersion and causes testers to focus on the fidelity rather than the concept.",
    points: 1,
  },
];

const session4: Module = {
  id: "ds-m4",
  title: "Session 4: Prototype — Building a Realistic Facade",
  description:
    "Transform your storyboard into a clickable, testable prototype using Figma and rapid prototyping techniques. By the end of this session, you will have a prototype and a test script ready for real users.",
  objectives: [
    "Build a clickable prototype that brings the sprint storyboard to life",
    "Write a structured usability test script for user interviews",
    "Apply the Goldilocks quality principle to balance speed and realism",
  ],
  lessons: session4Lessons,
  quiz: session4Quiz,
  order: 3,
  durationMinutes: 144,
};

// ---------------------------------------------------------------------------
// Session 5 — Validate: Testing with Real Users
// ---------------------------------------------------------------------------

const session5Lessons: Lesson[] = [
  {
    id: "ds-l5-1",
    title: "Running Usability Tests That Produce Real Signal",
    description:
      "Facilitate user testing sessions that capture honest, actionable feedback by observing behavior rather than asking opinions.",
    format: "interactive",
    durationMinutes: 50,
    order: 0,
    objectives: [
      "Facilitate a 20-minute usability test using the think-aloud protocol",
      "Distinguish between observed behavior and self-reported preference",
    ],
    keyPoints: [
      "Watch what users do, not what they say — actions reveal more than opinions",
      "The think-aloud protocol ('tell me what you are thinking') is your primary tool",
      "Test with 5 users to identify ~85% of usability issues",
      "Assign one team member as interviewer and one as note-taker — never combine roles",
      "Resist the urge to help when users struggle — struggle is data",
    ],
    content: "",
    suggestedResources: [
      {
        title: "NNG: Thinking Aloud Protocol",
        url: "https://www.nngroup.com/articles/thinking-aloud-the-1-usability-tool/",
        type: "article",
      },
      {
        title: "Maze — Remote Usability Testing Tool",
        url: "https://maze.co",
        type: "tool",
      },
    ],
  },
  {
    id: "ds-l5-2",
    title: "Capturing and Organizing Feedback That Matters",
    description:
      "Turn messy test observations into structured patterns using a systematic note-taking grid and affinity mapping.",
    format: "project",
    durationMinutes: 48,
    order: 1,
    objectives: [
      "Use a structured note-taking grid to capture observations during testing",
      "Identify recurring patterns across 5 test sessions using affinity mapping",
    ],
    keyPoints: [
      "Capture observations, not interpretations — 'User clicked the wrong button' not 'User was confused'",
      "Record direct quotes — they are the most persuasive evidence for stakeholders",
      "Use a simple scoring system: green (worked), yellow (struggled then succeeded), red (failed)",
      "Affinity mapping after all 5 tests reveals patterns no single test shows",
      "Three or more users hitting the same issue = a confirmed pattern worth fixing",
    ],
    content: "",
    suggestedResources: [
      {
        title: "NNG: Affinity Diagramming",
        url: "https://www.nngroup.com/articles/affinity-diagram/",
        type: "article",
      },
    ],
  },
  {
    id: "ds-l5-3",
    title: "From Sprint to Roadmap: Planning Your Next Moves",
    description:
      "Translate sprint findings into a concrete action plan with clear priorities, owners, and timelines for what to build, fix, or test next.",
    format: "discussion",
    durationMinutes: 46,
    order: 2,
    objectives: [
      "Create a prioritized action plan based on usability test findings",
      "Distinguish between 'build it,' 'iterate and retest,' and 'kill it' decisions",
    ],
    keyPoints: [
      "A sprint ends with decisions, not a report — commit to next steps before leaving the room",
      "Sort findings into three buckets: build (validated), iterate (promising but needs work), kill (disproven)",
      "Assign owners and deadlines to every action item — unowned items never happen",
      "Schedule a follow-up sprint for the 'iterate' bucket within 2-4 weeks",
      "Celebrate what you learned, even if the prototype failed — a fast failure saves months of building the wrong thing",
    ],
    content: "",
    suggestedResources: [
      {
        title: "Sprint Book — Friday: Test",
        url: "https://www.thesprintbook.com",
        type: "book",
      },
      {
        title: "Product Roadmap Templates — Atlassian",
        url: "https://www.atlassian.com/agile/product-management/product-roadmaps",
        type: "template",
      },
    ],
  },
];

const session5Quiz: QuizQuestion[] = [
  {
    id: "ds-q5-1",
    type: "multiple-choice",
    question:
      "According to usability research, how many users do you typically need to identify the majority of usability problems?",
    options: [
      "1-2 users",
      "5 users",
      "15-20 users",
      "At least 50 users for statistical significance",
    ],
    correctAnswer: "5 users",
    explanation:
      "Jakob Nielsen's research shows that 5 users uncover approximately 85% of usability issues. Additional users produce diminishing returns for qualitative usability testing.",
    points: 1,
  },
  {
    id: "ds-q5-2",
    type: "multiple-choice",
    question:
      "During a usability test, a user asks 'What does this button do?' What is the best response?",
    options: [
      "Explain what the button does so they can continue the task",
      "Tell them to skip that part and move to the next task",
      "Ask them: 'What do you think it does?'",
      "Point to the label on the button",
    ],
    correctAnswer: "Ask them: 'What do you think it does?'",
    explanation:
      "Redirecting the question back to the user reveals their mental model and expectations. If you explain the UI, you lose the opportunity to learn whether the design communicates its function clearly.",
    points: 1,
  },
  {
    id: "ds-q5-3",
    type: "multiple-choice",
    question:
      "In the three-bucket framework, a concept where 3 out of 5 users struggled but eventually succeeded belongs in which bucket?",
    options: [
      "Build It — most users completed the task",
      "Iterate and Retest — the concept has promise but the execution needs refinement",
      "Kill It — too many users struggled",
      "Defer — not enough data to decide",
    ],
    correctAnswer:
      "Iterate and Retest — the concept has promise but the execution needs refinement",
    explanation:
      "When users struggle but succeed, the core idea is sound but the execution has friction. A focused redesign and retest can unlock the concept's potential without a full sprint.",
    points: 1,
  },
];

const session5: Module = {
  id: "ds-m5",
  title: "Session 5: Validate — Testing with Real Users",
  description:
    "Put your prototype in front of real users, capture structured feedback, and translate findings into a clear action plan. By the end of this session, you will know exactly what to build, what to iterate, and what to abandon.",
  objectives: [
    "Conduct usability tests using the think-aloud protocol and a structured script",
    "Synthesize test findings into patterns and prioritize next steps",
  ],
  lessons: session5Lessons,
  quiz: session5Quiz,
  order: 4,
  durationMinutes: 144,
};

// ---------------------------------------------------------------------------
// Bonus Resources
// ---------------------------------------------------------------------------

const bonusResources: BonusResource[] = [
  {
    id: "ds-br-1",
    title: "Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days",
    type: "book",
    url: "https://www.thesprintbook.com",
    description:
      "The definitive guide to design sprints by Jake Knapp, creator of the process at Google Ventures. Essential reading for anyone facilitating their first sprint.",
    isFree: false,
  },
  {
    id: "ds-br-2",
    title: "Google Design Sprint Kit",
    type: "tool",
    url: "https://designsprintkit.withgoogle.com",
    description:
      "Free, comprehensive toolkit with templates, facilitator guides, and video tutorials for every phase of the sprint process.",
    isFree: true,
  },
  {
    id: "ds-br-3",
    title: "Figma Prototyping Starter Kit",
    type: "template",
    url: "https://www.figma.com/community/file/prototyping-starter-kit",
    description:
      "A free Figma file with pre-built components, device frames, and interaction patterns to speed up sprint prototyping.",
    isFree: true,
  },
  {
    id: "ds-br-4",
    title: "The Design Sprint — GV Library",
    type: "video",
    url: "https://www.gv.com/sprint",
    description:
      "Video walkthroughs from Google Ventures partners showing real sprint facilitation techniques and common pitfalls.",
    durationMinutes: 45,
    isFree: true,
  },
  {
    id: "ds-br-5",
    title: "Don't Make Me Think — Steve Krug",
    type: "book",
    url: "https://sensible.com/dont-make-me-think/",
    description:
      "A classic guide to web usability that underpins the testing techniques used in Session 5. Short, witty, and immediately practical.",
    isFree: false,
  },
];

// ---------------------------------------------------------------------------
// Exported Course
// ---------------------------------------------------------------------------

export const dsCourse: Curriculum = {
  id: "ds-design-sprint-2026",
  title: "Product Design Sprint: Problem to Prototype",
  subtitle:
    "A 5-session hands-on workshop to go from problem statement to validated prototype",
  description:
    "This workshop-format course walks you through a complete design sprint in 5 intensive sessions. Using the proven Google Ventures sprint methodology, you will move from fuzzy problem statement to tested, clickable prototype — learning stakeholder interviewing, rapid ideation, collaborative decision-making, Figma prototyping, and usability testing along the way. Every session is built around hands-on exercises, not lectures.",
  targetAudience:
    "Product managers, designers, and startup founders who want to rapidly validate ideas",
  difficulty: "beginner",
  objectives: [
    "Run a complete design sprint from problem definition through validated prototype",
    "Conduct stakeholder interviews and synthesize findings into a user journey map",
    "Generate diverse solution concepts using structured ideation techniques like Crazy 8s",
    "Make fast, evidence-based design decisions using dot voting and prioritization frameworks",
    "Build a clickable Figma prototype realistic enough to test with real users",
    "Facilitate usability tests and translate findings into a prioritized action plan",
  ],
  prerequisites: [
    "No prior design experience required",
    "Access to Figma (free tier is fine)",
  ],
  tags: ["Design", "UX", "Product", "Workshop", "Prototyping"],
  modules: [session1, session2, session3, session4, session5],
  pacing: {
    style: "cohort",
    totalHours: 12,
    hoursPerWeek: 6,
    totalWeeks: 2,
    weeklyPlan: [
      {
        week: 1,
        label: "Understand, Diverge & Converge",
        moduleIds: ["ds-m1", "ds-m2", "ds-m3"],
      },
      {
        week: 2,
        label: "Prototype & Validate",
        moduleIds: ["ds-m4", "ds-m5"],
      },
    ],
  },
  bonusResources,
  createdBy: "Syllabi AI",
  createdAt: "2026-04-01T10:00:00Z",
  updatedAt: "2026-04-11T00:00:00Z",
  version: "1.0.0",
};
