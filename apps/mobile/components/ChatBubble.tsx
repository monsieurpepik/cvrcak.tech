import { View, Text } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";
import CitationChip from "./CitationChip";

type Citation = {
  page: number;
  excerpt: string;
};

type ChatBubbleProps = {
  role: "kid" | "tutor";
  text: string;
  citations?: Citation[];
};

export default function ChatBubble({ role, text, citations }: ChatBubbleProps) {
  const isKid = role === "kid";

  return (
    <View
      style={{
        alignSelf: isKid ? "flex-end" : "flex-start",
        maxWidth: "80%",
        gap: 6,
        flexDirection: isKid ? "column" : "row",
        alignItems: "flex-end",
      }}
    >
      {!isKid && (
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: radius.pill,
            backgroundColor: colors.popPeach,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 2,
            flexShrink: 0,
          }}
        >
          <Text style={{ fontFamily: fonts.displayItalic, fontSize: 14, color: colors.ink }}>
            C
          </Text>
        </View>
      )}

      <View style={{ gap: 6, flex: isKid ? undefined : 1 }}>
        <View
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 18,
            borderBottomRightRadius: isKid ? 4 : 18,
            borderBottomLeftRadius: isKid ? 18 : 4,
            backgroundColor: isKid ? colors.ink : colors.cream3,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.body,
              fontSize: 15,
              lineHeight: 22,
              color: isKid ? colors.cream : colors.ink,
            }}
          >
            {text}
          </Text>
        </View>

        {!isKid && citations && citations.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, paddingLeft: 2 }}>
            {citations.map((c) => (
              <CitationChip key={c.page} page={c.page} excerpt={c.excerpt} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
