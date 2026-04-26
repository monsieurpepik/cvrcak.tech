import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import { supabase } from "../lib/supabase";

type Citation = { page: number; excerpt: string };
type QuickResponse = { answer: string; citations: Citation[] } | null;

const SUGGESTED: string[] = [
  "Kako se nađe NZN?",
  "Zašto ne možemo samo sabirati brojnike?",
  "Kako se sabira 1/2 i 1/3?",
];

export default function HomeScreen() {
  const [showVoiceTip, setShowVoiceTip] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-280)).current;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickResponse, setQuickResponse] = useState<QuickResponse>(null);

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

  async function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    setQuickResponse(null);
    try {
      const { data, error } = await supabase.functions.invoke("ask", {
        body: { question: text },
      });
      if (error) throw error;
      setQuickResponse({
        answer: data.answer ?? "Nešto nije u redu.",
        citations: data.citations ?? [],
      });
    } catch {
      setQuickResponse({
        answer: "Nema interneta. Provjeri vezu i pokušaj ponovo.",
        citations: [],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >

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
                <Text style={{ fontFamily: fonts.displayItalic, color: colors.accentTeal }}>
                  Marko
                </Text>
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: colors.popTeal,
                borderRadius: radius.pill,
                paddingVertical: 5,
                paddingHorizontal: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 15,
                  color: colors.ink,
                }}
              >
                Lekcije
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
            </View>

            {/* Active episode card */}
            <TouchableOpacity
              onPress={() => router.push("/chapter")}
              activeOpacity={0.9}
              style={{
                backgroundColor: colors.ink,
                borderRadius: radius.hero,
                padding: 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.18,
                shadowRadius: 16,
                elevation: 4,
                overflow: "hidden",
              }}
            >
              {/* Top highlight overlay */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 60,
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderTopLeftRadius: radius.hero,
                  borderTopRightRadius: radius.hero,
                  pointerEvents: "none",
                }}
              />
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
                  color: colors.accentTeal,
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

            {/* Suggested questions */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
            >
              {SUGGESTED.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => send(q)}
                  activeOpacity={0.75}
                  style={{
                    backgroundColor: colors.popPeach,
                    borderRadius: radius.pill,
                    paddingVertical: 9,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink }}>
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Matematika 2 visual card */}
            <TouchableOpacity
              onPress={() => router.push("/visual-chapter")}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.popLavender,
                borderRadius: radius.hero,
                padding: 20,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
                elevation: 2,
              }}
            >
              {/* Subject label + CRA dots */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <Text
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    color: colors.accentTeal,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Matematika 2 · Poglavlje 1
                </Text>
                {/* Three dots: Concrete (peach) → Representational (purple) → Abstract (ink) */}
                <View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.popPeach }} />
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.popLavender }} />
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink }} />
                </View>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 19,
                  color: colors.ink,
                  lineHeight: 26,
                  marginBottom: 14,
                }}
              >
                Sabiranje do 20
              </Text>

              {/* Badge + CTA */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View
                  style={{
                    backgroundColor: "rgba(255,255,255,0.55)",
                    borderRadius: radius.pill,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontFamily: fonts.monoMedium, fontSize: 10, color: colors.ink3 }}>
                    Vizuelno
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink }}>
                  Počni →
                </Text>
              </View>
            </TouchableOpacity>

            {/* Coming-soon card */}
            <View
              style={{
                borderRadius: radius.card,
                borderWidth: 1.5,
                borderColor: colors.line,
                borderStyle: "dashed",
                padding: spacing.cardPadding,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    color: colors.muted,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 4,
                  }}
                >
                  Matematika 5 · Poglavlje 5
                </Text>
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.muted }}>
                  Množenje razlomaka
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.muted }}>
                uskoro
              </Text>
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.ink }}>
                Pitaj pitanje
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
            </View>

            {/* Inline response card */}
            {quickResponse && (
              <View
                style={{
                  marginBottom: 12,
                  backgroundColor: colors.cream,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: 14,
                }}
              >
                <TouchableOpacity
                  onPress={() => setQuickResponse(null)}
                  style={{ position: "absolute", top: 10, right: 10, padding: 4 }}
                  hitSlop={8}
                >
                  <Text style={{ color: colors.muted, fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
                <Text
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 14,
                    color: colors.ink,
                    lineHeight: 20,
                    paddingRight: 20,
                  }}
                  numberOfLines={5}
                >
                  {quickResponse.answer}
                </Text>
                {quickResponse.citations.length > 0 && (
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}
                  >
                    {quickResponse.citations.map((c, i) => (
                      <View
                        key={i}
                        style={{
                          backgroundColor: colors.popPeach,
                          borderRadius: radius.pill,
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                        }}
                      >
                        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.ink }}>
                          str. {c.page}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                <TouchableOpacity
                  onPress={() => router.push("/chat")}
                  style={{ marginTop: 10 }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.accentTeal }}>
                    Nastavi razgovor →
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Loading indicator */}
            {loading && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                  paddingHorizontal: 4,
                }}
              >
                <ActivityIndicator size="small" color={colors.muted} />
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>
                  Cvrčak razmišlja...
                </Text>
              </View>
            )}

            {/* Voice tip tooltip */}
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

              {/* Input row */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  backgroundColor: colors.cream,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: colors.line,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                }}
              >
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Šta te muči danas?"
                  placeholderTextColor={colors.muted}
                  style={{
                    flex: 1,
                    fontFamily: fonts.body,
                    fontSize: 15,
                    color: colors.ink,
                  }}
                  returnKeyType="send"
                  onSubmitEditing={() => send()}
                  blurOnSubmit={false}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={input.trim() ? () => send() : handleMicPress}
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
                  {input.trim() ? (
                    <Text style={{ color: colors.cream, fontSize: 16 }}>↑</Text>
                  ) : (
                    <Text style={{ fontSize: 16 }}>🎤</Text>
                  )}
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

        </KeyboardAvoidingView>

        {/* Drawer backdrop — absolute positioned, outside KeyboardAvoidingView */}
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

        {/* Drawer panel — absolute positioned, outside KeyboardAvoidingView */}
        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 260,
            backgroundColor: colors.cream2,
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

          {/* Avatar + user info */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 32 }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.ink,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: fonts.displayItalic, fontSize: 24, color: colors.cream }}>M</Text>
            </View>
            <View>
              <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.ink }}>Marko</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>5. razred</Text>
                <View
                  style={{
                    backgroundColor: colors.popPeach,
                    borderRadius: radius.pill,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Text style={{ fontSize: 10 }}>🔥</Text>
                  <Text style={{ fontFamily: fonts.monoMedium, fontSize: 11, color: colors.ink }}>12</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: colors.line, marginBottom: 4 }} />

          {/* Roditelji */}
          <TouchableOpacity
            onPress={() => navigateTo("/roditelj")}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 18,
            }}
          >
            <View>
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink }}>
                Roditelji
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 }}>
                Pregled napretka djeteta
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: colors.ink3 }}>›</Text>
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: colors.line }} />

          {/* Nastavnici */}
          <TouchableOpacity
            onPress={() => navigateTo("/nastavnik")}
            activeOpacity={0.8}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 18,
            }}
          >
            <View>
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink }}>
                Nastavnici
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 2 }}>
                Upravljanje sadržajem
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: colors.ink3 }}>›</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}
