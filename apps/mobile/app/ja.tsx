import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radius } from "../theme/tokens";

const STATS = [
  { label: "Streak", value: "12", unit: "dana", icon: "🔥" },
  { label: "Pitanja", value: "34", unit: "ukupno", icon: "💬" },
  { label: "Kvizovi", value: "5", unit: "završeno", icon: "✅" },
];

const ACHIEVEMENTS = [
  { label: "Prva lekcija", desc: "Odslušao si svoju prvu lekciju", icon: "🎧", unlocked: true },
  { label: "Znatiželjan", desc: "Postavio si 10 pitanja", icon: "🤔", unlocked: true },
  { label: "Kviz majstor", desc: "Riješio si kviz sa 100%", icon: "🏆", unlocked: false },
  { label: "Sedmica", desc: "7 dana zaredom", icon: "🔥", unlocked: false },
];

export default function JaScreen() {
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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color={colors.ink3} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink }}>
            Moj profil
          </Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Avatar + name */}
        <View style={{ alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: radius.pill,
              backgroundColor: colors.popPeach,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 36, color: colors.ink }}>
              M
            </Text>
          </View>
          <View style={{ alignItems: "center", gap: 2 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>
              Marko
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.muted }}>
              5. razred · OŠ Hasan Kikić
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {STATS.map((stat) => (
            <View
              key={stat.label}
              style={{
                flex: 1,
                backgroundColor: colors.cream,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.line,
                padding: 14,
                alignItems: "center",
                gap: 4,
              }}
            >
              <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink }}>
                {stat.value}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted, textAlign: "center" }}>
                {stat.unit}
              </Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
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
            Dostignuća
          </Text>
          <View style={{ gap: 8 }}>
            {ACHIEVEMENTS.map((a) => (
              <View
                key={a.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  backgroundColor: colors.cream,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: 14,
                  opacity: a.unlocked ? 1 : 0.4,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    backgroundColor: a.unlocked ? colors.popPeach : colors.line2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink }}>
                    {a.label}
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
                    {a.desc}
                  </Text>
                </View>
                {a.unlocked && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Switch role */}
        <TouchableOpacity
          onPress={() => router.push("/welcome")}
          activeOpacity={0.8}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: radius.pill,
            borderWidth: 1.5,
            borderColor: colors.line,
            paddingVertical: 14,
          }}
        >
          <Ionicons name="swap-horizontal-outline" size={16} color={colors.ink3} />
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink3 }}>
            Promijeni profil
          </Text>
        </TouchableOpacity>

        {/* Progress section */}
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
            Moje knjige
          </Text>
          <View
            style={{
              backgroundColor: colors.cream,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.line,
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink }}>
                Matematika 5
              </Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.muted }}>
                67%
              </Text>
            </View>
            <View style={{ height: 4, backgroundColor: colors.line2, borderRadius: 4 }}>
              <View style={{ height: 4, width: "67%", backgroundColor: colors.accentWarm, borderRadius: 4 }} />
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
              Poglavlje 4 od 6 završeno
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
