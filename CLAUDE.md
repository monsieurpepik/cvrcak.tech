# Cvrčak · Project Context for Claude Code

Read this file at the start of every session. If an instruction in the conversation contradicts this file, flag it and ask. Push back on scope creep.

---

## What Cvrčak is

Cvrčak is an **audio-first AI tutor for Bosnian schoolchildren in grades 5 to 8**, grounded in licensed textbooks. A child listens to a chapter-length audio overview (teacher and student dialogue, Bosnian language, pre-generated TTS), then asks follow-up questions that are answered from the exact textbook content with page citations. Off-syllabus questions are refused politely.

Cvrčak is a **new Bosnian legal entity** (Cvrčak Tech d.o.o., pending registration), a 50/50 joint venture between the founder (Boban) and the owner of cvrcak.ba, an existing children's educational publisher. Capital in Phase 1 is ~$30,000 USD with 4 to 6 months of runway. Cvrčak Tech licenses textbook content and brand from cvrcak.ba under an IP contribution agreement.

The founder's thesis: the audio overview format (inspired by NotebookLM, reframed as children's educational audio) is the wedge. Text chat with citations is the supporting feature, not the hero.

---

## Current scope: Slice 1 only

We are building **one vertical slice** to validate the audio-first thesis before committing to v1. Not the app. One slice.

### What Slice 1 is

1. **One chapter, end to end.** Matematika 5, Poglavlje 4, Razlomci. Digitized, chunked, embedded, stored in pgvector.
2. **One audio overview** for Tema 4.2 "Sabiranje razlomaka sa različitim nazivnicima." Roughly 8 minutes. Two speakers: Nastavnica (warm, patient, female teacher voice) and Marko (curious 10-year-old student voice). Script human-QA'd, TTS-generated, stored as .mp3 in Supabase Storage.
3. **One audio player screen** in Expo: waveform, chapter markers, speed control, download-for-offline, two speaker chips.
4. **One follow-up chat screen** that opens from a "Pitaj pitanje" button after audio. Kid asks a question in Bosnian, retrieval pulls top-k chunks from pgvector, Claude answers grounded in those chunks with a page citation chip. Off-syllabus questions refused.
5. **One user, anonymous.** No auth, no onboarding, no profile in Slice 1. The app opens straight to the chapter.

### What Slice 1 is NOT

- NOT the onboarding flow (mockup exists in `/v1-screens/onboarding.html`, out of scope)
- NOT the books library (mockup exists, out of scope)
- NOT the quiz (mockup exists, out of scope)
- NOT the profile / streak / Ja tab (mockup exists, out of scope)
- NOT empty states, error states beyond the basic "nema interneta" banner
- NOT real authentication or parent account creation
- NOT the teacher dashboard (v1.5, out of scope)
- NOT the parent weekly digest (v1.5, out of scope)
- NOT regional expansion (Serbia, Croatia, Montenegro are v2+, out of scope)
- NOT multiple textbooks. One chapter. One subject. One grade.
- NOT iOS and Android launch readiness. Expo Dev Client on one test device is fine.

If the conversation drifts toward anything in the NOT list, stop and ask. We are not shipping v1 in this slice. We are testing whether the audio thesis works.

---

## Tech stack (locked)

Chosen for **ease of handoff to BiH and regional engineers**, strong ecosystem support, and minimum cognitive load. No experimental pieces.

### Mobile app
- **Expo SDK 52** (managed workflow)
- **React Native** with **TypeScript** (strict mode)
- **Expo Router** for file-based routing
- **NativeWind** for styling (Tailwind for React Native). Tokens ported from `system.css`.
- **react-native-track-player** for audio. Handles background playback, lock-screen controls, interruptions.
- **TanStack Query** for server state, cache, retries.
- **Zustand** for client state. No Redux.
- **Expo AsyncStorage** for small device persistence (last-played position, download state).

### Backend
- **Supabase** (cloud, EU region, Frankfurt):
  - Postgres with the **pgvector** extension for textbook chunks and embeddings.
  - Auth (disabled in Slice 1, anon key only).
  - Storage bucket `audio/` for pre-generated .mp3 files.
  - Edge Functions in **TypeScript on Deno** for the Q&A endpoint.

### AI (runtime, in Edge Functions)
- **Anthropic Claude 3.5 Sonnet** via HTTPS for grounded Q&A. Strong refusal behavior, strong multilingual, fits the grade-5 register.
- Alternative to benchmark against: **OpenAI GPT-4o**. Final choice is an empirical call by the engineer based on BiH-language accuracy on a 20-question evaluation set. Document the choice in `/docs/llm-choice.md` with evidence.
- **OpenAI `text-embedding-3-large`** for embeddings. Best multilingual performance on Bosnian in current testing.

### TTS (for Slice 1 audio generation)
TBD. Three candidates validated during Slice 1 content work:
1. **ElevenLabs Turbo v2.5** (multilingual voices, voice cloning available)
2. **OpenAI tts-1-hd**
3. **Azure Neural Voice (sr-RS locale, Bosnian rendering)**

Winner picked at end of Phase 0 (content pipeline phase) based on native-speaker panel scoring. See `/docs/tts-validation.md` when produced.

### Content pipeline (offline, runs once per chapter)
- **Python 3.11+**
- **pdfplumber** for text PDF extraction, **Tesseract** via `pytesseract` as OCR fallback for scanned pages
- **OpenAI API** for embeddings
- **psycopg2** or **supabase-py** to write chunks and embeddings directly to Supabase
- Runs on the engineer's machine or a one-off cloud box. Never in the request path.

### Deployment and ops
- **EAS Build** and **EAS Update** for mobile.
- **Supabase cloud** for backend. Migrations committed to the repo, applied via `supabase db push`.
- **GitHub Actions** for CI (type-check, lint, migration check).
- **Sentry** for mobile and edge function error tracking.
- **PostHog** (free tier, EU hosting) for product analytics.

---

## Architectural rules (non-negotiable for Slice 1)

1. **No Python in the request path.** LLM calls happen inside Supabase Edge Functions in TypeScript. Python exists only in the offline content pipeline.

2. **No LLM orchestration frameworks.** No LangChain, no LlamaIndex, no agent libraries. The Q&A flow is: embed question → SQL similarity search in pgvector → construct prompt with retrieved chunks → call Claude → run citation verifier → return. Roughly 60 lines of TypeScript.

3. **Citation or silence.** Every grounded answer must cite a real page number that resolves to an actual chunk in pgvector. If the LLM produces an answer without a verifiable citation, return "Ne znam, ovo nije u poglavlju koje si slušao." Target: 95% citation accuracy on the Slice 1 evaluation set. Below 90% kills the slice.

4. **Off-syllabus refusal is a hard stop.** Questions not covered by Poglavlje 4 (Razlomci) are refused with the redirect pattern from PRD v0.4 §3.1 Feature 2. Evaluate on a 20-question off-syllabus test set. Target: 95% correctly refused.

5. **Audio is pre-generated, never live.** TTS runs offline during content prep. MP3 files live in Supabase Storage and are served via CDN. The app does not call TTS at runtime. This is a cost and latency rule, do not violate.

6. **No localStorage in React Native.** Use AsyncStorage for device state, Supabase for server state.

7. **Secrets stay out of the app.** Anthropic and OpenAI API keys live in Supabase Edge Function secrets. The mobile app never sees them. The app calls one endpoint: `POST /functions/v1/ask`.

8. **One environment for Slice 1.** Dev only. Staging and production separation is a v1 concern, not a Slice 1 concern.

---

## Design tokens (port from system.css to NativeWind)

### Fonts
- **Display:** Instrument Serif (weight 400 only, italic for accent). Used for screen titles, hero card titles, and the Nastavnica "N" / Marko "M" speaker-chip initials.
- **Body:** DM Sans (400 / 500 / 600 / 700). Used for everything else.
- **Mono:** JetBrains Mono (400 / 500). Used for durations (2:34 / 8:42), chapter timestamps, percentages.

### Colors (verbatim from system.css, do not invent new ones)

```
--cream:          #FFFFFF   /* screen background */
--cream-2:        #FDF6E8   /* page background */
--cream-3:        #FAF6EC   /* subtle surfaces */
--ink:            #1C1C1C   /* primary text, dark buttons */
--ink-2:          #3A3A3A   /* secondary text */
--ink-3:          #5A5A5A   /* tertiary text */
--muted:          #7A7A7A   /* metadata, timestamps */
--line:           #E8E8E8   /* borders */
--line-2:         #F0F0F0   /* subtle borders */
--accent-warm:    #B87A2E   /* the Cvrčak amber, sparingly */
--pop-peach:      #F8DFB0   /* audio hero card */
--pop-peach-warm: #FBE8C0   /* warm peach */
--pop-lavender:   #F0E5FB   /* v1.5 scope tag */
--success:        #4F7F4B
--danger:         #C14E3C
--warning:        #D4923A
```

### Radii
- Cards: 14px to 16px
- Buttons: 100px (pill)
- Chips: 100px (pill)
- Hero / major containers: 24px to 32px
- Phone screen inner: 42px

### Spacing
Use Tailwind defaults via NativeWind. Page padding 18px, card padding 16px, section gap 14px to 20px.

---

## Working style

- **Explain before changing.** One turn, one change. No silent rewrites.
- **Ask before installing dependencies** outside the stack above.
- **Ask before changing Supabase schema.**
- **Ask before modifying design tokens.**
- **Do not commit to git without asking.**
- **No big-bang refactors.** If existing code is messy, call it out and leave it for a dedicated cleanup turn.
- **If a library adds complexity without a Slice 1 benefit, question adding it.**
- **Prefer boring over clever.** We are handing this to another engineer. Clever code that the next person cannot read is worse than verbose code that they can.

---

## Copy and voice rules (user-facing strings)

- **Language:** Bosnian by default (bs-BA, Latin script). Match dialect to input later. Slice 1 is BS only.
- **Voice:** warm, curious, never condescending, never performatively cute.
- **Never reveal the system is an AI.** Never apologize for "limitations as an AI." Never break frame.
- **Never use em dashes anywhere.** Not the long dash character, not the short dash as a substitute, nothing that functions as one. Not in UI strings, not in code comments, not in markdown. Use periods, colons, commas, parentheses, or line breaks. This is a project-wide rule, no exceptions.
- **Kid-facing register:** short sentences, second person, concrete examples from the current chapter.
- **Off-syllabus refusal pattern:** "To nije u tvojoj knjizi. Ali možemo završiti zadatak iz Matematike koji si počeo, hoćeš?" Never mention "curriculum" or "syllabus" to the kid.
- **Numbers, durations, fractions:** always mono font in UI, never in body type.

---

## Founder context

- Founder: **Boban**, based in Banja Luka and Dubai. Non-engineer but technically literate. Uses Claude Code for integration, review, and focused edits.
- **Engineers are contracted.** Boban is not writing production code directly. Claude Code sessions in this repo are for Boban to review, test, run scripts, ask architectural questions, and make small surgical edits.
- **Runway is tight.** $30K, 4 to 6 months. Every session must move the slice forward or it was a waste.
- **Deeply allergic to displacement activity.** Mockups, PRD revisions, plans produced instead of shipping code are yellow flags. If a deliverable looks like process rather than product, say so.
- **Pushes back hard and wants to be pushed back on.** Do not cave to "just do it." If something is wrong, say it is wrong.

---

## File layout (target)

```
cvrcak/
├── apps/
│   └── mobile/                   # Expo app
│       ├── app/                  # Expo Router routes
│       │   ├── index.tsx         # Audio overview screen
│       │   └── chat.tsx          # Follow-up chat screen
│       ├── components/           # AudioPlayer, Waveform, ChapterMarkers, ChatBubble, CitationChip
│       ├── lib/
│       │   ├── supabase.ts       # Client
│       │   └── audio.ts          # Track-player wiring
│       └── theme/                # NativeWind config, tokens
├── supabase/
│   ├── functions/
│   │   └── ask/                  # Grounded Q&A endpoint
│   │       ├── index.ts
│   │       └── prompt.ts         # System prompt + refusal rules
│   └── migrations/
│       ├── 001_chunks_table.sql
│       └── 002_pgvector.sql
├── content/                      # Python pipeline (offline)
│   ├── ingest.py                 # PDF → text
│   ├── chunk.py                  # semantic chunking
│   ├── embed.py                  # OpenAI embeddings + write to pgvector
│   └── generate_audio.py         # Script → TTS → upload to Supabase Storage
├── docs/
│   ├── llm-choice.md
│   ├── tts-validation.md
│   └── slice-1-plan.md           # Copy of the plan document
├── CLAUDE.md                     # This file
└── README.md
```

---

## When to break the rules

If a rule here produces a clearly worse outcome for Slice 1, stop and tell Boban. Rules save decisions, they do not replace them. But the default answer to "should we deviate from this file" is **no**.
