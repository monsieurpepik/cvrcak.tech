import { useRef, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, fonts, spacing } from "../theme/tokens";
import { TRANSCRIPT } from "../lib/transcript";

import { TrackPlayer, useProgress } from "../lib/trackplayer";

function activeIndex(positionSeconds: number): number {
  let active = 0;
  for (let i = 0; i < TRANSCRIPT.length; i++) {
    if (TRANSCRIPT[i].startSeconds <= positionSeconds) {
      active = i;
    } else {
      break;
    }
  }
  return active;
}

export default function Transcript() {
  const { position } = useProgress();
  const listRef = useRef<FlatList>(null);
  const currentIndex = activeIndex(Math.floor(position));

  // Auto-scroll to keep active line near the top third of the list
  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: currentIndex,
      animated: true,
      viewPosition: 0.25,
    });
  }, [currentIndex]);

  async function handleTap(startSeconds: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (TrackPlayer) {
      await TrackPlayer.seekTo(startSeconds);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: colors.ink3,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          paddingHorizontal: spacing.pagePadding,
          paddingBottom: 10,
        }}
      >
        Transkript
      </Text>

      <FlatList
        ref={listRef}
        data={TRANSCRIPT}
        keyExtractor={(_, i) => String(i)}
        scrollEnabled={false}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item, index }) => {
          const isActive = index === currentIndex;
          const isN = item.speaker === "N";

          return (
            <TouchableOpacity
              onPress={() => handleTap(item.startSeconds)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                gap: 10,
                paddingHorizontal: spacing.pagePadding,
                paddingVertical: 8,
                backgroundColor: isActive ? colors.popPeach : "transparent",
              }}
            >
              {/* Speaker dot */}
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 100,
                  backgroundColor: isActive ? colors.ink : colors.line2,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 1,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: fonts.displayItalic,
                    fontSize: 11,
                    color: isActive ? colors.cream : colors.ink3,
                  }}
                >
                  {item.speaker}
                </Text>
              </View>

              {/* Text */}
              <Text
                style={{
                  fontFamily: isActive ? fonts.bodyMedium : fonts.body,
                  fontSize: 14,
                  color: isActive ? colors.ink : colors.ink3,
                  flex: 1,
                  lineHeight: 20,
                }}
              >
                {item.text}
              </Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: colors.line2, marginLeft: spacing.pagePadding + 22 + 10 }} />
        )}
      />
    </View>
  );
}
