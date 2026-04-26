# Welcome Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the role-picker welcome screen with a pure brand screen that routes straight to `/chapter` on a single "Počni" tap.

**Architecture:** `app/welcome.tsx` is rewritten in place — same file, same Expo Router route. All role-picker logic and the PostHog `role_selected` event are removed. The screen renders a vertically centered brand block (logo, heading, tagline, CTA) and a pinned footer. No new files, no new tokens.

**Tech Stack:** Expo Router, React Native core primitives (`View`, `Text`, `TouchableOpacity`), `react-native-safe-area-context`, theme tokens from `theme/tokens.ts`.

---

### Task 1: Rewrite `app/welcome.tsx`

**Files:**
- Modify: `app/welcome.tsx` (full rewrite — delete role-picker, replace with brand screen)

- [ ] **Step 1: Open the file and confirm current content**

  Read `app/welcome.tsx`. Confirm it contains the `ROLES` array and three role cards. This is the baseline you are replacing.

- [ ] **Step 2: Rewrite the file**

  Replace the entire contents of `app/welcome.tsx` with:

  ```tsx
  import { View, Text, TouchableOpacity } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { router } from "expo-router";
  import { colors, fonts, radius, spacing } from "../theme/tokens";

  export default function WelcomeScreen() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: spacing.pagePadding,
            paddingBottom: 36,
          }}
        >
          {/* Center block */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
            }}
          >
            {/* Logo */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: radius.pill,
                backgroundColor: colors.ink,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.displayItalic,
                  fontSize: 28,
                  color: colors.cream,
                }}
              >
                C
              </Text>
            </View>

            {/* Heading + tagline */}
            <View style={{ alignItems: "center", gap: 6 }}>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 30,
                  color: colors.ink,
                  lineHeight: 36,
                  textAlign: "center",
                }}
              >
                Dobrodošli u{" "}
                <Text
                  style={{
                    fontFamily: fonts.displayItalic,
                    color: colors.accentWarm,
                  }}
                >
                  Cvrčak
                </Text>
              </Text>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.muted,
                  lineHeight: 22,
                  textAlign: "center",
                  maxWidth: 260,
                }}
              >
                Znanje u džepu.
              </Text>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => router.replace("/chapter")}
              activeOpacity={0.85}
              style={{
                marginTop: 12,
                backgroundColor: colors.ink,
                borderRadius: radius.pill,
                paddingVertical: 17,
                width: "100%",
                maxWidth: 280,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 16,
                  color: colors.cream,
                  letterSpacing: 0.2,
                }}
              >
                Počni
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 12,
              color: colors.muted,
              textAlign: "center",
            }}
          >
            cvrcak.ai
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  ```

- [ ] **Step 3: Verify no unused imports remain**

  The rewrite removes `ScrollView`, `Ionicons`, `usePostHog`, and the `ROLES` array. Confirm none of these appear in the new file.

- [ ] **Step 4: Run TypeScript check**

  ```bash
  cd /Users/bobanpepic/cvrcak.code/apps/mobile && npx tsc --noEmit
  ```

  Expected: no errors. If you see `Cannot find name 'router'` or similar, confirm `expo-router` is imported correctly.

- [ ] **Step 5: Commit**

  ```bash
  cd /Users/bobanpepic/cvrcak.code/apps/mobile
  git add app/welcome.tsx
  git commit -m "feat: replace role-picker welcome with pure brand screen"
  ```

---

### Task 2: Smoke test on device

**Files:** none — test only

- [ ] **Step 1: Start the dev server**

  ```bash
  cd /Users/bobanpepic/cvrcak.code/apps/mobile && npx expo run:ios --device Moonshot
  ```

- [ ] **Step 2: Verify welcome screen appearance**

  On device, confirm:
  - Background is warm cream (`#FDF6E8`)
  - Ink circle logo with italic "C" visible, centered
  - Heading: "Dobrodošli u Cvrčak" with "Cvrčak" in amber
  - Tagline: "Znanje u džepu." in muted gray below heading
  - Full-width dark pill button labeled "Počni"
  - Footer "cvrcak.ai" pinned at bottom

- [ ] **Step 3: Verify navigation**

  Tap "Počni". Confirm the app navigates to the chapter screen (audio player). Confirm there is no home screen or role picker in the path.

- [ ] **Step 4: Verify back navigation is gone**

  On the chapter screen, confirm there is no back arrow to welcome (router.replace replaces the stack, so welcome is not in history).
