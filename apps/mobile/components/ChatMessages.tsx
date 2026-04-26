import { useEffect, useRef } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius } from "../theme/tokens";
import ChatBubble from "./ChatBubble";

type Citation = { page: number; excerpt: string };
type Message = { id: string; role: "kid" | "tutor"; text: string; citations?: Citation[] };

function TypingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

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

const SUGGESTED = [
  "Kako se sabira 1/2 i 1/3?",
  "Šta je NZN i kako ga nađem?",
  "Zašto ne mogu samo sabrati brojnike?",
];

type Props = {
  messages: Message[];
  loading: boolean;
  showSuggested: boolean;
  onSuggestedPress: (q: string) => void;
  scrollRef: React.RefObject<ScrollView | null>;
};

export default function ChatMessages({ messages, loading, showSuggested, onSuggestedPress, scrollRef }: Props) {
  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ padding: 18, gap: 12, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
    >
      {messages.map((msg) => (
        <ChatBubble key={msg.id} role={msg.role} text={msg.text} citations={msg.citations} />
      ))}

      {showSuggested && !loading && (
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: colors.muted, textAlign: "center" }}>
            Ili odaberi pitanje:
          </Text>
          {SUGGESTED.map((q) => (
            <TouchableOpacity
              key={q}
              onPress={() => onSuggestedPress(q)}
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
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink2, flex: 1 }}>{q}</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.muted} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && <TypingDots />}
    </ScrollView>
  );
}
