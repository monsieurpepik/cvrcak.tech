import { useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Animated, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, radius, spacing } from "../theme/tokens";

export default function HomeScreen() {
  const [showVoiceTip, setShowVoiceTip] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-280)).current;

  function handleMicPress() {
    setShowVoiceTip(true);
    setTimeout(() => setShowVoiceTip(false), 2000);
  }

  function openDrawer() {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }

  function closeDrawer() {
    Animated.timing(drawerAnim, {
      toValue: -280,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  }

  function navigateTo(route: string) {
    closeDrawer();
    setTimeout(() => router.push(route as any), 220);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      <View style={{ flex: 1 }}>

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.pagePadding,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <TouchableOpacity onPress={openDrawer} activeOpacity={0.7}>
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
                <Text style={{ fontFamily: fonts.displayItalic, fontSize: 14, color: colors.cream }}>
                  C
                </Text>
              </View>
            </TouchableOpacity>
            <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.ink }}>
              Zdravo,{" "}
              <Text style={{ fontFamily: fonts.displayItalic, color: colors.accentWarm }}>
                Marko
              </Text>
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: colors.popPeach,
              borderRadius: radius.pill,
              paddingVertical: 5,
              paddingHorizontal: 10,
            }}
          >
            <Text style={{ fontSize: 12 }}>🔥</Text>
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 12, color: colors.ink }}>
              12
            </Text>
          </View>
        </View>

        {/* Lesson zone */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.pagePadding,
            paddingBottom: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 12,
            }}
          >
            Lekcije
          </Text>

          {/* Active episode card */}
          <TouchableOpacity
            onPress={() => router.push("/chapter")}
            activeOpacity={0.9}
            style={{
              backgroundColor: colors.ink,
              borderRadius: radius.hero,
              padding: 20,
              marginBottom: 12,
            }}
          >
            {/* Speaker chips */}
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: radius.pill,
                  paddingVertical: 4,
                  paddingLeft: 4,
                  paddingRight: 10,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: radius.pill,
                    backgroundColor: colors.popPeach,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: fonts.displayItalic, fontSize: 10, color: colors.ink }}>
                    N
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.popPeach }}>
                  Nastavnica
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: radius.pill,
                  paddingVertical: 4,
                  paddingLeft: 4,
                  paddingRight: 10,
                }}
              >
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: radius.pill,
                    backgroundColor: colors.cream,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: fonts.displayItalic, fontSize: 10, color: colors.ink }}>
                    M
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.cream }}>
                  Marko
                </Text>
              </View>
            </View>

            {/* Subject label */}
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: colors.accentWarm,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              Matematika 5 · Poglavlje 4
            </Text>

            {/* Title */}
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 19,
                color: colors.cream,
                lineHeight: 26,
                marginBottom: 8,
              }}
            >
              Sabiranje razlomaka sa različitim nazivnicima
            </Text>

            {/* Duration */}
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.muted }}>
              ~8 min
            </Text>

            {/* Play row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: radius.pill,
                  backgroundColor: colors.popPeach,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18, color: colors.ink, marginLeft: 3 }}>▶</Text>
              </View>
              <View>
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.cream }}>
                  Slušaj lekciju
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 1 }}>
                  Audio pregled · 2 glasa
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Coming-soon card */}
          <View
            style={{
              backgroundColor: colors.cream3,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.line,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: 0.6,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  color: colors.accentWarm,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Matematika 5 · Poglavlje 5
              </Text>
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink }}>
                Množenje razlomaka
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.popLavender,
                borderRadius: radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 10, color: colors.ink3 }}>
                Uskoro
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Chat zone — pinned bottom */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.line,
            paddingHorizontal: spacing.pagePadding,
            paddingTop: 16,
            paddingBottom: 36,
            backgroundColor: colors.cream2,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 10,
            }}
          >
            Pitaj pitanje
          </Text>

          <View style={{ position: "relative" }}>
            {showVoiceTip && (
              <View
                style={{
                  position: "absolute",
                  bottom: 52,
                  right: 0,
                  backgroundColor: colors.ink,
                  borderRadius: radius.pill,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  zIndex: 10,
                }}
              >
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.cream }}>
                  Glasovni unos uskoro
                </Text>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: colors.cream,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: colors.line,
                paddingVertical: 12,
                paddingHorizontal: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => router.push("/chat")}
                activeOpacity={0.85}
                style={{ flex: 1 }}
              >
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 15,
                    color: colors.muted,
                  }}
                >
                  Šta te muči danas?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMicPress}
                activeOpacity={0.75}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radius.pill,
                  backgroundColor: colors.ink,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 16 }}>🎤</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 11,
              color: colors.muted,
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Pitaj o gradivu iz knjige · Cvrčak odgovara
          </Text>
        </View>

        {/* Drawer backdrop */}
        {drawerOpen && (
          <Pressable
            onPress={closeDrawer}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              zIndex: 20,
            }}
          />
        )}

        {/* Drawer panel */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 260,
            backgroundColor: colors.cream,
            zIndex: 21,
            transform: [{ translateX: drawerAnim }],
            paddingTop: 56,
            paddingHorizontal: 24,
            shadowColor: "#000",
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Close button */}
          <TouchableOpacity
            onPress={closeDrawer}
            activeOpacity={0.7}
            style={{ position: "absolute", top: 20, right: 20, padding: 4 }}
          >
            <Text style={{ fontSize: 16, color: colors.ink3 }}>✕</Text>
          </TouchableOpacity>

          {/* User info */}
          <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>
            Marko
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted, marginTop: 2, marginBottom: 24 }}>
            5. razred
          </Text>

          <View style={{ height: 1, backgroundColor: colors.line, marginBottom: 8 }} />

          {/* Kviz */}
          <TouchableOpacity
            onPress={() => navigateTo("/kviz")}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 16,
            }}
          >
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink }}>
              Kviz
            </Text>
            <View
              style={{
                backgroundColor: colors.popLavender,
                borderRadius: radius.pill,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ fontFamily: fonts.monoMedium, fontSize: 10, color: colors.ink3 }}>
                Uskoro
              </Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: colors.line2 }} />

          {/* Roditelji */}
          <TouchableOpacity
            onPress={() => navigateTo("/roditelj")}
            activeOpacity={0.8}
            style={{ paddingVertical: 16 }}
          >
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink }}>
              Roditelji
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 }}>
              Pregled napretka djeteta
            </Text>
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: colors.line2 }} />

          {/* Nastavnici */}
          <TouchableOpacity
            onPress={() => navigateTo("/nastavnik")}
            activeOpacity={0.8}
            style={{ paddingVertical: 16 }}
          >
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink }}>
              Nastavnici
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 }}>
              Upravljanje sadržajem
            </Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}
