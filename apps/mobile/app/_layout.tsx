import "../global.css";
import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { View } from "react-native";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from "@expo-google-fonts/jetbrains-mono";
import Constants from "expo-constants";
import * as Sentry from "@sentry/react-native";
import { PostHogProvider } from "posthog-react-native";

const sentryDsn: string = Constants.expoConfig?.extra?.sentryDsn ?? "";
const posthogApiKey: string = process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? "";
const posthogHost: string = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

if (sentryDsn) {
  Sentry.init({ dsn: sentryDsn });
}

const queryClient = new QueryClient();

function RootLayout() {
  const [fontsLoaded] = useFonts({
    DM_Sans_400Regular: DMSans_400Regular,
    DM_Sans_500Medium: DMSans_500Medium,
    DM_Sans_600SemiBold: DMSans_600SemiBold,
    DM_Sans_700Bold: DMSans_700Bold,
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#FDF6E8" }} />;
  }

  return (
    <PostHogProvider
      apiKey={posthogApiKey}
      options={{ host: posthogHost }}
    >
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </PostHogProvider>
  );
}

export default Sentry.wrap(RootLayout);
