import { View, Text, TouchableOpacity } from "react-native";
import { colors, fonts, radius, spacing } from "../theme/tokens";

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
  const showRetry = correct < total;
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.pagePadding,
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
        {Array.from({ length: Math.min(correct, 3) }).map((_, i) => (
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
          marginBottom: showRetry ? 12 : 0,
        }}
      >
        <Text
          style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.cream }}
        >
          ← Nazad na početnu
        </Text>
      </TouchableOpacity>

      {/* Secondary CTA — only if not perfect score */}
      {showRetry && (
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
