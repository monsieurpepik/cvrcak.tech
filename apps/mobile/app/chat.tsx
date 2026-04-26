import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePostHog } from "posthog-react-native";
import { colors, fonts, radius, spacing } from "../theme/tokens";
import ChatBubble from "../components/ChatBubble";
import { supabase } from "../lib/supabase";

type Citation = {
  page: number;
  excerpt: string;
};

type Message = {
  id: string;
  role: "kid" | "tutor";
  text: string;
  citations?: Citation[];
};

const INITIAL_MESSAGE: Message = {
  id: "intro",
  role: "tutor",
  text: "Zdravo! Pitaj me šta god hoćeš o sabiranju razlomaka. Odgovaram samo iz tvoje knjige.",
  citations: [],
};

const SUGGESTED = [
  "Kako se sabira 1/2 i 1/3?",
  "Šta je NZN i kako ga nađem?",
  "Zašto ne mogu samo sabrati brojnike?",
];

function TypingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - i * 150),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingLeft: 4, paddingVertical: 8 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: colors.muted,
            opacity: dot,
          }}
        />
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const posthog = usePostHog();

  async function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSuggested(false);
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "kid", text },
    ]);
    posthog?.capture("question_asked", { episode_id: "tema-4-2", source: "chat_screen" });

    try {
      const { data, error } = await supabase.functions.invoke("ask", {
        body: { question: text },
      });

      if (error) throw error;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "tutor",
          text: data.answer ?? "Nešto nije u redu. Pokušaj ponovo.",
          citations: data.citations ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "tutor",
          text: "Nema interneta. Provjeri vezu i pokušaj ponovo.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream2 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: spacing.pagePadding,
            paddingVertical: 14,
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={20} color={colors.ink3} />
          </TouchableOpacity>
          <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink, flex: 1, textAlign: "center" }}>
            Pitaj Cvrčka
          </Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Grounded source badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingHorizontal: spacing.pagePadding,
            paddingVertical: 10,
            backgroundColor: colors.popPeach,
          }}
        >
          <Ionicons name="book-outline" size={13} color={colors.accentTeal} />
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.ink2, flex: 1 }}>
            Odgovaram iz:{" "}
            <Text style={{ fontFamily: fonts.bodySemiBold, color: colors.ink }}>
              Matematika 5, Poglavlje 4
            </Text>
          </Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            padding: spacing.pagePadding,
            gap: 12,
            paddingBottom: 24,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              text={msg.text}
              citations={msg.citations}
            />
          ))}

          {/* Suggested questions — visible until first send */}
          {showSuggested && !loading && (
            <View style={{ gap: 8, marginTop: 4 }}>
              <Text
                style={{
                  fontFamily: fonts.body,
                  fontSize: 12,
                  color: colors.muted,
                  textAlign: "center",
                }}
              >
                Ili odaberi pitanje:
              </Text>
              {SUGGESTED.map((q) => (
                <TouchableOpacity
                  key={q}
                  onPress={() => send(q)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: colors.cream,
                    borderRadius: radius.card,
                    borderWidth: 1,
                    borderColor: colors.line,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: fonts.body,
                      fontSize: 14,
                      color: colors.ink2,
                      flex: 1,
                    }}
                  >
                    {q}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.muted} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {loading && <TypingDots />}
        </ScrollView>

        {/* Input bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 10,
            paddingHorizontal: spacing.pagePadding,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.line,
            backgroundColor: colors.cream2,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Pitaj me nešto..."
            placeholderTextColor={colors.muted}
            multiline
            style={{
              flex: 1,
              fontFamily: fonts.body,
              fontSize: 15,
              color: colors.ink,
              backgroundColor: colors.cream,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: colors.line,
              paddingHorizontal: 16,
              paddingVertical: 10,
              maxHeight: 120,
            }}
            returnKeyType="send"
            onSubmitEditing={() => send()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => send()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 100,
              backgroundColor: input.trim() && !loading ? colors.ink : colors.line,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-up" size={18} color={colors.cream} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
