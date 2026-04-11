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
    content: `## Why Most Interviews Fail

Most stakeholder interviews produce polite, vague answers that tell you nothing actionable. The reason? We ask opinion questions ("What do you think about...") instead of experience questions ("Tell me about the last time...").

In a design sprint, you have **zero time for fluff**. Every interview minute must yield a concrete insight you can act on within hours, not weeks.

### The 15-Minute Sprint Interview Format

Break your interview into three blocks:

1. **Context (3 min)** — Ask the stakeholder to describe their role and what success looks like for them personally. This reveals hidden incentives.
2. **Story time (7 min)** — Ask them to walk you through the last time they encountered the problem. Probe with "What happened next?" and "Why was that frustrating?" Do not let them speak in hypotheticals.
3. **Magic wand (5 min)** — "If you could change one thing overnight, what would it be?" Then ask: "What's stopping that from happening today?"

### Exercise: Pair Interview Practice

**Time:** 10 minutes

Partner up. One person plays the stakeholder (use a scenario card provided by the facilitator), the other runs the 15-minute format compressed to 10 minutes.

**Rules:**
- The interviewer may **not** suggest solutions
- Write down at least **3 direct quotes**
- After the interview, the interviewer has 2 minutes to identify the **#1 unspoken assumption** they detected

> **Tip:** Record interviews (with permission) so you can revisit exact wording later. In a remote sprint, Zoom transcripts are your best friend.

### Synthesizing Interview Data

After conducting 3-5 interviews, look for:
- **Repeated pain points** — if three people mention the same friction, it is real
- **Contradictions** — stakeholders who disagree reveal where the real design tension lives
- **Emotional language** — words like "hate," "dread," and "workaround" mark high-value opportunity areas

Capture your top findings on sticky notes (physical or digital). You will feed these directly into the next exercise: journey mapping.`,
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
    content: `## From Interviews to a Shared Picture

You just completed stakeholder interviews. Now you need to transform those individual perspectives into a single, shared understanding of the user's experience. That is what a journey map does.

### The 30-Minute Journey Map Protocol

**Materials:** A long whiteboard (or a FigJam/Miro board), sticky notes in three colors, markers.

#### Step 1 — Define the Scope (5 min)

Agree on:
- **Who** is the user? Pick one primary persona.
- **Starting trigger** — what event causes them to begin this journey? (e.g., "Receives an error email")
- **End goal** — what does success look like? (e.g., "Issue is resolved and customer is notified")

Write these on the far left and far right of your board.

#### Step 2 — Map the Steps (10 min)

Working **silently and individually**, each team member writes one action per sticky note for every step the user takes between trigger and goal. Place them in a horizontal row.

After 10 minutes, the facilitator reads the steps aloud and the group consolidates duplicates. Aim for **8-12 steps**.

#### Step 3 — Add the Emotional Layer (10 min)

Below each step, draw a simple curve showing the user's emotional state: high (things are going well), neutral, or low (frustration, confusion).

For every low point, add a **pink sticky note** describing the pain in the user's own words (pull from interview quotes).

#### Step 4 — Mark Opportunities (5 min)

Place **green sticky notes** on the 2-3 moments where a better experience would have the biggest impact. These become your "How Might We" targets.

### Exercise: Build Your Map Now

Using the interview data from the previous lesson, build a journey map with your sprint team. Appoint one facilitator to keep time.

> **Tip:** Take a photo of your completed map. You will reference it throughout every remaining session. It is your team's single source of truth.

### Common Mistakes
- **Too granular** — if your map has 25+ steps, zoom out. Think phases, not clicks.
- **Mixing current and future state** — this map shows what happens today, not what you wish happened.
- **Skipping the emotional layer** — without it, you have a process diagram, not a journey map.`,
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
    content: `## The Bridge Between Problem and Solution

"How Might We" (HMW) questions are the most important artifact in a design sprint. They take raw pain points and reframe them as creative opportunities. A great HMW question makes the team lean forward and say, "Oh, I have an idea for that."

### Anatomy of a Great HMW

**Formula:** "How might we [verb] [user outcome] without [constraint]?"

**Examples from real sprints:**
- Pain: "Users abandon the checkout flow at the address step."
  - Bad HMW: "How might we redesign the checkout page?" (too vague)
  - Bad HMW: "How might we add Google address autocomplete?" (solution baked in)
  - **Good HMW:** "How might we help users complete their address in under 10 seconds?"

- Pain: "New employees feel lost during their first week."
  - **Good HMW:** "How might we make a new hire feel like an insider by day 3?"

### Exercise: HMW Generation Blitz

**Time:** 8 minutes silent writing, 7 minutes sharing

1. Look at the **pink sticky notes** (pain points) on your journey map
2. For each pain point, write **at least 2 HMW questions** on separate sticky notes
3. Work silently — no discussion yet
4. After 8 minutes, each person reads their HMWs aloud and sticks them on the board

### Voting: Pick Your Sprint Target

Give each team member **3 dot votes** (sticker dots or marker dots). Vote for the HMW questions you believe would create the most value if solved.

**Voting rules:**
- You may place multiple dots on the same question
- The **decider** (product owner or sprint sponsor) gets **2 extra votes**
- Tally votes. The top-voted HMW becomes your sprint's **design challenge**

> **Tip:** If the top two questions are tied, let the decider break the tie. Design sprints are not democracies — they need a clear decision-maker.

### What Happens Next

Your winning HMW question will carry into Session 2, where the team generates as many solutions as possible. Pin it at the top of your board — every idea you sketch tomorrow must answer this question.

### Quality Check

Before you leave Session 1, make sure your HMW passes these tests:
- **Actionable** — could you start sketching solutions right now?
- **Human-centered** — does it mention a real user and a real outcome?
- **Scope-appropriate** — could a small team prototype a solution in one day?

If it fails any test, rewrite it before wrapping up.`,
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
    content: `## Why Start With What Already Exists

Before you generate new ideas, study what is already working in the wild. Lightning demos prevent your team from reinventing solved problems and inject outside-industry thinking into your sprint.

### How Lightning Demos Work

Each team member gets **10 minutes of prep time** to find 1-2 products, services, or experiences that solve a problem similar to your HMW question — even if they come from a completely different domain.

Then, one by one, each person presents a **3-minute walkthrough**:
1. Show the product (screen share or screenshots)
2. Explain the **one big idea** it demonstrates
3. The team captures that idea on a sticky note and adds it to the inspiration wall

### Where to Look for Inspiration

- **Direct competitors** — what are they doing well? What feels broken?
- **Adjacent industries** — if your HMW is about onboarding, look at how Duolingo onboards language learners or how Notion introduces features progressively
- **Analog experiences** — physical-world solutions often hold brilliant design patterns. How does IKEA guide you through a warehouse? How does a restaurant menu direct your attention?
- **Best-in-class digital products** — Stripe's developer docs, Linear's keyboard-first UI, Airbnb's trust-building flows

### Exercise: Run Your Lightning Demos

**Time:** 10 min prep + 3 min per person

1. Open your laptop and find 1-2 examples relevant to your HMW question
2. Prepare a quick screen share or paste screenshots into your shared board
3. Present in round-robin order — facilitator keeps strict 3-minute time
4. After all demos, the team silently reviews the inspiration wall for 2 minutes

> **Tip:** The best lightning demos come from unexpected places. A team redesigning hospital check-in found their winning pattern in a hotel self-service kiosk. Look wide.

### Building Your Inspiration Wall

By the end of this exercise, you should have **8-15 sticky notes** on your inspiration wall, each capturing a single transferable idea. These notes stay visible for the next two exercises — they are fuel for your sketches.

Keep the language pattern-focused:
- Good: "Progressive disclosure — show only what's needed at each step"
- Bad: "Copy Duolingo's green owl mascot"`,
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
    content: `## Sketching Is the Fastest Way to Think

Writing a product spec takes days. Building a prototype takes hours. But sketching a solution concept? That takes **20 minutes** — and it forces a level of concreteness that no amount of verbal discussion can match.

### The Four-Step Sketch Process

Work through these steps **individually and silently**. No talking, no peeking at your neighbor's work.

#### Step 1 — Notes (5 min)
Walk around the room and review the journey map, HMW questions, and lightning demo wall. Jot down anything that sparks an idea on a piece of paper. This is your private brainstorm dump.

#### Step 2 — Rough Ideas (5 min)
Sketch **3-5 rough ideas** on paper. Each one is a single frame — a quick doodle showing one possible approach. Draw boxes for screens, stick figures for users, arrows for flows. No detail needed.

#### Step 3 — Crazy 8s (8 min)
Fold a sheet of paper into 8 panels. Set a timer for **8 minutes**. Sketch **one variation per panel** — that is one minute per sketch. This forces rapid exploration and kills perfectionism. Most panels will be rough or silly, and that is the point.

#### Step 4 — Solution Sketch (20 min)
Pick your strongest idea from the Crazy 8s and develop it into a **3-panel storyboard** on a fresh sheet of paper:
- **Panel 1:** How does the user discover or arrive at your solution?
- **Panel 2:** What is the core interaction or "magic moment"?
- **Panel 3:** What does success look like for the user?

Add **annotations**: labels, arrows, callout boxes explaining what is happening. Write a catchy **title** at the top.

### Exercise: Complete Your Solution Sketch

**Time:** 38 minutes total (following the four steps above)

**Rules:**
- Work alone and in silence
- Your sketch must be understandable without verbal explanation
- Use a thick marker so details stay intentionally low-fidelity
- When done, fold your sketch in half and place it face-down — no one sees it until Session 3

> **Tip:** If you think you cannot draw, you are the ideal participant. The constraint of low-fidelity forces you to focus on the concept, not the polish. That is exactly what a sprint needs.`,
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
    content: `## Why Speed Unlocks Creativity

When you have 30 minutes, your brain defaults to the safe, obvious answer. When you have 60 seconds, your brain panics — and that panic bypasses your inner critic. Crazy 8s exploits this phenomenon to generate ideas you would never reach through careful deliberation.

### The Crazy 8s Protocol

**Materials:** One sheet of paper folded into 8 panels (fold in half 3 times), a thick marker, a timer.

**Setup:** Place your HMW question where you can see it. Have the inspiration wall and journey map visible.

**Execution:**
1. The facilitator starts a timer for **8 minutes total**
2. Every 60 seconds, the facilitator calls "Next!"
3. You sketch **one idea per panel** — it can be a screen, a flow, a concept, or even a single interaction
4. When the timer ends, put your marker down

### Coaching Notes for Facilitators

- Play upbeat music during the exercise — it keeps energy high
- Announce the time loudly: "Panel 4 — halfway there!"
- If someone freezes, tell them to **draw the opposite** of their last idea
- Remind the group: "Ugly is beautiful. Speed is the goal."

### Exercise: Double-Round Crazy 8s

For this workshop, we run **two rounds**:

**Round 1 (8 min):** Classic Crazy 8s. Sketch 8 variations of your solution.

**Round 2 (8 min):** Constraint round. The facilitator adds a constraint before each panel:
- Panel 1: "What if it had to work with no text at all?"
- Panel 2: "What if the user were a complete beginner?"
- Panel 3: "What if it had to work on a smartwatch?"
- Panel 4: "What if you could only use one screen?"
- Panel 5: "What if it had to delight a 5-year-old?"
- Panel 6: "What if it cost zero dollars to build?"
- Panel 7: "What if it had to work offline?"
- Panel 8: "What if it were physical, not digital?"

These absurd constraints break habitual thinking and often produce the most innovative kernels.

### After Crazy 8s

1. Lay out both sheets in front of you
2. **Circle** the 2-3 panels that have the strongest potential
3. Use these as the foundation for your solution sketch (the detailed 3-panel storyboard from the previous lesson)

> **Tip:** Keep your Crazy 8s sheets. Teams that revisit "rejected" panels during the converge phase often find that a wild idea becomes the differentiating detail in their final concept.`,
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
    content: `## Why Traditional Feedback Fails in Sprints

In a typical design review, someone presents their work, the loudest person in the room shares their opinion, and everyone else agrees to avoid conflict. This produces mediocre consensus, not the best idea.

The **Art Museum method** flips this dynamic entirely: sketches are anonymous, critique is silent, and voting is democratic (with a decisive tiebreaker).

### Setting Up the Art Museum

1. **Post sketches** on the wall in a row, like paintings in a gallery. Remove any identifying marks — this is anonymous.
2. **Set a timer for 10 minutes** of silent review. Team members walk along the wall, studying each sketch carefully.
3. **Dot voting round:** Give each person **10-15 small dot stickers**. They place dots on any **specific element** that they find compelling — a clever interaction, a smart flow decision, a delightful detail. Not on the sketch as a whole, but on the parts that work.

### Reading the Heat Map

After voting, step back and look at the wall. You will see natural clusters:
- **Hot zones** — areas with many dots indicate ideas that resonate broadly
- **Cold zones** — areas with no dots are not necessarily bad, but they did not grab anyone
- **Lone dots** — a single dot from the decider is worth investigating

### Exercise: Run Your Art Museum

**Time:** 10 min silent review + 5 min dot voting + 10 min discussion

1. Post all solution sketches from Session 2
2. Silent review (no talking, no gesturing, no reactions)
3. Dot voting — place dots on the specific parts you love
4. The facilitator reads each sketch aloud, narrating the dots: "This area got 7 dots — what do people see here?"
5. Sketch creators may clarify **only when asked a direct question**

> **Tip:** If you are running a remote sprint, use FigJam's stamp tool or Miro's voting feature. The principle is the same: silent, individual evaluation before any group discussion.

### Supervote: The Decider's Call

After the group discussion, the **decider** (product owner or sponsor) places **3 large star stickers** on the ideas they want to move forward. These supervotes are the final word.

The sketches (or sketch components) with supervotes advance to the storyboarding phase. Everything else goes into a "parking lot" for future sprints.`,
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
    content: `## From Voted Ideas to a Single Story

Your Art Museum produced a set of winning components — clever interactions, smart flows, and compelling moments. Now you need to weave them into a **single, coherent user story** that you can prototype tomorrow.

### The Storyboard Format

Use a horizontal row of **6-8 panels**, each representing one key moment in the user's experience:

| Panel | Content |
|-------|---------|
| 1 | **Entry point** — How does the user discover your solution? (Google search? Email link? App notification?) |
| 2 | **First impression** — What do they see first? What is the headline promise? |
| 3 | **Core action** — What does the user do? What is the primary interaction? |
| 4 | **Decision point** — Where does the user make a choice? What are the options? |
| 5 | **Magic moment** — The "aha" instant where the value becomes clear |
| 6 | **Outcome** — What does success look like? What feedback does the user receive? |
| 7-8 | **Follow-up** — What happens next? Sharing, saving, next steps? |

### Exercise: Collaborative Storyboard

**Time:** 30 minutes

The **facilitator** leads this exercise at the whiteboard. The rest of the team contributes ideas, but the facilitator makes final decisions on what goes in each panel.

**Process:**
1. Draw 8 empty panels on the whiteboard
2. Start with Panel 1: "Where does our user's story begin?" Pull from the winning sketches.
3. Work through each panel sequentially. For each one:
   - Propose what happens (draw it roughly)
   - Check: does this incorporate a supervoted idea?
   - Ask the decider: "Does this feel right?"
4. When complete, read the storyboard aloud as a narrative: "First, the user sees... then they... and finally..."

### Quality Checklist

Before leaving this exercise, verify:
- [ ] The storyboard answers your HMW question
- [ ] Every panel is concrete enough to prototype (no "and then magic happens" gaps)
- [ ] The flow takes **5 minutes or less** for a test user to complete
- [ ] The success moment is emotionally satisfying, not just functional

> **Tip:** Number your panels and add short captions. Tomorrow's prototypers will use this as their build spec, so clarity now saves hours later.`,
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
    content: `## Disagreement Is a Feature, Not a Bug

If everyone on your sprint team agrees on everything, you either have the wrong people in the room or no one is being honest. Healthy disagreement surfaces trade-offs and catches blind spots. The goal is not to eliminate disagreement — it is to **resolve it quickly** so the sprint keeps moving.

### Framework 1: The 2x2 Prioritization Matrix

Draw a large cross on the whiteboard:
- **X-axis:** Effort (low to high)
- **Y-axis:** Impact (low to high)

Place each competing idea on the matrix. The conversation becomes immediately visual:
- **High impact, low effort** = do this first (the "quick wins")
- **High impact, high effort** = worth doing but plan carefully
- **Low impact, low effort** = nice-to-haves, deprioritize
- **Low impact, high effort** = discard

### Framework 2: Note and Vote

When the team is stuck in circular debate:

1. **Silent note (2 min):** Each person writes their preferred option on a sticky note, along with one sentence explaining why.
2. **Reveal:** Everyone flips their note simultaneously. No peeking, no changing answers.
3. **Brief advocacy (1 min each):** Each person explains their choice.
4. **Final vote:** Simple majority wins. If tied, the decider breaks it.

Total time: under 10 minutes for a decision that could otherwise consume an hour.

### Framework 3: Reversibility Test

Ask: "Is this decision easily reversible?"

- **Reversible** (e.g., button color, copy wording) — decide fast, test later, move on
- **Irreversible** (e.g., core architecture, target user) — invest more time in deliberation

Most sprint decisions are reversible. Treat them accordingly.

### Exercise: Practice Note and Vote

**Time:** 10 minutes

The facilitator presents a real (or simulated) sprint dilemma:

*"Your storyboard has two possible entry points: (A) a landing page with a video explainer, or (B) a streamlined sign-up form with progressive disclosure. The team is split. Use Note and Vote to decide."*

Run the full Note and Vote protocol. Debrief: How did it feel compared to open debate?

> **Tip:** Post your chosen decision framework on the wall. When the next disagreement arises (and it will), point to the framework instead of re-explaining the process.`,
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
    content: `## The Prototype Mindset

A design sprint prototype has one job: **to generate honest reactions from real users**. It is not a beta product. It is not a proof of concept for engineering. It is a learning tool, and it should be treated as disposable.

### Goldilocks Quality

Your prototype needs to hit the sweet spot:
- **Too rough** (wireframes, gray boxes, placeholder text) — users cannot react naturally because the experience does not feel real. They comment on the fidelity instead of the concept.
- **Too polished** (pixel-perfect, animated, production-ready) — you spend 8 hours building something you might throw away after testing. Worse, the team becomes emotionally attached and resists negative feedback.
- **Just right** — realistic enough that a user forgets they are looking at a prototype for at least 20 seconds. Real text, real images, plausible interactions.

### The Division of Labor

With your storyboard as the blueprint, split the work:

| Role | Responsibility |
|------|---------------|
| **Makers** (2-3 people) | Build the prototype screens in Figma, Keynote, or your tool of choice |
| **Writer** (1 person) | Create all text content — headlines, button labels, error messages, notifications |
| **Asset collector** (1 person) | Source realistic images, icons, and logos |
| **Stitcher** (1 person) | Connect screens into a clickable flow and test all transitions |

### Exercise: Set Up Your Prototype Project

**Time:** 15 minutes

1. Create a new Figma file (or equivalent) with frames matching your storyboard panels
2. Agree on a simple design system: one font, one accent color, consistent button style
3. Assign roles from the table above
4. Set a checkpoint: the team reconvenes in 90 minutes to review the first draft

> **Tip:** Start with the "magic moment" screen (Panel 5 of your storyboard). If you run out of time, you want the most important screen to be the most polished.

### What to Skip

Do **not** build:
- A working backend
- More than one user flow
- Edge cases beyond one basic error state
- A responsive mobile version (unless mobile is your test device)
- Animations beyond simple screen transitions`,
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
    content: `## Figma in 45 Minutes: Everything You Need

You do not need to be a Figma expert to build a sprint prototype. You need exactly **5 skills**. This lesson teaches all of them.

### Skill 1 — Frames (5 min)

Frames are the containers for each screen. Press **F** to create a frame, then choose a device size from the right panel (iPhone 14, Desktop 1440px, etc.). Each storyboard panel gets one frame.

**Action:** Create frames for panels 1 through 6 of your storyboard. Name them descriptively: "01-Landing", "02-Signup", etc.

### Skill 2 — Components from the Community (10 min)

Do not design buttons, input fields, or navigation bars from scratch. Go to **Figma Community** (the globe icon in the toolbar) and search for a free UI kit like "Untitled UI" or "Material Design Kit."

**Action:** Import a UI kit. Drag in the components you need: buttons, text fields, cards, navigation bars.

### Skill 3 — Text and Images (10 min)

Press **T** for text. Use the Writer's copy from the division of labor — paste real headlines and labels, never placeholder text.

For images, drag files directly onto the canvas, or use the **Unsplash plugin** (search "Unsplash" in Figma plugins) to insert relevant stock photos.

**Action:** Populate your first two frames with real text and images.

### Skill 4 — Prototype Links (15 min)

Switch to the **Prototype** tab (top right). Click on any element (a button, a card, a link), drag the blue arrow to the destination frame. Choose:
- **Trigger:** On click
- **Action:** Navigate to
- **Transition:** Smart animate, 300ms ease-in-out

**Action:** Link all your frames into a linear flow. Test it by pressing the **Play** button (top right).

### Skill 5 — Sharing (5 min)

Click **Share** > copy the prototype link. Anyone with the link can open it in their browser and click through the flow — no Figma account required.

**Action:** Share the link with your team for an internal review.

### Exercise: Build Your First Three Screens

**Time:** 30 minutes

Using the skills above, build frames for the first three panels of your storyboard. Focus on:
- Real content (no lorem ipsum)
- Clickable navigation between screens
- One interactive element per screen (a button, a form, a toggle)

> **Tip:** If you get stuck, use Figma's built-in "Prototype" flow tutorial — it is a 3-minute interactive walkthrough available from the Help menu.`,
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
    content: `## Your Script Is Your Research Instrument

Without a consistent test script, your user interviews will produce anecdotes, not patterns. A good script ensures that all 5 testers attempt the same core tasks, allowing you to compare their reactions and spot recurring issues.

### Test Script Template

#### Part 1: Introduction (3 min)

Read this aloud to every tester — consistency matters:

*"Thanks for being here. We are testing an early version of a product, and your feedback will directly shape what we build. A few things to know:*
- *There are no wrong answers. We are testing the product, not you.*
- *Please think out loud — tell me what you see, what you expect, and what confuses you.*
- *This is a prototype, so some things will not work. That is fine — just tell me what you would expect to happen.*
- *We will be done in about 20 minutes."*

#### Part 2: Background (2 min)

Ask 2-3 questions to understand the tester's context:
- "Have you ever used a product like [category]?"
- "How do you currently handle [the problem your HMW addresses]?"

#### Part 3: Tasks (12 min)

Write **3-4 tasks** that map to your storyboard panels:
- **Task 1:** "Imagine you just received [trigger]. What would you do first?"
- **Task 2:** "You want to [core goal]. Go ahead and try."
- **Task 3:** "You have completed [action]. What do you expect happens next?"

After each task, ask:
- "What are you thinking right now?"
- "Is this what you expected?"
- "What would you do if you got stuck here?"

#### Part 4: Debrief (3 min)

- "What stood out to you most?"
- "Was anything confusing or frustrating?"
- "Would you use something like this? Why or why not?"

### Exercise: Write Your Test Script

**Time:** 20 minutes

Using the template above, write a complete test script for your prototype:
1. Customize the introduction for your product
2. Write 3 tasks that match your storyboard flow
3. Add follow-up probes for each task
4. Write 3 debrief questions

Then **pair up and practice**: one person reads the script while the other plays the tester. Swap roles. Refine any questions that felt awkward or leading.

> **Tip:** Print your script or keep it on a separate device during testing. Looking at the script and the tester's screen simultaneously prevents you from accidentally guiding their behavior with your body language.`,
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
    content: `## Five Users, Five Revelations

Research by Jakob Nielsen shows that **5 usability tests** uncover approximately 85% of usability problems. You do not need 50 users and a statistics degree. You need 5 real people, a quiet room, and the discipline to watch without helping.

### The Testing Setup

**Room layout:**
- The **tester** sits in front of a laptop or phone with the prototype loaded
- The **interviewer** sits beside them (not across — side-by-side feels less confrontational)
- The **note-taker** sits behind or to the side, out of the tester's peripheral vision
- Screen-share to a separate room where the rest of the sprint team watches the live feed

**Equipment:**
- Screen recording software (Loom, OBS, or Figma's built-in recording)
- The printed test script
- A note-taking grid (columns: Task, Observation, Quote, Severity)

### Running the Session

1. **Introduction (3 min):** Read the script introduction. Emphasize: "We are testing the product, not you."
2. **Background (2 min):** Ask the context questions from your script.
3. **Tasks (12 min):** Present one task at a time. After each task:
   - "What did you expect to happen?"
   - "How confident are you that it worked?"
   - If they get stuck for more than 30 seconds, ask: "What are you looking for?"
4. **Debrief (3 min):** Open-ended reflection questions.

### The Interviewer's Rules

- **Never explain the UI.** If the user asks "What does this button do?" reply: "What do you think it does?"
- **Never apologize for bugs.** Say: "That is great feedback, thank you."
- **Never lead.** Not: "Did you notice the menu?" But: "How would you navigate from here?"
- **Stay neutral.** Your facial expression is data too — keep it warm but unreadable.

### Exercise: Run a Practice Test

**Time:** 20 minutes

Pair up within your team. One person plays the tester (pretend you have never seen the prototype), one plays the interviewer, one takes notes. Run through all 3 tasks from your script. Then rotate roles.

> **Tip:** The most valuable moment in testing is when a user goes quiet and squints at the screen. That silence means they are confused but not saying it. Gently prompt: "I notice you paused — what is going through your mind?"`,
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
    content: `## From Raw Notes to Actionable Patterns

After 5 usability tests, you will have pages of observations, quotes, and impressions. Without a system, this data is overwhelming. With the right structure, it tells a clear story about what works, what fails, and what to fix first.

### The Note-Taking Grid

Before testing begins, set up a grid (spreadsheet, whiteboard, or sticky notes):

| User | Task 1 | Task 2 | Task 3 | Key Quotes | Overall |
|------|--------|--------|--------|------------|---------|
| User 1 | | | | | |
| User 2 | | | | | |
| ... | | | | | |

For each task cell, record:
- **Outcome:** Green (completed easily), Yellow (struggled but completed), Red (failed or needed help)
- **Observation:** What specifically happened? What did they click? Where did they hesitate?
- **Quote:** Any notable thing they said, in their exact words

### Exercise: Affinity Mapping Your Results

**Time:** 25 minutes

After completing all 5 tests:

1. **Individual sticky notes (10 min):** Each observer writes one observation per sticky note. Include the user number: "U3: Expected the back button to go to the dashboard, not the previous form."
2. **Silent clustering (10 min):** Place all sticky notes on a wall. Silently, as a team, move related notes into clusters. Do not label the clusters yet.
3. **Name the clusters (5 min):** Once the clusters stabilize, give each one a descriptive label: "Navigation confusion," "Trust gap at sign-up," "Delightful onboarding moment."

### Reading the Results

Look at your grid and clusters:
- **Rows with all green:** Your storyboard nailed this part. Move fast here during iteration.
- **Rows with 3+ reds:** Critical usability failure. This needs redesign, not tweaking.
- **Consistent yellow tasks:** The concept works but the execution needs polish. These are your highest-ROI improvements.
- **Positive clusters:** Do not just fix problems — amplify what users loved.

### Presenting to Stakeholders

Stakeholders do not read spreadsheets. They respond to:
1. **Video clips** of real users struggling (or delighting) — 30-second clips are devastatingly persuasive
2. **Direct quotes** on sticky notes
3. **The traffic-light grid** — visual, immediate, undeniable

> **Tip:** Never present findings as "users did not like X." Present them as "3 out of 5 users could not complete X because Y." Evidence over opinion.`,
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
    content: `## The Sprint Is Not the End — It Is the Beginning

You have spent 5 intense sessions moving from problem to validated prototype. Now comes the most important moment: **deciding what to do with what you learned.** A sprint that produces great insights but no action is worse than no sprint at all.

### The Three-Bucket Framework

Lay out your affinity map clusters and traffic-light grid. As a team, sort every finding into one of three buckets:

**1. Build It (Green)**
Concepts that users understood, completed successfully, and responded to positively. These are validated — move them to your product backlog with high priority.

Questions to confirm:
- Did 4+ out of 5 users succeed at the related task?
- Did users express genuine interest (not just polite agreement)?
- Is the technical feasibility confirmed?

**2. Iterate and Retest (Yellow)**
Concepts that showed promise but tripped users up. These need redesign and another round of testing — not a full sprint, but a focused 1-2 day iteration cycle.

Questions to confirm:
- Did 2-3 users struggle but eventually succeed?
- Is the core idea sound, with the execution needing refinement?
- Can you identify the specific friction point to fix?

**3. Kill It (Red)**
Concepts that fundamentally did not work. Users did not understand the value, could not complete the task, or expressed clear disinterest. These save you months of building something nobody wants.

Questions to confirm:
- Did 4+ users fail or express confusion?
- Is the problem with the concept itself (not just the prototype execution)?
- Would fixing it require rethinking the core approach?

### Exercise: Build Your Action Plan

**Time:** 20 minutes

1. Sort all findings into the three buckets (10 min)
2. For each "Build" item, assign an **owner** and a **target date**
3. For each "Iterate" item, schedule a **retest date** within 2-4 weeks
4. For each "Kill" item, document **what you learned** so the insight is not lost

Write the action plan on a shared document. Take a photo of the wall. Send both to every stakeholder within 24 hours.

### The Sprint Retro (10 min)

Before the team disperses, do a quick retrospective:
- **What worked?** Which sprint activities produced the most value?
- **What was frustrating?** What would you change about the process?
- **What surprised you?** The biggest unexpected insight from testing?

### Closing

A design sprint compresses months of guesswork into days of evidence-based decision-making. The prototype you built may be disposable, but the insights you gained are permanent. Whether you are building, iterating, or killing an idea, you are making that decision with **confidence grounded in real user behavior** — and that is the entire point.

> **Tip:** Share a 2-minute video highlight reel of testing moments with your broader organization. Nothing builds design culture faster than showing real users interacting with real prototypes.`,
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
