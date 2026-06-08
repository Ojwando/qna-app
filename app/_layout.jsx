import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Keep splash visible until initialization routines are completed
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Handle global re-entrant errors safely */
});

/* -------------------- THEME -------------------- */
const Theme = {
  primary: "#1448AA",
  background: "#F8FAFC",       // Clean corporate off-white
  headerBackground: "#FFFFFF",
  textPrimary: "#0F172A",      // Deep slate text for high legibility
  border: "#E2E8F0"
};

/* -------------------- HEADER TITLE -------------------- */
const AppHeaderTitle = ({ title }) => (
  <View style={styles.headerTitleContainer}>
    <Text style={styles.headerTitleText} numberOfLines={1}>
      {title}
    </Text>
  </View>
);

/* -------------------- ROOT LAYOUT -------------------- */
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  /* -------------------- ASSET LOADING -------------------- */
  const [fontsLoaded, fontError] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-ExtraLight": require("../assets/fonts/Inter_18pt-ExtraLight.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "PlayfairDisplay-Black": require("../assets/fonts/PlayfairDisplay-Black.ttf"),
  });

  /* -------------------- INITIALIZATION SEQUENCER -------------------- */
  useEffect(() => {
    async function prepareSystem() {
      try {
        // 1. Initialize mobile advertisements safely with a strict local timeout fallback
        await Promise.race([
          mobileAds().initialize(),
          new Promise((resolve) => setTimeout(resolve, 3500)) // 3.5s maximum timeout fail-safe
        ]);
        console.log("Ads infrastructure checked.");
      } catch (e) {
        console.warn("Non-breaking Ads initialization exception:", e);
      } finally {
        // 2. Mark the orchestration phase ready if fonts loaded successfully or hit a system error
        if (fontsLoaded || fontError) {
          setAppIsReady(true);
        }
      }
    }

    prepareSystem();
  }, [fontsLoaded, fontError]);

  /* -------------------- DISMISS SPLASH -------------------- */
  useEffect(() => {
    if (appIsReady) {
      // Execute UI layout presentation phase
      SplashScreen.hideAsync().catch((err) => console.log("Splash dismissal safe log:", err));
    }
  }, [appIsReady]);

  // If assets aren't fetched and system is unready, show absolute nothingness safely
  // to avoid rendering structural UI components with raw layouts
  if (!appIsReady) {
    return null;
  }

  /* -------------------- APP UI -------------------- */
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.headerBackground,
          },
          headerShadowVisible: false,
          headerTintColor: Theme.primary,
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontSize: 17,
            fontFamily: "Inter-Bold",
            color: Theme.textPrimary,
          },
          contentStyle: {
            backgroundColor: Theme.background,
          },
        }}
      >
        {/* HOME */}
        <Stack.Screen
          name="index"
          options={{
            headerTitle: () => <AppHeaderTitle title="Computer Studies Q&A" />,
          }}
        />

        {/* TOPICS LIST */}
        <Stack.Screen
          name="topics/index"
          options={{
            headerTitle: () => <AppHeaderTitle title="Strands" />,
          }}
        />

        {/* TOPIC DETAILS */}
        <Stack.Screen
          name="topics/[id]"
          options={{
            headerTitle: () => <AppHeaderTitle title="Questions" />,
          }}
        />

        {/* QUESTION DETAILS */}
        <Stack.Screen
          name="questions/[id]"
          options={{
            headerTitle: () => <AppHeaderTitle title="Question Details" />,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  headerTitleText: {
    fontSize: 17,
    fontFamily: "Inter-Bold",
    color: Theme.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
});