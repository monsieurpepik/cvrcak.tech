import { useState } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import Waveform from "./Waveform";
import ChapterMarkers from "./ChapterMarkers";

// Lazy-load TrackPlayer so the app doesn't crash in Expo Go
let TrackPlayer: any = null;
let useProgress: () => { position: number; duration: number } = () => ({ position: 0, duration: 0 });
let usePlaybackState: () => { state: string } = () => ({ state: "" });
let PlayingState = "playing";

try {
  const tp = require("react-native-track-player");
  TrackPlayer = tp.default;
  useProgress = tp.useProgress;
  usePlaybackState = tp.usePlaybackState;
  PlayingState = tp.State.Playing;
} catch {
  // Running in Expo Go -- audio controls are disabled
}

const SPEEDS = [0.75, 1, 1.25, 1.5];
const TOTAL_SECONDS = 510; // 8:30 placeholder until real audio loaded

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer() {
  const [speedIndex, setSpeedIndex] = useState(1);
  const { position, duration } = useProgress();
  const playbackState = usePlaybackState();

  const isPlaying = playbackState.state === PlayingState;
  const currentSeconds = Math.floor(position);
  const totalSeconds = Math.floor(duration) || TOTAL_SECONDS;
  const progress = totalSeconds > 0 ? position / totalSeconds : 0;

  async function togglePlay() {
    if (!TrackPlayer) return;
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }

  async function cycleSpeed() {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (!TrackPlayer) return;
    await TrackPlayer.setRate(SPEEDS[next]);
  }

  async function seek(seconds: number) {
    if (!TrackPlayer) return;
    await TrackPlayer.seekTo(seconds);
  }

  return (
    <View
      style={{
        backgroundColor: colors.popPeach,
        borderRadius: radius.hero,
        padding: spacing.cardPadding,
        gap: 16,
      }}
    >
      {/* Speaker chips */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <SpeakerChip initial="N" label="Nastavnica" />
        <SpeakerChip initial="M" label="Marko" />
      </View>

      {/* Waveform */}
      <Waveform progress={progress} />

      {/* Time row */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.ink2 }}>
          {formatTime(currentSeconds)}
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.muted }}>
          {formatTime(totalSeconds)}
        </Text>
      </View>

      {/* Controls row: speed | play/pause */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <Pressable
          onPress={cycleSpeed}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 100,
            backgroundColor: colors.popPeachWarm,
          }}
        >
          <Text style={{ fontFamily: fonts.monoMedium, fontSize: 13, color: colors.ink2 }}>
            {SPEEDS[speedIndex]}x
          </Text>
        </Pressable>

        <TouchableOpacity
          onPress={togglePlay}
          activeOpacity={0.8}
          style={{
            width: 56,
            height: 56,
            borderRadius: 100,
            backgroundColor: colors.ink,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 18, color: colors.cream }}>
            {isPlaying ? "⏸" : "▶"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chapter markers */}
      <ChapterMarkers currentSeconds={currentSeconds} onSeek={seek} />
    </View>
  );
}

function SpeakerChip({ initial, label }: { initial: string; label: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 100,
        backgroundColor: colors.popPeachWarm,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 100,
          backgroundColor: colors.ink,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: fonts.displayItalic, fontSize: 12, color: colors.cream }}>
          {initial}
        </Text>
      </View>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.ink2 }}>
        {label}
      </Text>
    </View>
  );
}
