import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts, radius, spacing } from "../theme/tokens";

type Props = {
  value: string;
  onChange: (text: string) => void;
  onSend: () => void;
  loading: boolean;
};

export default function ChatInput({ value, onChange, onSend, loading }: Props) {
  return (
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
        value={value}
        onChangeText={onChange}
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
        onSubmitEditing={onSend}
        blurOnSubmit={false}
      />
      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim() || loading}
        activeOpacity={0.8}
        style={{
          width: 44,
          height: 44,
          borderRadius: 100,
          backgroundColor: value.trim() && !loading ? colors.ink : colors.line,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="arrow-up" size={18} color={colors.cream} />
      </TouchableOpacity>
    </View>
  );
}
