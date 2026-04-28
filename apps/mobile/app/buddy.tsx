import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import Reanimated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import {
  useFonts,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from "@expo-google-fonts/baloo-2";
import { supabase } from "../lib/supabase";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import TapChoices from "../components/TapChoices";
import FractionVisual from "../components/FractionVisual";

// Grades 1-4 colors
const MATH_ORANGE = "#FF6B35";
const MATH_BG = "#FFF0EB";

// Claymorphism tokens — local to buddy.tsx only
const CLAY_CARD_STYLES = {
  borderWidth: 3,
  borderColor: "rgba(0,0,0,0.08)",
  borderRadius: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 0,
  elevation: 3,
} as const;

const CLAY_BTN_STYLES = {
  borderWidth: 3,
  borderColor: "rgba(180,60,0,0.2)",
  borderRadius: 100,
  shadowColor: "rgba(180,60,0,1)",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.4,
  shadowRadius: 0,
  elevation: 4,
} as const;

// Drift words — static positions to avoid RN layout warnings
const DRIFT_WORDS = [
  { word: "razlomak",  left: "12%", delay: 0 },
  { word: "sabiranje", left: "55%", delay: 800 },
  { word: "nazivnik",  left: "30%", delay: 1600 },
  { word: "četvrtina", left: "70%", delay: 400 },
  { word: "polovica",  left: "15%", delay: 1200 },
  { word: "cijeli",    left: "45%", delay: 2000 },
] as const;

type Phase = "greeting" | "conversation" | "quiz" | "reward";
type MicState = "idle" | "listening" | "thinking" | "speaking";
type AppleState = "idle" | "listening" | "thinking" | "speaking" | "celebrate" | "wrong";

type DbExercise = {
  id: string;
  question_text: string;
  visual_type: string;
  visual_data: { numerator: number; denominator: number };
  choices: [
    { label: string; correct: boolean },
    { label: string; correct: boolean },
    { label: string; correct: boolean },
    { label: string; correct: boolean }
  ];
  feedback_correct: string;
  feedback_wrong: string;
  sort_order: number;
};

// Fallback exercises if DB fetch fails
const FALLBACK_EXERCISES: DbExercise[] = [
  {
    id: "fallback-1",
    question_text: "Koliko je 1/2 + 1/4?",
    visual_type: "fractions",
    visual_data: { numerator: 3, denominator: 4 },
    choices: [
      { label: "2/6", correct: false },
      { label: "3/4", correct: true },
      { label: "1/6", correct: false },
      { label: "1/2", correct: false },
    ],
    feedback_correct: "Tačno! Tri četvrtine. Bravo!",
    feedback_wrong: "Nije to. Pogledaj krugiće ponovo.",
    sort_order: 1,
  },
  {
    id: "fallback-2",
    question_text: "Koja slika pokazuje 2/3?",
    visual_type: "fractions",
    visual_data: { numerator: 2, denominator: 3 },
    choices: [
      { label: "1/3", correct: false },
      { label: "2/3", correct: true },
      { label: "3/3", correct: false },
      { label: "2/4", correct: false },
    ],
    feedback_correct: "Odlično! Dva od tri dijela su popunjena.",
    feedback_wrong: "Pogledaj koliko je kvadratića popunjeno.",
    sort_order: 2,
  },
  {
    id: "fallback-3",
    question_text: "Koliko je 3/4 - 1/4?",
    visual_type: "fractions",
    visual_data: { numerator: 2, denominator: 4 },
    choices: [
      { label: "2/4", correct: true },
      { label: "4/4", correct: false },
      { label: "1/4", correct: false },
      { label: "2/8", correct: false },
    ],
    feedback_correct: "Tačno! Dva od četiri dijela ostaju.",
    feedback_wrong: "Oduzmi jedan dio od tri dijela.",
    sort_order: 3,
  },
];

const GREETING_TEXT =
  "Bok! Ja sam Cvrčak. Danas učimo razlomke. Pitaj me šta hoćeš ili počni vježbati!";

// ── Karaoke hook ─────────────────────────────────────────────
function useKaraoke() {
  const [displayedWords, setDisplayedWords] = useState<string[]>([]);
  const [totalWords, setTotalWords] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function play(text: string) {
    if (timerRef.current) clearInterval(timerRef.current);
    setDisplayedWords([]);
    const allWords = text.split(" ");
    setTotalWords(allWords);
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i >= allWords.length) {
        clearInterval(timerRef.current!);
        return;
      }
      setDisplayedWords((prev) => [...prev, allWords[i]]);
      i++;
    }, 210);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return { displayedWords, totalWords, play };
}

// ── RippleRing component ──────────────────────────────────────
function RippleRing({ delay, size }: { delay: number; size: number }) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.7,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1350,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0.9, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const half = size / 2;
  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: half,
        borderWidth: 2,
        borderColor: "rgba(255,107,53,0.55)",
        opacity,
        transform: [{ scale }],
      }}
    />
  );
}

// ── DriftWord component ───────────────────────────────────────
function DriftWord({ word, left, delay }: { word: string; left: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.18, duration: 1200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -18, duration: 3000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.driftWord,
        { left: left as any, opacity, transform: [{ translateY }] },
      ]}
    >
      {word}
    </Animated.Text>
  );
}

// ── Main screen ───────────────────────────────────────────────
export default function BuddyScreen() {
  const [fontsLoaded] = useFonts({ Baloo2_700Bold, Baloo2_800ExtraBold });

  const [phase, setPhase] = useState<Phase>("greeting");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [micState, setMicState] = useState<MicState>("idle");
  const [appleState, setAppleState] = useState<AppleState>("idle");
  const [exercises, setExercises] = useState<DbExercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(true);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingStartRef = useRef<number>(0);
  const maxRecordingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fix 6: bouncing dots animated values
  const dotBounce0 = useRef(new Animated.Value(0)).current;
  const dotBounce1 = useRef(new Animated.Value(0)).current;
  const dotBounce2 = useRef(new Animated.Value(0)).current;

  const { displayedWords, totalWords, play } = useKaraoke();

  // ConceptCard slide-up animation
  const conceptCardY = useRef(new Animated.Value(20)).current;
  const conceptCardOpacity = useRef(new Animated.Value(0)).current;

  // Apple Reanimated shared values
  const bobY = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const tiltRotate = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Apple animation based on appleState
  useEffect(() => {
    bobY.value = 0;
    shakeX.value = 0;
    tiltRotate.value = 0;
    pulseScale.value = 1;

    if (appleState === "idle" || appleState === "listening") {
      // Fix 2: bob includes rotate(3deg) oscillation in sync with translateY
      bobY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 900, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
      tiltRotate.value = withRepeat(
        withSequence(
          withTiming(3, { duration: 900 }),
          withTiming(0, { duration: 900 })
        ),
        -1,
        false
      );
    } else if (appleState === "thinking") {
      tiltRotate.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 600, easing: Easing.inOut(Easing.sin) }),
          withTiming(4, { duration: 600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else if (appleState === "speaking") {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.09, { duration: 500, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    } else if (appleState === "celebrate") {
      // Fix 3: scale burst + rotate burst
      pulseScale.value = withSequence(
        withTiming(1.18, { duration: 100 }),
        withTiming(1.22, { duration: 100 }),
        withTiming(1.1, { duration: 250 }),
        withTiming(1, { duration: 250 })
      );
      tiltRotate.value = withSequence(
        withTiming(15, { duration: 100 }),
        withTiming(-10, { duration: 100 }),
        withTiming(5, { duration: 150 }),
        withTiming(0, { duration: 350 })
      );
    } else if (appleState === "wrong") {
      // Fix 1: shake uses translateX not translateY
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [appleState]);

  const appleAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bobY.value },
      { translateX: shakeX.value },
      { rotate: `${tiltRotate.value}deg` },
      { scale: pulseScale.value },
    ],
  }));

  // Fetch exercises from DB on mount
  useEffect(() => {
    async function fetchExercises() {
      try {
        const { data, error } = await supabase
          .from("vjezbanka_exercises")
          .select("*")
          .eq("chapter_id", 4)
          .order("sort_order");
        if (error || !data || data.length === 0) throw error ?? new Error("empty");
        setExercises(data as DbExercise[]);
      } catch {
        setExercises(FALLBACK_EXERCISES);
      } finally {
        setExercisesLoading(false);
      }
    }
    fetchExercises();
  }, []);

  // Start greeting karaoke on mount
  useEffect(() => {
    play(GREETING_TEXT);
  }, []);

  // Show concept card when quiz phase starts
  useEffect(() => {
    if (phase === "quiz") {
      conceptCardY.setValue(20);
      conceptCardOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(conceptCardY, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(conceptCardOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [phase, exerciseIndex]);

  // ── Voice recording ───────────────────────────────────────
  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      recordingStartRef.current = Date.now();
      setMicState("listening");
      setAppleState("listening");
      // Fix 5: show listening karaoke text
      play("Slušam te...");
      maxRecordingTimer.current = setTimeout(() => stopAndSend(), 15000);
    } catch (e) {
      console.warn("Could not start recording:", e);
    }
  }

  async function stopAndSend() {
    if (maxRecordingTimer.current) clearTimeout(maxRecordingTimer.current);
    const recording = recordingRef.current;
    if (!recording) return;

    const elapsed = Date.now() - recordingStartRef.current;
    if (elapsed < 400) {
      try { await recording.stopAndUnloadAsync(); } catch {}
      recordingRef.current = null;
      setMicState("idle");
      setAppleState("idle");
      return;
    }

    setMicState("thinking");
    setAppleState("thinking");
    // Fix 5: show thinking karaoke text before API call
    play("Hmm, razmišljam...");

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      if (!uri) throw new Error("no uri");

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64",
      });

      setLoading(true);
      const { data, error } = await supabase.functions.invoke("buddy-ask", {
        body: { audio_base64: base64, audio_mime: "audio/m4a" },
      });
      if (error) throw error;

      setMicState("speaking");
      setAppleState("speaking");
      play(data.answer ?? "Pokušaj ponovo.");
    } catch {
      play("Nema interneta. Provjeri vezu.");
      setMicState("idle");
      setAppleState("idle");
    } finally {
      setLoading(false);
    }
  }

  // Fix 6: animate thinking dots when in thinking state
  useEffect(() => {
    const makeBounce = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: -8, duration: 350, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 350, useNativeDriver: true }),
        ])
      );

    if (micState === "thinking") {
      const a0 = makeBounce(dotBounce0, 0);
      const a1 = makeBounce(dotBounce1, 180);
      const a2 = makeBounce(dotBounce2, 360);
      a0.start();
      a1.start();
      a2.start();
      return () => {
        a0.stop();
        a1.stop();
        a2.stop();
        dotBounce0.setValue(0);
        dotBounce1.setValue(0);
        dotBounce2.setValue(0);
      };
    } else {
      dotBounce0.setValue(0);
      dotBounce1.setValue(0);
      dotBounce2.setValue(0);
    }
  }, [micState]);

  // When karaoke finishes speaking, return mic to idle
  useEffect(() => {
    if (
      micState === "speaking" &&
      displayedWords.length === totalWords.length &&
      totalWords.length > 0
    ) {
      setMicState("idle");
      setAppleState("idle");
    }
  }, [displayedWords, totalWords, micState]);

  // ── Text question ─────────────────────────────────────────
  async function sendQuestion() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setLoading(true);
    setAppleState("thinking");
    try {
      const { data, error } = await supabase.functions.invoke("buddy-ask", {
        body: { question: text },
      });
      if (error) throw error;
      setAppleState("speaking");
      play(data.answer ?? "Pokušaj ponovo.");
    } catch {
      play("Nema interneta. Provjeri vezu.");
      setAppleState("idle");
    } finally {
      setLoading(false);
    }
  }

  // ── Quiz flow ─────────────────────────────────────────────
  function startQuiz() {
    if (exercises.length === 0) return;
    setPhase("quiz");
    setExerciseIndex(0);
    setScore(0);
    setShowFeedback(false);
    play(exercises[0].question_text);
  }

  function handleQuizResult(wasCorrect: boolean) {
    setScore((s) => s + (wasCorrect ? 1 : 0));
    setShowFeedback(true);
    setAppleState(wasCorrect ? "celebrate" : "wrong");
    const ex = exercises[exerciseIndex];
    play(wasCorrect ? ex.feedback_correct : ex.feedback_wrong);
  }

  function nextExercise() {
    const next = exerciseIndex + 1;
    if (next >= exercises.length) {
      setPhase("reward");
      setAppleState("celebrate");
      play("Završio si! Odlično si radio danas.");
    } else {
      setExerciseIndex(next);
      setShowFeedback(false);
      setAppleState("idle");
      play(exercises[next].question_text);
    }
  }

  const currentExercise = exercises[exerciseIndex];

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: MATH_BG }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={12}
            style={styles.backBtn}
          >
            <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.ink }}>
              Natrag
            </Text>
          </TouchableOpacity>

          <Text style={styles.subjectLabel}>Matematika · Razlomci</Text>

          {phase === "quiz" && exercises.length > 0 && (
            <Text style={{ fontFamily: fonts.monoMedium, fontSize: 12, color: colors.ink3 }}>
              {exerciseIndex + 1}/{exercises.length}
            </Text>
          )}
          {phase !== "quiz" && <View style={{ width: 60 }} />}
        </View>

        {/* Stage */}
        <View style={styles.stage}>
          {DRIFT_WORDS.map((d) => (
            <DriftWord key={d.word} word={d.word} left={d.left} delay={d.delay} />
          ))}

          <View style={styles.appleContainer}>
            <Reanimated.View style={appleAnimStyle}>
              <Text style={{ fontSize: 72 }}>🍎</Text>
            </Reanimated.View>
          </View>

          {phase === "quiz" && !showFeedback && currentExercise && (
            <Animated.View
              style={[
                styles.conceptCard,
                {
                  opacity: conceptCardOpacity,
                  transform: [{ translateY: conceptCardY }],
                },
              ]}
            >
              <FractionVisual
                numerator={currentExercise.visual_data.numerator}
                denominator={currentExercise.visual_data.denominator}
              />
            </Animated.View>
          )}
        </View>

        {/* Karaoke strip */}
        <View style={styles.karaokeStrip}>
          {exercisesLoading ? (
            <Text style={styles.karaokeWord}>Učitavam vježbe...</Text>
          ) : (
            <Text style={styles.karaokeText}>
              {displayedWords.map((word, i) => {
                const isCurrent =
                  i === displayedWords.length - 1 &&
                  displayedWords.length < totalWords.length;
                return (
                  <Text
                    key={i}
                    style={[styles.karaokeWord, isCurrent && styles.karaokeWordCurrent]}
                  >
                    {word}{" "}
                  </Text>
                );
              })}
            </Text>
          )}
        </View>

        {/* Reward screen */}
        {phase === "reward" && (
          <View style={styles.rewardContainer}>
            <Text style={{ fontSize: 48 }}>🏆</Text>
            <Text style={styles.rewardTitle}>Sjajno si uradio!</Text>
            <Text style={styles.rewardScore}>
              {score}/{exercises.length} tačno
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/home")}
              style={styles.rewardBtn}
            >
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.cream }}>
                Idi kući
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input area: pinned bottom */}
        {phase !== "reward" && (
          <View style={styles.inputArea}>
            {phase === "quiz" && !showFeedback && currentExercise && (
              <TapChoices
                key={currentExercise.id}
                choices={currentExercise.choices}
                onResult={handleQuizResult}
              />
            )}

            {phase === "quiz" && showFeedback && (
              <TouchableOpacity onPress={nextExercise} style={styles.nextBtn}>
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 16, color: colors.cream }}>
                  {exerciseIndex + 1 < exercises.length ? "Sljedeći zadatak" : "Završi"}
                </Text>
              </TouchableOpacity>
            )}

            {(phase === "conversation" || phase === "greeting") && (
              <>
                <View style={styles.micRow}>
                  <View style={styles.micRippleWrapper}>
                    {micState === "listening" && (
                      <>
                        <RippleRing delay={0} size={72} />
                        <RippleRing delay={500} size={72} />
                      </>
                    )}
                  <Pressable
                    onPressIn={startRecording}
                    onPressOut={stopAndSend}
                    style={[
                      styles.micBtn,
                      micState === "idle" && styles.micBtnIdle,
                      micState === "listening" && styles.micBtnListening,
                      (micState === "thinking" || micState === "speaking") &&
                        styles.micBtnMuted,
                    ]}
                    disabled={micState === "thinking"}
                  >
                    {micState === "idle" && (
                      <Text style={{ fontSize: 26 }}>🎤</Text>
                    )}
                    {micState === "listening" && (
                      <View style={styles.waveformBars}>
                        {[8, 18, 14, 20, 10].map((h, i) => (
                          <View key={i} style={[styles.wbar, { height: h }]} />
                        ))}
                      </View>
                    )}
                    {micState === "thinking" && (
                      <View style={styles.thinkDots}>
                        <Animated.View style={[styles.dot, { transform: [{ translateY: dotBounce0 }] }]} />
                        <Animated.View style={[styles.dot, { transform: [{ translateY: dotBounce1 }] }]} />
                        <Animated.View style={[styles.dot, { transform: [{ translateY: dotBounce2 }] }]} />
                      </View>
                    )}
                    {micState === "speaking" && (
                      <Text style={{ fontSize: 26, opacity: 0.4 }}>🎤</Text>
                    )}
                  </Pressable>
                  </View>
                  {micState === "idle" && (
                    <Text style={styles.micHint}>Pritisni i govori</Text>
                  )}
                </View>

                <View style={styles.textRow}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ili upiši pitanje..."
                    placeholderTextColor={colors.muted}
                    style={styles.textInput}
                    returnKeyType="send"
                    onSubmitEditing={sendQuestion}
                    blurOnSubmit={false}
                    editable={!loading && micState === "idle"}
                    onFocus={() => setPhase("conversation")}
                  />
                  {input.trim().length > 0 && (
                    <TouchableOpacity
                      onPress={sendQuestion}
                      style={styles.sendBtn}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                      <Text style={{ color: colors.cream, fontSize: 16 }}>↑</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity
                  onPress={startQuiz}
                  disabled={exercisesLoading || exercises.length === 0}
                  style={[
                    styles.quizStartBtn,
                    (exercisesLoading || exercises.length === 0) && { opacity: 0.5 },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: "Baloo2_800ExtraBold",
                      fontSize: 15,
                      color: colors.cream,
                    }}
                  >
                    Vježbaj razlomke
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

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.pagePadding,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  subjectLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: MATH_ORANGE,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  driftWord: {
    position: "absolute",
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 15,
    color: MATH_ORANGE,
  },
  appleContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  conceptCard: {
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 3,
    backgroundColor: colors.cream,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  karaokeStrip: {
    backgroundColor: colors.cream,
    marginHorizontal: spacing.pagePadding,
    marginBottom: 8,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 0,
    elevation: 2,
    padding: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  karaokeText: {
    textAlign: "center",
    flexWrap: "wrap",
  },
  karaokeWord: {
    fontFamily: "Baloo2_700Bold",
    fontSize: 16,
    color: colors.ink,
    lineHeight: 24,
  },
  karaokeWordCurrent: {
    color: MATH_ORANGE,
    fontFamily: "Baloo2_800ExtraBold",
  },
  rewardContainer: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 24,
    paddingHorizontal: spacing.pagePadding,
  },
  rewardTitle: {
    fontFamily: "Baloo2_800ExtraBold",
    fontSize: 24,
    color: colors.ink,
    textAlign: "center",
  },
  rewardScore: {
    fontFamily: fonts.monoMedium,
    fontSize: 16,
    color: MATH_ORANGE,
  },
  rewardBtn: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  inputArea: {
    paddingHorizontal: spacing.pagePadding,
    paddingBottom: 28,
    paddingTop: 8,
    gap: 10,
  },
  nextBtn: {
    backgroundColor: MATH_ORANGE,
    borderWidth: 3,
    borderColor: "rgba(180,60,0,0.2)",
    borderRadius: 100,
    shadowColor: "rgba(180,60,0,1)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  micRow: {
    alignItems: "center",
    gap: 8,
  },
  micRippleWrapper: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnIdle: {
    backgroundColor: MATH_ORANGE,
    borderWidth: 3,
    borderColor: "rgba(180,60,0,0.2)",
    borderRadius: 100,
    shadowColor: "rgba(180,60,0,1)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
  },
  micBtnListening: {
    backgroundColor: MATH_ORANGE,
    borderWidth: 3,
    borderColor: "rgba(180,60,0,0.2)",
    borderRadius: 100,
    shadowColor: "rgba(180,60,0,1)",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 4,
  },
  micBtnMuted: {
    backgroundColor: "rgba(0,0,0,0.07)",
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 0,
    elevation: 1,
  },
  waveformBars: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
    height: 22,
  },
  wbar: {
    width: 3,
    backgroundColor: colors.cream,
    borderRadius: 2,
  },
  thinkDots: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: MATH_ORANGE,
  },
  micHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.muted,
    textAlign: "center",
  },
  textRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.08)",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: MATH_ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  quizStartBtn: {
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: "rgba(0,0,0,0.08)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 0,
    elevation: 3,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
