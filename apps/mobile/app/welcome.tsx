import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radius } from "../theme/tokens";

const ROLES = [
  {
    id: "ucenik",
    label: "Učenik",
    desc: "Slušaj lekcije i pitaj pitanja",
    icon: "school-outline" as const,
    bg: colors.popPeach,
    route: "/",
  },
  {
    id: "roditelj",
    label: "Roditelj",
    desc: "Prati napredak svog djeteta",
    icon: "heart-outline" as const,
    bg: "#D6EFE0",
    route: "/roditelj",
  },
  {
    id: "nastavnik",
    label: "Nastavnik",
    desc: "Pregled napretka cijelog razreda",
    icon: "people-outline" as const,
    bg: colors.popLavender,
    route: "/nastavnik",
  },
];

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.pagePadding,
          gap: 32,
          paddingBottom: 40,
          flexGrow: 1,
          justifyContent: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={{ alignItems: "center", gap: 12 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.pill,
              backgroundColor: colors.ink,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontFamily: fonts.displayItalic, fontSize: 28, color: colors.cream }}>
              C
            </Text>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>
              Dobrodošli u{" "}
              <Text style={{ fontFamily: fonts.displayItalic, color: colors.accentWarm }}>
                Cvrčak
              </Text>
            </Text>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.muted, textAlign: "center" }}>
              Audio lekcije iz udžbenika, pitanja, kvizovi.
            </Text>
          </View>
        </View>

        {/* Role selection */}
        <View style={{ gap: 12 }}>
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: colors.ink3,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              textAlign: "center",
            }}
          >
            Ko ste vi?
          </Text>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => router.replace(role.route as any)}
              activeOpacity={0.85}
              style={{
                backgroundColor: colors.cream,
                borderRadius: radius.card,
                borderWidth: 1,
                borderColor: colors.line,
                padding: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: role.bg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={role.icon} size={22} color={colors.ink2} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.ink }}>
                  {role.label}
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>
                  {role.desc}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </TouchableOpacity>
          ))}
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
          OŠ Hasan Kikić · 5. razred
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
