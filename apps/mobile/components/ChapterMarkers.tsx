import { ScrollView, TouchableOpacity, Text } from "react-native";
import { colors, fonts } from "../theme/tokens";

const CHAPTERS = [
  { label: "Uvod",      startSeconds: 0 },
  { label: "Osnove",    startSeconds: 38 },
  { label: "Primjer 1", startSeconds: 127 },
  { label: "Primjer 2", startSeconds: 203 },
  { label: "Sažetak",   startSeconds: 305 },
];

type ChapterMarkersProps = {
  currentSeconds: number;
  onSeek: (seconds: number) => void;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ChapterMarkers({ currentSeconds, onSeek }: ChapterMarkersProps) {
  const activeIndex = CHAPTERS.reduce(
    (acc, ch, i) => (currentSeconds >= ch.startSeconds ? i : acc),
    0
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
    >
      {CHAPTERS.map((ch, i) => {
        const isActive = i === activeIndex;
        return (
          <TouchableOpacity
            key={ch.label}
            onPress={() => onSeek(ch.startSeconds)}
            style={{
              alignItems: "center",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 100,
              backgroundColor: isActive ? colors.ink : colors.line2,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 12,
                color: isActive ? colors.cream : colors.ink3,
              }}
            >
              {ch.label}
            </Text>
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: isActive ? colors.popPeach : colors.muted,
              }}
            >
              {formatTime(ch.startSeconds)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
