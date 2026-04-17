# Syllabi.online — Premium Generation Animation + Fixes

> **Purpose:** Self-contained spec for a new Claude Code session. Read top to bottom, execute the TODO list, test, commit, deploy. No questions needed.

---

## Project Context

**Repo:** `/Users/gianmarcopaglierani/Projects/syllabi.online`
**Stack:** Next.js 16.2.1 (App Router), React 19, Framer Motion 12, Tailwind CSS, Lucide icons, Supabase, Inngest
**Deployment:** Vercel (frontend) + Google Cloud Run (Inngest background worker)
**Notion context page (read first for full context):** `https://www.notion.so/34315a619d1f81c79fd1cce8deaeef54` — fetch via Notion MCP tool `notion-fetch`

**Key files you'll touch:**
- `src/components/CourseAssemblyLoader.tsx` — the main loader component (complete rewrite)
- `src/app/page.tsx` — landing page; generation section starts at line ~930
- `src/app/profile/page.tsx` — dashboard; "generate" tab uses same loader at line ~1855
- `src/app/layout.tsx` — root layout (white flash fix)
- `src/app/globals.css` — global styles (white flash fix)

**Key files to read (don't modify unless needed):**
- `src/lib/inngest/functions.ts` — Inngest pipeline; writes `generation_progress`, `generation_completed_modules`, `generation_total_modules` to Supabase
- `src/app/api/courses/[id]/status/route.ts` — polling endpoint, returns progress fields
- `src/components/CurriculumForm.tsx` — form component, exports `GenerationProgress` type
- `src/app/api/generate/route.ts` — POST endpoint, creates course and triggers Inngest

---

## How Generation Works (don't change the pipeline — only the frontend UX)

1. User fills form → `POST /api/generate` → HTTP 202 with `courseId`
2. Inngest `courseGenerate` function runs on Cloud Run:
   - Writes `generation_progress = "Designing course structure..."` to Supabase
   - Calls Claude to build skeleton (course outline with module titles)
   - Writes `generation_total_modules = N`, `generation_completed_modules = 0`
   - Writes `generation_progress = "Generating module 1 of N..."`
   - Fans out N `module/generate.requested` events (3 concurrent per course)
3. Each `moduleGenerate` function writes:
   - `generation_progress = "Writing module X of N: <Module Title>"` (last-writer-wins, fine for UX)
   - Increments `generation_completed_modules` on completion
4. When all modules done → `courseFinalize` → `status = "ready"`
5. Frontend polls `GET /api/courses/[id]/status` every 3 seconds. Response includes:
   - `status`: "pending" | "generating" | "ready" | "failed"
   - `generation_progress`: the human-readable string
   - `generation_total_modules` / `generation_completed_modules`

**What the frontend currently has access to (via props):**
- `topic` (string) — the user's course topic
- `progressMessage` (string) — the `generation_progress` value from DB
- `completedModules` (number) — modules done so far
- `totalModules` (number) — total modules (0 until skeleton done)

---

## TODO List

Execute in order. After each TODO, run `npm run build` (or the project's build command) to catch type errors. After all TODOs, test in browser, then commit and push.

### TODO 1: Fix white flash on page load

**Problem:** When opening syllabi.online, there's a brief white flash before the dark theme applies. The root cause:
- `src/app/globals.css` line 51: `:root` sets `--background: oklch(1 0 0)` (white)
- `src/app/layout.tsx` line 341: `<html>` has `className="... dark"` but CSS `:root` vars load first
- For ~50-100ms the browser renders `:root` white background before `.dark` overrides kick in

**Fix — two changes:**

1. In `src/app/globals.css`, add this rule at the very top of the `@layer base` block (after line 120):
```css
html {
  color-scheme: dark;
}
```

2. In `src/app/layout.tsx`, add an inline style to `<html>` to force dark background before CSS loads:
```tsx
<html
  lang="en"
  className={`${inter.variable} h-full antialiased dark`}
  style={{ background: '#1a1a1a' }}
  suppressHydrationWarning
>
```

The inline `style` loads with the HTML (zero delay), preventing the flash. The CSS will override it once loaded. The `color-scheme: dark` tells the browser to default to dark scrollbars/form controls.

**Test:** Open https://localhost:3000 (or whatever the dev port is) in an incognito window with cache disabled. Reload. No white flash should be visible.

---

### TODO 2: Redirect "Generate" from landing page to dashboard

**Problem:** When a user clicks "Generate" on the main landing page form, the generation runs inline on the landing page. Instead, it should navigate to `/profile` and open the "generate" tab there, so the user is in their dashboard context.

**Current flow (page.tsx ~line 947):**
```tsx
{isGenerating ? (
  <CourseAssemblyLoader ... />
) : curriculum ? (
  <CurriculumOutput ... />
) : (
  <CurriculumForm ... />
)}
```

**New flow:**
- When `CurriculumForm` triggers a generation from the **landing page** (`src/app/page.tsx`), navigate to `/profile?tab=generate` using `next/navigation`'s `useRouter`
- The profile page already handles `activeTab === "generate"` and shows the loader
- The generation is already persisted to Supabase and tracked by `courseId` — the profile page polls the same status endpoint
- You need to pass the `courseId` so the profile page can pick up the in-flight generation. Use a query param: `/profile?tab=generate&courseId=<id>`

**Implementation steps:**
1. In `src/app/page.tsx`:
   - Import `useRouter` from `next/navigation`
   - In the generation callback (where `setIsGenerating(true)` is called), instead of showing the local loader, call `router.push(\`/profile?tab=generate&courseId=${courseId}\`)`
   - Remove or guard the `CourseAssemblyLoader` rendering in page.tsx (keep the form, remove the inline loader)
   - Keep the `CurriculumOutput` rendering for when a user comes back with a completed course (or remove it too if the profile handles it — check what makes sense)

2. In `src/app/profile/page.tsx`:
   - Read `courseId` and `tab` from URL search params on mount
   - If `tab=generate` and `courseId` is present, auto-start polling that course's status
   - The profile page already has `isGenerating`, `genProgress`, and `CourseAssemblyLoader` — wire them up to the incoming courseId

**Important:** The `CurriculumForm` component handles the actual `POST /api/generate` call and starts polling. Look at how it does this — the `courseId` is created inside the form's submit handler. You may need to:
- Have the form emit the courseId via a callback
- Or read it from the URL after the form redirects

Read `src/components/CurriculumForm.tsx` carefully before implementing. The form currently manages its own polling loop. You might need to lift the courseId out of the form and into the page, then pass it to the profile page via URL.

**Test:** Click "Generate Your First Course Free" on the landing page → fill form → submit → should navigate to `/profile?tab=generate&courseId=xxx` → loader shows there with real progress.

---

### TODO 3: Premium generation animation — complete rewrite of CourseAssemblyLoader

**File:** `src/components/CourseAssemblyLoader.tsx`

This is the main creative task. The current loader is functional but basic. Rewrite it to feel premium, engaging, and alive — like a Stripe/Linear-quality loading experience.

#### 3A: Expanded personality copy (40+ lines)

Replace the current `COPY_BY_PHASE` object. The tone is: **dry, first-person, slightly self-deprecating, competent-but-honest teaching assistant.** No emojis. Use `{topic}` interpolation in ~50% of lines. Aim for 12-15 per phase.

**Skeleton phase (the AI is designing the course structure):**
```
"Sketching the shape of {topic}…"
"Deciding what Module 1 should make you feel…"
"Reading three textbooks about {topic} at once…"
"Wait — should this start easy or throw you in the deep end?"
"Figuring out what a beginner actually needs to hear first…"
"Pretending I know what I'm doing (I kind of do)…"
"Outlining {topic} like it's a Netflix series…"
"Debating whether 6 modules is too few or 12 is too many…"
"Mapping out {topic} so it actually makes sense…"
"Trying to make {topic} sound exciting from the first line…"
"Structuring this so nobody drops off at Module 3…"
"Building the skeleton — the one that holds everything together…"
"Deciding the order you'll learn {topic} in. It matters more than you'd think…"
"Staring at a blank outline. Give me a second…"
```

**Modules phase (the AI is writing each module's full content):**
```
"Writing this one — I think it's actually fun…"
"Trying not to overuse the word 'basically'…"
"Looking for a better example than the one I just wrote…"
"Arguing with myself about whether quiz 3 is too easy…"
"Making sure Module 2 doesn't repeat Module 1. Again."
"Rewriting that paragraph because I didn't like it either."
"Convincing myself this metaphor works…"
"Teaching {topic} the way I wish someone taught me…"
"Writing a quiz question I actually want to answer…"
"Sneaking in one more good example…"
"This module on {topic} is turning out better than expected…"
"Adding a practical exercise that isn't boring…"
"Cutting the fluff. Nobody needs filler."
"Writing the part about {topic} that most courses get wrong…"
"Double-checking that the examples don't all sound the same…"
```

**Polish phase (finalizing, all modules done):**
```
"Polishing the edges. Almost there…"
"Double-checking nobody will fall asleep in Module 5…"
"Making sure the audio narrator doesn't sound bored…"
"Tidying up the roadmap…"
"One last pass — this is the fun part…"
"Putting the finishing touches on {topic}…"
"Reading the whole thing back. Looking good…"
"Checking that the quizzes actually test what we taught…"
"Making {topic} look like it took weeks to write…"
"Almost done. This one's actually good…"
"Smoothing out the transitions between modules…"
"Last sanity check. Stand by…"
```

#### 3B: Module-aware dynamic copy

When in the "modules" phase and we know `completedModules`, `totalModules`, and the `progressMessage` contains a module title (pattern: `"Writing module X of N: <Title>"`), parse the title and inject it into some copy lines:

- Extract module title from `progressMessage` using regex: `/Writing module \d+ of \d+: (.+)/`
- Add a few dynamic lines that use both `{topic}` and the current module title:
  - `"Deep into '{moduleTitle}' — this one's meaty…"`
  - `"'{moduleTitle}' is the chapter everyone will remember…"`
  - `"Almost done with '{moduleTitle}'. Moving on…"`
- Mix these dynamically-generated lines into the rotation when a module title is available

#### 3C: Premium animation design

**Overall vibe:** Dark, glowing, premium. Think Vercel's deploy animation or Stripe's loading states. Purple/violet accent palette (matches the existing brand).

**Key animation elements to implement:**

1. **Orbital progress ring** (replaces the basic progress bar):
   - A circular SVG ring (like a radial progress indicator) with a glowing violet trail
   - The ring fills based on `progressPercent`
   - Inside the ring: the phase icon (Layers → PenLine → Wand2) with a slow pulse
   - Below the ring: the `{elapsed}s` counter and `"X of Y modules"` text

2. **Typewriter subline** (replaces the simple fade in/out):
   - The rotating humor copy should appear character-by-character (typewriter effect)
   - After fully typed, hold for 1.5s, then fade out → next line types in
   - Use a blinking cursor `|` at the end while typing
   - Total cycle: ~3.5s per line (1.5s typing + 1.5s hold + 0.5s transition)

3. **Module cards that build up** (replaces the current `ModuleStack`):
   - When in skeleton phase: show 3-4 placeholder cards with shimmer animation
   - When modules start generating: cards appear one by one with a satisfying slide-in
   - Each card shows the module number + title (extracted from `progressMessage`)
   - Active card has the purple glow ring + typing line animation
   - Completed cards: subtle green checkmark, slightly dimmed
   - Pending cards: barely visible outlines

4. **Particle system upgrade:**
   - Current particles are basic dots. Upgrade to:
   - Small floating sparkle dots that drift upward (like embers)
   - Increase density during the modules phase (more "work" happening)
   - Reduce to a gentle drift during polish phase
   - Use `mix-blend-mode: screen` for a premium glow effect

5. **Phase transition animation:**
   - When transitioning between phases (skeleton → modules → polish), play a satisfying "burst" animation
   - A brief ring of particles expands outward from the center
   - The phase chip tracker should animate the active chip sliding with a glow trail

6. **Smooth progress that never stalls:**
   - The current `fakePercent` logic (line 316) climbs linearly. Improve it:
   - Use an easing curve that moves fast at the start, slows in the middle, and speeds up near the end
   - When real data arrives (`totalModules > 0`), smoothly interpolate from the fake value to the real one
   - The progress should never visually stall for more than 5 seconds — if real progress hasn't updated, add micro-increments

#### 3D: Keep the component interface stable

The props interface MUST remain the same:
```typescript
export interface CourseAssemblyLoaderProps {
  topic?: string;
  progressMessage?: string;
  completedModules?: number;
  totalModules?: number;
}
```

Both `src/app/page.tsx` (line 948) and `src/app/profile/page.tsx` (line 1857) render this component with the same props. Don't break either call site.

#### 3E: Responsive design

- Mobile (< 640px): Stack vertically. Orbital ring smaller. Module cards single column. No particle system (performance).
- Tablet (640-1024px): Ring + copy side by side. Module cards in 1 column.
- Desktop (> 1024px): Full layout with particles, ring, and module cards.

---

### TODO 4: Final testing checklist

Run the dev server (`npm run dev` or whatever the project uses) and test:

- [ ] **White flash:** Open site in incognito with cache disabled. No white flash on any page.
- [ ] **Landing page generate → dashboard redirect:** Fill the form on the landing page, click generate. Should navigate to `/profile?tab=generate&courseId=xxx`. Loader shows with real progress.
- [ ] **Dashboard direct generate:** Go to `/profile`, click "New Course" tab, fill form, generate. Loader shows inline in dashboard.
- [ ] **Loader copy rotation:** Watch the loader for 60+ seconds. Copy should rotate every ~3.5s, use the topic name, never repeat too quickly.
- [ ] **Module progress:** When modules start generating, the module cards should appear one by one. Progress ring should advance.
- [ ] **Phase transitions:** Watch for skeleton → modules → polish phase changes. Each should animate smoothly.
- [ ] **Mobile:** Resize to 375px width. Loader should be fully usable and performant.
- [ ] **Completion:** When generation finishes (`status = "ready"`), the loader should transition to showing the completed course.
- [ ] **Error state:** If generation fails, the loader should gracefully show an error (check how the current code handles `status = "failed"`).

### TODO 5: Build, commit, deploy

```bash
npm run build          # Must pass with zero errors
npm run lint           # Fix any lint issues
```

Then commit:
```
feat(loader): premium generation animation + white flash fix + generate-to-dashboard redirect

- Rewrite CourseAssemblyLoader with orbital progress ring, typewriter copy,
  animated module cards, and upgraded particle system
- 40+ personality copy lines with topic interpolation across 3 phases
- Fix FOUC white flash via inline dark background + color-scheme: dark
- Redirect landing page "Generate" to /profile?tab=generate for dashboard context
```

Push to main. Vercel will auto-deploy.

---

## Reference: Current Backend Progress Messages

These are the exact strings written to `generation_progress` in Supabase. Your frontend code should handle all of them gracefully:

| When | Progress string |
|------|----------------|
| Skeleton starts | `"Designing course structure..."` |
| Skeleton done, modules starting | `"Generating module 1 of N..."` |
| Each module starts writing | `"Writing module X of N: <Module Title>"` |
| Module fails (still increments) | `"Generated X of N modules (<moduleId> failed)..."` |
| All modules done | `"Finalizing course..."` |
| Course ready | `null` (cleared) |

## Reference: Current Inngest Progress Fields in DB

| Column | Type | When set |
|--------|------|----------|
| `generation_progress` | text | Updated at each stage (see above) |
| `generation_total_modules` | int | Set after skeleton generation |
| `generation_completed_modules` | int | Incremented after each module completes |

## Reference: Polling Response Shape

```typescript
interface CourseStatusResponse {
  status: "pending" | "generating" | "ready" | "failed";
  curriculum?: CourseData;
  error_message?: string;
  generation_progress?: string;
  generation_total_modules?: number;
  generation_completed_modules?: number;
}
```

---

## Style Guide

- **Color palette:** Violet/purple accent (`violet-500`, `fuchsia-500`, `indigo-500`). Dark background. Emerald for success states.
- **Animations:** Use Framer Motion (already imported). Prefer `easeOut` and spring physics. No jarring movements.
- **Typography:** Use the existing `Inter` font. Headlines bold, sublines italic or muted.
- **Icons:** Use Lucide React (already imported). `Sparkles`, `Layers`, `PenLine`, `Wand2`, `CheckCircle2` are already in the component.
- **No emojis in code or copy.** The visual layer handles the vibe.
- **Dark mode only** — the site is permanently dark themed (`className="dark"` on `<html>`).
