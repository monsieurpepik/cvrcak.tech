import React, { useState } from "react";
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

const difficultyLabel: Record<ExerciseCardProps["difficulty"], string> = {
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
    setTimeout(() => {
      onNext(index === correctIndex);
      setSelected(null);
      setLocked(false);
    }, 800);
  }

  // Split questionText on "?" to render the styled span
  const questionParts = questionText.split("?");

  function getTileStyle(index: number): object {
    if (selected === null) {
      return {
        backgroundColor: colors.cream,
        borderColor: colors.line,
      };
    }
    if (index === correctIndex) {
      return {
        backgroundColor: colors.success,
        borderColor: colors.success,
      };
    }
    if (index === selected) {
      return {
        backgroundColor: colors.danger,
        borderColor: colors.danger,
      };
    }
    return {
      backgroundColor: colors.cream,
      borderColor: colors.line,
    };
  }

  function getTileTextColor(index: number): string {
    if (selected === null) return colors.ink;
    if (index === correctIndex) return colors.cream;
    if (index === selected) return colors.cream;
    return colors.ink;
  }

  function getTileLabel(index: number): string {
    const base = options[index];
    if (selected !== null && index === correctIndex) {
      return base + " \u2713";
    }
    return base;
  }

  return (
    <View>
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
        {`Vježba ${step} od ${total} · ${difficultyLabel[difficulty]}`}
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
          <Text
            style={{
              fontSize: 30,
              textAlign: "center",
              marginBottom: 10,
            }}
          >
            {questionVisual}
          </Text>
        )}

        {/* Render questionText with styled "?" */}
        <Text
          style={{
            fontFamily: fonts.display,
            fontSize: 22,
            color: colors.cream2,
            textAlign: "center",
          }}
        >
          {questionParts.map((part, i) => (
            <React.Fragment key={i}>
              <Text>{part}</Text>
              {i < questionParts.length - 1 && (
                <Text
                  style={{
                    color: colors.popPeach,
                    backgroundColor: "rgba(255,255,255,0.15)",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                  }}
                >
                  {"?"}
                </Text>
              )}
            </React.Fragment>
          ))}
        </Text>
      </View>

      {/* Answer tiles */}
      <View style={{ gap: 14 }}>
        {options.map((option, i) => {
          const index = i as 0 | 1 | 2;
          const tileStyle = getTileStyle(index);
          const textColor = getTileTextColor(index);
          const label = getTileLabel(index);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleTap(index)}
              activeOpacity={0.85}
              style={[
                {
                  borderWidth: 2,
                  borderRadius: radius.card,
                  minHeight: 56,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                },
                tileStyle,
              ]}
            >
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 22,
                  color: textColor,
                  textAlign: "center",
                }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
