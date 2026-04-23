import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radius } from "../theme/tokens";
import AudioPlayer from "../components/AudioPlayer";
import { setupPlayer, loadEpisode } from "../lib/audio";

const LEARNING_POINTS = [
  "Razlomci s različitim nazivnicima ne mogu se odmah sabirati.",
  "Najpre treba pronaći najmanji zajednički nazivnik (NZN).",
  "NZN je najmanji broj koji je djeljiv s oba nazivnika.",
  "Svaki razlomak proširimo da dobijemo isti nazivnik.",
  "Tek tada sabiramo brojnike, nazivnik ostaje isti.",
];

export default function AudioScreen() {
  useEffect(() => {
    async function init() {
      await setupPlayer();
      await loadEpisode({
        id: "tema-4-2",
        title: "Sabiranje razlomaka sa različitim nazivnicima",
        artist: "Cvrčak",
        // placeholder until real MP3 is uploaded to Supabase Storage
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        artwork: undefined,
      });
    }
    init();
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
          <TouchableOpacity onPress={() => router.back()} hitSlop={12} style={{ alignSelf: "flex-start" }}>
            <Ionicons name="arrow-back" size={20} color={colors.ink3} />
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
        <AudioPlayer />

        {/* What you'll learn */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Šta ćeš naučiti
          </Text>
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
                    backgroundColor: colors.line2,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 1,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.monoMedium,
                      fontSize: 11,
                      color: colors.ink3,
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

        {/* CTAs */}
        <View style={{ gap: 10 }}>
          <TouchableOpacity
            onPress={() => router.push("/chat")}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.ink,
              borderRadius: radius.pill,
              paddingVertical: 16,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: fonts.bodySemiBold,
                fontSize: 16,
                color: colors.cream,
              }}
            >
              Pitaj pitanje
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              borderRadius: radius.pill,
              paddingVertical: 14,
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: colors.line,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.bodyMedium,
                fontSize: 15,
                color: colors.ink3,
              }}
            >
              Preuzmi za offline
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
