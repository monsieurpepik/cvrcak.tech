// apps/mobile/components/ConceptCard.tsx
import React from "react";
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

export default function ConceptCard(props: ConceptCardProps) {
  const { title, subjectLabel, concreteEmoji, dotsA, dotsB, formula, audioUrl, onStart } = props;

  // Parse formula: split on "=" to separate lhs from answer (last token)
  const formulaParts = formula.split("=");
  const formulaAnswer = formulaParts.length > 1 ? formulaParts[formulaParts.length - 1].trim() : "";
  const formulaLhs = formulaParts.length > 1
    ? formulaParts.slice(0, formulaParts.length - 1).join("=").trim() + " ="
    : formula;

  const panelBg = "rgba(255,255,255,0.06)";
  const formulaBg = "rgba(248,223,176,0.12)";

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
        {/* Title */}
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.popPeach,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 12,
          }}
        >
          {title}
        </Text>

        {/* Panel 1 — Konkretno */}
        <View
          style={{
            backgroundColor: panelBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Konkretno
          </Text>
          <Text style={{ fontSize: 26, letterSpacing: 2 }}>
            {concreteEmoji[0]} + {concreteEmoji[1]}
          </Text>
        </View>

        {/* Panel 2 — Prikaz */}
        <View
          style={{
            backgroundColor: panelBg,
            borderRadius: 12,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: colors.muted,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Prikaz
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
            {Array.from({ length: dotsA }).map((_, i) => (
              <View
                key={`a-${i}`}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: colors.popPeach,
                }}
              />
            ))}
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 14,
                color: colors.muted,
                marginHorizontal: 4,
              }}
            >
              +
            </Text>
            {Array.from({ length: dotsB }).map((_, i) => (
              <View
                key={`b-${i}`}
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

        {/* Panel 3 — Formula */}
        <View
          style={{
            backgroundColor: formulaBg,
            borderRadius: 12,
            padding: 12,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              color: colors.popPeach,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 8,
            }}
          >
            Formula
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "baseline" }}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 24,
                color: colors.cream,
              }}
            >
              {formulaLhs}{" "}
            </Text>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 24,
                color: colors.popPeach,
              }}
            >
              {formulaAnswer}
            </Text>
          </View>
        </View>
      </View>

      {/* Audio narration chip */}
      <TouchableOpacity
        disabled={audioUrl === null}
        activeOpacity={0.7}
        style={{
          marginTop: 14,
          opacity: audioUrl === null ? 0.6 : 1,
          backgroundColor: colors.cream,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.line,
          paddingVertical: 10,
          paddingHorizontal: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        {/* Music note circle */}
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

        {/* Label */}
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 12,
            color: colors.ink3,
            flex: 1,
          }}
        >
          Poslušaj objašnjenje
        </Text>

        {/* Duration */}
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.accentWarm,
          }}
        >
          ~30s
        </Text>
      </TouchableOpacity>

      {/* CTA button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onStart}
        style={{
          marginTop: 14,
          backgroundColor: colors.ink,
          borderRadius: radius.pill,
          paddingVertical: 14,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.bodySemiBold,
            fontSize: 14,
            color: colors.cream,
          }}
        >
          Počni vježbe →
        </Text>
      </TouchableOpacity>
    </View>
  );
}
