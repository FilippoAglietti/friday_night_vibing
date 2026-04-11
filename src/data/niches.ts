/**
 * data/niches.ts
 * ─────────────────────────────────────────────────────────────
 * Niche definitions for programmatic SEO pages.
 * Each niche targets a specific audience / use-case to capture
 * long-tail "course generator for X" queries.
 * ─────────────────────────────────────────────────────────────
 */

export interface Niche {
  slug: string;
  /** H1 headline on the page */
  headline: string;
  /** Short tagline below the headline */
  tagline: string;
  /** Meta description (~155 chars) */
  metaDescription: string;
  /** Persona-specific blurb (2-3 sentences) */
  blurb: string;
  /** Use-case examples shown on the page */
  useCases: string[];
  /** 3 FAQ pairs for FAQPage schema */
  faqs: { question: string; answer: string }[];
  /** Target keywords */
  keywords: string[];
  /** Emoji for visual accent */
  emoji: string;
  /** Category grouping for internal navigation */
  category: "education" | "corporate" | "creative" | "technology" | "health" | "business" | "language";
}

export const NICHES: Niche[] = [
  // ── Education ────────────────────────────────────────────────
  {
    slug: "teachers",
    headline: "AI Course Generator for Teachers",
    tagline: "Build complete lesson plans and courses in seconds, not weeks.",
    metaDescription: "Create structured courses, lesson plans, and courses instantly with Syllabi's AI course generator for teachers. Modules, quizzes, pacing schedules included.",
    blurb: "Stop spending weekends planning lessons from scratch. Syllabi generates complete courses with modules, lessons, quizzes, and pacing schedules tailored for K-12 and higher education. Export to PDF or Notion and start teaching immediately.",
    useCases: ["Semester-long course planning", "Differentiated lesson plans by skill level", "Quiz and assessment generation", "Substitute teacher handoffs"],
    faqs: [
      { question: "Can I customize the generated course for my grade level?", answer: "Yes. When generating a course, you specify the target audience (e.g., 'Grade 8 students' or 'AP History class'). Syllabi tailors the depth, vocabulary, and pacing to match." },
      { question: "What export formats work best for teachers?", answer: "Most teachers use PDF export for printed handouts or Notion export for digital classrooms. You can also export to PPTX for slide-based lectures or DOCX for editable documents." },
      { question: "Is there a free plan for educators?", answer: "Yes. The free tier gives you 3 full course generations with JSON export. Paid plans start at €28/month with all export formats and up to 15 generations." },
    ],
    keywords: ["course generator for teachers", "AI lesson plan generator", "course builder for educators", "teacher course creator"],
    emoji: "📚",
    category: "education",
  },
  {
    slug: "university-professors",
    headline: "AI Course Generator for University Professors",
    tagline: "Design rigorous academic courses with AI-powered structure and depth.",
    metaDescription: "Create university-level courses with Syllabi's AI. Generate syllabi, module outlines, reading lists, and assessments for higher education in minutes.",
    blurb: "Designing a new seminar or restructuring an existing course takes weeks. Syllabi generates publication-ready syllabi with learning objectives mapped to Bloom's Taxonomy, module breakdowns, and assessment strategies — so you can focus on research and teaching.",
    useCases: ["New course proposals for department approval", "Seminar and workshop outlines", "Graduate-level reading schedules", "Cross-disciplinary course design"],
    faqs: [
      { question: "Does Syllabi support academic rigor and learning outcomes?", answer: "Yes. Generated courses include explicit learning objectives, module-level outcomes, and quiz questions that can be aligned with Bloom's Taxonomy levels from knowledge to evaluation." },
      { question: "Can I export the syllabus for my university's LMS?", answer: "Syllabi exports to JSON, Markdown, PDF, Notion, PPTX, and DOCX. The JSON and Markdown exports integrate easily with most LMS platforms including Canvas, Blackboard, and Moodle." },
      { question: "How detailed are the generated courses?", answer: "Each course includes a full description, learning objectives, modules with individual lessons, quizzes per module, a pacing schedule, and suggested resources — typically 15-30 pages of structured content." },
    ],
    keywords: ["syllabus generator for professors", "university course builder", "academic course generator AI", "higher education course tool"],
    emoji: "🎓",
    category: "education",
  },
  {
    slug: "homeschool-parents",
    headline: "AI Course Generator for Homeschool Parents",
    tagline: "Create structured, engaging courses for your child — no teaching degree required.",
    metaDescription: "Homeschool course made easy. Syllabi's AI generates complete courses with lessons, quizzes, and pacing schedules customized for your child's learning level.",
    blurb: "Planning a full year of homeschool course is overwhelming. Syllabi lets you generate age-appropriate, structured courses on any subject — from elementary math to high school biology — with built-in quizzes and weekly pacing schedules.",
    useCases: ["Full-year subject courses", "Unit studies on specific topics", "Multi-age group lesson planning", "State requirement alignment"],
    faqs: [
      { question: "Can I generate courses for different age groups?", answer: "Absolutely. Specify your child's age or grade level as the target audience, and Syllabi adjusts the complexity, vocabulary, and lesson length accordingly." },
      { question: "How do I track progress with Syllabi?", answer: "Each generated course includes quizzes per module and a pacing schedule. Export to PDF for a printed checklist or use Notion export for a digital progress tracker." },
      { question: "Can I generate courses in languages other than English?", answer: "Yes. Syllabi supports 16 languages including Spanish, French, German, Italian, Japanese, and more. Perfect for bilingual homeschool programs." },
    ],
    keywords: ["homeschool course generator", "AI homeschool planner", "homeschool course builder", "homeschool lesson plan generator"],
    emoji: "🏠",
    category: "education",
  },
  {
    slug: "tutors",
    headline: "AI Course Generator for Tutors",
    tagline: "Deliver structured tutoring programs that get results.",
    metaDescription: "Create professional tutoring courses with Syllabi's AI. Generate session plans, practice quizzes, and progress milestones for any subject.",
    blurb: "Stand out from other tutors by offering structured learning paths instead of ad-hoc sessions. Syllabi generates complete tutoring programs with session-by-session breakdowns, practice quizzes, and clear milestones to show parents real progress.",
    useCases: ["Multi-session tutoring programs", "Test prep courses (SAT, ACT, GRE)", "Skill-gap remediation plans", "Summer learning programs"],
    faqs: [
      { question: "Can I create short tutoring programs, not full courses?", answer: "Yes. You control the course length — from a 4-session mini-course to a 20-week deep dive. Syllabi scales the content to match." },
      { question: "How can I share courses with my students' parents?", answer: "Export to PDF for a professional-looking program overview, or use the shareable link feature (Pro Max) so parents can view the full course online." },
      { question: "Does it generate practice problems?", answer: "Syllabi generates multiple-choice quizzes for each module. For math and science tutoring, these serve as excellent practice problem sets with explanations." },
    ],
    keywords: ["tutoring course generator", "AI tutor planner", "tutoring program builder", "tutor course creator"],
    emoji: "✏️",
    category: "education",
  },
  // ── Corporate / Professional ─────────────────────────────────
  {
    slug: "corporate-training",
    headline: "AI Course Generator for Corporate Training",
    tagline: "Build employee training programs 10x faster.",
    metaDescription: "Generate corporate training courses with AI. Create onboarding programs, compliance training, and professional development courses in minutes with Syllabi.",
    blurb: "HR and L&D teams spend months building training programs. Syllabi generates complete corporate training courses — from compliance modules to leadership development — with assessments, pacing, and export to any format your LMS supports.",
    useCases: ["New hire onboarding programs", "Compliance and regulatory training", "Leadership development tracks", "Quarterly skills workshops"],
    faqs: [
      { question: "Can I align courses with our company's competency framework?", answer: "Yes. Add your specific context and competency requirements in the course form, and Syllabi will tailor the course to match your organizational goals." },
      { question: "What about SCORM or LMS integration?", answer: "Export courses as JSON for direct LMS import, or use DOCX/PDF for manual upload. The structured JSON format maps cleanly to most SCORM-compatible systems." },
      { question: "Can multiple team members use Syllabi?", answer: "Yes. Each team member can have their own account. For enterprise needs, contact us for team pricing and white-label options." },
    ],
    keywords: ["corporate training course generator", "AI employee training builder", "L&D course creator", "corporate onboarding generator"],
    emoji: "🏢",
    category: "corporate",
  },
  {
    slug: "hr-managers",
    headline: "AI Course Generator for HR Managers",
    tagline: "Design onboarding, compliance, and development programs without an instructional designer.",
    metaDescription: "HR professionals: create structured onboarding and training programs with AI. Syllabi generates complete courses with quizzes and schedules in minutes.",
    blurb: "You don't need an instructional design team to build professional training programs. Syllabi's AI generates structured courses for onboarding, compliance, DEI training, and professional development — complete with assessments and pacing schedules.",
    useCases: ["90-day onboarding programs", "Annual compliance refreshers", "DEI and workplace culture training", "Manager development tracks"],
    faqs: [
      { question: "How quickly can I create a full onboarding program?", answer: "Under 60 seconds. Enter your role requirements and company context, and Syllabi generates a multi-week onboarding course with modules, lessons, and checkpoints." },
      { question: "Can I edit the generated content?", answer: "Yes. Use the built-in Course Editor (available on paid plans) to modify any module, lesson, or quiz. You can also export to DOCX for editing in Word." },
      { question: "Is the content compliant with training standards?", answer: "Syllabi generates structured educational content. For industry-specific compliance (OSHA, HIPAA, etc.), we recommend reviewing and customizing the generated content with your compliance team." },
    ],
    keywords: ["HR training generator", "onboarding program creator", "AI HR course builder", "employee development course generator"],
    emoji: "👥",
    category: "corporate",
  },
  {
    slug: "sales-teams",
    headline: "AI Course Generator for Sales Teams",
    tagline: "Train reps faster. Close deals sooner.",
    metaDescription: "Build sales training programs with AI. Create product knowledge courses, objection handling guides, and onboarding tracks for sales teams with Syllabi.",
    blurb: "Every week a new rep spends ramping up is revenue lost. Syllabi generates complete sales training programs — product knowledge, objection handling, negotiation tactics, CRM workflows — so your team hits quota faster.",
    useCases: ["New rep onboarding bootcamps", "Product launch training", "Objection handling playbooks", "Quarterly skills refreshers"],
    faqs: [
      { question: "Can I create product-specific training?", answer: "Yes. Provide your product details and target market in the context field, and Syllabi generates training modules specific to your product's features, benefits, and competitive positioning." },
      { question: "How do I assess rep knowledge?", answer: "Every generated course includes per-module quizzes with answer explanations. Use these as knowledge checks during onboarding or as ongoing certification tests." },
      { question: "Can I share training materials with the team?", answer: "Export to PDF for team distribution, use Notion export for a shared workspace, or generate shareable links (Pro Max) so reps can access training on any device." },
    ],
    keywords: ["sales training course generator", "AI sales enablement", "sales onboarding program", "sales team training builder"],
    emoji: "📈",
    category: "business",
  },
  // ── Technology ───────────────────────────────────────────────
  {
    slug: "python-developers",
    headline: "AI Course Generator for Python Developers",
    tagline: "Generate structured Python courses — from basics to advanced topics.",
    metaDescription: "Create Python programming courses with AI. Build structured courses for beginners to advanced developers with modules, coding exercises, and quizzes.",
    blurb: "Teaching Python? Building a bootcamp? Syllabi generates complete Python courses with progressive module structures, quiz assessments, and lesson plans covering everything from syntax basics to machine learning pipelines.",
    useCases: ["Python bootcamp courses", "Data science learning paths", "Django/Flask web development courses", "Python for non-programmers"],
    faqs: [
      { question: "Does it generate actual code examples?", answer: "Syllabi generates structured course content including lesson descriptions, key concepts, and learning objectives. For hands-on exercises, the lesson descriptions include detailed coding exercise prompts and project ideas." },
      { question: "Can I create courses for complete beginners?", answer: "Yes. Specify 'complete beginners with no programming experience' as your audience, and the AI adjusts the course to start with fundamentals like variables, loops, and functions." },
      { question: "What about advanced topics like ML or data engineering?", answer: "Syllabi handles any complexity level. Request courses on machine learning, deep learning, data pipelines, or any Python specialization and get a structured, progressive course." },
    ],
    keywords: ["Python course generator", "AI programming course builder", "Python course creator", "coding course generator"],
    emoji: "🐍",
    category: "technology",
  },
  {
    slug: "web-developers",
    headline: "AI Course Generator for Web Developers",
    tagline: "Build web development courses from HTML basics to full-stack mastery.",
    metaDescription: "Create web development courses with AI. Generate structured courses for HTML, CSS, JavaScript, React, Next.js, and full-stack development.",
    blurb: "Whether you're teaching a coding bootcamp or creating internal training, Syllabi generates comprehensive web development courses covering frontend, backend, and full-stack topics — with quizzes to verify understanding at every step.",
    useCases: ["Full-stack bootcamp courses", "React/Next.js workshop outlines", "Frontend fundamentals courses", "API development training"],
    faqs: [
      { question: "Can I create framework-specific courses?", answer: "Yes. Request courses specifically for React, Vue, Angular, Next.js, Node.js, or any framework. Syllabi generates courses that follow each framework's learning curve." },
      { question: "Does it cover modern web development practices?", answer: "Absolutely. Generated courses include modules on responsive design, accessibility, performance optimization, testing, CI/CD, and deployment — reflecting 2026 best practices." },
      { question: "Can I generate a full bootcamp course?", answer: "Yes. Set the course length to 'comprehensive' and Syllabi will generate a multi-month bootcamp course with progressive modules from basics through advanced topics." },
    ],
    keywords: ["web development course generator", "coding bootcamp course builder", "JavaScript course creator", "full-stack course generator"],
    emoji: "💻",
    category: "technology",
  },
  {
    slug: "data-scientists",
    headline: "AI Course Generator for Data Scientists",
    tagline: "From statistics fundamentals to production ML — structured learning paths in seconds.",
    metaDescription: "Generate data science courses with AI. Create courses covering statistics, Python, machine learning, and deep learning with structured modules and assessments.",
    blurb: "Data science is a vast field. Syllabi helps you build focused learning paths — whether it's a statistics refresher, a complete ML engineering track, or a specialized NLP course — with clear progression and built-in assessments.",
    useCases: ["Data science bootcamp design", "ML specialization tracks", "Statistics and probability courses", "MLOps and deployment training"],
    faqs: [
      { question: "Can it generate prerequisite-aware course sequences?", answer: "Yes. Syllabi structures courses with progressive complexity. Specify prerequisites in the context field, and the AI builds on assumed knowledge rather than starting from scratch." },
      { question: "Does it cover tools like TensorFlow or PyTorch?", answer: "Absolutely. Request courses focused on specific tools, frameworks, or libraries, and Syllabi generates courses tailored to those ecosystems." },
      { question: "Can I create courses that blend theory and practice?", answer: "Yes. Generated courses include both conceptual lessons and hands-on project modules, with quizzes that test both theoretical understanding and practical application." },
    ],
    keywords: ["data science course generator", "ML course builder", "AI data science training", "machine learning course creator"],
    emoji: "📊",
    category: "technology",
  },
  {
    slug: "cybersecurity",
    headline: "AI Course Generator for Cybersecurity Training",
    tagline: "Build security awareness and technical training programs at scale.",
    metaDescription: "Create cybersecurity training courses with AI. Generate security awareness programs, ethical hacking courses, and compliance training with Syllabi.",
    blurb: "Cybersecurity training is no longer optional. Syllabi generates comprehensive security courses — from employee awareness programs to advanced penetration testing courses — with assessments that verify real understanding, not just checkbox completion.",
    useCases: ["Security awareness training for all employees", "Ethical hacking and penetration testing courses", "Incident response training", "Cloud security certification prep"],
    faqs: [
      { question: "Is the content up-to-date with current threats?", answer: "Syllabi's AI generates content based on modern cybersecurity practices. For rapidly evolving threats, we recommend adding your specific threat landscape in the context field." },
      { question: "Can I create role-specific security training?", answer: "Yes. Generate different courses for developers (secure coding), executives (risk management), and IT staff (incident response) by specifying the target audience." },
      { question: "Does it cover compliance frameworks?", answer: "Syllabi can generate courses structured around NIST, ISO 27001, SOC 2, GDPR, and other frameworks. Specify the framework in your course context for aligned content." },
    ],
    keywords: ["cybersecurity course generator", "security training builder", "infosec course creator", "security awareness course AI"],
    emoji: "🔒",
    category: "technology",
  },
  // ── Creative ─────────────────────────────────────────────────
  {
    slug: "content-creators",
    headline: "AI Course Generator for Content Creators",
    tagline: "Turn your expertise into structured online courses your audience will pay for.",
    metaDescription: "Content creators: build and sell online courses with AI. Syllabi generates complete course structures from your expertise — modules, lessons, and assessments included.",
    blurb: "Your audience already trusts you. Now monetize that trust with a structured course. Syllabi takes your topic expertise and generates a complete course framework — so you can focus on recording content instead of planning course.",
    useCases: ["YouTube → course pipeline", "Membership site course libraries", "Lead magnet mini-courses", "Workshop and cohort courses"],
    faqs: [
      { question: "Can I create a course from my existing content?", answer: "Yes. Describe your content niche and existing topics in the context field, and Syllabi generates a course structure that organizes and extends your existing knowledge." },
      { question: "How do I sell the course once it's generated?", answer: "Export to PDF or Notion for platforms like Teachable, Thinkific, or Gumroad. Use the PPTX export for video-based courses. The structured JSON works with custom-built course platforms." },
      { question: "Can I generate a lead magnet mini-course?", answer: "Absolutely. Set the course length to 'short' and generate a free mini-course that showcases your expertise and drives sign-ups for your full content." },
    ],
    keywords: ["course generator for creators", "online course builder AI", "creator economy course tool", "course creation for YouTubers"],
    emoji: "🎬",
    category: "creative",
  },
  {
    slug: "coaches",
    headline: "AI Course Generator for Coaches & Consultants",
    tagline: "Package your methodology into scalable, structured programs.",
    metaDescription: "Coaches and consultants: turn your expertise into structured courses. Syllabi's AI generates complete coaching programs with modules, exercises, and milestones.",
    blurb: "Stop trading time for money. Syllabi helps you transform your coaching methodology into a structured course that clients can follow independently — complete with progressive modules, reflection exercises, and milestone checkpoints.",
    useCases: ["Self-paced coaching programs", "Group coaching courses", "Certification programs", "Workshop series frameworks"],
    faqs: [
      { question: "Can I include coaching exercises and reflections?", answer: "Yes. Syllabi generates lesson types including interactive, discussion, and project formats. Add 'include reflection exercises' in your context for coaching-specific content." },
      { question: "How do I build a certification program?", answer: "Generate a comprehensive course with assessment milestones. Each module includes quizzes that serve as certification checkpoints. Export the full program as your official certification course." },
      { question: "Can I white-label the courses?", answer: "Pro Max plan includes white-label exports without Syllabi branding. Perfect for delivering branded coaching programs to your clients." },
    ],
    keywords: ["course generator for coaches", "coaching program builder", "consultant course creator", "online coaching course AI"],
    emoji: "🎯",
    category: "creative",
  },
  // ── Health & Wellness ────────────────────────────────────────
  {
    slug: "yoga-teachers",
    headline: "AI Course Generator for Yoga Teachers",
    tagline: "Design structured yoga teacher training programs and student courses in minutes.",
    metaDescription: "Yoga teachers: create structured training courses with AI. Build teacher training programs, workshop courses, and student learning paths with Syllabi.",
    blurb: "Whether you're designing a 200-hour YTT program or a beginner workshop series, Syllabi generates structured yoga courses with progressive sequencing, anatomy modules, philosophy lessons, and practical teaching components.",
    useCases: ["200-hour yoga teacher training", "Beginner workshop series", "Specialized style courses (Vinyasa, Yin, Ashtanga)", "Anatomy and philosophy modules"],
    faqs: [
      { question: "Can it generate a full 200-hour YTT course?", answer: "Yes. Specify '200-hour yoga teacher training' as your course topic and Syllabi generates a comprehensive course covering asana, pranayama, anatomy, philosophy, and teaching methodology." },
      { question: "Does it cover different yoga styles?", answer: "Absolutely. Specify any style — Vinyasa, Hatha, Yin, Ashtanga, Kundalini, or Restorative — and the course is tailored to that tradition's methodology." },
      { question: "Can I export for my yoga studio's website?", answer: "Yes. Use PDF export for downloadable program guides, Notion export for interactive online courses, or shareable links for web-based access." },
    ],
    keywords: ["yoga course generator", "yoga teacher training course", "yoga workshop builder", "YTT program creator"],
    emoji: "🧘",
    category: "health",
  },
  {
    slug: "fitness-trainers",
    headline: "AI Course Generator for Fitness Trainers",
    tagline: "Build structured fitness education programs your clients will actually follow.",
    metaDescription: "Fitness trainers: create educational courses for clients with AI. Generate nutrition, exercise science, and training methodology courses with Syllabi.",
    blurb: "Educate your clients, don't just train them. Syllabi generates structured fitness education courses covering exercise science, nutrition fundamentals, injury prevention, and program design — turning your expertise into a scalable product.",
    useCases: ["Client education programs", "Personal trainer certification prep", "Nutrition fundamentals courses", "Specialty training courses (strength, HIIT, mobility)"],
    faqs: [
      { question: "Can I create nutrition courses for clients?", answer: "Yes. Generate courses covering macronutrients, meal planning, supplementation, or sport-specific nutrition tailored to your client base." },
      { question: "Does it work for online fitness coaching?", answer: "Perfectly. Generate structured programs that clients follow independently, with quiz checkpoints to verify understanding before progressing." },
      { question: "Can I generate specialty courses?", answer: "Yes. Request courses on strength training, HIIT programming, flexibility, or any fitness specialization for targeted educational content." },
    ],
    keywords: ["fitness course generator", "personal trainer course builder", "fitness education course AI", "training program course creator"],
    emoji: "💪",
    category: "health",
  },
  {
    slug: "healthcare-training",
    headline: "AI Course Generator for Healthcare Training",
    tagline: "Create structured medical education and staff training programs at scale.",
    metaDescription: "Generate healthcare training courses with AI. Build continuing education, staff training, and patient education programs with Syllabi's course generator.",
    blurb: "Healthcare education demands structure and accuracy. Syllabi generates training frameworks for continuing medical education, staff onboarding, patient education programs, and clinical procedure training — saving your education team weeks of course development.",
    useCases: ["Continuing medical education (CME)", "Nursing staff orientation programs", "Patient education series", "Clinical procedure training"],
    faqs: [
      { question: "Is the content medically accurate?", answer: "Syllabi generates course structures and educational frameworks. Medical content should always be reviewed by qualified healthcare professionals before deployment. The tool saves you structuring time, not clinical review." },
      { question: "Can I create patient education materials?", answer: "Yes. Generate courses targeted at patients with simplified language covering conditions, treatments, post-operative care, or wellness programs." },
      { question: "Does it support continuing education requirements?", answer: "Syllabi generates structured modules with assessments that map well to CE credit frameworks. Customize the module structure to match your accreditation requirements." },
    ],
    keywords: ["healthcare course generator", "medical training builder", "CME course creator", "healthcare education AI"],
    emoji: "🏥",
    category: "health",
  },
  // ── Business ─────────────────────────────────────────────────
  {
    slug: "startups",
    headline: "AI Course Generator for Startups",
    tagline: "Build internal training, onboarding, and customer education without a full L&D team.",
    metaDescription: "Startups: create training courses without an L&D team. Generate onboarding, product training, and customer education programs with Syllabi's AI.",
    blurb: "Startups can't afford a dedicated L&D department. Syllabi lets founders and ops teams generate professional training programs in minutes — from engineering onboarding to customer success academies — so your team scales knowledge as fast as headcount.",
    useCases: ["Engineering team onboarding", "Customer success academies", "Product documentation courses", "Investor-ready training materials"],
    faqs: [
      { question: "Can I create customer-facing courses?", answer: "Yes. Generate product training, certification programs, or educational content for customers. Export with shareable links so customers can access courses directly." },
      { question: "How does this help with investor conversations?", answer: "Having structured training materials signals operational maturity to investors. Generate an onboarding program or customer academy in minutes for due diligence." },
      { question: "Is it cost-effective for a small team?", answer: "The free tier gives you 3 courses. Paid plans start at €28/month — less than an hour of a consultant's time. The 5-Pack at €33 is ideal for startups needing a few key training programs." },
    ],
    keywords: ["startup training course generator", "startup onboarding builder", "course generator for small teams", "startup customer education AI"],
    emoji: "🚀",
    category: "business",
  },
  {
    slug: "marketing-teams",
    headline: "AI Course Generator for Marketing Teams",
    tagline: "Train your team on SEO, content strategy, and campaign execution — fast.",
    metaDescription: "Create marketing training courses with AI. Build SEO, content marketing, social media, and analytics courses for your team with Syllabi.",
    blurb: "Marketing evolves faster than any training program can keep up. Syllabi generates up-to-date marketing courses — SEO, content strategy, paid ads, analytics, social media — so your team stays sharp without waiting for the next conference.",
    useCases: ["SEO and content marketing fundamentals", "Paid advertising playbooks", "Social media strategy courses", "Marketing analytics training"],
    faqs: [
      { question: "Can I create courses on specific marketing tools?", answer: "Yes. Generate training for Google Analytics, HubSpot, Mailchimp, or any tool. Specify the tool name in the topic and Syllabi builds a structured learning path." },
      { question: "How do I keep training content current?", answer: "Generate new courses whenever strategies change. At under 60 seconds per generation, you can refresh your team's training quarterly with zero overhead." },
      { question: "Can I create certification programs for team members?", answer: "Yes. Generate comprehensive courses with module quizzes that serve as certification checkpoints. Track completion and scores to verify skill development." },
    ],
    keywords: ["marketing training course generator", "SEO course builder", "marketing team training AI", "digital marketing course creator"],
    emoji: "📣",
    category: "business",
  },
  {
    slug: "real-estate-agents",
    headline: "AI Course Generator for Real Estate Agents",
    tagline: "Build continuing education and client education courses that close deals.",
    metaDescription: "Real estate agents: create CE courses and client education programs with AI. Generate structured training on market analysis, negotiation, and more.",
    blurb: "Stay ahead in real estate with structured training. Syllabi generates courses for continuing education credits, buyer/seller education programs, and brokerage onboarding — complete with assessments and professional export formats.",
    useCases: ["Continuing education courses", "First-time homebuyer guides", "Brokerage agent onboarding", "Market analysis training"],
    faqs: [
      { question: "Can I generate CE credit-aligned courses?", answer: "Syllabi generates structured courses with assessments. Map the generated modules to your state's CE requirements and submit for accreditation approval." },
      { question: "Can I create courses for my clients?", answer: "Yes. Generate buyer education courses, investment property guides, or market overview programs. Share via PDF or shareable links for a professional client experience." },
      { question: "Does it cover market-specific content?", answer: "Add your local market details in the context field. Syllabi will tailor the course to reference your specific market dynamics and regulations." },
    ],
    keywords: ["real estate course generator", "real estate training builder", "agent CE course creator", "real estate education AI"],
    emoji: "🏡",
    category: "business",
  },
  // ── Language ──────────────────────────────────────────────────
  {
    slug: "language-teachers",
    headline: "AI Course Generator for Language Teachers",
    tagline: "Create structured language courses in 16 languages with AI.",
    metaDescription: "Language teachers: generate structured courses for any language with AI. Build courses with progressive lessons, vocabulary modules, and assessments.",
    blurb: "Teaching a language requires careful progression. Syllabi generates structured language courses — from beginner phonics to advanced conversation — with module-by-module skill building, vocabulary lessons, grammar progressions, and comprehension quizzes.",
    useCases: ["A1-C2 progression courses", "Conversational language workshops", "Business language training", "Test prep (DELF, JLPT, HSK, TOEFL)"],
    faqs: [
      { question: "Which languages are supported?", answer: "Syllabi generates courses in 16 languages: English, Italian, Spanish, French, German, Portuguese, Japanese, Arabic, Dutch, Hindi, Russian, Turkish, Swedish, Korean, Chinese, and Polish." },
      { question: "Can I create level-specific courses?", answer: "Yes. Specify the proficiency level (A1, A2, B1, B2, C1, C2) and Syllabi generates content appropriate for that level with progressive difficulty." },
      { question: "Does it include assessment components?", answer: "Every generated course includes per-module quizzes. For language courses, these test vocabulary, grammar, and comprehension at the appropriate level." },
    ],
    keywords: ["language course generator", "ESL course builder", "language teaching AI", "foreign language course creator"],
    emoji: "🌍",
    category: "language",
  },
  {
    slug: "esl-teachers",
    headline: "AI Course Generator for ESL Teachers",
    tagline: "Build structured English courses for learners at every level.",
    metaDescription: "ESL teachers: create structured English language courses with AI. Generate level-appropriate courses with grammar, vocabulary, and speaking practice modules.",
    blurb: "ESL instruction demands careful scaffolding. Syllabi generates English language courses that progress logically from survival phrases to academic English — with integrated grammar, vocabulary, and communication modules tailored to your students' starting level.",
    useCases: ["Beginner survival English", "Academic English preparation", "Business English programs", "IELTS/TOEFL prep courses"],
    faqs: [
      { question: "Can I generate courses for students with different first languages?", answer: "Yes. Specify your students' native language in the context field, and Syllabi can tailor the course to address common interference patterns and learning challenges specific to that language background." },
      { question: "Does it cover all four skills (reading, writing, listening, speaking)?", answer: "Generated courses include modules for all language skills. Lessons are categorized by format — reading, interactive, discussion, and project — to ensure balanced skill development." },
      { question: "Can I create placement test materials?", answer: "Generate level-specific courses and use the quiz components as placement assessments. Compare student scores across levels to determine appropriate placement." },
    ],
    keywords: ["ESL course generator", "English teaching course AI", "EFL course builder", "ESL lesson plan generator"],
    emoji: "🗣️",
    category: "language",
  },
  // ── More Niches ──────────────────────────────────────────────
  {
    slug: "nonprofit-organizations",
    headline: "AI Course Generator for Nonprofits",
    tagline: "Train volunteers, educate communities, and maximize impact with structured programs.",
    metaDescription: "Nonprofits: create training and education programs with AI. Generate volunteer onboarding, community education, and grant-funded training courses with Syllabi.",
    blurb: "Nonprofits need to do more with less. Syllabi generates structured training programs for volunteer onboarding, community education, and grant-funded initiatives — so your team spends time on impact, not course design.",
    useCases: ["Volunteer training and onboarding", "Community education programs", "Grant-funded training deliverables", "Board member orientation"],
    faqs: [
      { question: "Is there nonprofit pricing?", answer: "The free tier provides 3 course generations. For nonprofits needing more, the 5-Pack at €33 is a cost-effective option. Contact us for special nonprofit pricing on larger needs." },
      { question: "Can I demonstrate training deliverables for grants?", answer: "Yes. Generate complete training courses and export as professionally formatted PDFs. These serve as excellent deliverables for grant applications and reporting." },
      { question: "Does it work for community education?", answer: "Absolutely. Generate courses targeted at community members with accessible language and practical content. Specify the community's needs and literacy level for tailored output." },
    ],
    keywords: ["nonprofit training generator", "volunteer course builder", "nonprofit education AI", "community training program creator"],
    emoji: "💚",
    category: "business",
  },
  {
    slug: "instructional-designers",
    headline: "AI Course Generator for Instructional Designers",
    tagline: "Accelerate your ID workflow — from analysis to outline in 60 seconds.",
    metaDescription: "Instructional designers: use AI to fast-track course development. Generate initial course structures, learning objectives, and assessment frameworks with Syllabi.",
    blurb: "Syllabi doesn't replace instructional designers — it supercharges them. Generate initial course frameworks in seconds, then apply your expertise to refine, customize, and elevate. Spend your time on design decisions, not blank-page syndrome.",
    useCases: ["Rapid course prototyping", "Client proposal course outlines", "Learning objective mapping", "Assessment framework design"],
    faqs: [
      { question: "Will this replace my job as an instructional designer?", answer: "No. Syllabi generates initial structures that save you hours of outline work. Your expertise in learning theory, UX, accessibility, and stakeholder management is what turns a good outline into a great course." },
      { question: "Can I use it for client proposals?", answer: "Yes. Generate a course outline in minutes to include in proposals. It demonstrates your ability to deliver structured content quickly and professionally." },
      { question: "Does it follow ADDIE or SAM methodology?", answer: "Generated courses follow structured learning principles. Use the output as your Design phase artifact and apply your preferred methodology (ADDIE, SAM, Agile) for the full development lifecycle." },
    ],
    keywords: ["instructional design AI tool", "course design generator", "ID course builder", "rapid course prototyping tool"],
    emoji: "🎨",
    category: "education",
  },
  {
    slug: "course-creators",
    headline: "AI Course Generator for Online Course Creators",
    tagline: "Go from idea to structured course in under a minute. Sell faster.",
    metaDescription: "Online course creators: generate complete course structures with AI. Build Teachable, Thinkific, or Kajabi-ready courses with modules, quizzes, and outlines.",
    blurb: "The course creation market is booming, but most creators get stuck on structure. Syllabi eliminates planning paralysis by generating a complete course framework from your topic — ready to fill with your content and upload to any platform.",
    useCases: ["Teachable/Thinkific course outlines", "Membership site content libraries", "Micro-course lead magnets", "Cohort-based course design"],
    faqs: [
      { question: "Does it work with Teachable, Thinkific, and Kajabi?", answer: "Yes. Export your course as JSON or Markdown and import directly into any course platform. The module-lesson structure maps cleanly to how these platforms organize content." },
      { question: "How is this different from ChatGPT?", answer: "Syllabi generates structured, education-specific output — not paragraphs of text. You get modules, lessons, quizzes, pacing schedules, and learning objectives in a format ready for course platforms." },
      { question: "Can I generate a course outline to validate my idea?", answer: "Absolutely. Generate a free course in under 60 seconds. If the structure feels right and the modules make sense, you've validated your course idea before investing weeks of recording time." },
    ],
    keywords: ["online course creator tool", "course outline generator", "Teachable course builder AI", "course creation tool"],
    emoji: "🎥",
    category: "creative",
  },
  {
    slug: "life-coaches",
    headline: "AI Course Generator for Life Coaches",
    tagline: "Transform your coaching framework into a scalable digital product.",
    metaDescription: "Life coaches: create structured self-improvement courses with AI. Build transformation programs, workshops, and certification tracks with Syllabi.",
    blurb: "Your coaching framework changes lives — but it only scales if you package it. Syllabi generates structured self-improvement courses from your methodology, with progressive modules, reflection exercises, and milestone assessments.",
    useCases: ["12-week transformation programs", "Self-paced personal development courses", "Group coaching workshop outlines", "Certification program design"],
    faqs: [
      { question: "Can I include journaling and reflection prompts?", answer: "Yes. Specify 'include reflection exercises and journaling prompts' in your context, and Syllabi generates modules with built-in introspective components." },
      { question: "How do I price a course built with Syllabi?", answer: "Syllabi generates the structure — pricing is up to you. Most life coaching courses sell for $97-$997 depending on depth, support level, and your brand positioning." },
      { question: "Can I create a free introductory course?", answer: "Yes. Use the free tier to generate a mini-course that introduces your methodology. Share it as a lead magnet to attract coaching clients." },
    ],
    keywords: ["life coaching course generator", "personal development course AI", "coaching program builder", "transformation course creator"],
    emoji: "✨",
    category: "creative",
  },
  {
    slug: "music-teachers",
    headline: "AI Course Generator for Music Teachers",
    tagline: "Structure your music lessons into progressive, professional courses.",
    metaDescription: "Music teachers: create structured music courses with AI. Build progressive courses for instruments, theory, and music production with Syllabi.",
    blurb: "Music education thrives on structure. Syllabi generates progressive music courses — from beginner instrument courses to advanced music theory and production — with clear learning pathways and assessment milestones.",
    useCases: ["Instrument learning progressions", "Music theory courses (beginner to advanced)", "Music production and DAW training", "Ear training and sight-reading programs"],
    faqs: [
      { question: "Can I create instrument-specific courses?", answer: "Yes. Generate courses for piano, guitar, violin, drums, or any instrument. Specify the instrument and student level for a tailored progressive course." },
      { question: "Does it cover music theory?", answer: "Absolutely. Generate courses from basic notation and rhythm through advanced harmony, counterpoint, and composition. Each module builds on the previous one." },
      { question: "Can I create group class courses?", answer: "Yes. Specify 'group class format' and Syllabi generates ensemble-friendly courses with collaborative exercises and peer assessment components." },
    ],
    keywords: ["music course generator", "music teaching course AI", "instrument course builder", "music theory course creator"],
    emoji: "🎵",
    category: "creative",
  },
  {
    slug: "product-managers",
    headline: "AI Course Generator for Product Managers",
    tagline: "Build product management training that levels up your entire team.",
    metaDescription: "Create product management courses with AI. Generate training on discovery, roadmapping, analytics, and stakeholder management with Syllabi.",
    blurb: "Great product teams share a common framework. Syllabi generates structured PM training covering discovery, prioritization, roadmapping, analytics, and stakeholder management — so every PM on your team speaks the same language.",
    useCases: ["Associate PM onboarding programs", "Product discovery workshops", "Roadmapping and prioritization training", "Stakeholder communication courses"],
    faqs: [
      { question: "Can I create level-specific PM training?", answer: "Yes. Generate courses for associate PMs (fundamentals), mid-level PMs (strategy), or senior PMs (leadership) by specifying the experience level." },
      { question: "Does it cover modern PM frameworks?", answer: "Syllabi generates content referencing frameworks like Jobs-to-be-Done, OKRs, RICE scoring, and continuous discovery. Specify which frameworks to emphasize in your context." },
      { question: "Can I use this for team workshops?", answer: "Yes. Generate workshop courses with interactive and discussion-format lessons. Export to PPTX for slide-based facilitation." },
    ],
    keywords: ["product management course generator", "PM training builder AI", "product manager course creator", "PM onboarding program"],
    emoji: "📋",
    category: "business",
  },
  {
    slug: "accounting-professionals",
    headline: "AI Course Generator for Accounting & Finance Training",
    tagline: "Build CPE-ready courses and staff training programs in minutes.",
    metaDescription: "Create accounting and finance training courses with AI. Generate CPE programs, staff training, and financial literacy courses with Syllabi.",
    blurb: "Accounting firms and finance teams need structured training — for CPE credits, new hire onboarding, and client education. Syllabi generates comprehensive courses covering accounting standards, tax updates, financial analysis, and audit procedures.",
    useCases: ["CPE credit courses", "New staff onboarding programs", "Tax season update training", "Client financial literacy education"],
    faqs: [
      { question: "Can I generate CPE-eligible course content?", answer: "Syllabi generates structured educational content with assessments. Map the output to your state board's CPE requirements and submit for accreditation approval." },
      { question: "Does it cover current accounting standards?", answer: "Add specific standard references (GAAP, IFRS, ASC topics) in the context field, and Syllabi builds courses around those standards." },
      { question: "Can I create client-facing financial education?", answer: "Yes. Generate simplified courses on financial literacy, tax planning, or business finance for non-accountant audiences." },
    ],
    keywords: ["accounting course generator", "CPE course builder", "finance training AI", "accounting education course"],
    emoji: "📒",
    category: "business",
  },
  {
    slug: "ai-and-machine-learning",
    headline: "AI Course Generator for AI & Machine Learning Training",
    tagline: "Teach AI to your team — structured courses from fundamentals to deployment.",
    metaDescription: "Generate AI and machine learning courses with Syllabi. Build structured training on neural networks, NLP, computer vision, LLMs, and MLOps.",
    blurb: "AI literacy is no longer optional. Syllabi generates structured AI/ML courses for any audience — from executive overviews to deep technical training on neural networks, transformers, and production ML systems.",
    useCases: ["AI literacy for executives", "Deep learning specialization tracks", "LLM and prompt engineering courses", "MLOps and deployment training"],
    faqs: [
      { question: "Can I create non-technical AI courses?", answer: "Yes. Specify 'non-technical business audience' and Syllabi generates AI literacy courses focused on concepts, use cases, and strategy rather than code." },
      { question: "Does it cover the latest AI developments like LLMs?", answer: "Yes. Request courses on large language models, prompt engineering, RAG systems, or fine-tuning, and get structured courses covering the latest approaches." },
      { question: "Can I build a multi-course AI learning path?", answer: "Generate multiple courses at increasing complexity — AI Fundamentals, ML Engineering, Deep Learning, and MLOps — and link them as a progressive learning path." },
    ],
    keywords: ["AI course generator", "machine learning course builder", "AI training program creator", "LLM course generator"],
    emoji: "🤖",
    category: "technology",
  },
  {
    slug: "project-managers",
    headline: "AI Course Generator for Project Managers",
    tagline: "Build PMP-aligned training and team development programs in minutes.",
    metaDescription: "Create project management training courses with AI. Generate PMP prep, Agile/Scrum training, and team development courses with Syllabi.",
    blurb: "Project management training shouldn't be a project in itself. Syllabi generates structured PM courses — from PMP certification prep to Agile workshops — with clear learning objectives, module assessments, and professional export formats.",
    useCases: ["PMP certification study programs", "Agile and Scrum training", "Risk management courses", "Team lead development programs"],
    faqs: [
      { question: "Can I create PMP prep courses?", answer: "Yes. Generate courses aligned with PMBOK knowledge areas. Each module covers a specific domain with quiz questions that mirror PMP exam format." },
      { question: "Does it cover Agile methodologies?", answer: "Absolutely. Generate courses on Scrum, Kanban, SAFe, or general Agile principles. Specify the methodology for targeted content." },
      { question: "Can I create different courses for different PM levels?", answer: "Yes. Generate beginner courses for aspiring PMs, intermediate courses for practicing managers, and advanced courses for program directors by specifying the audience level." },
    ],
    keywords: ["project management course generator", "PMP training builder", "Agile course creator AI", "PM certification course generator"],
    emoji: "📐",
    category: "business",
  },
  {
    slug: "legal-professionals",
    headline: "AI Course Generator for Legal Training",
    tagline: "Create CLE courses and firm training programs without the course committee.",
    metaDescription: "Generate legal training courses with AI. Build CLE programs, associate training, and client education courses for law firms with Syllabi.",
    blurb: "Law firms need structured training for associates, paralegals, and clients — but building courses drains billable hours. Syllabi generates complete legal education programs covering practice areas, procedures, and professional development.",
    useCases: ["CLE credit courses", "Associate development programs", "Paralegal training", "Client legal education seminars"],
    faqs: [
      { question: "Can I generate CLE-eligible course content?", answer: "Syllabi generates structured educational content with assessments. Submit the output to your state bar's CLE accreditation process for approval." },
      { question: "Does it cover specific practice areas?", answer: "Yes. Generate courses on any practice area — corporate law, litigation, IP, employment law, real estate, etc. Specify the area and jurisdiction for tailored content." },
      { question: "Can I create client-facing legal education?", answer: "Yes. Generate simplified courses on business law, employment compliance, or IP protection for non-lawyer audiences." },
    ],
    keywords: ["legal training course generator", "CLE course builder", "law firm training AI", "legal education course creator"],
    emoji: "⚖️",
    category: "business",
  },
  {
    slug: "churches-and-ministries",
    headline: "AI Course Generator for Churches & Ministries",
    tagline: "Build structured Bible studies, leadership training, and small group courses.",
    metaDescription: "Churches and ministries: create structured courses for Bible studies, leadership development, and congregation education with Syllabi's AI course generator.",
    blurb: "From small group studies to leadership development, Syllabi generates structured church education programs with progressive lessons, discussion prompts, and reflection components — letting your ministry team focus on people, not planning.",
    useCases: ["Bible study series", "New member orientation programs", "Small group discussion courses", "Ministry leadership training"],
    faqs: [
      { question: "Can I create Bible study series?", answer: "Yes. Generate multi-week Bible study courses on any book, theme, or topic. Each module includes lesson content, discussion questions, and reflection exercises." },
      { question: "Does it work for youth ministry?", answer: "Absolutely. Specify the age group (teens, young adults, etc.) and Syllabi generates age-appropriate courses with engaging formats and relatable applications." },
      { question: "Can I create leadership training for volunteers?", answer: "Yes. Generate courses on servant leadership, ministry management, volunteer coordination, or any leadership topic relevant to your church's needs." },
    ],
    keywords: ["church course generator", "Bible study course builder", "ministry training AI", "church education program creator"],
    emoji: "⛪",
    category: "education",
  },
  {
    slug: "freelancers",
    headline: "AI Course Generator for Freelancers",
    tagline: "Turn your freelance expertise into a passive income stream.",
    metaDescription: "Freelancers: create and sell online courses with AI. Turn your expertise into structured courses with modules, quizzes, and professional exports using Syllabi.",
    blurb: "Freelancing has a ceiling — your time. Break through it by packaging your expertise into courses. Syllabi generates complete course structures from your knowledge, ready to sell on Gumroad, Teachable, or your own site.",
    useCases: ["Skill-based courses from your expertise", "Client education programs", "Passive income course products", "Workshop and webinar frameworks"],
    faqs: [
      { question: "What kind of courses can I create from my freelance skills?", answer: "Any skill you sell as a service — design, writing, development, marketing, consulting — can become a structured course. If clients pay you for it, students will too." },
      { question: "How do I sell courses as a freelancer?", answer: "Export your course and upload to Gumroad (simplest), Teachable, or embed on your website. Start with a free mini-course to build your email list." },
      { question: "Can I create courses while still freelancing?", answer: "That's the point. Syllabi generates course structures in under 60 seconds. Spend a few hours filling in your expertise and you have a product that sells while you sleep." },
    ],
    keywords: ["freelancer course generator", "sell online courses freelancer", "freelance course builder", "passive income course creator"],
    emoji: "💼",
    category: "creative",
  },
];

/** Lookup a niche by slug — returns undefined if not found */
export function getNicheBySlug(slug: string): Niche | undefined {
  return NICHES.find((n) => n.slug === slug);
}

/** All slugs (for generateStaticParams) */
export function getAllNicheSlugs(): string[] {
  return NICHES.map((n) => n.slug);
}

/** Group niches by category */
export function getNichesByCategory(): Record<string, Niche[]> {
  return NICHES.reduce(
    (acc, niche) => {
      if (!acc[niche.category]) acc[niche.category] = [];
      acc[niche.category].push(niche);
      return acc;
    },
    {} as Record<string, Niche[]>
  );
}

/** Category display labels */
export const CATEGORY_LABELS: Record<string, string> = {
  education: "Education",
  corporate: "Corporate & HR",
  creative: "Creators & Coaches",
  technology: "Technology",
  health: "Health & Wellness",
  business: "Business & Professional",
  language: "Languages",
};
