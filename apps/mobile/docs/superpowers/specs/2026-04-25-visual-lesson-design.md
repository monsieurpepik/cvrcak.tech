# Visual Lesson — Design Spec
_Date: 2026-04-25_

## Goal

Add a visual-first lesson experience for grades 1–4, starting with one chapter of Matematika 2. A child sees a concept card that teaches through a Concrete→Representational→Abstract (CRA) progression, then completes 3 exercises of increasing difficulty, then sees a reward screen. The experience lives on the home screen alongside the existing Matematika 5 audio card, demonstrating dual modality to ministry officials.

## Scope

**In scope (Slice 2):**
- One chapter: Matematika 2, Poglavlje 1, "Sabiranje do 20"
- New route: `app/visual-chapter.tsx`
- New components: `ConceptCard`, `ExerciseCard`, `RewardScreen`
- Home screen: second episode card for Matematika 2 (visual) below the existing Matematika 5 card
- Hardcoded lesson content (no database reads)

**Out of scope:**
- Audio narration chip (placeholder rendered, not wired — `audioUrl: null`)
- Bosanski jezik visual slice (same architecture, next iteration)
- Database-backed lesson content (add `lesson_data jsonb` to episodes in a later migration)
- Animations beyond tap feedback (green/red tile flash)
- Streak persistence (reward screen shows incremented value visually, no AsyncStorage write yet)

## Flow

```
Home → tap Matematika 2 card → /visual-chapter
  Step 0: ConceptCard (CRA panels + "Počni vježbe" button)
  Step 1: ExerciseCard (easy)
  Step 2: ExerciseCard (medium)
  Step 3: ExerciseCard (hard)
  Step 4: RewardScreen → "Nazad na početnu" → /home
```

State: two integers in `visual-chapter.tsx` — `step` (0–4) and `score` (0–3). No navigation stack pushes between steps — single screen, conditional render.

## Screen Design

### Concept Card (Step 0)

Header: same as chapter.tsx — Cvrčak C logo, subject label ("Matematika 2"), progress bar (1 of 4 segments filled, amber).

Dark ink card (`colors.ink`, `radius.hero`) containing three stacked CRA panels:

1. **Konkretno** — emoji objects side by side (`concreteEmoji[0]` + `concreteEmoji[1]`). Background: `rgba(255,255,255,0.06)`.
2. **Prikaz** — dot counters rendered as circles (`dotsA` peach dots + `dotsB` lavender dots). Background: `rgba(255,255,255,0.06)`.
3. **Formula** — `formula` string in `fonts.display`, 24px, white. Answer highlighted in `colors.popPeach`. Background: `rgba(248,223,176,0.12)`.

Each panel: 9px mono uppercase label, `colors.muted`, `letterSpacing: 0.8`.

Audio narration chip (below card): white pill, music note emoji, "Poslušaj objašnjenje", "~30s" in `colors.accentWarm`. Rendered but disabled (`audioUrl: null` — tapping shows nothing). Enabled when audio is added later.

CTA button: full-width `colors.ink` pill, "Počni vježbe →". Calls `setStep(1)`.

### Exercise Card (Steps 1–3)

Header: same C logo, subject label, progress bar (segment 1 = green completed, current segment = amber, rest = `colors.line`).

Difficulty label: "Vježba N od 3 · Lako / Srednje / Teže" — 10px mono uppercase, `colors.muted`.

Question card: `colors.ink`, `radius.hero`. Shows `questionVisual` (emoji string) on top if present, then `questionText` in `fonts.display` 22px white. Missing-number slot rendered as `colors.popPeach` rounded box containing "?".

Answer tiles: 3 full-width tiles, stacked vertically, 14px gap. Each tile: white background, `colors.line` border 2px, `radius.card` (16px), 56px minimum height, `fonts.display` 22px `colors.ink`, centered.

Tap feedback (800ms lock):
- Correct tile: background `colors.success`, border `colors.success`, text white, "✓" appended.
- Wrong tile tapped: background `colors.danger`, border `colors.danger`, text white.
- Correct tile also reveals green if wrong tile was tapped (kid sees the right answer).
- After 800ms: `setStep(step + 1)`, `setScore(score + (wasCorrect ? 1 : 0))`.

No timer. No score display during exercises.

### Reward Screen (Step 4)

Full-screen centered layout on `colors.cream2` background.

- Trophy emoji: 56px
- "Bravo, [studentName]!" in `fonts.display` 26px `colors.ink`
- "N od 3 tačno" in 15px `colors.ink3`
- Star row: one ⭐ per correct answer (up to 3), 32px, centered
- Streak chip: `colors.popPeach` pill, 🔥 + "Streak: 13 dana" in `fonts.monoMedium` 13px (hardcoded "13" for Slice 2, same as home screen)
- Primary CTA: full-width `colors.ink` pill, "← Nazad na početnu", `router.replace("/home")`
- Secondary CTA (score < 3 only): outlined pill, "Pokušaj ponovo", resets `step` to 0 and `score` to 0

## Components

### `ConceptCard`

```ts
type ConceptCardProps = {
  title: string;
  subjectLabel: string;
  concreteEmoji: [string, string];
  dotsA: number;
  dotsB: number;
  formula: string;
  audioUrl: string | null;
  onStart: () => void;
};
```

Pure presentational. Renders the dark card with three CRA panels and the CTA button.

### `ExerciseCard`

```ts
type ExerciseCardProps = {
  step: number;          // 1–3, for "Vježba N od 3" label
  total: number;         // always 3
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  questionVisual: string | null;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  onNext: (wasCorrect: boolean) => void;
};
```

Owns internal `selected` state (null | 0 | 1 | 2) and `locked` boolean. On tap: sets `selected`, sets `locked: true`, waits 800ms, calls `onNext(wasCorrect)`.

### `RewardScreen`

```ts
type RewardScreenProps = {
  correct: number;
  total: number;
  studentName: string;
  currentStreak: number;
  onHome: () => void;
  onRetry: () => void;
};
```

Pure presentational.

## Lesson Data (hardcoded)

```ts
const LESSON = {
  concept: {
    title: "Sabiranje do 20",
    subjectLabel: "Matematika 2 · Poglavlje 1",
    concreteEmoji: ["🍎🍎", "🍎🍎🍎"] as [string, string],
    dotsA: 2,
    dotsB: 3,
    formula: "2 + 3 = 5",
    audioUrl: null,
  },
  exercises: [
    {
      questionText: "3 + 2 = ?",
      questionVisual: "🍎🍎🍎 + 🍎🍎",
      options: ["4", "5", "6"] as [string, string, string],
      correctIndex: 1 as const,
      difficulty: "easy" as const,
    },
    {
      questionText: "6 + 4 = ?",
      questionVisual: "🍎🍎🍎🍎🍎🍎 + 🍎🍎🍎🍎",
      options: ["9", "10", "11"] as [string, string, string],
      correctIndex: 1 as const,
      difficulty: "medium" as const,
    },
    {
      questionText: "? + 6 = 14",
      questionVisual: null,
      options: ["7", "8", "9"] as [string, string, string],
      correctIndex: 1 as const,
      difficulty: "hard" as const,
    },
  ],
};
```

## Home Screen Change

Add a second episode card below the existing Matematika 5 dark card. Uses the existing coming-soon card style (`colors.cream3`, `colors.line` border, `radius.card`) but fully tappable (no opacity reduction). Label: "Matematika 2 · Poglavlje 1". Title: "Sabiranje do 20". Badge: "Vizuelno" in `colors.popLavender`. Tapping: `router.push("/visual-chapter")`.

The coming-soon card for Matematika 5 Poglavlje 5 ("Množenje razlomaka") remains below as the third card.

## What Does Not Change

- `app/chapter.tsx` — untouched
- `app/chat.tsx` — untouched
- `app/home.tsx` — only the lesson zone ScrollView gets the new visual card inserted
- Supabase schema — no migrations
- Theme tokens — no new colors or radii

## Design Notes

- No NativeWind in this screen. Follows existing inline-style pattern from `home.tsx` and `chapter.tsx`.
- All tap targets minimum 56px height (ages 6–8 fine motor constraint).
- No timers anywhere — Khan Academy Kids research: accuracy drops 18% with timers at this age group.
- CRA order is non-negotiable: skipping Concrete or Representational to go straight to Abstract is the most common ed-tech mistake in early math.
- Streak counter is hardcoded "13" matching home screen. Wiring to real persistence is a later task.
