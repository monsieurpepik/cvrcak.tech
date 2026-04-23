import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radius } from "../theme/tokens";

const WEEK_STATS = [
  { label: "Minuta slušanja", value: "47", unit: "ove sedmice", icon: "headset-outline" as const, bg: colors.popPeach },
  { label: "Pitanja", value: "12", unit: "postavljeno", icon: "chatbubble-outline" as const, bg: "#D6EFE0" },
  { label: "Kvizovi", value: "2", unit: "završeno", icon: "checkbox-outline" as const, bg: colors.popLavender },
];

const ACTIVITY = [
  {
    day: "Utorak",
    date: "22. apr",
    action: "Slušao lekciju",
    subject: "Sabiranje razlomaka",
    duration: "8 min",
    icon: "headset-outline" as const,
  },
  {
    day: "Utorak",
    date: "22. apr",
    action: "Postavio 5 pitanja",
    subject: "Matematika 5 · Pogl. 4",
    duration: null,
    icon: "chatbubble-outline" as const,
  },
  {
    day: "Srijeda",
    date: "23. apr",
    action: "Riješio kviz",
    subject: "80% tačnih odgovora",
    duration: null,
    icon: "checkbox-outline" as const,
  },
  {
    day: "Četvrtak",
    date: "24. apr",
    action: "Slušao lekciju",
    subject: "Sabiranje razlomaka",
    duration: "8 min",
    icon: "headset-outline" as const,
  },
];

const INSIGHTS = [
  {
    text: "Marko pita mnogo pitanja o NZN. Ova tema mu ide teže.",
    type: "attention" as const,
  },
  {
    text: "Kviz rezultat se poboljšao: 60% u ponedjeljak, 80% u srijedu.",
    type: "progress" as const,
  },
  {
    text: "Aktivniji je ujutro. Najduže slušanje je između 8:00 i 10:00.",
    type: "info" as const,
  },
];

export default function RoditeljScreen() {
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
          <TouchableOpacity onPress={() => router.push("/welcome")} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color={colors.ink3} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink }}>
            Izvještaj za roditelje
          </Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Child info */}
        <View
          style={{
            backgroundColor: colors.ink,
            borderRadius: radius.hero,
            padding: spacing.cardPadding,
            gap: 10,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              color: colors.accentWarm,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Vaše dijete
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: radius.pill,
                backgroundColor: colors.popPeach,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: fonts.displayItalic, fontSize: 24, color: colors.ink }}>
                M
              </Text>
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.cream }}>
                Marko
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>
                5. razred · OŠ Hasan Kikić
              </Text>
            </View>
          </View>
          <View style={{ height: 1, backgroundColor: "#2C2C2C", marginTop: 2 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>
              Aktivni streak
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 14 }}>🔥</Text>
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 14, color: colors.cream }}>
                12 dana
              </Text>
            </View>
          </View>
        </View>

        {/* Week stats */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Ova sedmica
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {WEEK_STATS.map((stat) => (
              <View
                key={stat.label}
                style={{
                  flex: 1,
                  backgroundColor: colors.cream,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: 12,
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: stat.bg,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={stat.icon} size={16} color={colors.ink2} />
                </View>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 20, color: colors.ink }}>
                  {stat.value}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 10,
                    color: colors.muted,
                    textAlign: "center",
                  }}
                >
                  {stat.unit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Zapažanja
          </Text>
          <View style={{ gap: 8 }}>
            {INSIGHTS.map((ins, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  backgroundColor: colors.cream,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor:
                    ins.type === "attention" ? colors.warning + "60" : colors.line,
                  padding: 14,
                  alignItems: "flex-start",
                }}
              >
                <Ionicons
                  name={
                    ins.type === "attention"
                      ? "alert-circle-outline"
                      : ins.type === "progress"
                      ? "trending-up-outline"
                      : "information-circle-outline"
                  }
                  size={18}
                  color={
                    ins.type === "attention"
                      ? colors.warning
                      : ins.type === "progress"
                      ? colors.success
                      : colors.muted
                  }
                />
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 13,
                    color: colors.ink2,
                    flex: 1,
                    lineHeight: 19,
                  }}
                >
                  {ins.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity log */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Aktivnosti
          </Text>
          <View style={{ gap: 1 }}>
            {ACTIVITY.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  gap: 14,
                  backgroundColor: colors.cream,
                  borderTopLeftRadius: i === 0 ? radius.card : 4,
                  borderTopRightRadius: i === 0 ? radius.card : 4,
                  borderBottomLeftRadius: i === ACTIVITY.length - 1 ? radius.card : 4,
                  borderBottomRightRadius: i === ACTIVITY.length - 1 ? radius.card : 4,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: 14,
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.line2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={item.icon} size={16} color={colors.ink3} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.ink }}>
                    {item.action}
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
                    {item.subject}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.muted }}>
                    {item.date}
                  </Text>
                  {item.duration && (
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.ink3 }}>
                      {item.duration}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Progress */}
        <View style={{ gap: 10 }}>
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Napredak u knjizi
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
            <View style={{ height: 6, backgroundColor: colors.line2, borderRadius: 6 }}>
              <View
                style={{
                  height: 6,
                  width: "67%",
                  backgroundColor: colors.accentWarm,
                  borderRadius: 6,
                }}
              />
            </View>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
              Poglavlje 4 od 6 zavrseno
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
