# Cvrčak Slice 1: Engineering Brief

**Version:** 1.0 (execution-ready)
**Date:** April 2026
**Owner:** Boban
**Duration:** 14 calendar days from engineer start
**Budget ceiling:** Set in Section 10 below
**Purpose of this document:** brief a contracted engineer to quote a fixed-price build of Cvrčak Slice 1. Also serves as the internal definition of done.

---

## 1. One-line summary

Build one working vertical slice of Cvrčak: one math chapter, one audio overview, one follow-up chat with grounded citations. Test it with real kids and parents in BiH. Decide whether to proceed to v1.

---

## 2. Why this slice exists

Cvrčak's founding thesis is that **audio overviews in Bosnian, grounded in licensed textbooks, are the product wedge**. Text chat with citations is the supporting feature, not the hero. Before committing ~$30K of runway to building full v1, we validate that thesis with one chapter on real users. If the audio teaches, if kids engage with it, if the follow-up chat actually answers grounded questions accurately, we continue. If not, we stop or pivot. Slice 1 is the instrument that produces that decision.

---

## 3. Scope IN

1. **One chapter, digitized and indexed.** Matematika 5 (5th grade math, BiH curriculum), Poglavlje 4 "Razlomci" (Fractions). The chapter is ingested from PDF or scan, OCR'd where needed, human-QA'd for accuracy especially on math notation (č, ć, đ, š, ž, LaTeX-style fractions), chunked into ~200 to 500 token semantic sections, embedded with OpenAI `text-embedding-3-large`, stored in Supabase pgvector with page-number metadata.

2. **One audio overview**, ~8 minutes, for Tema 4.2 "Sabiranje razlomaka sa različitim nazivnicima" (adding fractions with different denominators). Script written in Bosnian as a dialogue between Nastavnica (warm, patient, female teacher) and Marko (curious 10-year-old boy student). Human-QA'd by a BiH native-speaker teacher. TTS-generated after provider selection (see Section 7). Output is a single .mp3 file plus a JSON sidecar with chapter markers (5: Uvod, Osnove, Primjer 1, Primjer 2, Sažetak) and their timestamps.

3. **Audio player screen in Expo.** Matches the design language of the existing v1 mockups (cream background, peach hero card, Instrument Serif display + DM Sans body, warm amber accents). Components: waveform visualization (24 bars, visibly segmented into played / active / upcoming), a dark 56px play/pause button, current time / total time in mono font, speed control (0.75 / 1 / 1.25 / 1.5 / 2), download-for-offline button, two speaker chips (Nastavnica N + Marko M), 5 tappable chapter markers with timestamps. Below the hero, a "Šta ćeš naučiti" 4-item list and two buttons: primary dark "Pitaj Cvrčka pitanje" and secondary outline "Otvori tekst poglavlja."

4. **Follow-up chat screen.** Opens when the kid taps "Pitaj Cvrčka pitanje." Simple chat UI (kid message right, Cvrčak message left), text input at the bottom. Each Cvrčak answer has a citation chip (e.g., "str. 62") that, on tap, shows a modal with the source paragraph and page number. Off-syllabus questions trigger the polite refusal with redirect. No message history persistence in Slice 1 (fresh chat on app open).

5. **Supabase Edge Function `/ask`.** Accepts a question, embeds it, runs pgvector similarity search restricted to Poglavlje 4 chunks, top-k = 5, constructs the prompt with retrieved chunks and a strict system prompt, calls Claude 3.5 Sonnet (and also OpenAI GPT-4o on a parallel track during the first week to benchmark), runs a citation verifier (does the cited page number correspond to a real retrieved chunk?), returns `{ answer, citation, confidence }`. Logs the full trace to Supabase for later accuracy evaluation.

6. **Evaluation suite.** 20 in-syllabus questions (must be correctly answered with valid citation) and 20 off-syllabus questions (must be correctly refused). Run manually at end of week 1, run automatically via a script at end of week 2. Target: 95% citation accuracy, 95% refusal precision.

7. **Field test in BiH.** Last 3 days of the 14. Install on 3 kids (ages 10 to 12) and 3 parents. Observe usage. Short structured interview after (questions in Section 11).

### Explicit non-goals for Slice 1

- No onboarding, no account creation, no auth flow. App opens directly to the chapter.
- No multiple chapters, no other subjects, no other grades. One chapter only.
- No book library, no progress tracking, no streak, no profile, no quiz screen.
- No teacher dashboard, no parent digest.
- No iOS or Android App Store submission. Expo Dev Client on physical test devices is the target.
- No localization beyond BS-BA. No SR / HR / ME variants in Slice 1.
- No real-time TTS. All audio is pre-generated.
- No multi-tenant architecture, no school codes, no org model.

If the engineer proposes building any of the above "because it is small," decline. Every hour spent on non-scope is an hour not spent on the thesis test.

---

## 4. Tech stack (locked, do not re-litigate)

The stack is chosen for **handoff-ease in the BiH and regional engineer pool**. TypeScript is the dominant skill. The Supabase TypeScript SDK is first-class. NativeWind maps to existing HTML/CSS mental model. No exotic pieces.

### Mobile
- Expo SDK 52 (managed workflow)
- React Native + TypeScript (strict mode)
- Expo Router
- NativeWind (Tailwind for RN)
- react-native-track-player (audio, background playback, lock-screen controls)
- TanStack Query
- Zustand for client state
- AsyncStorage for small device persistence

### Backend
- Supabase (EU region, Frankfurt)
  - Postgres + pgvector
  - Auth (disabled in Slice 1)
  - Storage bucket `audio/`
  - Edge Functions (TypeScript / Deno)

### AI
- Anthropic Claude 3.5 Sonnet (primary)
- OpenAI GPT-4o (benchmarked in parallel week 1)
- OpenAI `text-embedding-3-large` (embeddings)

### TTS (selected at end of week 1, see Section 7)
- Candidate A: ElevenLabs Turbo v2.5
- Candidate B: OpenAI tts-1-hd
- Candidate C: Azure Neural sr-RS

### Content pipeline
- Python 3.11+
- pdfplumber, pytesseract (OCR fallback)
- OpenAI API
- supabase-py

### DevOps
- EAS Build, EAS Update
- Supabase CLI for migrations
- GitHub Actions (type-check, lint, test)
- Sentry, PostHog (free tiers)

---

## 5. System architecture

### Request flow: kid asks a question

```
Expo app
  ↓  POST /functions/v1/ask { question, chapter_id: 4 }
Supabase Edge Function `ask`
  ↓  embed(question) via OpenAI
  ↓  SELECT top 5 chunks from pgvector WHERE chapter_id = 4 ORDER BY embedding <=> question_embedding
  ↓  construct prompt: system rules + retrieved chunks + question
  ↓  call Claude 3.5 Sonnet
  ↓  citation verifier: does answer cite a real retrieved-chunk page?
  ↓  if no valid citation, return "ne znam" response
  ↓  log { question, retrieved_chunks, answer, citation, latency } to supabase.ask_logs
Returns { answer, citation_page, confidence }
Expo app
  ↓  render message + citation chip
```

### Content flow (offline, one-time per chapter)

```
Matematika 5 PDF
  ↓  content/ingest.py (pdfplumber + tesseract fallback)
  ↓  human QA pass (engineer + BiH teacher, 1 day)
chunked .json per section
  ↓  content/chunk.py (semantic splitter, ~300 tokens per chunk)
  ↓  content/embed.py (OpenAI embedding-3-large)
Supabase pgvector table `chunks`
```

### Audio flow (offline, one-time per episode)

```
script.md (human-written, human-QA'd)
  ↓  content/generate_audio.py (SSML-aware, voice mapping Nastavnica / Marko)
  ↓  selected TTS provider API (ElevenLabs / OpenAI / Azure)
raw .wav
  ↓  ffmpeg normalize + encode to mp3 (128kbps mono)
  ↓  produce chapter-markers.json from script timestamps
Supabase Storage bucket `audio/`
```

### Supabase schema (Slice 1)

```sql
-- chunks: ingested textbook content
create table chunks (
  id uuid primary key default gen_random_uuid(),
  textbook text not null,        -- 'Matematika 5'
  chapter_id int not null,       -- 4
  section text,                  -- 'Tema 4.2 Sabiranje razlomaka...'
  page_number int not null,      -- for citation
  content text not null,
  embedding vector(3072),        -- text-embedding-3-large
  created_at timestamptz default now()
);
create index on chunks using ivfflat (embedding vector_cosine_ops) with (lists = 50);
create index on chunks (chapter_id);

-- episodes: audio overviews
create table episodes (
  id uuid primary key default gen_random_uuid(),
  chapter_id int not null,
  topic text not null,           -- 'Sabiranje razlomaka sa različitim nazivnicima'
  subtopic text,                 -- 'Tema 4.2'
  audio_url text not null,       -- Supabase Storage public URL
  duration_seconds int not null,
  chapter_markers jsonb not null,  -- [{ label, timestamp_seconds }, ...]
  learning_points text[] not null, -- the "Šta ćeš naučiti" 4 items
  created_at timestamptz default now()
);

-- ask_logs: for evaluation
create table ask_logs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  retrieved_chunk_ids uuid[] not null,
  answer text,
  citation_page int,
  refused boolean not null,
  latency_ms int,
  model text,                    -- 'claude-3-5-sonnet' or 'gpt-4o'
  created_at timestamptz default now()
);
```

---

## 6. Content pipeline for Poglavlje 4

Who does what:

1. **Boban** provides the PDF of Matematika 5 textbook (via publisher partner), scoped to Poglavlje 4.
2. **Engineer** runs `content/ingest.py` to produce raw extracted text. Reports page-by-page OCR accuracy.
3. **Engineer + a BiH math teacher** (freelance, ~1 day, budget in Section 10) review OCR output for accuracy, especially fractions, math notation, Bosnian diacritics. Fix errors manually. Output is a clean per-page JSON.
4. **Engineer** runs chunking + embedding pipeline. Smoke-tests retrieval with 5 hand-written questions.
5. **Boban or a contracted BiH teacher** writes the Tema 4.2 dialogue script (800 to 1,200 words, roughly 8 minutes at natural speaking pace) in Bosnian. Teacher and student parts clearly annotated. Chapter markers inline.
6. **BiH teacher** QA's the script for pedagogical accuracy and natural dialect.
7. **Engineer** runs the three TTS candidates (A, B, C) on a 30-second sample from the script for side-by-side comparison.
8. **Panel of 3 native speakers** (Boban + 2 others) blind-score the three samples on: naturalness, warmth of Nastavnica voice, believability of Marko voice, pronunciation of Bosnian math terms, overall "would I listen to 8 minutes of this." Winner declared end of week 1.
9. **Engineer** generates the full 8-minute audio with the winning provider. Normalizes, encodes to mp3, uploads to Supabase Storage, writes episode record.

---

## 7. 14-day timeline

### Week 1: content and retrieval (days 1 to 7)

**Day 1.** Kickoff call (Boban + engineer). Walk through CLAUDE.md and this plan. Engineer sets up Expo project skeleton, Supabase project, GitHub repo, CI.

**Day 2.** Engineer builds the Python content pipeline skeleton. Boban delivers Matematika 5 PDF. First ingest run on Poglavlje 4.

**Day 3.** OCR QA with BiH math teacher. Clean extracted text committed to repo.

**Day 4.** Chunking + embedding done. pgvector populated. 5 smoke-test queries verified against top-k retrieval.

**Day 5.** Edge Function `/ask` scaffolded. Claude + GPT-4o both wired in. First end-to-end grounded-answer tests from a local cURL client.

**Day 6.** Citation verifier implemented. 20 in-syllabus + 20 off-syllabus evaluation set written. Manual eval run: target 95% / 95%. If below, iterate on system prompt.

**Day 7.** TTS three-way test: 30-second samples generated from each of ElevenLabs, OpenAI, Azure. Blind panel scoring (Boban + 2 native speakers). Winner selected. Script for full episode written and QA'd. Week 1 demo to Boban: cURL to `/ask` returns grounded answers with citations in Bosnian. Retrieval works. TTS provider chosen.

### Week 2: app and field test (days 8 to 14)

**Day 8.** Expo skeleton with NativeWind configured. Design tokens ported from `system.css`. Typography (Instrument Serif + DM Sans) loaded. Basic navigation scaffolding.

**Day 9.** Audio player screen built: hero card, waveform (24 bars, state segments), play button, time display, speed control, chapter markers, speaker chips, download-for-offline. Wired to react-native-track-player. Full audio generated from winning TTS provider and uploaded to Supabase Storage. Plays on device.

**Day 10.** "Šta ćeš naučiti" section, bottom CTAs ("Pitaj Cvrčka pitanje" + "Otvori tekst poglavlja"). Chat screen scaffolded. Chat message component + citation chip component.

**Day 11.** Chat wired to `/ask` edge function. Citation chip tap shows a modal with source paragraph. Off-syllabus refusal flow tested. Error states for no-network.

**Day 12.** End-to-end polish pass. Accessibility: voiceover labels, touch targets, dynamic type. Evaluation run: citation accuracy, refusal precision. Fix prompt if under target.

**Day 13.** Sideload or EAS Update to 6 test devices (3 kids, 3 parents in BiH). Structured observation protocol prepared (Section 11).

**Day 14.** Field test day. Morning sessions with kids, afternoon with parents. End-of-day debrief with Boban. Go / no-go decision (Section 12).

---

## 8. Deliverables at end of day 14

1. **Git repository** with:
   - `/apps/mobile` Expo app, buildable with `eas build`
   - `/supabase/functions/ask` edge function, deployable with `supabase functions deploy ask`
   - `/supabase/migrations` SQL files, applied to the dev database
   - `/content` Python pipeline, reproducible from PDF to pgvector
   - `/docs` with llm-choice.md, tts-validation.md, eval-results.md, field-test-notes.md

2. **A working Expo Dev Client build** of the audio + chat flow, running on one Android test device and one iOS test device.

3. **A populated Supabase dev database** with Poglavlje 4 chunks, one episode, and eval logs.

4. **An audio file** (.mp3) of Tema 4.2, ~8 minutes, hosted in Supabase Storage with a stable public URL.

5. **The TTS decision document** showing the three-way blind test results and the winning choice with reasoning.

6. **The field test report** with observations from all 6 participants, usage patterns, verbatim quotes (with consent), and the engineer's and Boban's go / no-go recommendation.

7. **A handoff README** explaining how to run the project locally, run the eval, add a new chapter, regenerate audio, and deploy.

---

## 9. Go / no-go criteria at day 14

Written now so the goalposts do not move later.

### GO (proceed to v1 planning)

All of these must be true:
- Citation accuracy >= 95% on the 20-question in-syllabus set.
- Refusal precision >= 95% on the 20-question off-syllabus set.
- At least 4 of 6 field-test participants (kids + parents combined) describe the audio as clear, natural, and something they would use again.
- At least 2 of 3 kids successfully asked a follow-up question and understood the answer + citation.
- No single child found the audio boring enough to quit before 5 minutes in.

### NO-GO (stop and reassess)

Any of:
- Citation accuracy < 90%. Means the grounding layer is broken.
- Refusal precision < 85%. Means the safety story collapses.
- More than 3 of 6 participants describe the audio as robotic, unclear, or "I would not use this."
- TTS quality for Marko (child voice) is universally described as uncanny or wrong.

### YELLOW (iterate for 1 more week before deciding)

Results in between. Specific fix plan written before continuing.

---

## 10. Budget ceiling (for quote calibration)

These are **upper limits** for the quote. A good engineer comes in below.

| Line item                                     | Ceiling (EUR) |
| --------------------------------------------- | ------------: |
| Engineer time, 14 days at mid-senior day rate |        4,200  |
| BiH math teacher, 1 day for OCR + script QA   |          150  |
| TTS generation (3 candidates + full episode)  |          100  |
| LLM API spend (evaluation + dev)              |          150  |
| Supabase Pro (first month)                    |           25  |
| EAS Build credits                             |           30  |
| Sentry + PostHog                              |            0 |
| Test device procurement if needed             |          200  |
| Contingency (10%)                             |          490  |
| **Total ceiling**                             |    **5,345**  |

At $30K total runway, this is ~20% for the validation slice. Everything else in runway goes to post-slice iteration, v1 scaffolding, and the rights / governance resolution timeline.

---

## 11. Field-test protocol (day 14)

Keep it simple. No NDAs, no clipboards. Informal but structured.

### With each kid (30 minutes)

1. "Tvoji roditelji su pristali da probaš ovu aplikaciju. Ja te samo gledam. Nema pogrešnog odgovora." (Put them at ease.)
2. Hand them the phone with the app open. No instructions.
3. Observe: do they tap play? Do they listen all the way through, or skip? When do they lose interest?
4. After audio: "Imaš li neko pitanje o ovome?" Watch them use the chat. Note if the citation chip makes sense to them.
5. Three direct questions:
   - "Da li si razumio šta si slušao?"
   - "Da li bi ovo slušao kad ti zatreba za domaći?"
   - "Šta bi mijenjao?"

### With each parent (20 minutes)

1. Let them play with the app for 5 minutes unguided.
2. Three direct questions:
   - "Da li bi ovo dali vašem djetetu?"
   - "Šta vas brine oko ovoga?"
   - "Šta bi bilo presudno da platite 4.99 EUR mjesečno za ovo?"

### Record

- Time-to-first-skip (did the kid let the audio play or jump ahead).
- Whether follow-up chat was used at all.
- Any utterance that contains the words "dosadno," "teško," "ne razumijem," "kao da me uči."
- Verbatim quotes on value and concern.

---

## 12. Division of ownership

### Boban owns
- Publisher relationship (textbook PDF delivery, teacher freelance sourcing for QA and script writing).
- Test device procurement and field-test participant recruitment.
- Final go / no-go decision on day 14.
- TTS panel participation.
- Anthropic and OpenAI API account setup + keys.
- Supabase project creation (hand the engineer owner access).

### Engineer owns
- Everything in the code, migrations, pipeline, eval suite, deploy.
- TTS three-way test execution and documentation.
- Eval runs and reporting.
- Handoff README.
- Day-by-day progress updates to Boban (daily standup, 10 minutes).

### Both own (decision required, not delegated)
- Week-1 TTS selection.
- Week-2 evaluation fixes if metrics miss.
- Day-14 go / no-go based on the criteria in Section 9.

---

## 13. What the engineer quote should include

When sending this brief out, the quote response should cover:

1. **Fixed price** for the 14-day Slice 1 delivery.
2. **Day-by-day plan** or at least weekly milestones matching Section 7.
3. **Any proposed deviation from the locked stack** in Section 4, with reasoning (default is: no deviation).
4. **Assumptions** about what Boban provides (PDF, TTS budget, API keys).
5. **Two references** of comparable work (React Native + AI backend shipped to users).
6. **A statement on post-slice availability** (if go, does the engineer continue into v1?).

If a quote arrives without these, send it back. "Vibes-based" quotes are what you're trying to eliminate.

---

## 14. What happens after day 14

If go: write v0.5 of the PRD with learnings folded in, scope v1 with the chapters-in-parallel strategy, begin the publisher rights and governance resolution track in parallel, target closed beta at 2 to 3 schools by month 3.

If no-go: honest autopsy of what broke (audio quality, grounding accuracy, engagement, or something else entirely), decide whether to pivot to text-first Slice 2 with the same engineer and remaining budget, or pause and address upstream issues first.

If yellow: one more focused week addressing the specific gap, then re-run criteria. Do not let a yellow drift into three weeks of "almost."

---

## 15. Things explicitly NOT in this brief and why

- **Marketing site updates.** cvrcak.ai overclaims ("52 škole aktivno koristi") are a separate 2-hour copy patch, not engineering work. Boban handles.
- **Legal and governance work.** IP contribution agreement, operating agreement, CEO decision. See PRD v0.4 §0.3 and §0.5. Parallel track, lawyer work, not in engineering scope.
- **Design system evolution.** Tokens are ported, not redesigned. If something needs a new color or component, add to the post-Slice 1 backlog.
- **Second chapter, second subject, second grade.** Scales are a v1 concern. Slice 1 proves one.
- **Backend scaling.** If this works we will worry about load at 1,000 DAU. Today we are worrying about 6.
