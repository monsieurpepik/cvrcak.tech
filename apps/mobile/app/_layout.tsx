import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
  DM_Sans_400Regular,
  DM_Sans_500Medium,
  DM_Sans_600SemiBold,
  DM_Sans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
import { View } from "react-native";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DM_Sans_400Regular,
    DM_Sans_500Medium,
    DM_Sans_600SemiBold,
    DM_Sans_700Bold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
