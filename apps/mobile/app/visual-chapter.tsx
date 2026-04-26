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

// Progress bar: segment 0 = concept step, segments 1-3 = exercises 1-3.
// Step 4 (reward) hides the header entirely so segment 4 is never rendered.
function segmentColor(segIndex: number, currentStep: number): string {
  if (segIndex < currentStep) return colors.success;
  if (segIndex === currentStep) return colors.accentTeal;
  return colors.line;
}

export default function VisualChapterScreen() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  function handleExerciseNext(wasCorrect: boolean) {
    setScore((s) => s + (wasCorrect ? 1 : 0));
    setStep((s) => Math.min(s + 1, 4));
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
              <Text
                style={{
                  fontFamily: fonts.displayItalic,
                  fontSize: 12,
                  color: colors.cream2,
                }}
              >
                C
              </Text>
            </View>
            <Text style={{ fontFamily: fonts.display, fontSize: 13, color: colors.ink }}>
              Matematika 2
            </Text>
          </View>

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
