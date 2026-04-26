import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePostHog } from "posthog-react-native";
import { colors, fonts, spacing, radius } from "../theme/tokens";
import AudioPlayer from "../components/AudioPlayer";
import ChatDrawer from "../components/ChatDrawer";
import Transcript from "../components/Transcript";
import { setupPlayer, loadEpisode } from "../lib/audio";
import { TrackPlayer, usePlaybackState, useProgress, State } from "../lib/trackplayer";

const EPISODE_ID = "tema-4-2";
const POSITION_KEY = `audio_position_${EPISODE_ID}`;

const LEARNING_POINTS = [
  "Razlomci s različitim nazivnicima ne mogu se odmah sabirati.",
  "Najpre treba pronaći najmanji zajednički nazivnik (NZN).",
  "NZN je najmanji broj koji je djeljiv s oba nazivnika.",
  "Svaki razlomak proširimo da dobijemo isti nazivnik.",
  "Tek tada sabiramo brojnike, nazivnik ostaje isti.",
];

export default function AudioScreen() {
  const [chatOpen, setChatOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [resumeFrom, setResumeFrom] = useState(0);
  const posthog = usePostHog();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress();
  const isPlaying = playbackState.state === State.Playing;
  const totalSeconds = Math.floor(duration) || 355;
  const isComplete = position > 0 && totalSeconds > 0 && position >= totalSeconds - 3;
  const completedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function init() {
      await setupPlayer();
      await loadEpisode({
        id: EPISODE_ID,
        title: "Sabiranje razlomaka sa različitim nazivnicima",
        artist: "Cvrčak",
        url: "https://bmfbibwphuocdevhbypm.supabase.co/storage/v1/object/public/audio/poglavlje-4/tema-4-2.mp3",
        artwork: require("../assets/icon.png"),
      });

      // Restore saved position
      if (TrackPlayer) {
        const saved = await AsyncStorage.getItem(POSITION_KEY);
        if (saved) {
          const savedPosition = parseFloat(saved);
          if (savedPosition > 10) {
            await TrackPlayer.seekTo(savedPosition);
            setResumeFrom(savedPosition);
          }
        }
        await TrackPlayer.play();
      }

      posthog?.capture("audio_started", { episode_id: EPISODE_ID, chapter_id: 4 });
    }

    init();

    // Save position every 5 seconds while playing
    intervalRef.current = setInterval(async () => {
      if (!TrackPlayer) return;
      try {
        const progress = await TrackPlayer.getProgress();
        if (progress.position > 0) {
          await AsyncStorage.setItem(POSITION_KEY, String(progress.position));
          // Mark completed and clear saved position when near the end
          if (!completedRef.current && progress.duration > 0 && progress.position >= progress.duration - 5) {
            completedRef.current = true;
            await AsyncStorage.removeItem(POSITION_KEY);
            posthog?.capture("audio_completed", {
              episode_id: EPISODE_ID,
              listen_duration_s: Math.floor(progress.position),
            });
          }
        }
      } catch {
        // TrackPlayer not ready
      }
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            style={{
              alignSelf: "flex-start",
              width: 36,
              height: 36,
              borderRadius: radius.pill,
              backgroundColor: colors.cream,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="arrow-back" size={18} color={colors.ink3} />
          </TouchableOpacity>
          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                color: colors.muted,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Matematika 5 · Poglavlje 4
            </Text>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 26,
                color: colors.ink,
                lineHeight: 34,
              }}
            >
              Sabiranje razlomaka sa različitim nazivnicima
            </Text>
          </View>
        </View>

        {/* Audio player hero card */}
        <AudioPlayer resumeFrom={resumeFrom} />

        {/* Transcript toggle */}
        <TouchableOpacity
          onPress={() => {
            const next = !transcriptOpen;
            setTranscriptOpen(next);
            posthog?.capture("transcript_toggled", { episode_id: EPISODE_ID, open: next });
          }}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: radius.card,
            backgroundColor: colors.cream,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.ink3, textTransform: "uppercase", letterSpacing: 0.8 }}>
            Transkript
          </Text>
          <Ionicons name={transcriptOpen ? "chevron-up" : "chevron-down"} size={14} color={colors.ink3} />
        </TouchableOpacity>
        {transcriptOpen && <Transcript />}

        {/* What you'll learn */}
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.ink }}>
              Šta ćeš naučiti
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
          </View>
          <View style={{ gap: 10 }}>
            {LEARNING_POINTS.map((point, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 100,
                    backgroundColor: colors.popPeach,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.monoMedium,
                      fontSize: 11,
                      color: colors.ink2,
                    }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: colors.ink2,
                    flex: 1,
                    lineHeight: 20,
                  }}
                >
                  {point}
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Sticky bottom CTA bar */}
      <View
        style={{
          paddingHorizontal: spacing.pagePadding,
          paddingTop: 12,
          paddingBottom: 16,
          gap: 10,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          backgroundColor: colors.cream2,
        }}
      >
        <TouchableOpacity
          onPress={() => { if (!isPlaying) setChatOpen(true); }}
          activeOpacity={isPlaying ? 1 : 0.85}
          style={{
            backgroundColor: colors.ink,
            borderRadius: radius.pill,
            paddingVertical: 16,
            alignItems: "center",
            opacity: isPlaying ? 0.38 : 1,
          }}
        >
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream }}>
            {isComplete ? "Pitaj pitanje" : isPlaying ? "Slušaj do kraja..." : "Pitaj pitanje"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => posthog?.capture("download_tapped", { episode_id: EPISODE_ID })}
          activeOpacity={0.6}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="download-outline" size={15} color={colors.ink3} />
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink3 }}>
            Preuzmi za offline
          </Text>
        </TouchableOpacity>
      </View>

      <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </SafeAreaView>
  );
}
