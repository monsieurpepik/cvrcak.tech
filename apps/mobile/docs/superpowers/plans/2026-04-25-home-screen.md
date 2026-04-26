# Student Home Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a student home screen at `/` with two zones — lesson cards above, persistent chat bar below — so kids can either browse lessons or ask a question directly.

**Architecture:** `app/index.tsx` becomes the home screen component (replacing the current `<Redirect>`). `app/welcome.tsx` is updated to route to `/` instead of `/chapter`. No new files needed — both changes are surgical edits to existing files.

**Tech Stack:** Expo Router, React Native core primitives, `react-native-safe-area-context`, theme tokens from `theme/tokens.ts`.

---

### Task 1: Build the home screen in `app/index.tsx`

**Files:**
- Modify: `app/index.tsx` (replace redirect with full home screen component)

- [ ] **Step 1: Read the current file**

  Read `app/index.tsx`. Confirm it contains only the `<Redirect href="/welcome" />` component and the v1 home screen commented out. This is the baseline.

- [ ] **Step 2: Replace the file contents**

  Write the following as the complete contents of `app/index.tsx`:

  ```tsx
  import { View, Text, TouchableOpacity, ScrollView } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { router } from "expo-router";
  import { colors, fonts, radius, spacing } from "../theme/tokens";

  export default function HomeScreen() {
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

            <TouchableOpacity
              onPress={() => router.push("/chat")}
              activeOpacity={0.85}
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
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 15,
                  color: colors.muted,
                  flex: 1,
                }}
              >
                Šta te muči danas?
              </Text>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: radius.pill,
                  backgroundColor: colors.ink,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.cream, fontSize: 14 }}>↑</Text>
              </View>
            </TouchableOpacity>

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

        </View>
      </SafeAreaView>
    );
  }
  ```

- [ ] **Step 3: Run TypeScript check**

  ```bash
  cd /Users/bobanpepic/cvrcak.code/apps/mobile && npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  cd /Users/bobanpepic/cvrcak.code/apps/mobile
  git add app/index.tsx
  git commit -m "feat: add student home screen with lesson cards and chat bar"
  ```

---

### Task 2: Fix welcome screen routing

**Files:**
- Modify: `app/welcome.tsx` (change `router.replace("/chapter")` to `router.replace("/")`  on line 89)

- [ ] **Step 1: Read the current file**

  Read `app/welcome.tsx`. Confirm line 89 contains `router.replace("/chapter")`.

- [ ] **Step 2: Update the route target**

  Change:
  ```tsx
  onPress={() => router.replace("/chapter")}
  ```
  To:
  ```tsx
  onPress={() => router.replace("/")}
  ```

- [ ] **Step 3: Run TypeScript check**

  ```bash
  cd /Users/bobanpepic/cvrcak.code/apps/mobile && npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  cd /Users/bobanpepic/cvrcak.code/apps/mobile
  git add app/welcome.tsx
  git commit -m "fix: welcome Počni routes to home screen instead of chapter"
  ```
