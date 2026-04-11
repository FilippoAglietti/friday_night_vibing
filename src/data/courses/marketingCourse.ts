import type {
  Curriculum,
  Module,
  Lesson,
  QuizQuestion,
  BonusResource,
} from "@/types/curriculum";

// ─── Module 1: The AI Marketing Landscape ────────────────────────────────────

const module1Lessons: Lesson[] = [
  {
    id: "mkt-l1-1",
    title: "Why AI Changes Everything in Marketing",
    description:
      "Explore the fundamental shifts AI brings to marketing strategy, from real-time personalization to predictive decision-making.",
    format: "video",
    durationMinutes: 45,
    objectives: [
      "Identify the key ways AI disrupts traditional marketing workflows",
      "Distinguish between AI hype and practical marketing applications",
    ],
    keyPoints: [
      "AI doesn't replace marketers — it amplifies their judgment by automating repetitive analysis and surfacing patterns humans miss",
      "The shift from campaign-based to always-on marketing is powered by machine learning models that adapt in real time",
      "First-party data strategies are now essential because AI models are only as good as the data they're trained on",
      "Companies using AI in marketing report 20-30% improvements in campaign ROI on average",
    ],
    content: `## The Marketing Paradigm Shift

Let's be honest: marketing has always been part art, part science. But AI is tipping the scale toward science in ways that actually make the art better.

### What's Really Different?

Before AI, you'd launch a campaign, wait for results, analyze them over coffee, then iterate. That cycle took weeks. Now, **machine learning models can optimize creative, targeting, and bidding in real time** — sometimes making thousands of micro-adjustments before your morning standup.

But here's the nuance most people miss: AI isn't replacing your marketing instincts. It's giving you **superpowers for pattern recognition**. You still decide the strategy. AI handles the combinatorial explosion of testing every possible variation.

### Three Fundamental Shifts

1. **From segments to individuals** — Traditional marketing groups people into broad buckets. AI enables true 1:1 personalization at scale. Your email can speak differently to each of your 500,000 subscribers without you writing 500,000 versions.

2. **From reactive to predictive** — Instead of analyzing what happened last quarter, AI models forecast what's likely to happen next week. Lead scoring, churn prediction, and demand forecasting become proactive tools rather than historical reports.

3. **From gut feel to informed intuition** — The best AI-powered marketers don't abandon creativity. They use data to validate creative hypotheses faster than ever before.

### The Practical Reality

Not every AI tool lives up to its marketing page. Throughout this course, we'll focus on **what actually works today** and what's still emerging. You'll learn to evaluate AI marketing tools critically, implement the ones that deliver real ROI, and build workflows that compound over time.

> **Pro tip:** Start with one high-impact use case (like lead scoring or content optimization) rather than trying to "AI-ify" everything at once. Quick wins build organizational buy-in.

The companies winning with AI marketing aren't necessarily the ones with the biggest budgets — they're the ones with the clearest data strategy and a willingness to experiment systematically.`,
    suggestedResources: [
      {
        title: "The State of AI in Marketing 2026",
        url: "https://www.hubspot.com/state-of-ai",
        type: "article",
      },
      {
        title: "Google AI Marketing Guide",
        url: "https://marketingplatform.google.com/about/",
        type: "article",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l1-2",
    title: "The AI Marketing Tech Stack",
    description:
      "Survey the modern AI marketing technology landscape and learn how to evaluate tools for your specific needs.",
    format: "reading",
    durationMinutes: 55,
    objectives: [
      "Map the core categories of AI marketing tools and their roles",
      "Evaluate AI marketing platforms using a practical scoring framework",
    ],
    keyPoints: [
      "The AI marketing stack spans six layers: data infrastructure, analytics, content, advertising, personalization, and orchestration",
      "Best-of-breed vs. all-in-one platform decisions depend on your team size, budget, and integration complexity tolerance",
      "Always evaluate AI tools on three axes: data quality requirements, time-to-value, and ongoing maintenance burden",
      "Open-source AI models are increasingly viable for marketing tasks that don't require enterprise-scale support",
      "Integration capability is often more important than raw feature count when choosing tools",
    ],
    content: `## Navigating the AI Marketing Tool Landscape

Walk into any marketing conference and you'll hear a hundred vendors claiming AI capabilities. Let's cut through the noise and build a practical mental model for the technology that actually matters.

### The Six-Layer Stack

Think of your AI marketing tech stack as six interconnected layers:

1. **Data Infrastructure** — Your CDP (Customer Data Platform), data warehouse, and integration layer. Tools like Segment, Snowflake, and BigQuery live here. This is your foundation — everything else depends on clean, unified data.

2. **Analytics & Intelligence** — Platforms that turn raw data into insights. Google Analytics 4, Mixpanel, and Amplitude use AI for anomaly detection, predictive metrics, and automated insights.

3. **Content & Creative** — AI writing assistants, image generators, and video tools. These range from general-purpose (like ChatGPT) to marketing-specific (like Jasper or Copy.ai).

4. **Advertising & Media** — Programmatic platforms, bid management, and creative optimization tools. Google's Performance Max and Meta's Advantage+ are prime examples of AI-native advertising.

5. **Personalization & Experience** — Dynamic content engines, recommendation systems, and A/B testing platforms like Optimizely and Dynamic Yield.

6. **Orchestration & Automation** — The glue that ties everything together. Marketing automation platforms like HubSpot, Marketo, and Braze with AI-powered journey builders.

### How to Evaluate Without Getting Burned

Here's a framework I call the **DVT Score** — rate each tool 1-5 on:

- **D (Data):** How much clean data does it need to deliver value? High data requirements = longer time to ROI.
- **V (Value):** How quickly can you see measurable results? Anything over 90 days to value is risky.
- **T (Toil):** How much ongoing maintenance does it demand? Some AI tools need constant feeding and tuning.

> **Pro tip:** Ask vendors for case studies from companies your size, not just their biggest logos. Enterprise results rarely translate to mid-market reality.

### Build vs. Buy

With open-source LLMs and accessible ML frameworks, the build option is more viable than ever. But be realistic about your team's engineering capacity. **A well-integrated bought solution beats a half-built custom one** every time.`,
    suggestedResources: [
      {
        title: "MarTech Landscape Overview",
        url: "https://chiefmartec.com/martech-landscape/",
        type: "article",
      },
      {
        title: "HubSpot AI Tools Directory",
        url: "https://www.hubspot.com/products/artificial-intelligence",
        type: "tool",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l1-3",
    title: "Building Your AI Marketing Roadmap",
    description:
      "Create a 90-day implementation plan for integrating AI into your existing marketing operations.",
    format: "project",
    durationMinutes: 50,
    objectives: [
      "Design a phased AI adoption roadmap tailored to your organization's maturity level",
    ],
    keyPoints: [
      "Audit your current data readiness before committing to any AI initiative — garbage in, garbage out applies tenfold with ML",
      "Prioritize use cases by impact and feasibility using a 2x2 matrix, starting in the high-impact / low-effort quadrant",
      "Assign clear ownership and success metrics to each AI initiative from day one",
      "Plan for a 30-60-90 day cadence: quick win, foundational build, strategic scaling",
    ],
    content: `## Your 90-Day AI Marketing Roadmap

Theory is great, but let's get practical. In this project, you'll build a concrete plan for bringing AI into your marketing operation — one that your leadership team can actually approve.

### Step 1: The Data Audit (Days 1-10)

Before you touch any AI tool, answer these questions honestly:

- **Where does your customer data live?** If it's scattered across 12 spreadsheets and 4 platforms with no single source of truth, that's your first problem to solve.
- **How clean is your data?** Duplicate contacts, missing fields, and inconsistent formatting will sabotage any AI model. Spend time here — it pays dividends.
- **Do you have consent?** Privacy regulations (GDPR, CCPA, and their successors) dictate what data you can feed into AI systems. Get your legal team involved early.

### Step 2: The Opportunity Matrix (Days 11-20)

Map your potential AI use cases on two axes:

| | Low Effort | High Effort |
|---|---|---|
| **High Impact** | Start here! | Plan for Phase 2 |
| **Low Impact** | Automate quietly | Skip for now |

Common quick wins include: **email subject line optimization**, **send-time personalization**, and **basic lead scoring**. These typically require minimal data and show results within weeks.

### Step 3: The Quick Win (Days 21-45)

Pick your top-left quadrant item and ship it. Document everything:

- Baseline metrics before AI
- Implementation steps and decisions
- Results after 2-3 weeks of operation

This becomes your **internal case study** — the proof point that opens budget for bigger initiatives.

### Step 4: The Foundation (Days 46-75)

Now tackle your data infrastructure. Set up proper tracking, unify your customer profiles, and establish the data pipelines your more ambitious AI projects will need.

### Step 5: The Scale Play (Days 76-90)

With a quick win under your belt and data foundations laid, you're ready to plan your Phase 2 investments. Use your results data to build the business case.

> **Pro tip:** Document your AI adoption journey publicly within your org. Internal visibility creates advocates and reduces the "what does the marketing team even do with AI?" questions.

### Deliverable

Create a one-page roadmap document covering your audit findings, opportunity matrix, selected quick win, and Phase 2 priorities. Share it with your team for feedback.`,
    suggestedResources: [
      {
        title: "AI Readiness Assessment Template",
        url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
        type: "template",
      },
    ],
    order: 2,
  },
];

const module1Quiz: QuizQuestion[] = [
  {
    id: "mkt-q1-1",
    type: "multiple-choice",
    question:
      "What is the most critical prerequisite before implementing AI in marketing?",
    options: [
      "Hiring a dedicated AI engineering team",
      "Having clean, unified customer data",
      "Purchasing an enterprise AI platform",
      "Getting executive sponsorship from the CEO",
    ],
    correctAnswer: "Having clean, unified customer data",
    explanation:
      "AI models are only as good as the data they're trained on. Without clean, unified data, even the most sophisticated AI tools will produce unreliable results.",
    points: 10,
  },
  {
    id: "mkt-q1-2",
    type: "multiple-choice",
    question:
      "In the DVT evaluation framework for AI marketing tools, what does the 'T' stand for?",
    options: [
      "Technology compatibility",
      "Toil (ongoing maintenance burden)",
      "Training time for the team",
      "Total cost of ownership",
    ],
    correctAnswer: "Toil (ongoing maintenance burden)",
    explanation:
      "The DVT framework scores tools on Data requirements, Value (time to results), and Toil (ongoing maintenance). High-toil tools demand constant feeding and tuning, which can erode their ROI over time.",
    points: 10,
  },
  {
    id: "mkt-q1-3",
    type: "multiple-choice",
    question:
      "Which AI marketing adoption approach is recommended for the first 45 days?",
    options: [
      "Implement a full marketing automation platform overhaul",
      "Focus on a single high-impact, low-effort quick win",
      "Build custom machine learning models in-house",
      "Run a comprehensive competitive analysis of all AI tools",
    ],
    correctAnswer: "Focus on a single high-impact, low-effort quick win",
    explanation:
      "Starting with a high-impact, low-effort quick win (like email subject line optimization) generates early results that build organizational buy-in for larger AI investments.",
    points: 10,
  },
];

// ─── Module 2: Customer Intelligence with AI ────────────────────────────────

const module2Lessons: Lesson[] = [
  {
    id: "mkt-l2-1",
    title: "AI-Powered Data Collection & Enrichment",
    description:
      "Learn how to build a comprehensive customer data foundation using AI-driven collection, enrichment, and unification techniques.",
    format: "video",
    durationMinutes: 50,
    objectives: [
      "Design an AI-enhanced data collection strategy that respects privacy regulations",
      "Implement data enrichment workflows that fill gaps in customer profiles automatically",
    ],
    keyPoints: [
      "Progressive profiling uses AI to determine which data points to request at each interaction, maximizing completion rates while minimizing friction",
      "Third-party enrichment APIs can automatically append firmographic, technographic, and intent data to your existing contacts",
      "Identity resolution algorithms stitch together anonymous and known interactions across devices and channels into unified profiles",
      "Always implement a consent management layer before scaling data collection — it's cheaper to build compliance in than to bolt it on later",
    ],
    content: `## Building Your Customer Intelligence Foundation

Every AI-powered marketing strategy lives or dies by the quality of its data. Let's talk about how to collect, enrich, and unify customer data the smart way.

### Beyond Basic Forms

Traditional data collection meant slapping a form on a landing page and hoping people filled it out. AI changes the game with **progressive profiling** — intelligently deciding what to ask each person based on what you already know about them.

Here's how it works: a first-time visitor sees a simple email capture. A returning visitor who already gave their email gets asked about their role. Someone who's visited the pricing page three times gets a targeted question about team size. The AI optimizes the sequence to **maximize data completeness while minimizing drop-off**.

### The Enrichment Layer

You don't need to ask customers for everything. Modern enrichment APIs can automatically append:

- **Firmographic data** — company size, industry, revenue, location
- **Technographic data** — what software tools they use (especially valuable for B2B)
- **Intent data** — signals that indicate active research or buying interest
- **Social data** — professional background, interests, and network

Tools like Clearbit, ZoomInfo, and Apollo.io integrate directly with your CRM and marketing automation platform. A single email address can unlock dozens of data points.

### Identity Resolution

Your customer interacts with you across email, your website, social media, mobile apps, and maybe even physical stores. **Identity resolution** is the AI-driven process of stitching all those touchpoints into one unified profile.

This is harder than it sounds. The same person might use different email addresses, browse on multiple devices, and have various aliases. Modern identity resolution uses:

- **Deterministic matching** — exact identifiers like email or phone
- **Probabilistic matching** — behavioral patterns, device fingerprints, and statistical models
- **Graph-based approaches** — mapping relationships between identifiers

### Privacy-First Approach

Here's the non-negotiable: **build consent management into your data architecture from day one**. This means:

- Clear opt-in mechanisms with specific purpose declarations
- Easy-to-use preference centers
- Automated data retention and deletion policies
- Audit trails for all data processing activities

> **Pro tip:** Think of privacy compliance as a competitive advantage, not a burden. Customers who trust you with their data are more likely to share the high-quality signals your AI models need.`,
    suggestedResources: [
      {
        title: "Customer Data Platform Buyer's Guide",
        url: "https://segment.com/customer-data-platform/",
        type: "article",
      },
      {
        title: "Clearbit Data Enrichment Documentation",
        url: "https://clearbit.com/platform/enrichment",
        type: "tool",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l2-2",
    title: "Intelligent Customer Segmentation",
    description:
      "Move beyond basic demographic segmentation to AI-driven behavioral clusters that predict future actions.",
    format: "interactive",
    durationMinutes: 55,
    objectives: [
      "Build AI-driven customer segments based on behavioral patterns and predicted lifetime value",
      "Implement dynamic segmentation that automatically updates as customer behavior evolves",
    ],
    keyPoints: [
      "Traditional segmentation uses static rules (age, location, job title); AI segmentation discovers natural behavioral clusters in your data",
      "RFM analysis (Recency, Frequency, Monetary value) combined with ML clustering reveals actionable customer tiers",
      "Predictive segments group customers by future behavior — like likelihood to purchase, churn, or upgrade — not just past actions",
      "Dynamic segments should refresh automatically as new data flows in, not wait for a quarterly manual review",
      "Start with 5-8 segments; too many creates operational complexity without proportional return",
    ],
    content: `## Segmentation That Actually Predicts the Future

If your segments are still "18-24 female urban" and "enterprise accounts over $50K ARR," you're leaving massive value on the table. AI-powered segmentation doesn't just describe who your customers are — it predicts what they'll do next.

### From Rules to Clusters

Traditional segmentation is top-down: you define the rules, the system sorts people into buckets. AI segmentation is bottom-up: you feed the algorithm behavioral data, and it **discovers natural groupings** you might never have hypothesized.

A clustering algorithm might reveal that your most valuable customers aren't defined by company size at all — they're defined by a specific combination of feature usage patterns, content consumption habits, and engagement timing. That's an insight no human analyst would find by staring at a spreadsheet.

### The RFM+ Framework

Start with the classic **RFM model** (Recency, Frequency, Monetary value) and then layer in AI:

- **Recency** — How recently did they engage? AI adds: *predicted next engagement date*
- **Frequency** — How often do they interact? AI adds: *engagement velocity trend*
- **Monetary** — How much do they spend? AI adds: *predicted lifetime value*

This gives you segments like "High-value, accelerating engagement, due for next purchase in 7 days" — which is infinitely more actionable than "big spender."

### Predictive Segmentation in Practice

The real power comes from **forward-looking segments**:

- **Likely to churn** — Customers showing early warning patterns (decreased login frequency, support tickets, reduced feature usage)
- **Ready to upgrade** — Users hitting usage limits or exploring premium features
- **Advocacy candidates** — High-satisfaction, high-engagement customers who haven't been asked for referrals yet
- **Re-engagement targets** — Dormant customers with high historical value worth winning back

### Building Your Segment Architecture

**Keep it manageable.** I've seen teams create 47 segments and then do nothing differently for 40 of them. Start with 5-8 actionable segments where you can genuinely deliver a differentiated experience.

For each segment, define:
1. The **behavioral criteria** (what puts someone in this segment)
2. The **business objective** (what you want this segment to do)
3. The **differentiated experience** (what you'll do differently for them)
4. The **success metric** (how you'll know it's working)

> **Pro tip:** Set up a monthly segment health review. If a segment has grown to contain more than 40% of your audience, it's too broad to be actionable. If it contains less than 2%, it's probably not worth the operational overhead.`,
    suggestedResources: [
      {
        title: "Customer Segmentation with Python (Google Cloud)",
        url: "https://cloud.google.com/architecture/predicting-customer-lifetime-value-with-ai-platform",
        type: "article",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l2-3",
    title: "AI Persona Building & Journey Mapping",
    description:
      "Use AI to generate data-backed personas and map customer journeys that reflect actual behavioral patterns.",
    format: "discussion",
    durationMinutes: 45,
    objectives: [
      "Create AI-generated personas grounded in real behavioral data rather than assumptions",
      "Map customer journeys using AI-identified touchpoint sequences and drop-off patterns",
    ],
    keyPoints: [
      "AI personas are derived from behavioral clusters in your actual data — they reflect real patterns, not workshop guesses",
      "Journey mapping with AI reveals the actual paths customers take, including the unexpected ones that traditional mapping misses",
      "Sentiment analysis across support tickets, reviews, and social mentions adds emotional context to each journey stage",
      "Update personas quarterly using fresh behavioral data; static personas become fiction within 6 months",
    ],
    content: `## Personas and Journeys Grounded in Reality

Let's have a candid conversation about buyer personas. Most of them are fiction. They're built in a workshop where marketing and sales debate stereotypes, someone names them "Marketing Mary," and then they sit in a slide deck forever. AI changes this completely.

### Data-Driven Persona Generation

Instead of guessing who your customers are, AI personas emerge from **analyzing actual behavioral patterns** across your customer base. The process looks like this:

1. **Feed the algorithm** your customer data — purchase history, content engagement, support interactions, feature usage, demographic information
2. **Let clustering identify** natural groupings of similar behavior
3. **Enrich each cluster** with qualitative data — interview quotes, support ticket themes, review sentiment
4. **Name and narrative** — now give each cluster a name and story, but grounded in data rather than assumption

The difference is profound. A traditional persona says "Enterprise Emma is a VP of Marketing at a Fortune 500 company." An AI-generated persona says "**Cluster 3 customers** engage primarily through long-form content, evaluate for an average of 67 days, involve 4.2 stakeholders, and convert 3.1x more often when they attend a webinar in weeks 2-4 of their journey."

### Journey Mapping That Reflects Reality

Traditional journey maps show a neat, linear path: Awareness > Consideration > Decision > Purchase. Real customer journeys look like a plate of spaghetti.

AI-powered journey analysis uses **sequence mining** and **path analysis** to reveal:

- **The actual most common paths** to conversion (often surprising)
- **Where people get stuck** or loop back (friction points)
- **Which touchpoints are causally linked** to conversion vs. just correlated
- **Journey duration and velocity** variations across segments

### Adding Emotional Intelligence

Modern NLP can analyze the **sentiment and emotion** in customer communications at each journey stage:

- What frustrations do people express in pre-purchase support chats?
- How does sentiment shift between trial signup and first value moment?
- What language do churning customers use in their final interactions?

This emotional layer turns a process diagram into a genuine empathy tool.

### Keeping Personas Alive

The biggest mistake is treating personas as a one-time deliverable. Build a **living persona dashboard** that:

- Updates behavioral metrics monthly
- Flags when cluster composition shifts significantly
- Surfaces new emerging segments
- Tracks how each persona responds to your latest campaigns

> **Pro tip:** Present AI personas to your sales team and ask "does this match what you see?" Their frontline experience is the best validation — and the collaboration builds cross-functional buy-in.`,
    suggestedResources: [
      {
        title: "Jobs to Be Done Framework for Personas",
        url: "https://hbr.org/2016/09/know-your-customers-jobs-to-be-done",
        type: "article",
      },
      {
        title: "Customer Journey Analytics in Google Analytics 4",
        url: "https://support.google.com/analytics/answer/9267568",
        type: "tool",
      },
    ],
    order: 2,
  },
];

const module2Quiz: QuizQuestion[] = [
  {
    id: "mkt-q2-1",
    type: "multiple-choice",
    question:
      "What is the primary advantage of AI-powered customer segmentation over traditional rule-based segmentation?",
    options: [
      "It requires less customer data to produce segments",
      "It discovers natural behavioral groupings that humans might never hypothesize",
      "It always creates more segments than traditional methods",
      "It eliminates the need for qualitative research",
    ],
    correctAnswer:
      "It discovers natural behavioral groupings that humans might never hypothesize",
    explanation:
      "AI clustering algorithms analyze behavioral patterns bottom-up, finding natural groupings in the data that a human analyst defining top-down rules might never consider.",
    points: 10,
  },
  {
    id: "mkt-q2-2",
    type: "multiple-choice",
    question:
      "In the RFM+ framework, what does AI add to the traditional 'Monetary' dimension?",
    options: [
      "Average order value calculations",
      "Predicted customer lifetime value",
      "Total revenue attribution by channel",
      "Discount sensitivity scoring",
    ],
    correctAnswer: "Predicted customer lifetime value",
    explanation:
      "While traditional RFM looks at historical monetary value, the AI-enhanced version adds predicted lifetime value — a forward-looking metric that helps prioritize customers based on future potential, not just past spending.",
    points: 10,
  },
];

// ─── Module 3: AI-Powered Content Strategy ───────────────────────────────────

const module3Lessons: Lesson[] = [
  {
    id: "mkt-l3-1",
    title: "Content Generation with AI: Strategy, Not Shortcuts",
    description:
      "Learn to use AI as a content creation force multiplier while maintaining brand voice, originality, and audience trust.",
    format: "video",
    durationMinutes: 50,
    objectives: [
      "Develop a systematic AI content workflow that maintains quality and brand consistency",
      "Identify which content types benefit most from AI assistance vs. human-only creation",
    ],
    keyPoints: [
      "AI excels at first drafts, variations, and structured content — but human editorial judgment remains essential for strategy, nuance, and brand voice",
      "Build a 'brand voice prompt library' that encodes your tone, terminology, and style guidelines for consistent AI-assisted outputs",
      "The highest-ROI use of AI in content isn't generating articles from scratch — it's repurposing one piece of content into 10 formats",
      "Always fact-check AI-generated claims, statistics, and expert attributions before publishing",
      "Disclose AI involvement where regulations or audience expectations require it",
    ],
    content: `## AI Content That Doesn't Sound Like AI

Here's the uncomfortable truth about AI-generated content: your audience can probably tell. Generic, surface-level, overly structured prose with that distinctive "here are five reasons why" cadence. Let's talk about how to use AI as a **content force multiplier** without sacrificing what makes your brand's content worth reading.

### The Content Spectrum

Not all content benefits equally from AI assistance. Think of it as a spectrum:

**High AI leverage** (save 60-80% of creation time):
- Product descriptions and variations
- Social media post variations
- Email subject lines and preview text
- Data-driven reports and summaries
- SEO meta descriptions and alt text

**Medium AI leverage** (save 30-50% of creation time):
- Blog post first drafts
- Newsletter outlines and drafts
- Case study structures
- Landing page copy variations
- Ad creative iterations

**Low AI leverage** (human-driven, AI-assisted):
- Thought leadership and opinion pieces
- Brand storytelling and narratives
- Crisis communications
- Executive communications
- Deeply technical or original research content

### Building Your Brand Voice Prompt Library

The secret to consistent AI content is **systematic prompt engineering**. Create a living document that includes:

- **Voice attributes** — "conversational but authoritative, like a smart friend who works in the industry"
- **Vocabulary rules** — words you always use, words you never use, industry jargon preferences
- **Structural preferences** — short paragraphs, lots of headers, bullet points for lists, always include a practical example
- **Audience context** — who's reading, what they know, what they care about

Encode these into reusable prompt templates for each content type. Your team should never start from a blank prompt.

### The Repurposing Multiplier

The highest ROI isn't generating net-new content — it's **intelligent repurposing**. One 2,000-word blog post can become:

- 10 social media posts (each highlighting a different insight)
- 1 email newsletter summary
- 1 infographic outline
- 5 potential podcast talking points
- 3 LinkedIn carousel slides
- 1 video script for a 2-minute explainer

AI handles this repurposing beautifully because it's working from your existing, human-approved content.

> **Pro tip:** Create a "content atomization" workflow where every pillar piece automatically generates derivative assets. Set up prompt templates for each derivative format and batch-process them weekly.`,
    suggestedResources: [
      {
        title: "Content Marketing Strategy Guide",
        url: "https://contentmarketinginstitute.com/developing-a-strategy/",
        type: "article",
      },
      {
        title: "Jasper AI Content Platform",
        url: "https://www.jasper.ai/",
        type: "tool",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l3-2",
    title: "SEO in the Age of AI Search",
    description:
      "Adapt your SEO strategy for AI-powered search experiences, including generative search results, answer engines, and evolving ranking signals.",
    format: "reading",
    durationMinutes: 50,
    objectives: [
      "Redesign content for AI search features including featured snippets, generative answers, and conversational queries",
      "Use AI tools to scale keyword research, content gap analysis, and technical SEO audits",
    ],
    keyPoints: [
      "AI search (Google's AI Overviews, Bing Chat, Perplexity) prioritizes content that directly answers questions with authoritative, well-structured information",
      "Topical authority matters more than ever — AI models assess whether your site comprehensively covers a subject area, not just individual keywords",
      "Structured data markup (Schema.org) is critical for helping AI systems understand and cite your content correctly",
      "Long-tail, conversational queries are growing as people interact with search more naturally through AI interfaces",
    ],
    content: `## SEO After the AI Search Revolution

The SEO playbook you learned five years ago is half-obsolete. AI-powered search experiences are fundamentally changing how content gets discovered, consumed, and attributed. Let's figure out what still works, what's changed, and where the opportunities are.

### The New Search Landscape

Google's AI Overviews, Bing's Copilot, Perplexity, and other AI answer engines now synthesize information from multiple sources into direct answers. This means:

- **Zero-click searches are increasing** — users get answers without visiting your site
- **Being a cited source matters** — if the AI references your content, you still win authority and some traffic
- **Content quality signals are amplified** — AI models are better at distinguishing genuinely helpful content from keyword-stuffed filler

### What to Optimize For

**1. Topical Authority**

AI models assess your **entire site's coverage** of a topic, not just individual pages. If you write one blog post about "marketing automation," you're competing against sites that have 50 interconnected pieces covering every subtopic.

Build **content clusters**: a pillar page supported by 8-12 detailed subtopic pages, all interlinked. This signals deep expertise to both traditional algorithms and AI models.

**2. Direct Answer Formatting**

Structure your content so AI can easily extract answers:

- Lead with the answer, then elaborate (inverted pyramid)
- Use clear H2/H3 headers as questions
- Include definition-style sentences ("X is a technique that...")
- Provide numbered steps for process-based queries
- Add comparison tables for "vs." and "best" queries

**3. E-E-A-T on Steroids**

Experience, Expertise, Authoritativeness, and Trustworthiness matter more than ever. AI systems are trained to prefer content from **credible, identifiable sources**. This means:

- Real author bios with verifiable credentials
- Citations and links to primary sources
- Original data, case studies, and first-hand experience
- Regular content updates with visible timestamps

### AI Tools for SEO Scale

Use AI to **accelerate your SEO workflows**, not replace SEO thinking:

- **Keyword clustering** — AI can group thousands of keywords into topical clusters automatically
- **Content gap analysis** — Compare your coverage against top-ranking competitors at scale
- **Technical audits** — AI-powered crawlers identify issues faster and prioritize by impact
- **SERP analysis** — Understand intent patterns and content format preferences for any query

> **Pro tip:** Monitor how often AI search engines cite your content. Tools are emerging for this, but you can start by searching your brand in Perplexity and Google AI Overviews to see where you appear and where you're missing.`,
    suggestedResources: [
      {
        title: "Semrush SEO Toolkit",
        url: "https://www.semrush.com/features/",
        type: "tool",
      },
      {
        title: "Google Search Central Documentation",
        url: "https://developers.google.com/search/docs",
        type: "article",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l3-3",
    title: "AI Copywriting: Emails, Ads & Landing Pages",
    description:
      "Master AI-assisted copywriting for the three highest-converting marketing formats, with hands-on practice and frameworks.",
    format: "interactive",
    durationMinutes: 50,
    objectives: [
      "Write high-converting email, ad, and landing page copy using AI as a drafting and iteration partner",
    ],
    keyPoints: [
      "AI-generated email subject lines can be A/B tested at massive scale — generate 20 variations, test the top 5, deploy the winner automatically",
      "For ad copy, use AI to generate variations across emotional angles (fear, aspiration, curiosity, social proof) then let performance data pick winners",
      "Landing page copy benefits from AI-driven personalization — dynamically adjust headlines, social proof, and CTAs based on visitor segment",
      "The AIDA framework (Attention, Interest, Desire, Action) still works, but AI lets you create dozens of variations at each stage",
    ],
    content: `## AI-Powered Copywriting That Converts

Copywriting is where AI delivers its fastest, most measurable marketing ROI. You can go from one headline to fifty variations in minutes, test them all, and let data crown the winner. Let's get into the specifics for each high-impact format.

### Email Copywriting with AI

Email remains the highest-ROI marketing channel, and AI supercharges it at every level:

**Subject Lines** — This is your highest-leverage AI copywriting opportunity. Generate 20 variations in seconds, score them with predictive open-rate models, A/B test the top 5 with a 10% holdout, and auto-deploy the winner to the remaining 90%.

Framework for subject line prompts:
- Specify the **emotion** you want to trigger (curiosity, urgency, exclusivity, humor)
- Include the **key value prop** or offer
- Set **character count constraints** (keep under 50 for mobile)
- Request variations with and without personalization tokens

**Body Copy** — Use AI to draft the structure, but edit for voice and authenticity. The best AI-assisted emails follow this flow:
1. **Hook** — One sentence that connects to the subject line's promise
2. **Story/Context** — Brief, relevant setup (2-3 sentences max)
3. **Value** — What you're offering and why it matters now
4. **Proof** — One data point or testimonial
5. **CTA** — Clear, single action

### Ad Copy at Scale

Advertising demands volume. You need variations across platforms, formats, audiences, and creative angles. AI excels here:

- **Generate variations by emotional angle**: Fear of missing out, aspiration, curiosity gap, social proof, logical comparison
- **Adapt copy per platform**: LinkedIn (professional, longer), Instagram (visual, punchy), Google Ads (keyword-rich, direct)
- **Iterate on winners**: Take your top-performing ad and ask AI for 10 variations that maintain the core message but test different hooks, CTAs, or framing

### Landing Page Copy

Landing pages are where AI personalization gets really powerful. **Dynamic content blocks** can adjust based on:

- **Traffic source** — Different headline for Google Ads vs. email vs. social
- **Visitor segment** — Adjust social proof to match the visitor's industry
- **Behavioral signals** — Returning visitors see different messaging than first-timers

For each section of your landing page, generate 3-5 variations and let your testing platform optimize the combination:

- **Hero headline**: benefit-driven, specific, urgent
- **Subhead**: clarify the mechanism or unique approach
- **Social proof**: match to the visitor's profile
- **CTA**: test action verbs, risk-reversals, and urgency language

> **Pro tip:** Build a "swipe file" prompt — feed your best-performing historical copy to AI and ask it to identify the patterns that made those pieces work. Then use those patterns as constraints for generating new copy.`,
    suggestedResources: [
      {
        title: "Really Good Emails — Inspiration Gallery",
        url: "https://reallygoodemails.com/",
        type: "article",
      },
      {
        title: "Unbounce Landing Page Best Practices",
        url: "https://unbounce.com/landing-page-articles/landing-page-best-practices/",
        type: "article",
      },
    ],
    order: 2,
  },
];

const module3Quiz: QuizQuestion[] = [
  {
    id: "mkt-q3-1",
    type: "multiple-choice",
    question:
      "Which content type benefits MOST from AI-assisted creation in terms of time savings?",
    options: [
      "Thought leadership articles expressing original opinions",
      "Product descriptions and variations",
      "Crisis communications requiring nuanced messaging",
      "Executive keynote speeches",
    ],
    correctAnswer: "Product descriptions and variations",
    explanation:
      "Product descriptions are structured, formulaic content that AI can generate rapidly with high quality. They fall in the 'High AI leverage' category, saving 60-80% of creation time compared to thought leadership or executive communications which require deep human judgment.",
    points: 10,
  },
  {
    id: "mkt-q3-2",
    type: "multiple-choice",
    question:
      "How has AI search changed SEO strategy?",
    options: [
      "Keywords no longer matter at all",
      "Topical authority across your entire site matters more than individual keyword targeting",
      "Only video content ranks well now",
      "Backlinks have become the sole ranking factor",
    ],
    correctAnswer:
      "Topical authority across your entire site matters more than individual keyword targeting",
    explanation:
      "AI search models evaluate your site's comprehensive coverage of a topic area, not just individual pages. Building content clusters with pillar pages and supporting subtopic pages signals deep expertise to both AI models and traditional algorithms.",
    points: 10,
  },
  {
    id: "mkt-q3-3",
    type: "multiple-choice",
    question:
      "What is the highest-leverage AI copywriting opportunity in email marketing?",
    options: [
      "Writing entire email newsletters from scratch with no editing",
      "Generating and testing multiple subject line variations at scale",
      "Personalizing the sender name for each recipient",
      "Automating unsubscribe page copy",
    ],
    correctAnswer:
      "Generating and testing multiple subject line variations at scale",
    explanation:
      "Subject lines have the most direct impact on email performance (open rates) and AI can generate dozens of variations rapidly. Combined with automated A/B testing and winner deployment, this delivers fast, measurable ROI.",
    points: 10,
  },
];

// ─── Module 4: Predictive Analytics for Growth ───────────────────────────────

const module4Lessons: Lesson[] = [
  {
    id: "mkt-l4-1",
    title: "Demand Forecasting & Trend Detection",
    description:
      "Use AI-powered forecasting models to predict demand patterns, identify emerging trends, and allocate marketing budgets proactively.",
    format: "video",
    durationMinutes: 55,
    objectives: [
      "Interpret AI demand forecasts and translate them into actionable marketing budget decisions",
      "Set up trend detection alerts that surface emerging opportunities before competitors act",
    ],
    keyPoints: [
      "AI forecasting models incorporate seasonality, market signals, competitive activity, and macroeconomic data — not just your historical trends",
      "Ensemble models (combining multiple forecasting approaches) consistently outperform any single method",
      "Trend detection works best when monitoring both quantitative signals (search volume, social mentions) and qualitative signals (sentiment shifts, emerging terminology)",
      "Over-fitting is the biggest risk — validate forecasts against holdout data and track prediction accuracy over time",
      "Use forecasts to shift budget allocation weekly, not just during annual planning",
    ],
    content: `## Predicting Demand Before It Arrives

The best time to launch a campaign is before demand peaks — not after. AI-powered demand forecasting gives you the ability to **anticipate market movements** and position your marketing accordingly. Let's dig into how it works and how to use it without getting burned by over-confidence in models.

### How AI Forecasting Differs from Spreadsheet Projections

Your old approach: take last year's numbers, add a growth percentage, adjust for known seasonality. Done.

AI forecasting models ingest **dozens of input signals** simultaneously:

- **Internal data**: historical sales, pipeline velocity, website traffic patterns, email engagement trends
- **Market signals**: search volume trends (Google Trends API), social conversation volume, competitor activity
- **External factors**: economic indicators, industry events, weather patterns, regulatory changes
- **Leading indicators**: intent data signals, content consumption patterns, trial signups velocity

The model identifies complex relationships between these signals that no human analyst could track manually. For example, it might discover that a specific combination of rising search volume + competitor price increase + seasonal pattern reliably predicts a demand spike 3-4 weeks later.

### Ensemble Forecasting

No single forecasting method dominates in all situations. **Ensemble models** combine multiple approaches:

- **Time-series models** (ARIMA, Prophet) — great for seasonal patterns
- **Regression models** — capture relationships between external variables and demand
- **Neural networks** — find non-linear patterns in complex, multi-variable datasets
- **Bayesian methods** — naturally handle uncertainty and update predictions as new data arrives

The ensemble averages or weights these predictions, producing forecasts that are consistently more accurate than any single model.

### From Forecast to Action

A forecast sitting in a dashboard is worthless. Here's how to operationalize it:

1. **Weekly budget reallocation** — Shift spend toward channels and campaigns aligned with predicted demand spikes
2. **Content calendar alignment** — Schedule content publication to build awareness 2-4 weeks before predicted demand
3. **Inventory and capacity planning** — Alert sales and ops teams about predicted volume changes
4. **Competitive positioning** — When forecasts show market expansion, invest in awareness; when they show contraction, invest in conversion

### Avoiding Forecast Failure

- **Track accuracy religiously** — Compare predictions to actuals and calculate MAPE (Mean Absolute Percentage Error)
- **Beware of overfitting** — A model that perfectly explains the past often fails at predicting the future
- **Maintain human override capability** — AI can't predict truly unprecedented events (new regulations, viral moments, black swans)

> **Pro tip:** Set up "prediction markets" within your marketing team. Have people make their own forecasts alongside the AI model. Comparing human vs. machine predictions builds intuition and catches model blind spots.`,
    suggestedResources: [
      {
        title: "Google Trends for Market Research",
        url: "https://trends.google.com/trends/",
        type: "tool",
      },
      {
        title: "Facebook Prophet Forecasting Library",
        url: "https://facebook.github.io/prophet/",
        type: "tool",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l4-2",
    title: "Lead Scoring & Pipeline Prediction",
    description:
      "Build AI lead scoring models that surface your best prospects and predict pipeline outcomes with real accuracy.",
    format: "interactive",
    durationMinutes: 50,
    objectives: [
      "Design and implement a multi-signal AI lead scoring model that outperforms simple rule-based scoring",
      "Use pipeline prediction to forecast revenue and identify deals at risk",
    ],
    keyPoints: [
      "AI lead scores combine demographic fit, behavioral engagement, intent signals, and timing patterns — weighting them based on actual conversion data, not gut feel",
      "The best lead scoring models are trained on your closed-won AND closed-lost data; you need both positive and negative examples",
      "Pipeline prediction models can estimate deal probability, expected close date, and deal size based on patterns from historical deals",
      "Regularly retrain scoring models as your market and product evolve — a model trained on last year's data may reflect last year's buyer, not today's",
    ],
    content: `## Lead Scoring That Sales Actually Trusts

Here's a common scenario: marketing builds a lead scoring model, assigns scores, passes "MQLs" to sales, and sales ignores them because the scores don't match reality. AI-powered lead scoring fixes this — but only if you build it right.

### Beyond Point-Based Scoring

Traditional lead scoring assigns arbitrary points: downloaded a whitepaper = 10 points, VP title = 15 points, visited pricing page = 20 points. The thresholds are guesses, the weights are vibes, and the model degrades silently over time.

AI scoring flips this: you give the model your **historical conversion data** (who actually became a customer and who didn't), and it discovers which signals truly predict conversion. The results often surprise people:

- Job title might matter less than you think
- Specific content consumption sequences might matter more
- Engagement recency often outweighs engagement volume
- Company technographic signals can be stronger predictors than firmographic ones

### Building Your Scoring Model

**Data you need:**
- 6-12 months of lead data with known outcomes (won, lost, or disqualified)
- Behavioral data (page views, content downloads, email engagement, event attendance)
- Demographic/firmographic data (title, company size, industry, technology used)
- Intent data (third-party signals indicating active research)

**The modeling process:**
1. **Feature engineering** — Transform raw data into meaningful variables (e.g., "days since last website visit" rather than just "last visit date")
2. **Model training** — Use classification algorithms (gradient boosting, random forests, or logistic regression) on your historical data
3. **Validation** — Test on holdout data the model hasn't seen; check precision, recall, and AUC metrics
4. **Calibration** — Ensure predicted probabilities match actual conversion rates
5. **Deployment** — Integrate scores into your CRM and automation platform

### Pipeline Prediction

Take lead scoring one step further by predicting **deal outcomes** for your active pipeline:

- **Win probability** — How likely is each deal to close, based on current signals?
- **Expected close date** — When will it actually close (not the rep's optimistic estimate)?
- **Deal size prediction** — What's the likely contract value based on similar deals?

These predictions power more accurate revenue forecasts and help managers coach reps on deals with the highest leverage.

### Maintaining Model Health

- **Retrain quarterly** — Your market, product, and buyers evolve
- **Monitor feature drift** — If a previously important signal stops mattering, investigate why
- **Track sales feedback** — Create a lightweight mechanism for reps to flag scoring misses

> **Pro tip:** Show sales reps the *reasons* behind each score, not just the number. "This lead scores 87 because they visited pricing 3 times, match your ideal company profile, and showed intent signals on G2" is infinitely more useful than just "Score: 87."`,
    suggestedResources: [
      {
        title: "HubSpot Predictive Lead Scoring",
        url: "https://www.hubspot.com/products/marketing/lead-scoring",
        type: "tool",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l4-3",
    title: "Churn Prediction & Retention Strategy",
    description:
      "Build early-warning churn models and design AI-powered retention campaigns that save at-risk customers before they leave.",
    format: "reading",
    durationMinutes: 45,
    objectives: [
      "Implement a churn prediction model that identifies at-risk customers with enough lead time for intervention",
      "Design automated retention workflows triggered by churn risk signals",
    ],
    keyPoints: [
      "Effective churn models detect warning signs 30-60 days before cancellation, giving your team time to intervene",
      "Behavioral churn signals (reduced login frequency, fewer features used, declining support satisfaction) are stronger predictors than demographic factors",
      "Not all churning customers are worth saving — focus retention efforts on high-LTV accounts where intervention is cost-effective",
      "Automated retention workflows should escalate through increasingly personalized touchpoints: automated email, personalized offer, human outreach",
    ],
    content: `## Predicting and Preventing Customer Churn

Acquiring a new customer costs 5-7x more than retaining an existing one. Yet most marketing teams pour resources into acquisition while treating retention as an afterthought. AI-powered churn prediction changes the economics dramatically by telling you **who's about to leave** with enough advance warning to do something about it.

### The Anatomy of Churn

Customers rarely churn overnight. There's usually a **decay curve** — a gradual disengagement that unfolds over weeks or months. AI models detect this pattern by tracking:

**Engagement signals:**
- Login frequency decline (the #1 predictor for SaaS products)
- Feature usage breadth narrowing (using fewer parts of your product)
- Session duration decreasing
- Content engagement dropping (not opening emails, not reading blog)

**Satisfaction signals:**
- Support ticket sentiment trending negative
- NPS or CSAT scores declining
- Social media sentiment shifting
- Complaints increasing in frequency or severity

**Transactional signals:**
- Payment method expiring without renewal
- Downgrade inquiries
- Usage approaching plan limits without upgrade interest
- Contract renewal discussions stalling

### Building the Churn Model

The technical approach mirrors lead scoring but predicts a different outcome:

1. **Label your data** — Identify customers who churned in the past 12-18 months and those who didn't
2. **Engineer features** — Calculate rolling averages, trend slopes, and comparative metrics (e.g., "this customer's login frequency vs. the cohort average")
3. **Train the model** — Survival analysis and gradient boosting methods work particularly well for churn prediction
4. **Set the prediction window** — Optimize for 30-60 days of lead time; too early means false positives, too late means no time to act

### The Retention Playbook

Once you can predict churn, build an **automated escalation workflow**:

**Risk Level: Low-Medium (score 40-60)**
- Trigger: automated re-engagement email sequence
- Content: feature highlights they haven't tried, success stories from similar customers, helpful tips
- Goal: reactivate engagement naturally

**Risk Level: Medium-High (score 60-80)**
- Trigger: personalized offer (extended trial of premium features, dedicated training session, discount on renewal)
- Channel: personal email from their CSM or account manager
- Goal: demonstrate additional value and address potential pain points

**Risk Level: High (score 80+)**
- Trigger: human outreach (phone call or video meeting)
- Action: understand the root cause, solve the problem, escalate internally if needed
- Goal: save the relationship with direct attention and concrete solutions

### The Economics of Retention

Not every at-risk customer is worth saving. Calculate the **retention ROI** for each intervention:

**Retention ROI = (Predicted remaining LTV × Save probability) - Intervention cost**

Focus your most expensive interventions (human outreach, significant discounts) on customers where this equation is clearly positive.

> **Pro tip:** Create a "churn autopsy" process. For every customer who does churn, analyze what signals the model caught, what it missed, and what intervention was attempted. Feed this back into model retraining.`,
    suggestedResources: [
      {
        title: "Gainsight Customer Success Platform",
        url: "https://www.gainsight.com/product/",
        type: "tool",
      },
      {
        title: "Churn Prediction Best Practices",
        url: "https://www.profitwell.com/recur/all/customer-churn-rate",
        type: "article",
      },
    ],
    order: 2,
  },
];

const module4Quiz: QuizQuestion[] = [
  {
    id: "mkt-q4-1",
    type: "multiple-choice",
    question:
      "Why do ensemble forecasting models outperform single-method approaches?",
    options: [
      "They require less data to train",
      "They combine multiple forecasting methods, each capturing different patterns, and average their predictions for higher accuracy",
      "They are always faster to compute",
      "They eliminate the need for human oversight",
    ],
    correctAnswer:
      "They combine multiple forecasting methods, each capturing different patterns, and average their predictions for higher accuracy",
    explanation:
      "Ensemble models combine the strengths of different approaches (time-series for seasonality, regression for external variables, neural networks for non-linear patterns) and produce forecasts that are consistently more reliable than any single method.",
    points: 10,
  },
  {
    id: "mkt-q4-2",
    type: "multiple-choice",
    question:
      "What is the strongest category of churn prediction signals for SaaS products?",
    options: [
      "Demographic factors like company size and industry",
      "Behavioral engagement signals like login frequency and feature usage",
      "Payment history and billing information",
      "The customer's original acquisition channel",
    ],
    correctAnswer:
      "Behavioral engagement signals like login frequency and feature usage",
    explanation:
      "Behavioral signals (especially declining login frequency, narrowing feature usage, and decreasing session duration) are the strongest predictors of churn because they directly reflect the customer's changing relationship with the product.",
    points: 10,
  },
  {
    id: "mkt-q4-3",
    type: "multiple-choice",
    question:
      "What is the recommended lead time window for churn prediction models?",
    options: [
      "1-3 days — just-in-time intervention",
      "7-14 days — short enough to be accurate",
      "30-60 days — enough time for meaningful intervention",
      "90-180 days — maximum advance warning",
    ],
    correctAnswer: "30-60 days — enough time for meaningful intervention",
    explanation:
      "A 30-60 day prediction window balances accuracy with actionability. Too short (1-14 days) doesn't leave enough time for intervention. Too long (90-180 days) dramatically increases false positive rates and prediction uncertainty.",
    points: 10,
  },
];

// ─── Module 5: Marketing Automation & Personalization ────────────────────────

const module5Lessons: Lesson[] = [
  {
    id: "mkt-l5-1",
    title: "Building Intelligent Email Automation Flows",
    description:
      "Design email sequences that adapt in real time to recipient behavior, using AI to optimize timing, content, and frequency.",
    format: "project",
    durationMinutes: 55,
    objectives: [
      "Design a multi-branch email automation flow with AI-driven send-time optimization and dynamic content blocks",
      "Implement suppression and fatigue management rules that prevent over-communication",
    ],
    keyPoints: [
      "AI send-time optimization analyzes each recipient's historical engagement patterns to determine their ideal delivery window",
      "Dynamic content blocks swap in different copy, images, and CTAs based on the recipient's segment, behavior, and journey stage",
      "Frequency capping with AI considers the recipient's individual tolerance — some people want daily updates, others prefer weekly digests",
      "Branch logic should be behavior-driven (what did they do?) not just attribute-driven (who are they?)",
      "Always include natural off-ramps — it's better to let disengaged contacts exit gracefully than to keep blasting them",
    ],
    content: `## Email Automation That Feels Like a Conversation

The difference between good and great email automation isn't complexity — it's intelligence. A 30-email nurture sequence that ignores recipient behavior is just sophisticated spam. Let's build flows that **listen and adapt**.

### The Architecture of Smart Flows

Every AI-powered email flow has four core components:

**1. Entry Triggers**
Move beyond simple triggers like "filled out form." AI-enhanced triggers consider:
- What the person did + what it means in context
- Behavioral intensity (casual browser vs. deep researcher)
- Where they are in the overall journey (new vs. returning)

**2. Decision Nodes**
This is where AI shines. Instead of rigid if/then branches, use:
- **Engagement prediction** — Will this person likely open the next email? If probability is low, try a different channel (SMS, push notification, retargeting ad)
- **Content affinity** — Based on past consumption, which topic or format will resonate most?
- **Journey velocity** — Is this person moving fast (send more, sooner) or slow (give them space)?

**3. Dynamic Content Blocks**
Within each email, swap content based on real-time signals:
- **Hero section** — Match the value prop to their demonstrated interests
- **Social proof** — Show testimonials from their industry or role
- **CTA** — Adjust the ask based on their readiness (learn more vs. start free trial vs. talk to sales)

**4. Exit Conditions**
Build intelligent off-ramps:
- **Conversion exit** — They took the desired action; move them to the next journey
- **Fatigue exit** — Three consecutive non-opens; pause and re-approach later
- **Negative signal exit** — Unsubscribed, marked as spam, or explicitly asked to stop

### Send-Time Optimization

Traditional: send all emails Tuesday at 10 AM because "that's when open rates are highest."

AI-powered: analyze each recipient's historical engagement data and send at **their individual optimal time**. For you, that might be 7 AM during your commute. For someone else, it's 9 PM after the kids are in bed.

The impact is real: send-time optimization typically improves open rates by 15-25% with zero extra creative effort.

### Project: Build Your Welcome Sequence

Design a 5-email welcome sequence for a new product signup with:
1. Immediate welcome (personalized by signup source)
2. Day 2: Feature highlight (matched to their stated goals)
3. Day 5: Social proof (from their industry)
4. Day 8: Value-add content (based on feature adoption)
5. Day 12: Conversion nudge or re-engagement (based on activity level)

Document the branch logic, dynamic content rules, and measurement plan.

> **Pro tip:** Map your automation flows visually before building them in your platform. It's much easier to spot logical gaps and missing branches on a whiteboard than in a drag-and-drop builder.`,
    suggestedResources: [
      {
        title: "Braze Customer Engagement Platform",
        url: "https://www.braze.com/product",
        type: "tool",
      },
      {
        title: "Mailchimp Automation Guide",
        url: "https://mailchimp.com/help/create-a-customer-journey/",
        type: "article",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l5-2",
    title: "Dynamic Content & Web Personalization",
    description:
      "Implement AI-driven website personalization that adapts content, offers, and experiences to each visitor in real time.",
    format: "video",
    durationMinutes: 50,
    objectives: [
      "Set up real-time website personalization using visitor signals and AI-driven content selection",
      "Design a personalization strategy that balances relevance with privacy expectations",
    ],
    keyPoints: [
      "Effective web personalization targets the highest-impact page elements first: hero headline, social proof, featured products or content, and CTAs",
      "Start with rule-based personalization for known segments, then layer in AI-driven recommendations for unknown visitors",
      "The 'creep factor' is real — personalization should feel helpful, not surveillance-y; use behavioral signals over demographic ones to reduce discomfort",
      "Measure personalization impact with holdout groups, not just before/after comparisons, to isolate the true lift",
    ],
    content: `## Making Every Visit Feel Like It Was Built for Them

Your website shows the same experience to a first-time visitor from organic search as it does to a returning customer who's visited 15 times. That's like a retail store greeting every person identically regardless of whether they're browsing or holding a credit card. Let's fix that.

### The Personalization Hierarchy

Not all personalization is created equal. Focus on elements with the highest conversion impact first:

**Tier 1 — Highest Impact:**
- **Hero headline and subhead** — Match the value proposition to the visitor's context (e.g., different headlines for traffic from a "pricing" search vs. a "features" search)
- **Primary CTA** — "Start Free Trial" for new visitors, "Welcome Back" for returning ones, "Talk to Sales" for enterprise-flagged accounts
- **Social proof** — Show testimonials and logos from the visitor's industry

**Tier 2 — High Impact:**
- **Featured content** — Surface blog posts, case studies, or resources relevant to their interests
- **Product recommendations** — Based on browsing history, similar customer purchases, or collaborative filtering
- **Pricing presentation** — Highlight the plan most likely to match their needs

**Tier 3 — Incremental:**
- **Navigation emphasis** — Promote different sections based on visitor intent
- **Exit-intent messaging** — Tailored offers based on what they were viewing
- **Notification bars** — Contextual announcements relevant to their segment

### How AI Recommendation Engines Work

For unknown visitors (no login, no cookies), AI still has signals to work with:

- **Referring source** — Where they came from tells you a lot about intent
- **Landing page** — Which page they entered on indicates what they're looking for
- **Session behavior** — Real-time browsing patterns compared against similar visitor journeys
- **Device and context** — Mobile vs. desktop, time of day, geographic location

The AI model compares the current visitor's signals against patterns from thousands of previous visitors to predict: "Visitors who behave like this tend to convert best when they see X."

### The Privacy Balance

Here's where you need judgment, not just algorithms. Personalization crosses from helpful to creepy when:

- It reveals you know something the visitor didn't explicitly share with you
- It feels like surveillance rather than service
- It's based on sensitive demographic assumptions rather than behavioral signals

**The rule of thumb:** Personalize based on what someone *does* on your site (behavioral), not who you *think they are* (demographic). "Because you read articles about enterprise security" feels natural. "Because you're a 42-year-old CTO" feels invasive.

### Measuring Real Impact

Always use **holdout groups** to measure personalization lift:

- Show 90% of visitors the personalized experience
- Show 10% the default (unpersonalized) experience
- Compare conversion rates between groups
- This isolates the true impact of personalization from other factors

> **Pro tip:** Start with just 3 personalization rules and measure rigorously. More rules don't automatically mean better results — sometimes a few high-impact personalizations outperform dozens of micro-optimizations.`,
    suggestedResources: [
      {
        title: "Optimizely Personalization Platform",
        url: "https://www.optimizely.com/products/intelligence/",
        type: "tool",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l5-3",
    title: "Trigger-Based Marketing & Event-Driven Campaigns",
    description:
      "Design marketing campaigns that fire automatically based on customer actions, milestones, and predicted behaviors.",
    format: "discussion",
    durationMinutes: 45,
    objectives: [
      "Map the key trigger events in your customer lifecycle and design appropriate automated responses for each",
    ],
    keyPoints: [
      "The best trigger-based campaigns respond within minutes of the triggering event — speed is a critical factor in effectiveness",
      "Combine behavioral triggers (actions taken) with predictive triggers (AI-predicted next actions) for proactive engagement",
      "Every trigger campaign needs a suppression layer to prevent conflicting or overwhelming communications",
      "Track trigger campaign performance by the business outcome, not just the campaign metric — did the triggered email drive revenue, not just opens?",
    ],
    content: `## Marketing That Responds in Real Time

Batch-and-blast campaigns are the marketing equivalent of shouting into a crowd. Trigger-based marketing is a conversation — you respond to what customers actually do, when they do it, at the moment it matters most.

### The Trigger Taxonomy

Think of triggers in three categories:

**1. Behavioral Triggers (What they DID)**
These fire when a customer takes a specific action:
- Visited the pricing page 3+ times in a week
- Abandoned a cart with items over $100
- Used a feature for the first time
- Hit a usage milestone (100th login, 1000th API call)
- Downloaded a high-intent resource (buyer's guide, comparison sheet)

**2. Temporal Triggers (What TIME it is)**
These fire based on calendar events:
- 30 days before contract renewal
- Anniversary of their signup date
- Industry-relevant seasonal moments
- Account inactivity for X days

**3. Predictive Triggers (What they're LIKELY to do)**
These fire based on AI predictions:
- Churn risk score exceeds threshold
- Lead score indicates sales-readiness
- Predicted to be in-market for an upgrade
- Similar customers recently purchased a complementary product

### Designing Effective Trigger Campaigns

For each trigger, define:

**The trigger event** — Be specific. "Visited pricing page" is too vague. "Visited pricing page 3+ times in 7 days without submitting a demo request" is actionable.

**The response** — What do you send, and through which channel? Match the channel to the urgency and context:
- Email for considered decisions (content, nurture)
- SMS for time-sensitive offers or reminders
- In-app notifications for feature-related triggers
- Push notifications for re-engagement
- Sales alerts for high-value behavioral patterns

**The timing** — How quickly should the response fire? For cart abandonment, 1-4 hours is ideal. For content-based triggers, next day is fine. For predictive triggers, the window might be a week.

**The suppression rules** — This is where most trigger programs fail. Without suppression, a highly active customer might receive 8 triggered messages in a day. Implement:
- Maximum messages per channel per day/week
- Priority ranking when multiple triggers fire simultaneously
- Cool-down periods after specific communications
- Global frequency caps across all automated programs

### The Predictive Trigger Advantage

The real magic happens when you combine behavioral and predictive triggers. Example: a customer hasn't hit any traditional warning signs, but their AI churn score just crossed 65%. A proactive "just checking in" email from their account manager — before any visible problem — can prevent churn that traditional monitoring would miss entirely.

### Discussion Questions

1. What are the 5 most impactful trigger events in your customer journey? Which ones are you currently acting on, and which are you missing?
2. How do you balance responsiveness (fast trigger response) with not overwhelming your audience?
3. What predictive triggers would be most valuable for your business if you could build them?

> **Pro tip:** Audit your current trigger campaigns quarterly. Disable any that have been running unchanged for more than 6 months — they're likely stale. Refresh creative, review performance, and check that suppression rules are still appropriate.`,
    suggestedResources: [
      {
        title: "Customer.io Event-Driven Messaging",
        url: "https://customer.io/features/workflows/",
        type: "tool",
      },
      {
        title: "Trigger-Based Marketing Playbook",
        url: "https://www.hubspot.com/marketing-automation-information",
        type: "article",
      },
    ],
    order: 2,
  },
];

const module5Quiz: QuizQuestion[] = [
  {
    id: "mkt-q5-1",
    type: "multiple-choice",
    question:
      "What is the typical open rate improvement from AI send-time optimization?",
    options: [
      "1-3% improvement",
      "5-10% improvement",
      "15-25% improvement",
      "40-50% improvement",
    ],
    correctAnswer: "15-25% improvement",
    explanation:
      "AI send-time optimization, which delivers emails at each recipient's individually optimal time based on historical engagement patterns, typically improves open rates by 15-25% with no additional creative effort required.",
    points: 10,
  },
  {
    id: "mkt-q5-2",
    type: "multiple-choice",
    question:
      "What is the most important element to personalize first for maximum conversion impact?",
    options: [
      "Footer content and legal disclaimers",
      "Hero headline and primary CTA",
      "Navigation menu structure",
      "Page loading animation",
    ],
    correctAnswer: "Hero headline and primary CTA",
    explanation:
      "The hero headline and primary CTA are Tier 1 personalization elements because they have the highest direct impact on conversion. Matching the value proposition and call-to-action to the visitor's context produces the largest measurable lift.",
    points: 10,
  },
];

// ─── Module 6: AI-Driven Advertising ─────────────────────────────────────────

const module6Lessons: Lesson[] = [
  {
    id: "mkt-l6-1",
    title: "Programmatic Advertising & AI Bidding",
    description:
      "Understand how AI powers modern programmatic advertising, from real-time bidding to audience targeting and budget optimization.",
    format: "reading",
    durationMinutes: 50,
    objectives: [
      "Configure AI-powered bidding strategies aligned with specific campaign objectives (CPA, ROAS, brand awareness)",
      "Evaluate programmatic advertising platforms and DSPs for your marketing goals",
    ],
    keyPoints: [
      "AI bidding algorithms evaluate millions of bid opportunities per second, considering user signals, context, time, device, and predicted conversion probability",
      "Choose bidding strategies based on your objective: Target CPA for lead gen, Target ROAS for e-commerce, Maximize Conversions for volume, CPM for awareness",
      "Allow AI bidding algorithms a learning period of at least 2-3 weeks and 30-50 conversions before evaluating performance or making changes",
      "First-party audience data consistently outperforms third-party segments in programmatic campaigns because it reflects actual customer behavior",
    ],
    content: `## How AI Made Advertising Smarter (and What You Still Need to Know)

Modern digital advertising is, at its core, an AI operation. Every time an ad appears on your screen, an AI-powered auction happened in milliseconds — evaluating hundreds of signals to decide which ad to show you, at what price, in what format. Let's understand this system so you can work with it, not against it.

### The Real-Time Bidding Ecosystem

When someone visits a website or opens an app, here's what happens in roughly 100 milliseconds:

1. The publisher sends a **bid request** to an ad exchange, containing available signals (page content, user demographics, device type, browsing context)
2. Multiple **Demand-Side Platforms (DSPs)** receive the request, each representing different advertisers
3. Each DSP's AI evaluates: "How valuable is this impression for my advertiser's goals?" considering:
   - User's predicted relevance to the advertiser's target audience
   - Historical conversion patterns for similar users
   - Current budget pacing and campaign objectives
   - Creative format suitability
   - Competitive landscape (who else is bidding?)
4. DSPs submit bids; the highest bidder wins
5. The ad loads — the user sees it

This entire process happens **billions of times per day** across the internet. No human could make these decisions at this speed and scale.

### Choosing Your Bidding Strategy

**Target CPA (Cost Per Acquisition)**
Best for: Lead generation campaigns where you know what a lead is worth.
How it works: You tell the AI "I want to pay no more than $50 per conversion." The algorithm learns which impressions are most likely to convert and bids accordingly.

**Target ROAS (Return on Ad Spend)**
Best for: E-commerce where different products have different margins.
How it works: You set a target like "400% ROAS." The AI predicts the revenue each click might generate and bids proportionally.

**Maximize Conversions**
Best for: Spending a fixed budget as efficiently as possible.
How it works: The AI spends your full budget but optimizes every dollar toward the maximum number of conversions.

**Target CPM (Cost Per Thousand Impressions)**
Best for: Brand awareness where reach matters more than clicks.
How it works: You set the price you'll pay per thousand impressions; the AI optimizes for the most valuable impressions within that price.

### The Learning Period

This is where most advertisers make a critical mistake. AI bidding algorithms **need data to learn**. During the first 2-3 weeks (or first 30-50 conversions), the algorithm is experimenting — testing different bid levels, audiences, and placements to build its model.

During this period:
- **Don't panic** about volatile performance
- **Don't change** the campaign structure, budget, or targeting
- **Do monitor** for egregious issues (spending way too fast, zero conversions)
- **Do ensure** conversion tracking is firing correctly

### The First-Party Data Advantage

With third-party cookies fading and privacy regulations tightening, your **first-party data is your competitive moat** in advertising:

- Upload customer lists for lookalike targeting
- Build retargeting audiences from your website and app data
- Use CRM data to suppress existing customers from acquisition campaigns
- Feed offline conversion data back to ad platforms for better optimization

> **Pro tip:** Create a "seed audience" from your top 20% of customers by LTV. Lookalike audiences built from your best customers consistently outperform those built from all customers.`,
    suggestedResources: [
      {
        title: "Google Ads Smart Bidding Guide",
        url: "https://support.google.com/google-ads/answer/7065882",
        type: "article",
      },
      {
        title: "The Trade Desk Platform Overview",
        url: "https://www.thetradedesk.com/us/our-platform",
        type: "tool",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l6-2",
    title: "Creative Optimization & AI Testing",
    description:
      "Use AI to generate, test, and optimize ad creative at scale — from copy and images to video and interactive formats.",
    format: "interactive",
    durationMinutes: 50,
    objectives: [
      "Implement a creative testing framework that uses AI to generate variations and performance data to select winners",
      "Design creative assets optimized for AI-driven ad platforms like Performance Max and Advantage+",
    ],
    keyPoints: [
      "AI creative tools can generate hundreds of ad variations combining different headlines, descriptions, images, and CTAs — your job is to define the strategic constraints",
      "Performance Max and Advantage+ campaigns need a diverse creative asset library to perform well; feed them variety and let the AI mix and match",
      "Test creative concepts (emotional angle, value prop, audience frame) not just surface variations (color, font, minor wording changes)",
      "Creative fatigue is accelerating — refresh cycles that used to last months now need updating every 2-4 weeks in high-frequency channels",
    ],
    content: `## Creative Testing at Machine Speed

The old creative process: brief the agency, wait two weeks, get three options, pick one, run it for a quarter. The AI-powered process: generate 50 variations in an afternoon, test them all simultaneously, and let performance data decide the winners in real time.

### The Creative Matrix

Think of ad creative as a matrix of interchangeable components:

| Component | Variations to Test |
|---|---|
| **Headline** | Benefit-driven, curiosity-driven, social proof, direct offer |
| **Primary visual** | Product shot, lifestyle image, data visualization, user-generated content |
| **Body copy** | Long-form story, short punchy, list of benefits, testimonial |
| **CTA** | Direct ("Buy Now"), soft ("Learn More"), urgent ("Limited Time"), trial ("Try Free") |
| **Format** | Static image, carousel, video, stories, interactive |

AI tools can **mix and match** these components to create hundreds of unique combinations. But the strategic work — deciding which emotional angles, value propositions, and audience frames to test — still requires human judgment.

### Feeding AI Ad Platforms

Google's Performance Max and Meta's Advantage+ are designed around a core principle: **give the AI the best creative ingredients and let it optimize the recipe**.

For Performance Max:
- Upload at least 5 headline variations (short, medium, and long)
- Provide 5+ image variations in required dimensions
- Include at least 1-2 video assets (even simple ones)
- Write 4+ description variations
- Add your logos and brand colors

For Advantage+ (Meta):
- Provide 10+ creative variations spanning different concepts
- Include both video and static assets
- Test different aspect ratios (1:1, 9:16, 16:9)
- Enable dynamic creative optimization for component-level testing

The more diverse your asset library, the more combinations the AI can test, and the faster it finds high-performing combinations for each audience segment.

### Testing Concepts, Not Colors

A common mistake: testing button color (red vs. blue) or minor word changes ("Get" vs. "Grab"). These are surface-level optimizations with minimal impact.

**Test concepts instead:**
- **Fear vs. aspiration** — "Don't miss out on..." vs. "Imagine achieving..."
- **Problem vs. solution framing** — "Tired of..." vs. "Finally, a way to..."
- **Social proof vs. authority** — "10,000 marketers use..." vs. "Recommended by Gartner"
- **Rational vs. emotional** — Feature specifications vs. outcome stories
- **Audience frame** — Speaking to the individual vs. speaking to their team/company

### Managing Creative Fatigue

Ad creative wears out faster than ever. AI can help here too:

- **Monitor frequency and engagement curves** — When CTR starts declining at a specific frequency, it's time to refresh
- **Automated rotation** — Set rules to replace underperforming creative automatically
- **Iterative evolution** — Take winning creative and generate variations that maintain the core concept but refresh the execution

> **Pro tip:** Build a creative scorecard that rates each asset on concept clarity, visual impact, and message-audience fit before putting it into testing. AI testing optimizes for performance, but starting with higher-quality inputs dramatically reduces the time and spend needed to find winners.`,
    suggestedResources: [
      {
        title: "Meta Advantage+ Creative Best Practices",
        url: "https://www.facebook.com/business/help/advantage-plus-creative",
        type: "article",
      },
      {
        title: "Google Performance Max Asset Guide",
        url: "https://support.google.com/google-ads/answer/13573145",
        type: "article",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l6-3",
    title: "Cross-Channel Budget Allocation with AI",
    description:
      "Use AI-driven media mix modeling to allocate advertising budgets across channels for maximum total return.",
    format: "project",
    durationMinutes: 50,
    objectives: [
      "Build a media mix model that accounts for cross-channel interactions and diminishing returns to optimize total advertising ROI",
    ],
    keyPoints: [
      "Media mix modeling (MMM) uses AI to estimate the incremental contribution of each channel while accounting for cross-channel effects and saturation curves",
      "Every channel has a saturation point — beyond a certain spend level, each additional dollar produces diminishing returns",
      "Cross-channel synergies matter: search + display often performs better together than the sum of running each independently",
      "Run MMM analysis monthly to keep budget allocation aligned with changing market conditions and channel performance",
    ],
    content: `## Optimizing Your Total Advertising Investment

Most marketing teams allocate budgets based on last year's plan plus a growth percentage. Or they over-index on the last channel that showed a positive ROAS report. AI-powered media mix modeling gives you a **holistic, data-driven approach** to putting each dollar where it generates the most incremental value.

### Why Single-Channel Metrics Mislead

Consider this scenario: your Google Ads dashboard shows 5x ROAS, your Meta Ads show 3x ROAS, and your LinkedIn Ads show 1.5x ROAS. The obvious conclusion? Shift everything to Google.

But wait. Some of those Google conversions were **assisted by Meta ads** that introduced the prospect to your brand. And some of those LinkedIn interactions **shortened the sales cycle** by building credibility with decision-makers, even though LinkedIn didn't get the last-click credit.

This is why you need **media mix modeling** — it untangles these cross-channel effects.

### How Media Mix Modeling Works

MMM uses regression analysis (increasingly powered by Bayesian methods and machine learning) to estimate:

1. **Base demand** — Sales that would happen even without advertising (organic, word-of-mouth, brand momentum)
2. **Channel contribution** — The incremental lift each channel provides, after controlling for the others
3. **Saturation curves** — How each channel's marginal return decreases as spend increases (the 100th dollar on Meta isn't as effective as the 10th)
4. **Synergy effects** — How channels amplify each other (search + video > search + video independently)
5. **Lag effects** — How long each channel's impact takes to materialize (display might show impact over 2-3 weeks, while search converts immediately)

### The Budget Optimization Process

**Step 1: Data Collection**
Gather 12-24 months of weekly data for each channel:
- Spend by channel and campaign type
- Conversions and revenue by channel
- External factors (seasonality, promotions, competitor activity, macroeconomic indicators)

**Step 2: Model Building**
Use tools like Google's Meridian, Meta's Robyn, or commercial MMM platforms. The model estimates each channel's contribution curve and cross-channel interactions.

**Step 3: Scenario Planning**
Run "what if" scenarios:
- "What happens if I shift 20% of display budget to connected TV?"
- "Where do I get the most incremental revenue from an additional $50K/month?"
- "Which channel should I cut first if budget is reduced by 15%?"

**Step 4: Continuous Recalibration**
Market conditions change. Retrain your model monthly with fresh data, and adjust allocations accordingly.

### Project Deliverable

Using your organization's channel spend and performance data (or the provided sample dataset), build a simplified media mix analysis:

1. Map your current spend allocation across channels
2. Estimate each channel's saturation point using marginal return analysis
3. Identify one channel that appears over-invested and one that appears under-invested
4. Propose a reallocation plan with expected incremental return
5. Design a test plan to validate the reallocation hypothesis

> **Pro tip:** When presenting budget reallocation recommendations to leadership, always include the incremental revenue estimate AND a rollback plan. Making it easy to say yes (and safe to try) dramatically increases adoption of data-driven budget decisions.`,
    suggestedResources: [
      {
        title: "Meta Robyn — Open Source MMM",
        url: "https://facebookexperimental.github.io/Robyn/",
        type: "tool",
      },
      {
        title: "Google Meridian MMM Framework",
        url: "https://developers.google.com/meridian",
        type: "tool",
      },
    ],
    order: 2,
  },
];

const module6Quiz: QuizQuestion[] = [
  {
    id: "mkt-q6-1",
    type: "multiple-choice",
    question:
      "How long should you wait before evaluating an AI bidding strategy's performance?",
    options: [
      "24-48 hours",
      "3-5 days with at least 10 conversions",
      "2-3 weeks with at least 30-50 conversions",
      "2-3 months with at least 500 conversions",
    ],
    correctAnswer: "2-3 weeks with at least 30-50 conversions",
    explanation:
      "AI bidding algorithms need a learning period to experiment with different bid levels, audiences, and placements. Making changes or evaluating performance too early disrupts this learning process and prevents the algorithm from finding optimal bidding patterns.",
    points: 10,
  },
  {
    id: "mkt-q6-2",
    type: "multiple-choice",
    question:
      "What does media mix modeling (MMM) reveal that single-channel analytics cannot?",
    options: [
      "Real-time click-through rates for each ad",
      "Cross-channel synergy effects and each channel's incremental contribution after controlling for other channels",
      "Individual user-level attribution paths",
      "Creative performance within a single platform",
    ],
    correctAnswer:
      "Cross-channel synergy effects and each channel's incremental contribution after controlling for other channels",
    explanation:
      "MMM uses regression analysis to untangle cross-channel effects, estimate saturation curves, and measure each channel's true incremental contribution — insights that are impossible when analyzing channels in isolation.",
    points: 10,
  },
  {
    id: "mkt-q6-3",
    type: "multiple-choice",
    question:
      "What type of creative testing delivers the most meaningful performance insights?",
    options: [
      "Testing button colors (red vs. blue)",
      "Testing minor word changes in CTAs ('Get' vs. 'Grab')",
      "Testing creative concepts (fear vs. aspiration, problem vs. solution framing)",
      "Testing different font sizes in headlines",
    ],
    correctAnswer:
      "Testing creative concepts (fear vs. aspiration, problem vs. solution framing)",
    explanation:
      "Concept-level testing (emotional angles, value propositions, audience frames) produces significantly more meaningful performance differences than surface-level variations like colors or minor wording changes.",
    points: 10,
  },
];

// ─── Module 7: Conversion Rate Optimization ──────────────────────────────────

const module7Lessons: Lesson[] = [
  {
    id: "mkt-l7-1",
    title: "A/B Testing at Scale with AI",
    description:
      "Move beyond basic A/B tests to AI-powered multi-variate testing, automated traffic allocation, and continuous optimization.",
    format: "video",
    durationMinutes: 50,
    objectives: [
      "Design and run multi-variate experiments using AI-driven traffic allocation and statistical analysis",
      "Interpret AI test results correctly, avoiding common pitfalls like peeking, segment pollution, and false discovery",
    ],
    keyPoints: [
      "Multi-armed bandit algorithms automatically shift traffic toward winning variations during the test, reducing opportunity cost compared to traditional 50/50 splits",
      "AI-powered stats engines can reach significance faster by using Bayesian methods that update probability estimates continuously",
      "Always define your primary metric and guardrail metrics before launching a test — AI should optimize for what you measure, so measure what matters",
      "Testing velocity matters more than any individual test result — build a culture and infrastructure that enables weekly test launches",
      "Beware of the 'local maximum' problem: small iterative tests may miss transformative improvements that require bold design changes",
    ],
    content: `## Testing Smarter, Not Just More

A/B testing revolutionized marketing by replacing opinions with data. AI takes it to the next level by making tests faster, smarter, and more efficient. But the fundamentals still matter — bad test design with AI acceleration just gives you wrong answers faster.

### Beyond the Basic A/B Test

Traditional A/B testing has a fundamental inefficiency: you split traffic 50/50 between control and variant, run the test until statistical significance, then deploy the winner. During the entire test period, half your traffic sees the inferior version.

**Multi-armed bandit algorithms** fix this. Instead of a fixed split, the algorithm:
1. Starts with roughly equal traffic to all variations
2. Continuously monitors performance
3. Gradually shifts more traffic to variations that appear to be winning
4. Maintains enough traffic to losing variations to confirm they're truly worse

The result: you reach conclusions faster and **lose less revenue** during the testing period. Most modern testing platforms (Optimizely, VWO, Google Optimize) offer this as an option.

### Multi-Variate Testing (MVT)

A/B tests compare whole pages. MVT tests **individual elements simultaneously**:

- Test 3 headlines × 4 hero images × 2 CTAs = 24 combinations
- AI determines the best combination of elements, not just the best page
- Requires more traffic but reveals interaction effects (specific headline + image combinations that outperform)

Use MVT when you have sufficient traffic (at least 1,000 conversions per variation per week) and want to optimize individual page elements.

### The AI Experimentation Framework

**1. Hypothesis Generation**
Use AI to analyze your analytics data and surface testing hypotheses:
- Pages with high traffic but low conversion rates
- Steps in your funnel with unusual drop-off patterns
- User segments with significantly different conversion behavior

**2. Prioritization**
Score each hypothesis using the **ICE framework**:
- **Impact** — How much could conversion improve?
- **Confidence** — How confident are you this will work?
- **Ease** — How quickly can you implement and launch the test?

**3. Test Design**
- Define your **primary metric** (the one thing you're optimizing for)
- Set **guardrail metrics** (things that shouldn't get worse — e.g., average order value, customer satisfaction)
- Calculate required **sample size** for desired statistical power
- Determine **test duration** (minimum 1-2 full business cycles)

**4. Analysis**
AI-powered stats engines use Bayesian methods to provide:
- Probability of each variant beating the control
- Expected improvement range (credible intervals)
- Segment-level results (does the winner vary by audience?)

### Building Testing Velocity

The companies that win at CRO aren't the ones with the single best test — they're the ones running the most tests. Build a **testing pipeline**:

- Maintain a backlog of 20+ ready-to-launch tests
- Launch at least one new test per week
- Review results weekly and archive learnings
- Feed insights back into hypothesis generation

> **Pro tip:** Document every test — wins, losses, and inconclusive results. After 50 tests, your testing archive becomes one of your most valuable marketing assets. Patterns emerge that reshape your understanding of what drives conversion in your specific context.`,
    suggestedResources: [
      {
        title: "Optimizely Experimentation Platform",
        url: "https://www.optimizely.com/products/experiment/",
        type: "tool",
      },
      {
        title: "A/B Testing Statistics Calculator",
        url: "https://www.evanmiller.org/ab-testing/",
        type: "tool",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l7-2",
    title: "AI-Optimized Landing Pages",
    description:
      "Build landing pages that continuously optimize themselves using AI-driven layout, copy, and conversion element adjustments.",
    format: "project",
    durationMinutes: 50,
    objectives: [
      "Design a landing page architecture with modular components that AI can dynamically optimize for different visitor segments",
    ],
    keyPoints: [
      "Modular landing page architecture separates content blocks that AI can independently test and swap — hero, social proof, features, pricing, CTA sections",
      "AI can optimize not just what content appears, but the order in which sections are presented based on visitor behavior patterns",
      "Above-the-fold content drives 80% of conversion decisions — focus AI optimization efforts there first",
      "Page speed directly impacts conversion: every additional second of load time reduces conversion by 7-12%; optimize AI elements to load asynchronously",
    ],
    content: `## Landing Pages That Optimize Themselves

The era of building one landing page and letting it run for six months is over. Modern landing pages are **living systems** that continuously evolve based on performance data and AI-driven optimization. Let's build one.

### The Modular Architecture

Think of your landing page as a stack of independent **content modules**, each of which can be tested and swapped independently:

**Module 1: Hero Section**
- Headline (test 5+ variations)
- Subhead (test 3+ variations)
- Hero image or video (test visual vs. product demo vs. social proof)
- Primary CTA (test text, color, placement)

**Module 2: Problem/Solution**
- Problem statement (test different pain points)
- Solution framing (test different angles)
- Visual support (illustration vs. screenshot vs. data)

**Module 3: Social Proof**
- Format (testimonial quotes vs. video testimonials vs. logos vs. data points)
- Content (match to visitor's industry or role when possible)
- Quantity (1 deep testimonial vs. 5 brief ones)

**Module 4: Features/Benefits**
- Presentation (list vs. grid vs. interactive demo)
- Emphasis (which features to highlight first)
- Depth (overview vs. detailed specifications)

**Module 5: Pricing/Offer**
- Framing (monthly vs. annual, per-user vs. flat rate)
- Anchoring (show all plans vs. recommended plan highlighted)
- Urgency elements (if applicable and genuine)

**Module 6: Final CTA**
- Repetition of primary CTA with different context
- Risk reversals (guarantee, free trial, no credit card required)
- Micro-commitments (start with a smaller ask if primary CTA is high-friction)

### AI-Driven Section Ordering

Here's something most teams don't consider: **the order of your page sections matters**, and the optimal order varies by visitor type.

- A visitor from a competitor comparison search might convert best when social proof appears immediately after the hero
- A visitor from an educational blog post might need the problem/solution section before seeing any pricing
- A returning visitor might skip directly to pricing if the CTA is prominent

AI can test section ordering just like it tests content within sections. Some platforms support this natively; others require custom implementation.

### Project Deliverable

Design and document a landing page for a product or service you're marketing:

1. **Define the page goal** — One primary conversion action
2. **Map the modular architecture** — Sketch each section with 3+ content variations
3. **Create a testing roadmap** — Which sections to test first (highest impact) and what hypotheses you're validating
4. **Design the personalization layer** — How the page adapts for at least 3 different visitor segments
5. **Set performance benchmarks** — Target conversion rates and how you'll measure against them

> **Pro tip:** Build your landing pages in a CMS or page builder that supports component-level A/B testing natively. Retrofitting testing capabilities onto a monolithic page design is painful and often leads to compromised test quality.`,
    suggestedResources: [
      {
        title: "Unbounce Smart Builder",
        url: "https://unbounce.com/product/smart-builder/",
        type: "tool",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l7-3",
    title: "Conversational AI: Chatbots & Live Chat for Conversion",
    description:
      "Deploy AI-powered chatbots and conversational interfaces that qualify leads, answer objections, and guide visitors toward conversion.",
    format: "discussion",
    durationMinutes: 50,
    objectives: [
      "Design a conversational AI strategy that balances automated responses with human handoff for maximum conversion and satisfaction",
    ],
    keyPoints: [
      "AI chatbots should handle the first 80% of conversations (FAQs, qualification, routing) and seamlessly hand off the remaining 20% to humans",
      "Conversational AI on high-intent pages (pricing, checkout, demo request) can increase conversion by 15-30% by addressing objections in real time",
      "The best chatbot experiences feel like helpful guidance, not interrogation — ask questions that demonstrate understanding, not just data collection",
      "Always provide a visible option to talk to a human; forcing chatbot-only interaction frustrates visitors and increases bounce rates",
    ],
    content: `## When Conversations Convert Better Than Forms

Forms are friction. A visitor with a burning question stares at a "Fill out this form and we'll get back to you in 24-48 hours" message and thinks: "I'll just check your competitor's pricing page instead." AI-powered conversational interfaces solve this by providing **instant, relevant responses** at the moment of maximum buying intent.

### The Chatbot Strategy Spectrum

Not all chatbot implementations are created equal. Choose your approach based on your traffic volume, deal complexity, and team resources:

**Level 1: FAQ Bot**
- Answers common questions using your knowledge base
- Reduces support ticket volume
- Minimal setup, maintenance-light
- Best for: High-traffic sites with repetitive inquiries

**Level 2: Qualification Bot**
- Asks qualifying questions and routes leads appropriately
- Collects key data points conversationally (less friction than forms)
- Books meetings directly into sales calendars
- Best for: B2B companies with inside sales teams

**Level 3: Advisory Bot**
- Recommends products, plans, or solutions based on conversation
- Handles objections using trained response patterns
- Provides personalized demos or walkthroughs
- Best for: Complex products with multiple use cases or buyer personas

**Level 4: Full Conversational Commerce**
- Guides the entire purchase journey through conversation
- Processes transactions, upsells, and cross-sells
- Integrates with inventory, pricing, and CRM systems
- Best for: E-commerce and self-service SaaS

### Designing for Conversion, Not Just Deflection

Most chatbots are designed to **reduce support costs**. That's fine, but the real revenue opportunity is using conversational AI to **increase conversion**. Here's how:

**Strategic placement:**
- Pricing page: "Have questions about which plan fits your needs? I can help."
- Cart/checkout: "I noticed you're looking at [product]. Can I answer anything before you decide?"
- High-exit pages: "Before you go — is there something specific you were looking for?"

**Objection handling:**
Train your chatbot on your most common sales objections and the best responses:
- "Is it secure?" → Specific security credentials and compliance certifications
- "How does it compare to [competitor]?" → Honest, specific differentiators
- "Is there a free trial?" → Direct path to signup with value framing

**Seamless handoff:**
The moment a conversation exceeds the chatbot's confidence threshold, hand off to a human with full context:
- Transfer the conversation transcript
- Include the visitor's browsing history and segment data
- Alert the human agent with a brief summary and suggested talking points

### Discussion Points

1. Where in your conversion funnel would conversational AI have the highest impact? What questions or objections appear at those points?
2. How do you balance the cost savings of automation with the conversion benefit of human interaction?
3. What data privacy considerations arise when chatbots collect information conversationally vs. through traditional forms?

> **Pro tip:** Review chatbot transcripts weekly. The conversations where the bot fails (hands off to human, visitor leaves, or gives an unhelpful response) are your richest source of improvement ideas — for both the bot and your broader marketing.`,
    suggestedResources: [
      {
        title: "Drift Conversational Marketing Platform",
        url: "https://www.drift.com/platform/",
        type: "tool",
      },
      {
        title: "Intercom AI Customer Service",
        url: "https://www.intercom.com/ai-bot",
        type: "tool",
      },
    ],
    order: 2,
  },
];

const module7Quiz: QuizQuestion[] = [
  {
    id: "mkt-q7-1",
    type: "multiple-choice",
    question:
      "What advantage do multi-armed bandit algorithms offer over traditional A/B testing?",
    options: [
      "They require no statistical knowledge to interpret",
      "They eliminate the need for a control group",
      "They automatically shift traffic toward winning variations during the test, reducing revenue loss",
      "They guarantee faster statistical significance regardless of traffic volume",
    ],
    correctAnswer:
      "They automatically shift traffic toward winning variations during the test, reducing revenue loss",
    explanation:
      "Multi-armed bandit algorithms dynamically allocate more traffic to better-performing variations while the test runs, minimizing the opportunity cost of showing the inferior version to visitors. Traditional 50/50 splits keep sending half your traffic to the losing variant.",
    points: 10,
  },
  {
    id: "mkt-q7-2",
    type: "multiple-choice",
    question:
      "What percentage of conversations should an AI chatbot typically handle before handing off to a human?",
    options: [
      "100% — humans should never be needed",
      "About 80% — handling FAQs, qualification, and routing",
      "About 50% — splitting equally between bot and human",
      "About 20% — only the simplest interactions",
    ],
    correctAnswer:
      "About 80% — handling FAQs, qualification, and routing",
    explanation:
      "AI chatbots should handle the high-volume, repeatable first 80% of conversations (FAQs, lead qualification, routing) and seamlessly hand off the complex or high-stakes 20% to humans, who can provide nuanced responses and close deals.",
    points: 10,
  },
  {
    id: "mkt-q7-3",
    type: "multiple-choice",
    question:
      "What is the most impactful area to focus AI-driven landing page optimization?",
    options: [
      "Footer links and navigation",
      "Above-the-fold content including hero section and primary CTA",
      "Blog recommendations sidebar",
      "Cookie consent banner design",
    ],
    correctAnswer:
      "Above-the-fold content including hero section and primary CTA",
    explanation:
      "Above-the-fold content drives approximately 80% of conversion decisions. The hero headline, subhead, hero image, and primary CTA are the highest-leverage elements for AI optimization because they're the first things visitors see and evaluate.",
    points: 10,
  },
];

// ─── Module 8: Measuring ROI & Scaling ───────────────────────────────────────

const module8Lessons: Lesson[] = [
  {
    id: "mkt-l8-1",
    title: "Attribution Modeling in the AI Era",
    description:
      "Navigate the complex world of marketing attribution, from last-click to AI-powered multi-touch models, and understand what each approach reveals.",
    format: "reading",
    durationMinutes: 55,
    objectives: [
      "Select and implement the attribution model best suited to your business model and data maturity",
      "Combine attribution data with incrementality testing for a complete picture of marketing impact",
    ],
    keyPoints: [
      "No single attribution model tells the complete truth — each model has biases that favor certain channels over others",
      "Data-driven attribution (DDA) uses machine learning to assign credit based on actual conversion path analysis, but requires significant conversion volume to be reliable",
      "Incrementality testing (holdout experiments) is the gold standard for measuring true marketing impact, complementing model-based attribution",
      "Attribution is a management tool for budget allocation, not an absolute measurement of truth — treat it as directional guidance",
      "The death of third-party cookies makes server-side tracking and first-party data strategies essential for attribution accuracy",
    ],
    content: `## Attribution: Finding Truth in a Complex Customer Journey

A customer sees your display ad on Monday, clicks a Google ad on Wednesday, reads your email on Friday, and converts through a direct visit on Saturday. Who gets credit? The answer depends on your attribution model — and every model tells a different story.

### The Attribution Model Spectrum

**Last-Click Attribution**
- Gives 100% credit to the last touchpoint before conversion
- Bias: Massively over-credits bottom-of-funnel channels (search, brand, direct)
- Use case: Quick and simple; acceptable only if you have a very short, simple sales cycle

**First-Click Attribution**
- Gives 100% credit to the first touchpoint
- Bias: Over-credits awareness channels while ignoring everything that happened afterward
- Use case: Understanding which channels drive initial discovery

**Linear Attribution**
- Distributes credit equally across all touchpoints
- Bias: Over-credits low-impact touches; a random display impression gets the same weight as a high-intent search click
- Use case: When you truly believe every touchpoint matters equally (rarely true)

**Time-Decay Attribution**
- Gives more credit to touchpoints closer to conversion
- Bias: Still under-credits awareness and consideration stages
- Use case: Reasonable default for most B2C businesses with moderate purchase cycles

**Position-Based (U-Shaped)**
- Gives 40% to first touch, 40% to last touch, 20% distributed across middle touches
- Bias: Arbitrary weighting assumptions
- Use case: When you want to credit both discovery and conversion

**Data-Driven Attribution (DDA)**
- Uses machine learning to analyze all conversion paths and assign credit based on actual statistical contribution
- Requirement: Needs significant conversion volume (Google recommends 600+ conversions per month)
- Advantage: The most accurate model-based approach, custom-fitted to your data

### Beyond Attribution: Incrementality Testing

Here's the uncomfortable truth: **all attribution models are fundamentally flawed** because they measure correlation (this touchpoint was present in the conversion path) rather than causation (this touchpoint caused the conversion).

Incrementality testing uses **controlled experiments** to measure true causal impact:

1. **Geographic holdouts** — Run ads in some markets, not others, and compare conversion differences
2. **Ghost ads / PSA tests** — Show real ads to a test group and public service announcements to a control group, then compare
3. **Conversion lift studies** — Platform-specific experiments (Meta, Google) that measure the incremental conversions caused by your ads

The best marketing measurement strategy combines DDA for **day-to-day optimization** with periodic incrementality tests for **calibrating the model's accuracy**.

### Navigating the Privacy Landscape

With third-party cookies disappearing and app tracking transparency limiting device-level tracking:

- **Implement server-side tracking** via the Google Ads API and Meta Conversions API
- **Build your first-party data graph** with proper consent management
- **Accept modeled conversions** — platforms increasingly fill attribution gaps with statistical modeling; understand how this affects your data
- **Invest in probabilistic measurement** like media mix modeling as a privacy-resilient complement to user-level attribution

> **Pro tip:** Run the same conversion data through three different attribution models. Where the models agree, you have high confidence. Where they disagree, you have a question worth investigating with an incrementality test.`,
    suggestedResources: [
      {
        title: "Google Analytics 4 Attribution Reports",
        url: "https://support.google.com/analytics/answer/10596866",
        type: "article",
      },
      {
        title: "Meta Conversion Lift Studies",
        url: "https://www.facebook.com/business/measurement/conversion-lift",
        type: "tool",
      },
    ],
    order: 0,
  },
  {
    id: "mkt-l8-2",
    title: "Building AI-Powered Marketing Dashboards",
    description:
      "Design dashboards that surface AI-generated insights, automate anomaly detection, and drive faster, better marketing decisions.",
    format: "interactive",
    durationMinutes: 45,
    objectives: [
      "Design a layered dashboard architecture that serves executives, managers, and practitioners with appropriate detail and AI-powered insights",
    ],
    keyPoints: [
      "Effective dashboards follow the inverted pyramid: top-level KPIs for executives, channel metrics for managers, tactical details for practitioners",
      "AI-powered anomaly detection alerts you to unexpected changes before they become problems — or before you miss an emerging opportunity",
      "Automated insight narratives use NLP to explain what changed, why it might have changed, and what action to consider",
      "The best dashboards answer questions, not just display numbers — build them around the decisions they inform",
    ],
    content: `## Dashboards That Drive Decisions, Not Just Display Data

Most marketing dashboards are graveyards of graphs that nobody acts on. The monthly report gets assembled, presented in a meeting, and forgotten. AI-powered dashboards change this by **actively surfacing what matters** and translating data into recommended actions.

### The Three-Layer Architecture

Design your dashboard system in three layers, each serving a different audience and decision type:

**Layer 1: Executive Dashboard (the "Signal" layer)**
- 5-7 top-line KPIs with trend indicators
- AI-generated **natural language summaries** ("Revenue is up 12% this month, primarily driven by a 23% increase in paid search conversions. One risk: CAC has increased 8%, outpacing the efficiency target.")
- Automated **forecast vs. actual** comparisons
- Strategic alerts only (things that need executive attention)

**Layer 2: Manager Dashboard (the "Context" layer)**
- Channel-level performance with week-over-week and month-over-month comparisons
- **Anomaly detection highlights** — metrics that deviated significantly from expected values, with AI-generated hypotheses for why
- Campaign performance rankings with AI-suggested optimizations
- Budget pacing and allocation recommendations

**Layer 3: Practitioner Dashboard (the "Action" layer)**
- Granular campaign and ad-level metrics
- Real-time test results with statistical confidence indicators
- Automated alerts for metrics crossing thresholds (spend pacing, conversion rate drops, quality score changes)
- Direct links to take action (adjust bid, pause campaign, launch new test)

### AI-Powered Anomaly Detection

This is the single most valuable AI feature in a marketing dashboard. Instead of manually scanning dozens of metrics:

The AI continuously monitors all your metrics and alerts you when something is **statistically unusual**:
- "Email open rates dropped 34% yesterday, which is outside the normal range. The drop is concentrated in Gmail recipients, suggesting a possible deliverability issue."
- "Organic traffic to the /features page tripled today. This coincides with a Reddit thread mentioning your product in r/marketing."

### Automated Insight Narratives

Go beyond charts by having AI generate **written interpretations**:

Not this: "Conversion rate: 3.2% (↓0.4%)"

This: "Conversion rate declined to 3.2%, down from 3.6% last week. The decline is primarily driven by a 15% increase in mobile traffic from social channels, which historically converts at half the rate of desktop traffic from search. This appears to be a traffic mix shift rather than a site performance issue. Recommendation: create a mobile-optimized landing page for social traffic to close the conversion gap."

### Building for Action

For every metric on your dashboard, answer: **"If this number changed significantly, what would I do differently?"** If you can't answer that question, the metric doesn't belong on the dashboard.

Structure each dashboard section around a **decision framework**:
- **What's happening?** (the metric)
- **Is it normal?** (anomaly detection)
- **Why is it happening?** (AI-generated hypothesis)
- **What should I do?** (recommended action)
- **What's the expected impact?** (predicted outcome)

> **Pro tip:** Schedule a weekly 15-minute "dashboard review" where AI-generated insights are the agenda. Don't let the team bring slides or additional analysis — if it matters, it should be on the dashboard. This forces continuous dashboard improvement.`,
    suggestedResources: [
      {
        title: "Looker Studio (Google Data Studio)",
        url: "https://lookerstudio.google.com/",
        type: "tool",
      },
      {
        title: "Databox Marketing Dashboard Templates",
        url: "https://databox.com/marketing-dashboard-examples",
        type: "template",
      },
    ],
    order: 1,
  },
  {
    id: "mkt-l8-3",
    title: "Scaling What Works: From Experiment to Growth Engine",
    description:
      "Learn the frameworks and processes for systematically scaling successful AI marketing initiatives across channels, markets, and teams.",
    format: "video",
    durationMinutes: 50,
    objectives: [
      "Design a scaling framework that maintains performance as successful marketing initiatives expand to new channels, markets, or segments",
      "Build organizational capabilities that sustain AI-driven marketing growth over the long term",
    ],
    keyPoints: [
      "What works at small scale doesn't always work at large scale — test scaling assumptions explicitly before committing resources",
      "The 70/20/10 budget rule: 70% on proven tactics, 20% on scaling promising experiments, 10% on new experiments",
      "Scaling requires systems and processes, not just bigger budgets — document playbooks, build templates, and automate repeatable workflows",
      "Build cross-functional AI marketing capability: analytics, creative, engineering, and strategy working together, not in silos",
      "Create feedback loops where performance data from scaled campaigns continuously improves your models, content, and targeting",
    ],
    content: `## From Proof of Concept to Growth Engine

You've run the experiments. You've found what works. Now comes the hardest part of AI-powered marketing: **scaling your wins without diluting their effectiveness**. This is where most marketing teams stumble — what worked brilliantly as a small test falls apart when you try to 10x it.

### The Scaling Paradox

A personalized email campaign that drove 40% open rates with your top 1,000 customers might only achieve 15% when expanded to your full list of 100,000. A high-performing ad creative might saturate its audience within weeks at higher spend levels. A chatbot that handled 50 conversations a day beautifully might break down at 500.

**Scaling isn't linear.** Understanding this is the first step to doing it well.

### The Scaling Framework

**Phase 1: Validate Scalability**
Before committing resources, test whether your winning initiative can actually scale:
- **Audience expansion test** — Does performance hold when you target a broader but similar audience?
- **Budget scaling test** — Does ROAS or CPA remain acceptable at 2x and 5x current spend?
- **Channel replication test** — Does the concept translate to adjacent channels?
- **Time durability test** — Does performance sustain over 4-8 weeks, or is it a novelty effect?

**Phase 2: Systematize**
Turn what worked into a **repeatable system**:
- Document the playbook: strategy, execution steps, optimization criteria, and failure modes
- Build templates for creative, targeting, and reporting
- Automate repeatable processes (reporting, bid adjustments, creative rotation)
- Train team members who weren't involved in the original experiment

**Phase 3: Scale Gradually**
Use the **70/20/10 model** for budget allocation:
- **70%** on proven, scaled tactics that are delivering reliably
- **20%** on scaling promising experiments (your current winners moving from Phase 1 to Phase 2)
- **10%** on entirely new experiments (your future pipeline of innovations)

This ensures you never stop innovating while protecting the majority of your budget for proven performance.

### Building Organizational AI Marketing Capability

Scaling isn't just about technology — it's about people and processes:

**Skills to develop:**
- Data literacy across the entire marketing team, not just analysts
- Prompt engineering and AI tool proficiency as a core marketing competency
- Experimentation mindset — comfort with ambiguity and iterative learning
- Cross-functional collaboration between marketing, data engineering, and product

**Processes to establish:**
- Weekly experiment review and prioritization
- Monthly model performance and data quality audits
- Quarterly strategic review of AI marketing roadmap
- Annual skills assessment and training plan

**Culture to cultivate:**
- Celebrate learning from failures, not just celebrating wins
- Reward experimentation velocity alongside result quality
- Share knowledge across teams and geographies
- Make data-driven decision-making the default, not the exception

### The Compounding Effect

Here's the exciting part: AI marketing gets better over time because of **compounding feedback loops**:
- More data → better models → better targeting → more conversions → more data
- More tests → more learnings → better hypotheses → higher win rates → faster scaling
- More content → better SEO → more traffic → more behavioral data → better personalization

The organizations that start building these loops today will have a **nearly insurmountable advantage** in 2-3 years.

> **Pro tip:** Assign someone (or a small team) to be the "AI marketing center of excellence." Their job isn't to do all the AI work — it's to maintain best practices, evaluate new tools, share learnings across teams, and prevent duplicated effort. This single investment pays for itself many times over.`,
    suggestedResources: [
      {
        title: "Reforge Growth Strategy Resources",
        url: "https://www.reforge.com/previews/growth-series",
        type: "article",
      },
      {
        title: "Think with Google — Marketing Measurement",
        url: "https://www.thinkwithgoogle.com/marketing-strategies/data-and-measurement/",
        type: "article",
      },
    ],
    order: 2,
  },
];

const module8Quiz: QuizQuestion[] = [
  {
    id: "mkt-q8-1",
    type: "multiple-choice",
    question:
      "Why is incrementality testing considered the gold standard for measuring marketing impact?",
    options: [
      "It's the cheapest measurement method available",
      "It measures causal impact through controlled experiments, not just correlation in conversion paths",
      "It works without any data or tracking requirements",
      "It provides instant results with no waiting period",
    ],
    correctAnswer:
      "It measures causal impact through controlled experiments, not just correlation in conversion paths",
    explanation:
      "Incrementality testing (geographic holdouts, ghost ads, conversion lift studies) uses controlled experiments to measure the true causal impact of marketing activity — separating conversions that were caused by marketing from those that would have happened anyway.",
    points: 10,
  },
  {
    id: "mkt-q8-2",
    type: "multiple-choice",
    question:
      "What is the recommended budget allocation model for scaling AI marketing initiatives?",
    options: [
      "100% on proven tactics that have shown results",
      "50% proven tactics, 50% new experiments",
      "70% proven tactics, 20% scaling promising experiments, 10% new experiments",
      "33% each across proven, scaling, and experimental",
    ],
    correctAnswer:
      "70% proven tactics, 20% scaling promising experiments, 10% new experiments",
    explanation:
      "The 70/20/10 model protects the majority of budget for reliable, proven performance while ensuring a steady pipeline of innovations through scaling experiments (20%) and entirely new initiatives (10%).",
    points: 10,
  },
  {
    id: "mkt-q8-3",
    type: "multiple-choice",
    question:
      "What is the most important principle of effective marketing dashboards?",
    options: [
      "Include as many metrics as possible for completeness",
      "Use complex visualizations to impress stakeholders",
      "Build them around the decisions they inform, ensuring every metric has a clear action if it changes",
      "Update them only during quarterly business reviews",
    ],
    correctAnswer:
      "Build them around the decisions they inform, ensuring every metric has a clear action if it changes",
    explanation:
      "Dashboards should drive decisions, not just display data. If you can't answer 'What would I do differently if this metric changed significantly?' for a given metric, it doesn't belong on the dashboard.",
    points: 10,
  },
];

// ─── Assemble Modules ───────────────────────────────────────────────────────

const modules: Module[] = [
  {
    id: "mkt-m1",
    title: "The AI Marketing Landscape",
    description:
      "Understand the fundamental shifts AI brings to marketing, survey the technology landscape, and build your implementation roadmap.",
    objectives: [
      "Identify the key AI-driven shifts transforming modern marketing strategy",
      "Evaluate AI marketing tools using a practical scoring framework",
      "Create a phased AI adoption roadmap tailored to your organization",
    ],
    lessons: module1Lessons,
    quiz: module1Quiz,
    order: 0,
    durationMinutes: 150,
  },
  {
    id: "mkt-m2",
    title: "Customer Intelligence with AI",
    description:
      "Build a comprehensive customer intelligence foundation using AI-powered data collection, segmentation, persona building, and journey mapping.",
    objectives: [
      "Design AI-enhanced data collection and enrichment strategies that respect privacy",
      "Build dynamic customer segments that predict future behavior, not just describe the past",
      "Create data-backed personas and journey maps grounded in actual behavioral patterns",
    ],
    lessons: module2Lessons,
    quiz: module2Quiz,
    order: 1,
    durationMinutes: 150,
  },
  {
    id: "mkt-m3",
    title: "AI-Powered Content Strategy",
    description:
      "Master AI-assisted content creation, SEO in the age of AI search, and high-converting copywriting for emails, ads, and landing pages.",
    objectives: [
      "Develop systematic AI content workflows that maintain brand quality and voice",
      "Adapt SEO strategy for AI-powered search features and generative results",
      "Write high-converting copy using AI as a drafting and iteration partner",
    ],
    lessons: module3Lessons,
    quiz: module3Quiz,
    order: 2,
    durationMinutes: 150,
  },
  {
    id: "mkt-m4",
    title: "Predictive Analytics for Growth",
    description:
      "Use AI-powered forecasting, lead scoring, and churn prediction to shift marketing from reactive reporting to proactive growth driving.",
    objectives: [
      "Implement AI demand forecasting and translate predictions into marketing budget decisions",
      "Build lead scoring models that surface high-value prospects and predict pipeline outcomes",
      "Design churn prediction systems with automated retention intervention workflows",
    ],
    lessons: module4Lessons,
    quiz: module4Quiz,
    order: 3,
    durationMinutes: 150,
  },
  {
    id: "mkt-m5",
    title: "Marketing Automation & Personalization",
    description:
      "Build intelligent email flows, dynamic web personalization, and trigger-based campaigns that respond to customer behavior in real time.",
    objectives: [
      "Design multi-branch email automation flows with AI-driven send-time optimization and dynamic content",
      "Implement real-time website personalization that adapts to visitor context and behavior",
      "Build trigger-based marketing campaigns that combine behavioral and predictive signals",
    ],
    lessons: module5Lessons,
    quiz: module5Quiz,
    order: 4,
    durationMinutes: 150,
  },
  {
    id: "mkt-m6",
    title: "AI-Driven Advertising",
    description:
      "Master programmatic advertising, AI-powered creative optimization, and cross-channel budget allocation for maximum total return.",
    objectives: [
      "Configure and manage AI-powered bidding strategies for different campaign objectives",
      "Implement creative testing at scale using AI generation and data-driven winner selection",
      "Optimize total advertising ROI through AI-driven media mix modeling and budget allocation",
    ],
    lessons: module6Lessons,
    quiz: module6Quiz,
    order: 5,
    durationMinutes: 150,
  },
  {
    id: "mkt-m7",
    title: "Conversion Rate Optimization",
    description:
      "Scale experimentation with AI-powered testing, build self-optimizing landing pages, and deploy conversational AI to increase conversion.",
    objectives: [
      "Design and run AI-accelerated multi-variate experiments with automated traffic allocation",
      "Build modular landing pages that continuously optimize through AI-driven element testing",
      "Deploy conversational AI that qualifies leads and handles objections in real time",
    ],
    lessons: module7Lessons,
    quiz: module7Quiz,
    order: 6,
    durationMinutes: 150,
  },
  {
    id: "mkt-m8",
    title: "Measuring ROI & Scaling",
    description:
      "Navigate attribution complexity, build AI-powered dashboards that drive decisions, and systematically scale successful marketing initiatives.",
    objectives: [
      "Select and implement the right attribution model while using incrementality testing for calibration",
      "Design AI-powered marketing dashboards with anomaly detection and automated insight narratives",
      "Build scaling frameworks that maintain performance as initiatives expand to new channels and markets",
    ],
    lessons: module8Lessons,
    quiz: module8Quiz,
    order: 7,
    durationMinutes: 150,
  },
];

// ─── Bonus Resources ────────────────────────────────────────────────────────

const bonusResources: BonusResource[] = [
  {
    id: "mkt-br-1",
    title: "HubSpot AI Marketing Hub",
    type: "tool",
    url: "https://www.hubspot.com/products/marketing",
    description:
      "All-in-one marketing platform with AI-powered content creation, email optimization, lead scoring, and analytics — an excellent starting point for teams implementing their first AI marketing stack.",
    isFree: false,
  },
  {
    id: "mkt-br-2",
    title: "Google's AI-Powered Marketing Playbook",
    type: "article",
    url: "https://www.thinkwithgoogle.com/marketing-strategies/automation/ai-marketing-strategy/",
    description:
      "Google's comprehensive guide to implementing AI across search, display, video, and shopping campaigns with real-world case studies and implementation checklists.",
    isFree: true,
  },
  {
    id: "mkt-br-3",
    title: "Marketing AI Institute Podcast",
    type: "podcast",
    url: "https://www.marketingaiinstitute.com/podcast",
    description:
      "Weekly interviews with marketing AI practitioners covering emerging tools, implementation strategies, and real results from companies at every scale.",
    durationMinutes: 30,
    isFree: true,
  },
  {
    id: "mkt-br-4",
    title: "AI Marketing Campaign Planning Template",
    type: "template",
    url: "https://docs.google.com/spreadsheets/d/ai-marketing-template",
    description:
      "A structured template for planning AI-enhanced marketing campaigns, including data readiness checklists, tool evaluation scorecards, and measurement frameworks.",
    isFree: true,
  },
  {
    id: "mkt-br-5",
    title: "Prediction Machines: The Simple Economics of Artificial Intelligence",
    type: "book",
    url: "https://www.predictionmachines.ai/",
    description:
      "A foundational book on the economics of AI that helps marketers understand when and where AI creates value — essential reading for making smart AI investment decisions.",
    isFree: false,
  },
];

// ─── Export Course ───────────────────────────────────────────────────────────

export const mktCourse: Curriculum = {
  id: "mkt-ai-marketing-2026",
  title: "AI-Powered Marketing: From Data to Revenue",
  subtitle:
    "Master AI-driven strategies to transform customer data into growth",
  description:
    "Learn how to harness AI across the entire marketing funnel — from customer intelligence and content strategy to predictive analytics, automation, and conversion optimization. This hands-on course equips marketing professionals with practical frameworks, real-world tools, and actionable playbooks to drive measurable revenue growth with AI.",
  targetAudience:
    "Marketing professionals looking to leverage AI to improve campaign performance, automate workflows, and make data-driven decisions that accelerate growth.",
  difficulty: "intermediate",
  objectives: [
    "Build an AI marketing tech stack and implementation roadmap tailored to your organization's maturity level",
    "Use AI-powered customer intelligence to create dynamic segments, predictive personas, and data-driven journey maps",
    "Implement AI-assisted content creation, SEO, and copywriting workflows that maintain brand quality at scale",
    "Deploy predictive analytics for demand forecasting, lead scoring, and churn prevention",
    "Design AI-driven advertising strategies with optimized bidding, creative testing, and cross-channel budget allocation",
    "Measure marketing ROI with modern attribution models and scale successful initiatives systematically",
  ],
  prerequisites: [
    "Basic marketing knowledge",
    "Familiarity with digital marketing channels",
  ],
  tags: ["Marketing", "AI", "Growth", "Analytics", "Automation"],
  modules,
  pacing: {
    style: "self-paced",
    totalHours: 20,
    hoursPerWeek: 4,
    totalWeeks: 5,
    weeklyPlan: [
      {
        week: 1,
        label: "Foundations & Customer Intelligence",
        moduleIds: ["mkt-m1", "mkt-m2"],
      },
      {
        week: 2,
        label: "Content Strategy & Predictive Analytics",
        moduleIds: ["mkt-m3", "mkt-m4"],
      },
      {
        week: 3,
        label: "Automation & Advertising",
        moduleIds: ["mkt-m5", "mkt-m6"],
      },
      {
        week: 4,
        label: "Conversion Optimization & Scaling",
        moduleIds: ["mkt-m7", "mkt-m8"],
      },
    ],
  },
  bonusResources,
  createdBy: "Syllabi AI",
  createdAt: "2026-04-01T10:00:00Z",
  updatedAt: "2026-04-11T00:00:00Z",
  version: "1.0.0",
};
