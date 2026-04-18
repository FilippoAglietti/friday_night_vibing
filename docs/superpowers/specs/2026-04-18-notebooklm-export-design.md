# NotebookLM Export — Replace Per-Lesson Audio Generation

**Date:** 2026-04-18
**Authors:** Gianmarco (product) + Claude Code
**Status:** Draft — awaiting Filippo review before implementation
**Supersedes:** per-lesson TTS pipeline (`/api/audio/generate` + ElevenLabs/OpenAI TTS)

---

## 1. Goal

Replace the Masterclass audio feature (per-lesson ElevenLabs/OpenAI TTS narration) with a **NotebookLM-ready export**: a single Markdown file per course that users drop into Google NotebookLM to generate their own conversational audio overview on demand.

One sentence: **we stop generating audio for the user and start generating the source material NotebookLM wants.**

---

## 2. Why

### Quality
Per-lesson single-voice TTS is a tired format. NotebookLM's two-host conversational podcast is what users actually want for "learn while walking." We cannot match NotebookLM output with TTS, and trying to compete is a losing frame.

### Margin
Masterclass (€99/mo ÷ 20 courses = $5.30/course budget):
- **Today:** generation $4.11 + audio $1–3 per course → **~23% gross margin before audio, ~0–15% after**.
- **After:** generation $4.11, no audio cost → **~22% margin, with no variable audio bill growing with usage**.

Audio was the most expensive and least differentiated piece of the stack.

### Scope simplification
Removes: TTS provider integration, voice selection UI, audio generation queue, audio storage bucket, signed URL rotation, `media_assets` audio rows, `AudioPlayer` component, provider fallback logic.

---

## 3. What gets removed

| Surface | Action |
|---|---|
| `src/app/api/audio/generate/route.ts` | **Delete** |
| `src/components/AudioPlayer.tsx` | **Delete** |
| `src/components/CurriculumOutput.tsx` | Remove audio UI block + play buttons |
| Supabase Storage bucket `course-audio` | Keep for now (contains paid user assets) — stop new writes, plan retirement in 90 days |
| `media_assets` rows where `type='audio'` | Keep — existing paid users retain access until signed URLs expire |
| `tiers.ts` `hasAudio` flag | Repurpose → `hasNotebookLMExport` (true for masterclass + enterprise) |
| Env vars `OPENAI_API_KEY` (TTS use), `ELEVENLABS_API_KEY` | Remove from Vercel + Cloud Run if unused elsewhere |
| i18n strings referencing "audio lessons" | Update in all 16 locales |

---

## 4. What gets added

### 4.1 Export endpoint

**`GET /api/export/notebooklm?course_id=<uuid>`** → returns `text/markdown` attachment.

- Auth: caller must own the course (reuse `loadCourseForEdit`).
- Plan gate: tier must have `hasNotebookLMExport = true`.
- Pure server-side, no queue, no background job. Runs in <2s on existing Vercel budget — no Cloud Run needed.

### 4.2 File format

Single `.md` per course, one file (NotebookLM accepts up to 50 sources, 500k words each — a single file is simpler and keeps the "course" as one unit).

```markdown
# {Course Title}

**Topic:** {topic}
**Audience:** {audience}
**Level:** {level}
**Duration:** {totalHours}h over {totalWeeks} weeks

## Course Overview
{skeleton.overview}

## Learning Objectives
- {objective 1}
- {objective 2}

---

# Module 1 — {Module Title}

{module.description}

## Lesson 1.1 — {Lesson Title}

{lesson.content (full polished body, Markdown preserved)}

**Key Points:**
- {keyPoints}

**Resources:**
- [{resource title}]({url})

---

(repeat per lesson, per module)

---

# Bonus Resources
- [{bonus resource title}]({url}) — {description}
```

Filename: `{slugified-topic}-{length}-{YYYY-MM-DD}.md`

### 4.3 UI entry point

Add a single button to the course viewer header:
**"Download for NotebookLM"** → triggers the GET endpoint → browser downloads file → small inline tooltip on first hover: *"Drop this file into a new NotebookLM notebook (notebooklm.google.com) to generate a conversational podcast."*

No wizard, no modal — one-click by design. Link to a 30-second help article (to be written) for first-time users.

### 4.4 Tier positioning

| Tier | NotebookLM export |
|---|---|
| Free | ❌ |
| Planner (€29) | ❌ |
| **Masterclass (€99)** | ✅ |
| Enterprise | ✅ |

The export is a Masterclass-differentiating feature. Planner users see a paywall CTA: "Upgrade to Masterclass to export for NotebookLM podcast generation."

---

## 5. Pricing implications

Pricing stays **€99/mo** for Masterclass. The value prop copy changes:

**Before:** "Masterclass includes audio lessons"
**After:** "Masterclass includes NotebookLM-ready export → generate a podcast of your course in one click"

Landing + pricing page + 16 locales need copy updates. Tracked as a follow-up task, not a blocker for ship.

---

## 6. Implementation plan (high level)

1. **Build export endpoint** — pure server function, deterministic formatter over `curriculum` JSON.
2. **Add viewer button** — wired to endpoint, tier-gated.
3. **Update tier config** — `hasAudio` → `hasNotebookLMExport`, update all call sites.
4. **Kill audio surfaces** — delete route, delete `AudioPlayer`, strip UI block from `CurriculumOutput`.
5. **i18n copy sweep** — 16 locales, "audio" mentions → "NotebookLM export" where tier-value copy.
6. **Cleanup plan** — mark `course-audio` bucket as deprecated; schedule removal after signed URLs age out (90d).

Detailed implementation lives in the plan doc (next step after this spec is approved).

---

## 7. Open questions for Filippo

1. **Existing audio assets** — leave accessible until signed URLs expire (90d), or revoke on deploy?
2. **TTS env vars** — any other code paths rely on `OPENAI_API_KEY` (we use Anthropic for generation, so probably not) or `ELEVENLABS_API_KEY`?
3. **Export format scope** — ship with body-only first, add bonus-resource section in a v2? Or include everything day 1?
4. **Analytics** — do we want an `export_generated` telemetry event for product-market fit tracking?
5. **Free-tier preview** — allow free users to export a 1-lesson sample to drive Masterclass conversion? (Could be a strong conversion lever.)

---

## 8. Non-goals (explicitly)

- **Not** generating audio ourselves anymore — full stop. No fallback TTS.
- **Not** embedding NotebookLM output back into Syllabi — users keep the podcast in their own NotebookLM notebook.
- **Not** supporting PDF/DOCX/EPUB export in v1 — Markdown only. Other formats are a separate spec.

---

## 9. Risk + mitigations

| Risk | Mitigation |
|---|---|
| Existing paying Masterclass users rely on generated audio | Grandfather existing audio assets; announce change with 14-day notice; offer bulk export before cutover |
| NotebookLM becomes paid / rate-limited | Markdown export still useful for any LLM (ChatGPT, Claude, Gemini). Frame as "universal AI-ready export" if needed |
| Users confused by external tool dependency | In-app help article + short demo GIF on the export button tooltip |

---

## 10. Success criteria

- `/api/export/notebooklm` returns a valid `.md` for any course with a ready curriculum, in under 2s.
- Masterclass users can download their course as a NotebookLM-ready file from the viewer.
- Zero remaining references to `ELEVENLABS_API_KEY` / OpenAI TTS in the codebase.
- Audio COGS on Masterclass drops to zero (tracked via Vercel + ElevenLabs billing).
- Masterclass gross margin ≥ 20% stays stable (no cost regression from other changes).
