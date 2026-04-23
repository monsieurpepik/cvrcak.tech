import { useState } from "react";
import { TouchableOpacity, Text, Modal, View, Pressable, ScrollView } from "react-native";
import { colors, fonts, radius } from "../theme/tokens";

type CitationChipProps = {
  page: number;
  excerpt: string;
};

export default function CitationChip({ page, excerpt }: CitationChipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        style={{
          alignSelf: "flex-start",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          paddingVertical: 3,
          paddingHorizontal: 8,
          borderRadius: radius.pill,
          backgroundColor: colors.popPeach,
          borderWidth: 1,
          borderColor: colors.accentWarm + "40",
        }}
      >
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.accentWarm }}>
          str. {page}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          onPress={() => setVisible(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.cream,
              borderTopLeftRadius: radius.hero,
              borderTopRightRadius: radius.hero,
              padding: 24,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: fonts.bodySemiBold, fontSize: 14, color: colors.ink }}>
                Iz udžbenika
              </Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accentWarm }}>
                str. {page}
              </Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 200 }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 14, color: colors.ink2, lineHeight: 22 }}>
                {excerpt}
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              activeOpacity={0.8}
              style={{
                backgroundColor: colors.ink,
                borderRadius: radius.pill,
                paddingVertical: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.cream }}>
                Zatvori
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
