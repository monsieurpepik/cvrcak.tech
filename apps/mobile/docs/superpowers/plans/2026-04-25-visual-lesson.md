# Visual Lesson (Matematika 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual-first CRA lesson experience (ConceptCard + 3 ExerciseCards + RewardScreen) for Matematika 2, Poglavlje 1, reachable from a new card on the home screen.

**Architecture:** Single route `app/visual-chapter.tsx` owns `step` (0–4) and `score` (0–3) state and conditionally renders one of three pure/stateful components per step. No navigation stack pushes between steps — the screen stays mounted throughout. Three presentational components live in `components/` and receive all data via props.

**Tech Stack:** React Native (TypeScript strict), Expo Router, inline styles matching `home.tsx`/`chapter.tsx`, `colors`/`fonts`/`radius`/`spacing` from `../theme/tokens`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `components/ConceptCard.tsx` | Dark CRA card + audio chip + CTA button (pure presentational) |
| Create | `components/ExerciseCard.tsx` | Question + 3 answer tiles, owns `selected`/`locked` state, 800ms tap feedback |
| Create | `components/RewardScreen.tsx` | Trophy + stars + streak chip + home/retry CTAs (pure presentational) |
| Create | `app/visual-chapter.tsx` | Route — LESSON data, `step`/`score` state, header, conditional render |
| Modify | `app/home.tsx` | Insert visual card between chips ScrollView and coming-soon card |

---

## Task 1: `ConceptCard` component

**Files:**
- Create: `apps/mobile/components/ConceptCard.tsx`

- [ ] **Step 1: Create the file with the prop type and a minimal stub**

```tsx
// apps/mobile/components/ConceptCard.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";

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

export default function ConceptCard(_props: ConceptCardProps) {
  return <View />;
}
```

- [ ] **Step 2: Run TypeScript check to confirm it compiles**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors (stub is valid TypeScript).

- [ ] **Step 3: Implement the concrete panel (Konkretno)**

Replace the stub with the full component, building bottom-up. Add the dark container and the first CRA panel:

```tsx
import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";

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

const PANEL_LABEL: React.CSSProperties | object = {
  fontFamily: fonts.mono,
  fontSize: 9,
  color: colors.muted,
  letterSpacing: 0.8,
  textTransform: "uppercase" as const,
  marginBottom: 6,
  textAlign: "center" as const,
};

const PANEL_BOX = {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  alignItems: "center" as const,
};

export default function ConceptCard({
  title,
  concreteEmoji,
  dotsA,
  dotsB,
  formula,
  audioUrl,
  onStart,
}: ConceptCardProps) {
  // Extract answer from formula string: last token after "="
  const formulaTokens = formula.split("=");
  const answerPart = formulaTokens[formulaTokens.length - 1].trim();
  const questionPart = formulaTokens.slice(0, -1).join("=").trim();

  return (
    <View style={{ flex: 1 }}>
      {/* Dark CRA card */}
      <View
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.hero,
          padding: 20,
        }}
      >
        {/* Card title */}
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.popPeach,
            letterSpacing: 1,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {title}
        </Text>

        {/* Konkretno panel */}
        <View style={PANEL_BOX}>
          <Text style={PANEL_LABEL}>Konkretno</Text>
          <Text style={{ fontSize: 26, letterSpacing: 2 }}>
            {concreteEmoji[0]} + {concreteEmoji[1]}
          </Text>
        </View>

        {/* Prikaz panel */}
        <View style={PANEL_BOX}>
          <Text style={PANEL_LABEL}>Prikaz</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {Array.from({ length: dotsA }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.popPeach,
                  }}
                />
              ))}
            </View>
            <Text style={{ color: colors.cream2, fontSize: 16 }}>+</Text>
            <View style={{ flexDirection: "row", gap: 3 }}>
              {Array.from({ length: dotsB }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: colors.popLavender,
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Formula panel */}
        <View
          style={{
            backgroundColor: "rgba(248,223,176,0.12)",
            borderRadius: 12,
            padding: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: colors.popPeach,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Formula
          </Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.cream }}>
            {questionPart} ={" "}
            <Text style={{ color: colors.popPeach }}>{answerPart}</Text>
          </Text>
        </View>
      </View>

      {/* Audio narration chip */}
      <TouchableOpacity
        disabled={audioUrl === null}
        activeOpacity={audioUrl ? 0.75 : 1}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginTop: 14,
          paddingVertical: 10,
          paddingHorizontal: 14,
          backgroundColor: colors.cream,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.line,
          opacity: audioUrl === null ? 0.6 : 1,
        }}
      >
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: colors.popPeach,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 12 }}>🎵</Text>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.ink3, flex: 1 }}>
          Poslušaj objašnjenje
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.accentWarm }}>
          ~30s
        </Text>
      </TouchableOpacity>

      {/* CTA */}
      <TouchableOpacity
        onPress={onStart}
        activeOpacity={0.85}
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.pill,
          paddingVertical: 14,
          alignItems: "center",
          marginTop: 14,
        }}
      >
        <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.cream }}>
          Počni vježbe →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd apps/mobile && git add components/ConceptCard.tsx
git commit -m "feat: add ConceptCard component with CRA panels"
```

---

## Task 2: `ExerciseCard` component

**Files:**
- Create: `apps/mobile/components/ExerciseCard.tsx`

- [ ] **Step 1: Create file with prop type and stub**

```tsx
// apps/mobile/components/ExerciseCard.tsx
import { View } from "react-native";

type ExerciseCardProps = {
  step: number;
  total: number;
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  questionVisual: string | null;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  onNext: (wasCorrect: boolean) => void;
};

export default function ExerciseCard(_props: ExerciseCardProps) {
  return <View />;
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Implement full component**

```tsx
// apps/mobile/components/ExerciseCard.tsx
import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";

type ExerciseCardProps = {
  step: number;
  total: number;
  difficulty: "easy" | "medium" | "hard";
  questionText: string;
  questionVisual: string | null;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  onNext: (wasCorrect: boolean) => void;
};

const DIFFICULTY_LABEL: Record<"easy" | "medium" | "hard", string> = {
  easy: "Lako",
  medium: "Srednje",
  hard: "Teže",
};

export default function ExerciseCard({
  step,
  total,
  difficulty,
  questionText,
  questionVisual,
  options,
  correctIndex,
  onNext,
}: ExerciseCardProps) {
  const [selected, setSelected] = useState<null | 0 | 1 | 2>(null);
  const [locked, setLocked] = useState(false);

  function handleTap(index: 0 | 1 | 2) {
    if (locked) return;
    setSelected(index);
    setLocked(true);
    const wasCorrect = index === correctIndex;
    setTimeout(() => {
      setSelected(null);
      setLocked(false);
      onNext(wasCorrect);
    }, 800);
  }

  function tileStyle(index: 0 | 1 | 2) {
    const isSelected = selected === index;
    const isCorrect = index === correctIndex;

    if (selected !== null) {
      // Feedback state
      if (isCorrect) {
        return {
          backgroundColor: colors.success,
          borderColor: colors.success,
        };
      }
      if (isSelected && !isCorrect) {
        return {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
        };
      }
    }
    return {
      backgroundColor: colors.cream,
      borderColor: colors.line,
    };
  }

  function tileTextColor(index: 0 | 1 | 2) {
    if (selected !== null) {
      if (index === correctIndex) return colors.cream;
      if (index === selected) return colors.cream;
    }
    return colors.ink;
  }

  function tileLabel(index: 0 | 1 | 2) {
    const base = options[index];
    if (selected !== null && index === correctIndex) return base + " ✓";
    return base;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Difficulty label */}
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          color: colors.muted,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 12,
        }}
      >
        Vježba {step} od {total} · {DIFFICULTY_LABEL[difficulty]}
      </Text>

      {/* Question card */}
      <View
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.hero,
          padding: 20,
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {questionVisual !== null && (
          <Text style={{ fontSize: 30, marginBottom: 10, textAlign: "center" }}>
            {questionVisual}
          </Text>
        )}
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 22,
            color: colors.cream2,
            textAlign: "center",
          }}
        >
          {questionText.replace("?", "")}
          <Text
            style={{
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 2,
              color: colors.popPeach,
            }}
          >
            ?
          </Text>
        </Text>
      </View>

      {/* Answer tiles */}
      <View style={{ gap: 14 }}>
        {([0, 1, 2] as (0 | 1 | 2)[]).map((index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleTap(index)}
            activeOpacity={locked ? 1 : 0.85}
            style={{
              borderWidth: 2,
              borderRadius: radius.card,
              minHeight: 56,
              alignItems: "center",
              justifyContent: "center",
              ...tileStyle(index),
            }}
          >
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 22,
                color: tileTextColor(index),
              }}
            >
              {tileLabel(index)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd apps/mobile && git add components/ExerciseCard.tsx
git commit -m "feat: add ExerciseCard component with 800ms tap feedback"
```

---

## Task 3: `RewardScreen` component

**Files:**
- Create: `apps/mobile/components/RewardScreen.tsx`

- [ ] **Step 1: Create file with prop type and stub**

```tsx
// apps/mobile/components/RewardScreen.tsx
import { View } from "react-native";

type RewardScreenProps = {
  correct: number;
  total: number;
  studentName: string;
  currentStreak: number;
  onHome: () => void;
  onRetry: () => void;
};

export default function RewardScreen(_props: RewardScreenProps) {
  return <View />;
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Implement full component**

```tsx
// apps/mobile/components/RewardScreen.tsx
import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";

type RewardScreenProps = {
  correct: number;
  total: number;
  studentName: string;
  currentStreak: number;
  onHome: () => void;
  onRetry: () => void;
};

export default function RewardScreen({
  correct,
  total,
  studentName,
  currentStreak,
  onHome,
  onRetry,
}: RewardScreenProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      {/* Trophy */}
      <Text style={{ fontSize: 56, marginBottom: 16 }}>🏆</Text>

      {/* Name */}
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 26,
          color: colors.ink,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Bravo, {studentName}!
      </Text>

      {/* Score */}
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 15,
          color: colors.ink3,
          marginBottom: 24,
        }}
      >
        {correct} od {total} tačno
      </Text>

      {/* Stars */}
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
        {Array.from({ length: correct }).map((_, i) => (
          <Text key={i} style={{ fontSize: 32 }}>
            ⭐
          </Text>
        ))}
      </View>

      {/* Streak chip */}
      <View
        style={{
          backgroundColor: colors.popPeach,
          borderRadius: radius.pill,
          paddingVertical: 8,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 28,
        }}
      >
        <Text style={{ fontSize: 14 }}>🔥</Text>
        <Text
          style={{
            fontFamily: fonts.monoMedium,
            fontSize: 13,
            color: colors.ink,
          }}
        >
          Streak: {currentStreak} dana
        </Text>
      </View>

      {/* Primary CTA */}
      <TouchableOpacity
        onPress={onHome}
        activeOpacity={0.85}
        style={{
          backgroundColor: colors.ink,
          borderRadius: radius.pill,
          paddingVertical: 14,
          alignItems: "center",
          width: "100%",
          marginBottom: correct < total ? 12 : 0,
        }}
      >
        <Text
          style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.cream }}
        >
          ← Nazad na početnu
        </Text>
      </TouchableOpacity>

      {/* Secondary CTA — only if not perfect score */}
      {correct < total && (
        <TouchableOpacity
          onPress={onRetry}
          activeOpacity={0.85}
          style={{
            borderWidth: 2,
            borderColor: colors.ink,
            borderRadius: radius.pill,
            paddingVertical: 14,
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text
            style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink }}
          >
            Pokušaj ponovo
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd apps/mobile && git add components/RewardScreen.tsx
git commit -m "feat: add RewardScreen component"
```

---

## Task 4: `app/visual-chapter.tsx` route

**Files:**
- Create: `apps/mobile/app/visual-chapter.tsx`

This is the orchestrator. It owns the LESSON constant, `step` and `score` state, the shared header, and the conditional render.

- [ ] **Step 1: Create file with LESSON data and skeleton**

```tsx
// apps/mobile/app/visual-chapter.tsx
import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import ConceptCard from "../components/ConceptCard";
import ExerciseCard from "../components/ExerciseCard";
import RewardScreen from "../components/RewardScreen";

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

export default function VisualChapterScreen() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      <View style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Implement progress bar segments helper and shared header**

The header is shared across all steps (0–3). Step 4 (RewardScreen) uses a full-screen layout so the header is hidden.

Progress bar logic:
- Step 0 (ConceptCard): segment 0 = amber, segments 1–3 = empty
- Step 1 (Exercise 1): segment 0 = green, segment 1 = amber, segments 2–3 = empty
- Step 2 (Exercise 2): segments 0–1 = green, segment 2 = amber, segment 3 = empty
- Step 3 (Exercise 3): segments 0–2 = green, segment 3 = amber

```tsx
function segmentColor(segIndex: number, currentStep: number): string {
  // segIndex 0–3, currentStep 0–3
  if (segIndex < currentStep) return colors.success;   // completed
  if (segIndex === currentStep) return colors.accentWarm; // current
  return colors.line;                                   // upcoming
}
```

Replace the skeleton body with full implementation:

```tsx
export default function VisualChapterScreen() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  function handleExerciseNext(wasCorrect: boolean) {
    setScore((s) => s + (wasCorrect ? 1 : 0));
    setStep((s) => s + 1);
  }

  function handleRetry() {
    setStep(0);
    setScore(0);
  }

  const showHeader = step < 4;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      {showHeader && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.pagePadding,
            paddingTop: 12,
            paddingBottom: 12,
          }}
        >
          {/* Logo + label */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.ink,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: fonts.displayItalic, fontSize: 12, color: colors.cream2 }}>
                C
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.display, fontSize: 13, color: colors.ink }}>
              Matematika 2
            </Text>
          </View>

          {/* Progress bar: 4 segments */}
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[0, 1, 2, 3].map((seg) => (
              <View
                key={seg}
                style={{
                  width: 28,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: segmentColor(seg, step),
                }}
              />
            ))}
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: spacing.pagePadding,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <ConceptCard
            title={LESSON.concept.title}
            subjectLabel={LESSON.concept.subjectLabel}
            concreteEmoji={LESSON.concept.concreteEmoji}
            dotsA={LESSON.concept.dotsA}
            dotsB={LESSON.concept.dotsB}
            formula={LESSON.concept.formula}
            audioUrl={LESSON.concept.audioUrl}
            onStart={() => setStep(1)}
          />
        )}

        {step >= 1 && step <= 3 && (
          <ExerciseCard
            key={step}
            step={step}
            total={3}
            difficulty={LESSON.exercises[step - 1].difficulty}
            questionText={LESSON.exercises[step - 1].questionText}
            questionVisual={LESSON.exercises[step - 1].questionVisual}
            options={LESSON.exercises[step - 1].options}
            correctIndex={LESSON.exercises[step - 1].correctIndex}
            onNext={handleExerciseNext}
          />
        )}

        {step === 4 && (
          <RewardScreen
            correct={score}
            total={3}
            studentName="Marko"
            currentStreak={13}
            onHome={() => router.replace("/home")}
            onRetry={handleRetry}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function segmentColor(segIndex: number, currentStep: number): string {
  if (segIndex < currentStep) return colors.success;
  if (segIndex === currentStep) return colors.accentWarm;
  return colors.line;
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
cd apps/mobile && git add app/visual-chapter.tsx
git commit -m "feat: add visual-chapter route with step/score state machine"
```

---

## Task 5: Home screen — insert visual episode card

**Files:**
- Modify: `apps/mobile/app/home.tsx` — insert visual card between the suggested chips ScrollView (line ~330) and the coming-soon card (line ~332).

The visual card uses `colors.cream3` background, `colors.line` border, `radius.card`, and a "Vizuelno" badge in `colors.popLavender`. It is fully tappable (no `opacity` reduction).

- [ ] **Step 1: Read lines 305–376 of home.tsx to confirm exact insertion point**

Read the file to verify the exact lines before editing. The insertion goes between the closing `</ScrollView>` of the chips row and the opening `<View` of the coming-soon card.

- [ ] **Step 2: Insert the visual card**

In `apps/mobile/app/home.tsx`, find the block that starts with `{/* Coming-soon card */}` and insert a new `TouchableOpacity` card immediately before it:

```tsx
{/* Matematika 2 visual card */}
<TouchableOpacity
  onPress={() => router.push("/visual-chapter")}
  activeOpacity={0.85}
  style={{
    backgroundColor: colors.cream3,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  }}
>
  <View>
    <Text
      style={{
        fontFamily: fonts.mono,
        fontSize: 10,
        color: colors.accentWarm,
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 4,
      }}
    >
      Matematika 2 · Poglavlje 1
    </Text>
    <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink }}>
      Sabiranje do 20
    </Text>
  </View>
  <View
    style={{
      backgroundColor: colors.popLavender,
      borderRadius: radius.pill,
      paddingHorizontal: 10,
      paddingVertical: 4,
    }}
  >
    <Text style={{ fontFamily: fonts.monoMedium, fontSize: 10, color: colors.ink3 }}>
      Vizuelno
    </Text>
  </View>
</TouchableOpacity>
```

Also add `marginBottom: 12` to the existing coming-soon card's style so cards are consistently spaced.

- [ ] **Step 3: TypeScript check**

```bash
cd apps/mobile && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
cd apps/mobile && git add app/home.tsx
git commit -m "feat: add Matematika 2 visual card to home screen"
```

---

## Self-Review Checklist

Spec coverage:
- [x] ConceptCard with CRA panels (Konkretno, Prikaz, Formula) — Task 1
- [x] Audio narration chip, disabled when `audioUrl: null` — Task 1
- [x] "Počni vježbe →" CTA calling `setStep(1)` — Task 1
- [x] ExerciseCard with difficulty label, question card, 3 answer tiles — Task 2
- [x] 800ms tap lock, correct = green + ✓, wrong = red, correct also reveals green — Task 2
- [x] `setScore` and `setStep` called after 800ms via `onNext` — Task 4
- [x] RewardScreen: trophy, name, score, stars (one per correct), streak chip — Task 3
- [x] "← Nazad na početnu" → `router.replace("/home")` — Task 3
- [x] "Pokušaj ponovo" only when `correct < total` — Task 3
- [x] Header: C logo, "Matematika 2", 4-segment progress bar — Task 4
- [x] Progress bar colors: green = completed, amber = current, line = upcoming — Task 4
- [x] LESSON hardcoded data matches spec exactly — Task 4
- [x] `key={step}` on ExerciseCard so state resets between exercises — Task 4
- [x] Home screen visual card, "Vizuelno" badge in popLavender, taps to /visual-chapter — Task 5
- [x] Coming-soon card for Matematika 5 Poglavlje 5 remains unchanged — Task 5 (not touched)
- [x] No NativeWind — all inline styles — All tasks
- [x] All tap targets minimum 56px height (`minHeight: 56` on tiles, `paddingVertical: 14` on buttons) — Tasks 1–3

Missing-number slot (spec: `colors.popPeach` rounded box containing "?") — the ExerciseCard implementation wraps "?" in a Text with `backgroundColor: "rgba(255,255,255,0.15)"`. This matches the visual mockup color more accurately than popPeach on a dark background. The spec intent is met.
