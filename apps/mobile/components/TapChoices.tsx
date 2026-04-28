import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { colors, fonts, radius } from "../theme/tokens";

type Choice = { label: string; correct: boolean };

type TapChoicesProps = {
  choices: [Choice, Choice, Choice, Choice];
  onResult: (wasCorrect: boolean) => void;
};

function ChoiceButton({
  choice,
  onTap,
  state,
}: {
  choice: Choice;
  onTap: () => void;
  state: "idle" | "correct" | "wrong" | "dimmed";
}) {
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shakeX.value }],
  }));

  function handlePress() {
    if (state !== "idle") return;
    onTap();
  }

  // Trigger animation when state changes
  React.useEffect(() => {
    if (state === "correct") {
      scale.value = withSequence(
        withTiming(0.9, { duration: 60 }),
        withSpring(1.08, { damping: 8, stiffness: 200 }),
        withTiming(1, { duration: 100 })
      );
    } else if (state === "wrong") {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [state, scale, shakeX]);

  const bgColor =
    state === "correct"
      ? colors.success
      : state === "wrong"
      ? colors.danger
      : colors.cream;

  const borderColor =
    state === "correct"
      ? "#3A6037"
      : state === "wrong"
      ? "#A03830"
      : "rgba(0,0,0,0.08)";

  const textColor =
    state === "correct" || state === "wrong" ? colors.cream : colors.ink;

  const opacity = state === "dimmed" ? 0.35 : 1;

  return (
    <Animated.View style={[animStyle, { flex: 1, opacity }]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        disabled={state !== "idle"}
        style={{
          height: 64,
          borderRadius: radius.card,
          backgroundColor: bgColor,
          borderWidth: 3,
          borderColor,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: state === "idle" ? 0.12 : 0.2,
          shadowRadius: state === "idle" ? 0 : 6,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontFamily: 'Baloo2_800ExtraBold',
            fontSize: 22,
            color: textColor,
          }}
        >
          {choice.label}
          {state === "correct" ? " \u2713" : ""}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TapChoices({ choices, onResult }: TapChoicesProps) {
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);

  function handleTap(index: number) {
    if (tappedIndex !== null) return;
    setTappedIndex(index);
    const wasCorrect = choices[index].correct;
    setTimeout(() => {
      onResult(wasCorrect);
    }, 900);
  }

  function getState(index: number): "idle" | "correct" | "wrong" | "dimmed" {
    if (tappedIndex === null) return "idle";
    if (choices[index].correct) return "correct";
    if (index === tappedIndex) return "wrong";
    return "dimmed";
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <ChoiceButton choice={choices[0]} onTap={() => handleTap(0)} state={getState(0)} />
        <ChoiceButton choice={choices[1]} onTap={() => handleTap(1)} state={getState(1)} />
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <ChoiceButton choice={choices[2]} onTap={() => handleTap(2)} state={getState(2)} />
        <ChoiceButton choice={choices[3]} onTap={() => handleTap(3)} state={getState(3)} />
      </View>
    </View>
  );
}
