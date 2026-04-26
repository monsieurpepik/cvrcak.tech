import { useState, useRef, useEffect } from "react";
import { View, Text, ScrollView, Modal, Pressable, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePostHog } from "posthog-react-native";
import { colors, fonts, spacing } from "../theme/tokens";
import { supabase } from "../lib/supabase";
import { TrackPlayer } from "../lib/trackplayer";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

const SESSION_TOKEN_KEY = "session_token";

type Citation = { page: number; excerpt: string };
type Message = { id: string; role: "kid" | "tutor"; text: string; citations?: Citation[] };

const INITIAL_MESSAGE: Message = {
  id: "intro",
  role: "tutor",
  text: "Zdravo! Pitaj me šta god hoćeš o sabiranju razlomaka. Odgovaram samo iz tvoje knjige.",
  citations: [],
};

function generateToken(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ChatDrawer({ open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const sessionTokenRef = useRef<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const posthog = usePostHog();

  useEffect(() => {
    async function loadToken() {
      let token = await AsyncStorage.getItem(SESSION_TOKEN_KEY);
      if (!token) {
        token = generateToken();
        await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
      }
      sessionTokenRef.current = token;
    }
    loadToken();
  }, []);

  // Pause audio when drawer opens
  useEffect(() => {
    if (open && TrackPlayer) {
      TrackPlayer.pause();
      posthog?.capture("chat_opened", { episode_id: "tema-4-2" });
    }
  }, [open]);

  async function send(question?: string) {
    const text = (question ?? input).trim();
    if (!text || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSuggested(false);
    setInput("");
    setLoading(true);

    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "kid", text }]);
    posthog?.capture("question_asked", { episode_id: "tema-4-2" });

    try {
      const { data, error } = await supabase.functions.invoke("ask", {
        body: { question: text },
        headers: sessionTokenRef.current ? { "X-Session-Token": sessionTokenRef.current } : undefined,
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
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.cream2,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: "88%",
            overflow: "hidden",
          }}
          onPress={() => {}}
        >
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            {/* Drag handle */}
            <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line }} />
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: spacing.pagePadding,
                paddingVertical: 12,
                gap: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 15, color: colors.ink }}>
                  Pitaj Cvrčka
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={12}>
                <Ionicons name="close" size={20} color={colors.ink3} />
              </TouchableOpacity>
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

            <ChatMessages
              messages={messages}
              loading={loading}
              showSuggested={showSuggested}
              onSuggestedPress={(q) => send(q)}
              scrollRef={scrollRef}
            />
            <ChatInput value={input} onChange={setInput} onSend={() => send()} loading={loading} />
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
