import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { supabase } from "../lib/supabase";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import TapChoices from "../components/TapChoices";
import FractionVisual from "../components/FractionVisual";

// Grades 1-4 subject colors (from sketch findings, separate from system.css tokens)
const MATH_ORANGE = "#FF6B35";
const MATH_BG = "#FFF0EB";

type Phase = "greeting" | "conversation" | "quiz" | "reward";

type Exercise = {
  id: number;
  question: string;
  visual: { numerator: number; denominator: number };
  choices: [
    { label: string; correct: boolean },
    { label: string; correct: boolean },
    { label: string; correct: boolean },
    { label: string; correct: boolean }
  ];
  feedback_correct: string;
  feedback_wrong: string;
};

const GREETING_TEXT =
  "Bok! Ja sam Cvrčak. Danas učimo razlomke. Pitaj me šta hoćeš ili počni vježbati!";

const EXERCISES: Exercise[] = [
  {
    id: 1,
    question: "Koliko je 1/2 + 1/4?",
    visual: { numerator: 3, denominator: 4 },
    choices: [
      { label: "2/6", correct: false },
      { label: "3/4", correct: true },
      { label: "1/6", correct: false },
      { label: "1/2", correct: false },
    ],
    feedback_correct: "Tačno! Tri četvrtine. Bravo!",
    feedback_wrong: "Nije to. Pogledaj krugiće ponovo.",
  },
  {
    id: 2,
    question: "Koja slika pokazuje 2/3?",
    visual: { numerator: 2, denominator: 3 },
    choices: [
      { label: "1/3", correct: false },
      { label: "2/3", correct: true },
      { label: "3/3", correct: false },
      { label: "2/4", correct: false },
    ],
    feedback_correct: "Odlično! Dva od tri dijela su popunjena.",
    feedback_wrong: "Pogledaj koliko je kvadratića popunjeno.",
  },
  {
    id: 3,
    question: "Koliko je 3/4 - 1/4?",
    visual: { numerator: 2, denominator: 4 },
    choices: [
      { label: "2/4", correct: true },
      { label: "4/4", correct: false },
      { label: "1/4", correct: false },
      { label: "2/8", correct: false },
    ],
    feedback_correct: "Tačno! Dva od četiri dijela ostaju.",
    feedback_wrong: "Oduzmi jedan dio od tri dijela.",
  },
];

function useKaraoke() {
  const [words, setWords] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function play(text: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    setWords([]);
    const allWords = text.split(" ");
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i >= allWords.length) {
        clearInterval(timerRef.current!);
        return;
      }
      setWords((prev) => [...prev, allWords[i]]);
      i++;
    }, 210);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { karaokeText: words.join(" "), play };
}

export default function BuddyScreen() {
  const [phase, setPhase] = useState<Phase>("greeting");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { karaokeText, play } = useKaraoke();

  // Apple bob animation
  const bobY = useSharedValue(0);
  useEffect(() => {
    bobY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);
  const appleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bobY.value }],
  }));

  // Start greeting karaoke on mount
  useEffect(() => {
    play(GREETING_TEXT);
  }, []);

  async function sendQuestion() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("buddy-ask", {
        body: { question: text },
      });
      if (error) throw error;
      play(data.answer ?? "Pokušaj ponovo.");
    } catch {
      play("Nema interneta. Provjeri vezu.");
    } finally {
      setLoading(false);
    }
  }

  function startQuiz() {
    setPhase("quiz");
    setExerciseIndex(0);
    setScore(0);
    setShowFeedback(false);
    play(EXERCISES[0].question);
  }

  function handleQuizResult(wasCorrect: boolean) {
    setScore((s) => s + (wasCorrect ? 1 : 0));
    setShowFeedback(true);
    const ex = EXERCISES[exerciseIndex];
    play(wasCorrect ? ex.feedback_correct : ex.feedback_wrong);
  }

  function nextExercise() {
    const next = exerciseIndex + 1;
    if (next >= EXERCISES.length) {
      setPhase("reward");
      play("Završio si! Odlično si radio danas.");
    } else {
      setExerciseIndex(next);
      setShowFeedback(false);
      play(EXERCISES[next].question);
    }
  }

  const currentExercise = EXERCISES[exerciseIndex];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MATH_BG }}>
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
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            style={{
              backgroundColor: "rgba(0,0,0,0.06)",
              borderRadius: radius.pill,
              paddingHorizontal: 14,
              paddingVertical: 7,
            }}
          >
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink }}>
              Natrag
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              color: MATH_ORANGE,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Matematika · Razlomci
          </Text>

          {phase === "quiz" && (
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 12, color: colors.ink3 }}>
              {exerciseIndex + 1}/{EXERCISES.length}
            </Text>
          )}
          {phase !== "quiz" && <View style={{ width: 60 }} />}
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: spacing.pagePadding,
            paddingBottom: 16,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Stage: apple character */}
          <View style={{ alignItems: "center", paddingVertical: 24 }}>
            <Animated.View style={appleStyle}>
              <Text style={{ fontSize: 72 }}>🍎</Text>
            </Animated.View>
          </View>

          {/* Karaoke text */}
          <View
            style={{
              backgroundColor: colors.cream,
              borderRadius: radius.hero,
              borderWidth: 2,
              borderColor: "rgba(0,0,0,0.06)",
              padding: 18,
              minHeight: 80,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={MATH_ORANGE} />
            ) : (
              <Text
                style={{
                  fontFamily: fonts.bodySemiBold,
                  fontSize: 17,
                  color: colors.ink,
                  textAlign: "center",
                  lineHeight: 26,
                }}
              >
                {karaokeText || " "}
              </Text>
            )}
          </View>

          {/* Quiz: fraction visual */}
          {phase === "quiz" && !showFeedback && (
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <FractionVisual
                numerator={currentExercise.visual.numerator}
                denominator={currentExercise.visual.denominator}
              />
            </View>
          )}

          {/* Reward screen */}
          {phase === "reward" && (
            <View style={{ alignItems: "center", gap: 16, paddingTop: 8 }}>
              <Text style={{ fontSize: 48 }}>🏆</Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontSize: 24,
                  color: colors.ink,
                  textAlign: "center",
                }}
              >
                Sjajno si uradio!
              </Text>
              <Text
                style={{
                  fontFamily: fonts.monoMedium,
                  fontSize: 16,
                  color: MATH_ORANGE,
                }}
              >
                {score}/{EXERCISES.length} tačno
              </Text>
              <TouchableOpacity
                onPress={() => router.replace("/home")}
                style={{
                  backgroundColor: colors.ink,
                  borderRadius: radius.pill,
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  marginTop: 8,
                }}
              >
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.cream }}>
                  Idi kući
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Input area: pinned bottom */}
        {phase !== "reward" && (
          <View
            style={{
              paddingHorizontal: spacing.pagePadding,
              paddingBottom: 28,
              paddingTop: 12,
              gap: 10,
            }}
          >
            {/* Quiz mode: tap choices OR next button */}
            {phase === "quiz" && !showFeedback && (
              <TapChoices
                key={currentExercise.id}
                choices={currentExercise.choices}
                onResult={handleQuizResult}
              />
            )}

            {phase === "quiz" && showFeedback && (
              <TouchableOpacity
                onPress={nextExercise}
                style={{
                  backgroundColor: MATH_ORANGE,
                  borderRadius: radius.pill,
                  height: 52,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: MATH_ORANGE,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream }}>
                  {exerciseIndex + 1 < EXERCISES.length ? "Sljedeći zadatak" : "Završi"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Conversation mode or greeting: text input + quiz start button */}
            {(phase === "conversation" || phase === "greeting") && (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: colors.cream,
                    borderRadius: radius.pill,
                    borderWidth: 2,
                    borderColor: "rgba(0,0,0,0.08)",
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                  }}
                >
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Pitaj Cvrčaka..."
                    placeholderTextColor={colors.muted}
                    style={{
                      flex: 1,
                      fontFamily: fonts.body,
                      fontSize: 15,
                      color: colors.ink,
                    }}
                    returnKeyType="send"
                    onSubmitEditing={sendQuestion}
                    blurOnSubmit={false}
                    editable={!loading}
                    onFocus={() => setPhase("conversation")}
                  />
                  <TouchableOpacity
                    onPress={input.trim() ? sendQuestion : undefined}
                    activeOpacity={0.75}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: radius.pill,
                      backgroundColor: input.trim() ? MATH_ORANGE : colors.line,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: input.trim() ? colors.cream : colors.muted, fontSize: 16 }}>
                      {input.trim() ? "↑" : "🎤"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={startQuiz}
                  style={{
                    backgroundColor: colors.ink,
                    borderRadius: radius.pill,
                    height: 52,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.cream }}>
                    Vjezbaj razlomke
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
