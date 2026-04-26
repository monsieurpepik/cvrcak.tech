// Scope: v1 — out of Slice 1
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radius } from "../theme/tokens";

type Question = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    question: "Koji je NZN za razlomke 1/4 i 1/6?",
    options: ["10", "12", "24", "8"],
    correct: 1,
    explanation: "NZN za 4 i 6 je 12, jer je 12 najmanji broj djeljiv i s 4 i s 6.",
  },
  {
    question: "Koliko je 1/2 + 1/3?",
    options: ["2/5", "2/6", "5/6", "3/5"],
    correct: 2,
    explanation: "1/2 = 3/6 i 1/3 = 2/6. Sabiramo brojnike: 3 + 2 = 5. Rezultat je 5/6.",
  },
  {
    question: "Koliko je 3/4 - 1/4?",
    options: ["2/4", "1/2", "2/8", "1/4"],
    correct: 1,
    explanation: "Nazivnici su isti pa oduzimamo brojnike: 3 - 1 = 2. Dakle 2/4, što je isto kao 1/2.",
  },
  {
    question: "Koji razlomak je veći: 2/3 ili 3/4?",
    options: ["2/3", "3/4", "Jednaki su", "Ne može se odrediti"],
    correct: 1,
    explanation: "Proširimo: 2/3 = 8/12 i 3/4 = 9/12. Veći je 9/12, dakle 3/4.",
  },
  {
    question: "Kako proširimo razlomak 1/3 da dobijemo nazivnik 12?",
    options: ["1/3 × 3/3", "1/3 × 4/4", "1/3 × 2/2", "1/3 × 6/6"],
    correct: 1,
    explanation: "12 ÷ 3 = 4. Množimo i brojnik i nazivnik s 4, pa dobijamo 4/12.",
  },
];

type Phase = "question" | "answered" | "results";

export default function KvizScreen() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");

  const q = QUESTIONS[current];
  const total = QUESTIONS.length;

  function handleSelect(i: number) {
    if (phase !== "question") return;
    setSelected(i);
    setPhase("answered");
    if (i === q.correct) setScore((s) => s + 1);
  }

  function handleNext() {
    if (current + 1 >= total) {
      setPhase("results");
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setPhase("question");
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setPhase("question");
  }

  if (phase === "results") {
    const pct = Math.round((score / total) * 100);
    const passed = score >= Math.ceil(total * 0.6);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
        <ScrollView
          contentContainerStyle={{
            padding: spacing.pagePadding,
            gap: 24,
            paddingBottom: 40,
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Result card */}
          <View
            style={{
              backgroundColor: passed ? colors.ink : colors.cream,
              borderRadius: radius.hero,
              padding: 32,
              alignItems: "center",
              gap: 16,
              borderWidth: passed ? 0 : 1,
              borderColor: colors.line,
            }}
          >
            <Text style={{ fontSize: 48 }}>{passed ? "🎉" : "📚"}</Text>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 32,
                color: passed ? colors.cream : colors.ink,
                textAlign: "center",
              }}
            >
              {pct}%
            </Text>
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 18,
                color: passed ? colors.popPeach : colors.ink,
                textAlign: "center",
              }}
            >
              {passed ? "Odlično urađeno!" : "Pokušaj ponovo!"}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: passed ? colors.muted : colors.ink3,
                textAlign: "center",
              }}
            >
              {score} od {total} tačnih odgovora
            </Text>
          </View>

          {/* Actions */}
          <TouchableOpacity
            onPress={handleRestart}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.ink,
              borderRadius: radius.pill,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream }}>
              Ponovi kviz
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              borderRadius: radius.pill,
              paddingVertical: 14,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: colors.line,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.ink3 }}>
              Nazad na početnu
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.pagePadding,
          gap: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={22} color={colors.ink3} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>
            {current + 1} / {total}
          </Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: colors.line2, borderRadius: 4 }}>
          <View
            style={{
              height: 4,
              width: `${((current + (phase === "answered" ? 1 : 0)) / total) * 100}%`,
              backgroundColor: colors.accentTeal,
              borderRadius: 4,
            }}
          />
        </View>

        {/* Chapter label */}
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.accentTeal,
            textTransform: "uppercase",
            letterSpacing: 0.8,
          }}
        >
          Matematika 5 · Poglavlje 4
        </Text>

        {/* Question */}
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 24,
            color: colors.ink,
            lineHeight: 32,
          }}
        >
          {q.question}
        </Text>

        {/* Options */}
        <View style={{ gap: 10 }}>
          {q.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.correct;
            const showFeedback = phase === "answered";

            let bg: string = colors.cream;
            let border: string = colors.line;
            let textColor: string = colors.ink;

            if (showFeedback && isCorrect) {
              bg = "#E8F5E4";
              border = colors.success;
              textColor = colors.success;
            } else if (showFeedback && isSelected && !isCorrect) {
              bg = "#FAE8E6";
              border = colors.danger;
              textColor = colors.danger;
            } else if (isSelected) {
              border = colors.ink;
            }

            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleSelect(i)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: bg,
                  borderRadius: radius.card,
                  borderWidth: 1.5,
                  borderColor: border,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                {/* Option letter */}
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: radius.pill,
                    backgroundColor: showFeedback && isCorrect
                      ? colors.success
                      : showFeedback && isSelected && !isCorrect
                        ? colors.danger
                        : colors.line2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.monoMedium,
                      fontSize: 12,
                      color: showFeedback && (isCorrect || (isSelected && !isCorrect))
                        ? colors.cream
                        : colors.ink3,
                    }}
                  >
                    {["A", "B", "C", "D"][i]}
                  </Text>
                </View>

                <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: textColor, flex: 1 }}>
                  {option}
                </Text>

                {showFeedback && isCorrect && (
                  <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <Ionicons name="close-circle" size={20} color={colors.danger} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation callout — shows after answering */}
        {phase === "answered" && (
          <View
            style={{
              backgroundColor: selected === q.correct ? "#E8F5E4" : "#FAE8E6",
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: selected === q.correct ? colors.success + "60" : colors.danger + "60",
              padding: 14,
              gap: 8,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <Text style={{ fontSize: 16, marginTop: 1 }}>
              {selected === q.correct ? "💡" : "📖"}
            </Text>
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 14,
                color: colors.ink2,
                flex: 1,
                lineHeight: 20,
              }}
            >
              {q.explanation}
            </Text>
          </View>
        )}

        {/* Next button - only shows after answering */}
        {phase === "answered" && (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.ink,
              borderRadius: radius.pill,
              paddingVertical: 16,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream }}>
              {current + 1 >= total ? "Vidi rezultat" : "Dalje"}
            </Text>
            <Ionicons name="arrow-forward" size={16} color={colors.cream} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
