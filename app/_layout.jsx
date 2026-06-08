import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import mobileAds from "react-native-google-mobile-ads";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

/* -------------------- THEME -------------------- */
const Theme = {
  primary: "#1448AA",
  background: "#F9FCFF",
  headerBackground: "#FFFFFF",
  textPrimary: "#1C1C1E",
};

/* -------------------- HEADER TITLE -------------------- */
const AppHeaderTitle = ({ title }) => (
  <View style={styles.headerTitleContainer}>
    <Text style={styles.headerTitleText}>{title}</Text>
  </View>
);

/* -------------------- ROOT LAYOUT -------------------- */
export default function RootLayout() {
  /* -------------------- FONTS -------------------- */
  const [fontsLoaded, error] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-ExtraLight": require("../assets/fonts/Inter_18pt-ExtraLight.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "PlayfairDisplay-Black": require("../assets/fonts/PlayfairDisplay-Black.ttf"),
  });

  /* -------------------- LIFECYCLE MANAGMENT -------------------- */
  useEffect(() => {
    // Handle error logging if fonts fail
    if (error) throw error;

    // Hide splash screen once fonts are fully ready
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  /* -------------------- ADS INIT -------------------- */
  useEffect(() => {
    const initAds = async () => {
      try {
        await mobileAds().initialize();
        console.log("Ads initialized");
      } catch (e) {
        console.log("Ads init failed:", e);
      }
    };

    initAds();
  }, []);

  // Return null or a generic screen while waiting for the native splash screen to hide
  if (!fontsLoaded) {
    return null;
  }

  /* -------------------- APP UI -------------------- */
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Theme.headerBackground,
          },
          headerShadowVisible: false,
          headerTintColor: Theme.primary,
          headerTitleStyle: {
            fontSize: 18,
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
            title: "Computer Studies Q&A",
          }}
        />

        {/* TOPICS LIST */}
        <Stack.Screen
          name="topics/index"
          options={{
            title: "Strands",
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
  },
  headerTitleText: {
    fontSize: 18,
    fontFamily: "Inter-Bold",
    color: Theme.textPrimary,
  },
});