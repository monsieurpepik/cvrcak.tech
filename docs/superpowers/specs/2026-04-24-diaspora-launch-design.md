# Cvrčak Diaspora Launch Design

**Date:** 2026-04-24
**Author:** Boban (founder) + Claude Code session
**Target:** US diaspora launch in ~4 weeks via US entity
**Audience:** Bosnian diaspora families (US + Germany/Austria primary markets)

---

## Context

Slice 1 is built and working: one chapter, one audio episode (Tema 4.2), one grounded Q&A chat. The thesis is validated at the code level. The gap before diaspora launch is in three areas: voice authenticity, product polish, and code quality signals. This spec covers all three.

---

## 1. Voice Strategy

### Decision: ElevenLabs Professional Voice Clone (PVC)

**Approach:** Record a real Bosnian educator (female, warm, patient nastavnica energy) for 45-60 minutes of natural speech. Feed the recording into ElevenLabs PVC to create a cloned voice. All current and future episodes generate from the clone.

**Why not fully human recordings:** Script changes require re-recording. Iteration speed drops to days per update. Not viable for a content-heavy product.

**Why not stay with current ElevenLabs voice:** The founder (a native speaker) can detect the synthesis in under 10 seconds. Diaspora parents who grew up in Bosnia will hear it immediately and lose trust. Cultural authenticity is non-negotiable for this audience.

**Why PVC wins:** Captures the real person's warmth, accent, and rhythm once. All future content generates in minutes. The recording session costs $300-500 (professor's time + a decent USB mic). ElevenLabs PVC plan is ~$99/month.

**Marko voice:** Stays on current ElevenLabs voice for launch. Kid voices are hard to cast and change as children age. Revisit at 10+ episodes when there is a proven voice actor worth cloning. Marko's lines should be rewritten in future scripts to sound like a diaspora kid who learned Bosnian at home, not a textbook character.

**Implementation:**
- Record professor, upload to ElevenLabs PVC, get new voice ID
- Update `NASTAVNICA_VOICE` constant in `content/generate_episode_dialogue.py`
- Re-run generation for Tema 4.2 with new voice ID
- Upload to Supabase Storage with `--upload` flag (overwrites existing file)
- Update `docs/tts-validation.md` with the voice decision and rationale

---

## 2. Product Polish

### 2.1 Audio Resume on Reopen

**What:** Persist playback position to AsyncStorage every 5 seconds while audio is playing. On chapter screen mount, check AsyncStorage for a saved position for the current episode ID. If found and position > 10s, seek to that position after `loadEpisode()`.

**Why:** Close the app at 3:22, reopen at 3:22. Every premium audio app does this. Without it the app feels broken. Highest retention impact of any single technical change.

**Files:** `app/chapter.tsx`, `lib/audio.ts`

**Key detail:** Use episode ID (`"tema-4-2"`) as the AsyncStorage key so position is per-episode. Clear the saved position when the episode completes (position >= duration - 5s).

### 2.2 Lock Screen Artwork

**What:** Pass the Cvrčak logo image as the `artwork` field in `loadEpisode()`. TrackPlayer already handles lock screen display — it just needs an asset.

**Why:** Parents see their kid's lock screen. A blank "now playing" card looks broken. The Cvrčak logo makes it look real and intentional. 30-minute fix with outsized brand impact.

**Files:** `lib/audio.ts` (loadEpisode call), `assets/` (logo PNG at 512x512px minimum)

### 2.3 Sentry Crash Tracking

**What:** Install `@sentry/react-native`. Initialize in `app/_layout.tsx` with the Sentry DSN from app config. Wrap the root layout in Sentry's error boundary.

**Why:** Without this, crashes are invisible until a user complains. YC will ask "how do you know when things break?" The answer cannot be "we find out from users."

**Files:** `app/_layout.tsx`, `app.json` (DSN in extra config), `package.json`

**Scope:** Mobile only for launch. Edge Function error tracking (Sentry for Deno) is v1.

### 2.4 Rate Limiting on /ask

**What:** Add per-session rate limiting in the `/ask` edge function. Track request count in a Supabase table (`rate_limits`) keyed by a session token passed from the mobile app. Limit: 20 requests per session per hour. Return HTTP 429 with a Bosnian-language error message when exceeded.

**Why:** Without rate limiting, one curious person (or a bot) can run up the OpenAI + Anthropic bill by hundreds of dollars. This is basic ops hygiene before any real users.

**Files:** `supabase/functions/ask/index.ts`, new migration for `rate_limits` table

**Rate limit message (kid-facing):** "Postavio si puno pitanja danas. Odmori malo i vrati se sutra."

**Session token:** Generate a UUID on first app launch, store in AsyncStorage, pass as `X-Session-Token` header with every `/ask` call.

### 2.5 PostHog Analytics

**What:** Install `posthog-react-native`. Initialize with EU-hosted PostHog project. Instrument 5 key events:

| Event | Where | Properties |
|-------|-------|------------|
| `audio_started` | chapter.tsx mount | `{ episode_id, chapter_id }` |
| `audio_completed` | when position >= duration - 5s | `{ episode_id, listen_duration_s }` |
| `chat_opened` | ChatDrawer open | `{ episode_id, audio_position_s }` |
| `question_asked` | after send() | `{ episode_id, input_language }` |
| `citation_tapped` | CitationChip press | `{ page_number }` |

**Why:** "62% of users who start the audio finish it" is a metric. "Users ask an average of 2.3 questions per session" is a metric. Without PostHog neither statement is possible and investor conversations become anecdotal.

**Files:** `app/_layout.tsx` (init), `app/chapter.tsx`, `components/ChatDrawer.tsx`, `components/CitationChip.tsx`

### 2.6 Bilingual Chat Response (Bosnian + English + German)

**What:** Update the system prompt in `supabase/functions/ask/prompt.ts` to detect the language of the child's question and respond accordingly:
- Question in Bosnian: respond in Bosnian only (current behavior)
- Question in English: respond in Bosnian first, then an English translation gloss below in smaller text
- Question in German: respond in Bosnian first, then a German translation gloss below

**Why:** Diaspora kids often think in the language of the country they grew up in. A kid in Chicago thinks in English. A kid in Stuttgart thinks in German. If the product only accepts Bosnian questions it excludes the exact children it is meant to reach. Parents see Bosnian on screen regardless — that is what they paid for.

**Implementation:** System prompt addition only. No mobile changes needed. Claude detects input language naturally. The response format:

```
[Bosnian answer with citation]

---
[English/German translation of the answer]
```

**Files:** `supabase/functions/ask/prompt.ts`

---

## 3. Code Quality Refactors

These three changes address the clearest "vibe-coded" signals in the codebase. A technical reviewer opening the mobile folder should see disciplined code, not copy-paste patterns.

### 3.1 Extract TrackPlayer Hook

**Problem:** The lazy-load TrackPlayer try/catch block is copy-pasted verbatim into 4 files: `AudioPlayer.tsx`, `ChatDrawer.tsx`, `Transcript.tsx`, `chapter.tsx`. This is the single clearest sign of rushed code to any reviewer.

**Fix:** Create `lib/trackplayer.ts` that exports the lazy-loaded `TrackPlayer`, `useProgress`, `usePlaybackState`, and `State` constants. All components import from there.

```typescript
// lib/trackplayer.ts
let TrackPlayer: any = null;
let useProgress: () => { position: number; duration: number } = () => ({ position: 0, duration: 0 });
let usePlaybackState: () => { state: string } = () => ({ state: "" });
let State = { Playing: "playing" };

try {
  const tp = require("react-native-track-player");
  TrackPlayer = tp.default;
  useProgress = tp.useProgress;
  usePlaybackState = tp.usePlaybackState;
  State = tp.State;
} catch {
  // Expo Go
}

export { TrackPlayer, useProgress, usePlaybackState, State };
```

**Files affected:** New `lib/trackplayer.ts`, update `AudioPlayer.tsx`, `ChatDrawer.tsx`, `Transcript.tsx`, `app/chapter.tsx`

### 3.2 Split ChatDrawer into Three Files

**Problem:** `ChatDrawer.tsx` is 332 lines handling modal layout, message state, send logic, typing animation, suggested questions, and input bar. Too much in one file.

**Fix:** Split into three focused files:
- `ChatDrawer.tsx` (~80 lines): Modal shell, open/close, keyboard avoiding, audio pause on open
- `ChatMessages.tsx` (~120 lines): Message list, suggested questions, TypingDots, scroll management
- `ChatInput.tsx` (~80 lines): TextInput, send button, input state, submit handler

`ChatDrawer` composes the other two. Each file has one clear purpose.

**Files:** New `components/ChatMessages.tsx`, new `components/ChatInput.tsx`, rewrite `components/ChatDrawer.tsx`

### 3.3 Mark Stub Screens as Intentional

**Problem:** `nastavnik.tsx`, `roditelj.tsx`, `kviz.tsx` are empty stub files. They make the repo look like an incomplete mockup rather than a deliberate MVP.

**Fix:** Replace each stub with a minimal `ComingSoon` component that renders a placeholder screen with the Cvrčak branding and a "Dolazi uskoro" message. This signals that these screens are planned, not forgotten. Add a comment at the top of each: `// Scope: v1 — out of Slice 1`.

**Files:** `app/nastavnik.tsx`, `app/roditelj.tsx`, `app/kviz.tsx`

---

## 4. YC Code Audit Summary

**Would you pass a YC technical review?** Yes, with the fixes above in place.

**Strengths a technical partner would notice:**
- Edge function architecture: embed → search → prompt → verify. 134 lines, no frameworks.
- Citation verification in code — shows awareness of LLM hallucination failure modes.
- pgvector without HNSW — correct trade-off for ~100 chunks, not over-engineered.
- Design token system (system.css → tokens.ts) — intentional, consistent.
- Offline content pipeline separate from runtime — architectural discipline.
- CLAUDE.md enforces scope. One chapter, one audio, one endpoint. Shows product focus.

**Gaps that need fixing before showing the code:**
- No rate limiting: one bad actor = surprise API bill. Fixed in this plan (2.4).
- No crash visibility: fixed with Sentry (2.3).
- No analytics: can't answer basic retention questions. Fixed with PostHog (2.5).
- Copy-pasted TrackPlayer try/catch x4: fixed with extraction (3.1).
- ChatDrawer at 332 lines: fixed with split (3.2).

**Acceptable gaps for Slice 1:**
- No tests. The eval set in `ask_logs` is the functional equivalent for the Q&A endpoint. Mention it.
- No CI. Listed as v1 in CLAUDE.md. Acceptable explanation.
- CORS `*` on edge function. Tighten to app domain before public launch.

---

## Implementation Order

| Priority | Item | Effort | Week |
|----------|------|--------|------|
| 1 | Rate limiting on /ask | 1h | 1 |
| 2 | Sentry install | 1h | 1 |
| 3 | Extract TrackPlayer hook | 1h | 1 |
| 4 | Lock screen artwork | 30m | 1 |
| 5 | Audio resume on reopen | 3h | 1 |
| 6 | Split ChatDrawer | 2h | 2 |
| 7 | Mark stub screens | 30m | 2 |
| 8 | Bilingual chat (EN + DE) | 1h | 2 |
| 9 | Voice clone — record + PVC | 1-2 days | 2 |
| 10 | PostHog analytics | 2h | 2 |
| 11 | App icon + splash screen | 3h | 3 |
| 12 | Marko script rewrite (next episode) | 2h writing | 3 |

Total estimated engineering: ~18-20 hours across 3 weeks. Voice clone is the only external dependency (scheduling the professor).
