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
                  color: colors.accentTeal,
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
            onPress={() => router.replace("/home")}
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
