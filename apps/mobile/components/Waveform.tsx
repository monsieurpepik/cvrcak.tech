import { View } from "react-native";
import { colors } from "../theme/tokens";

// Predefined bar heights to simulate a natural audio waveform
const BAR_HEIGHTS = [20, 35, 28, 45, 32, 50, 38, 42, 55, 30, 48, 36, 52, 40,
                     33, 46, 38, 44, 29, 51, 37, 43, 26, 34];

type WaveformProps = {
  progress: number; // 0 to 1
};

export default function Waveform({ progress }: WaveformProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 56 }}>
      {BAR_HEIGHTS.map((height, i) => {
        const position = i / BAR_HEIGHTS.length;
        const isActive = Math.abs(position - progress) < 1 / BAR_HEIGHTS.length && progress > 0;
        const isPlayed = position < progress;

        return (
          <View
            key={i}
            style={{
              width: 8,
              height,
              borderRadius: 3,
              backgroundColor: isActive
                ? colors.accentWarm
                : isPlayed
                ? colors.ink
                : colors.line,
            }}
          />
        );
      })}
    </View>
  );
}
