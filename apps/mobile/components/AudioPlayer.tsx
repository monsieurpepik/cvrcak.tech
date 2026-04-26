import { useState } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import Waveform from "./Waveform";
import ChapterMarkers from "./ChapterMarkers";

import { TrackPlayer, useProgress, usePlaybackState, State } from "../lib/trackplayer";

const SPEEDS = [0.75, 1, 1.25, 1.5];
const TOTAL_SECONDS = 355; // 5:55 — actual duration of tema-4-2.mp3

// Approximate speaker segments — calibrate against actual audio timestamps
const SPEAKER_SEGMENTS: Array<{ from: number; speaker: "N" | "M" }> = [
  { from: 0, speaker: "N" },
  { from: 18, speaker: "M" },
  { from: 30, speaker: "N" },
  { from: 58, speaker: "M" },
  { from: 72, speaker: "N" },
  { from: 105, speaker: "M" },
  { from: 118, speaker: "N" },
  { from: 158, speaker: "M" },
  { from: 173, speaker: "N" },
  { from: 213, speaker: "M" },
  { from: 228, speaker: "N" },
  { from: 278, speaker: "M" },
  { from: 293, speaker: "N" },
  { from: 335, speaker: "M" },
  { from: 348, speaker: "N" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getActiveSpeaker(seconds: number): "N" | "M" {
  let active: "N" | "M" = "N";
  for (const seg of SPEAKER_SEGMENTS) {
    if (seconds >= seg.from) active = seg.speaker;
    else break;
  }
  return active;
}

export default function AudioPlayer({ resumeFrom = 0 }: { resumeFrom?: number }) {
  const [speedIndex, setSpeedIndex] = useState(1);
  const { position, duration } = useProgress();
  const playbackState = usePlaybackState();

  const isPlaying = playbackState.state === State.Playing;
  const currentSeconds = Math.floor(position);
  const totalSeconds = Math.floor(duration) || TOTAL_SECONDS;
  const progress = totalSeconds > 0 ? position / totalSeconds : 0;
  const isComplete = position > 0 && totalSeconds > 0 && position >= totalSeconds - 3;
  const activeSpeaker = getActiveSpeaker(currentSeconds);

  async function togglePlay() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!TrackPlayer) return;
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }

  async function skipBack() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!TrackPlayer) return;
    await TrackPlayer.seekTo(Math.max(0, position - 15));
  }

  async function skipForward() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!TrackPlayer) return;
    await TrackPlayer.seekTo(Math.min(totalSeconds, position + 15));
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Speaker chips */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <SpeakerChip initial="N" label="Nastavnica" active={isPlaying && activeSpeaker === "N"} />
        <SpeakerChip initial="M" label="Marko" active={isPlaying && activeSpeaker === "M"} />
      </View>

      {/* Resume label */}
      {resumeFrom > 10 && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
          <Ionicons name="time-outline" size={12} color={colors.ink3} />
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.ink3 }}>
            Nastavljaš od {formatTime(Math.floor(resumeFrom))}
          </Text>
        </View>
      )}

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

      {/* Controls: speed | skip-back | play/pause | skip-forward */}
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

        <TouchableOpacity onPress={skipBack} activeOpacity={0.7} hitSlop={8} style={{ alignItems: "center", gap: 3 }}>
          <Ionicons name="play-back" size={22} color={colors.ink2} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.ink3 }}>-15</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={togglePlay}
          activeOpacity={0.8}
          style={{
            width: 64,
            height: 64,
            borderRadius: 100,
            backgroundColor: colors.ink,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={26}
            color={colors.cream}
            style={{ marginLeft: isPlaying ? 0 : 3 }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipForward} activeOpacity={0.7} hitSlop={8} style={{ alignItems: "center", gap: 3 }}>
          <Ionicons name="play-forward" size={22} color={colors.ink2} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.ink3 }}>+15</Text>
        </TouchableOpacity>
      </View>

      {/* Chapter markers */}
      <ChapterMarkers currentSeconds={currentSeconds} onSeek={seek} />

      {/* Completion state */}
      {isComplete && (
        <View
          style={{
            alignItems: "center",
            gap: 10,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "rgba(0,0,0,0.08)",
          }}
        >
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink }}>
            Lekcija završena
          </Text>
          <TouchableOpacity
            onPress={() => seek(0)}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              backgroundColor: colors.popPeachWarm,
              borderRadius: radius.pill,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Ionicons name="refresh-outline" size={14} color={colors.ink} />
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink }}>
              Ponovi
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SpeakerChip({ initial, label, active }: { initial: string; label: string; active: boolean }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 100,
        backgroundColor: active ? colors.popPeach : colors.popPeachWarm,
        borderWidth: active ? 1.5 : 0,
        borderColor: active ? colors.accentTeal : "transparent",
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 100,
          backgroundColor: active ? colors.accentTeal : colors.ink,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontFamily: fonts.displayItalic, fontSize: 12, color: colors.cream }}>
          {initial}
        </Text>
      </View>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 12, color: active ? colors.ink : colors.ink2 }}>
        {label}
      </Text>
    </View>
  );
}
