import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radius } from "../theme/tokens";

const BOOKS = [
  { subject: "Matematika 5", progress: 0.67, active: true, iconBg: colors.popPeach },
  { subject: "Bosanski 5", progress: 0.82, active: false, iconBg: colors.popLavender },
];

const TABS = [
  { label: "Početna", icon: "home-outline" as const, active: true, route: null },
  { label: "Pitanja", icon: "chatbubble-outline" as const, active: false, route: "/chat" },
  { label: "Audio", icon: "headset-outline" as const, active: false, route: "/chapter" },
  { label: "Kviz", icon: "checkbox-outline" as const, active: false, route: "/kviz" },
  { label: "Ja", icon: "person-outline" as const, active: false, route: "/ja" },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.pagePadding,
          gap: 24,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header: brand mark + streak */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: radius.pill,
              backgroundColor: colors.ink,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 16, color: colors.cream }}>
              C
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/ja")}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              backgroundColor: colors.popPeach,
              borderRadius: radius.pill,
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            <Text style={{ fontSize: 14 }}>🔥</Text>
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 13, color: colors.ink }}>
              12
            </Text>
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={{ gap: 2 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.ink }}>
            Zdravo,{" "}
            <Text style={{ fontFamily: fonts.displayItalic, color: colors.accentWarm }}>
              Marko!
            </Text>
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.muted }}>
            5. razred · OŠ Hasan Kikić
          </Text>
        </View>

        {/* Focus card (dark) */}
        <View
          style={{
            backgroundColor: colors.ink,
            borderRadius: radius.hero,
            padding: 20,
            gap: 16,
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
            Danas za vježbati
          </Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.cream, lineHeight: 28 }}>
            Sabiranje razlomaka sa različitim nazivnicima
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>
            Matematika · Poglavlje 4 · ~8 min
          </Text>

          {/* Play button row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/chapter")}
              activeOpacity={0.85}
              style={{
                width: 52,
                height: 52,
                borderRadius: radius.pill,
                backgroundColor: colors.popPeach,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="play" size={22} color={colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/chapter")} activeOpacity={0.7}>
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.cream }}>
                Slušaj lekciju
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 1 }}>
                Nastavi gdje si stao
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inline chat bar */}
        <TouchableOpacity
          onPress={() => router.push("/chat")}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            backgroundColor: colors.cream,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: colors.line,
            paddingVertical: 14,
            paddingHorizontal: 18,
          }}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.muted} />
          <Text style={{ fontFamily: fonts.body, fontSize: 15, color: colors.muted, flex: 1 }}>
            Pitaj o sabiranju razlomaka...
          </Text>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: radius.pill,
              backgroundColor: colors.ink,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-up" size={15} color={colors.cream} />
          </View>
        </TouchableOpacity>

        {/* Moje knjige */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
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
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accentWarm }}>
              Sve
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {BOOKS.map((book) => (
              <TouchableOpacity
                key={book.subject}
                onPress={() => book.active && router.push("/chapter")}
                activeOpacity={book.active ? 0.85 : 1}
                style={{
                  flex: 1,
                  backgroundColor: colors.cream,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: 16,
                  gap: 12,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: book.iconBg,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="book-outline" size={20} color={colors.ink2} />
                  </View>

                  {!book.active && (
                    <View
                      style={{
                        backgroundColor: colors.popLavender,
                        borderRadius: radius.pill,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                      }}
                    >
                      <Text style={{ fontFamily: fonts.monoMedium, fontSize: 10, color: colors.ink3 }}>
                        Uskoro
                      </Text>
                    </View>
                  )}
                </View>

                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: colors.ink }}>
                  {book.subject}
                </Text>

                <View style={{ height: 5, backgroundColor: colors.line2, borderRadius: 5 }}>
                  <View
                    style={{
                      height: 5,
                      width: `${book.progress * 100}%`,
                      backgroundColor: colors.accentWarm,
                      borderRadius: 5,
                    }}
                  />
                </View>

                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
                  {Math.round(book.progress * 100)}% završeno
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Tab bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.cream,
          borderTopWidth: 1,
          borderTopColor: colors.line,
          flexDirection: "row",
          paddingBottom: 28,
          paddingTop: 10,
        }}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            onPress={() => tab.route && router.push(tab.route as any)}
            activeOpacity={tab.route ? 0.7 : 1}
            style={{ flex: 1, alignItems: "center", gap: 4 }}
          >
            {tab.active && (
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  width: 20,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: colors.accentWarm,
                }}
              />
            )}
            <Ionicons
              name={tab.icon}
              size={22}
              color={tab.active ? colors.ink : colors.muted}
            />
            <Text
              style={{
                fontFamily: tab.active ? fonts.bodyMedium : fonts.body,
                fontSize: 10,
                color: tab.active ? colors.ink : colors.muted,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}
