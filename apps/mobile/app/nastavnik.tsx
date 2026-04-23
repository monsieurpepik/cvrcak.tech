import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, spacing, radius } from "../theme/tokens";

const CLASS_STATS = [
  { label: "Učenici aktivni", value: "18", unit: "od 24", icon: "people-outline" as const, bg: colors.popLavender },
  { label: "Avg. napredak", value: "58%", unit: "u poglavlju", icon: "bar-chart-outline" as const, bg: "#D6EFE0" },
  { label: "Pitanja danas", value: "47", unit: "ukupno razred", icon: "chatbubble-outline" as const, bg: colors.popPeach },
];

const STUDENTS = [
  { name: "Marko P.", progress: 0.67, quiz: 80, active: true, streak: 12, struggling: false },
  { name: "Amina K.", progress: 0.83, quiz: 95, active: true, streak: 7, struggling: false },
  { name: "Tarik H.", progress: 0.42, quiz: 60, active: true, streak: 3, struggling: true },
  { name: "Lejla M.", progress: 0.75, quiz: 85, active: true, streak: 5, struggling: false },
  { name: "Jasmin S.", progress: 0.25, quiz: 40, active: false, streak: 0, struggling: true },
  { name: "Sara B.", progress: 0.91, quiz: 100, active: true, streak: 14, struggling: false },
];

const COMMON_QUESTIONS = [
  { q: "Šta je NZN i kako ga nađem?", count: 11 },
  { q: "Zašto ne mogu samo sabrati brojnike?", count: 8 },
  { q: "Kako proširim razlomak?", count: 6 },
];

export default function NastavnikScreen() {
  const struggling = STUDENTS.filter((s) => s.struggling);

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
            Kontrolni panel
          </Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Context card */}
        <View
          style={{
            backgroundColor: colors.ink,
            borderRadius: radius.hero,
            padding: spacing.cardPadding,
            gap: 8,
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
            Aktivna lekcija
          </Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: colors.cream, lineHeight: 26 }}>
            Sabiranje razlomaka sa razlicitim nazivnicima
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.muted }}>
            Matematika 5 · Poglavlje 4 · 5-1 razred
          </Text>
        </View>

        {/* Class stats */}
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
            Pregled razreda
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {CLASS_STATS.map((stat) => (
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
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 18, color: colors.ink }}>
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

        {/* Struggling students alert */}
        {struggling.length > 0 && (
          <View
            style={{
              backgroundColor: colors.cream,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.warning + "80",
              padding: 14,
              gap: 10,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.warning} />
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink }}>
                Trebaju pažnju
              </Text>
            </View>
            {struggling.map((s) => (
              <View
                key={s.name}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink2 }}>
                  {s.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.muted }}>
                    {Math.round(s.progress * 100)}% napretka
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.warning + "25",
                      borderRadius: radius.pill,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.mono,
                        fontSize: 11,
                        color: colors.warning,
                      }}
                    >
                      {s.quiz}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Student list */}
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
              Ucenici
            </Text>
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.accentWarm }}>
              Svi ({STUDENTS.length})
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            {STUDENTS.map((student) => (
              <View
                key={student.name}
                style={{
                  backgroundColor: colors.cream,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: student.struggling ? colors.warning + "40" : colors.line,
                  padding: 14,
                  gap: 8,
                  opacity: student.active ? 1 : 0.55,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: radius.pill,
                        backgroundColor: student.struggling ? colors.warning + "20" : colors.popPeach,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.displayItalic,
                          fontSize: 16,
                          color: colors.ink,
                        }}
                      >
                        {student.name[0]}
                      </Text>
                    </View>
                    <View style={{ gap: 1 }}>
                      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.ink }}>
                        {student.name}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        {student.streak > 0 ? (
                          <>
                            <Text style={{ fontSize: 11 }}>🔥</Text>
                            <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.muted }}>
                              {student.streak}d
                            </Text>
                          </>
                        ) : (
                          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
                            Neaktivan
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 2 }}>
                    <View
                      style={{
                        backgroundColor:
                          student.quiz >= 80
                            ? colors.success + "20"
                            : student.quiz >= 60
                            ? colors.warning + "20"
                            : colors.danger + "15",
                        borderRadius: radius.pill,
                        paddingHorizontal: 10,
                        paddingVertical: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.mono,
                          fontSize: 12,
                          color:
                            student.quiz >= 80
                              ? colors.success
                              : student.quiz >= 60
                              ? colors.warning
                              : colors.danger,
                        }}
                      >
                        {student.quiz}%
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={{ height: 3, backgroundColor: colors.line2, borderRadius: 3 }}>
                  <View
                    style={{
                      height: 3,
                      width: `${student.progress * 100}%`,
                      backgroundColor: student.struggling ? colors.warning : colors.accentWarm,
                      borderRadius: 3,
                    }}
                  />
                </View>
                <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
                  {Math.round(student.progress * 100)}% poglavlja zavrseno
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Common questions */}
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
            Najcesca pitanja razreda
          </Text>
          <View style={{ gap: 8 }}>
            {COMMON_QUESTIONS.map((item, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  backgroundColor: colors.cream,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.line,
                  padding: 14,
                }}
              >
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: radius.pill,
                    backgroundColor: colors.line2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: fonts.monoMedium, fontSize: 12, color: colors.ink3 }}>
                    {i + 1}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: colors.ink2, flex: 1, lineHeight: 19 }}>
                  {item.q}
                </Text>
                <View
                  style={{
                    backgroundColor: colors.popPeach,
                    borderRadius: radius.pill,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontFamily: fonts.monoMedium, fontSize: 12, color: colors.ink }}>
                    ×{item.count}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted }}>
            Ova pitanja mozete obraditi uzivo na sljedecoj lekciji.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
