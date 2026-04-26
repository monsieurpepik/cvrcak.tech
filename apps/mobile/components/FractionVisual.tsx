import { View, Text } from "react-native";
import { fonts } from "../theme/tokens";

// Math orange from sketch findings (grades 1-4 subject color)
const MATH_ORANGE = "#FF6B35";
const MATH_BG = "#FFF0EB";

type FractionVisualProps = {
  numerator: number;
  denominator: number;
};

export default function FractionVisual({ numerator, denominator }: FractionVisualProps) {
  if (denominator <= 0) return null;
  const tiles = Array.from({ length: denominator }, (_, i) => i < numerator);

  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      {/* Tile strip */}
      <View
        style={{
          flexDirection: "row",
          gap: 4,
          backgroundColor: MATH_BG,
          borderRadius: 12,
          padding: 8,
          borderWidth: 2,
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        {tiles.map((filled, i) => (
          <View
            key={i}
            style={{
              width: Math.min(44, Math.floor(240 / denominator) - 4),
              height: 44,
              borderRadius: 8,
              backgroundColor: filled ? MATH_ORANGE : "rgba(0,0,0,0.06)",
              borderWidth: filled ? 0 : 1,
              borderColor: "rgba(0,0,0,0.1)",
            }}
          />
        ))}
      </View>

      {/* Fraction label */}
      <Text
        style={{
          fontFamily: fonts.monoMedium,
          fontSize: 22,
          color: MATH_ORANGE,
        }}
      >
        {numerator}/{denominator}
      </Text>
    </View>
  );
}
