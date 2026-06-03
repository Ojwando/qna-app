import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import mobileAds from "react-native-google-mobile-ads";

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
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter_18pt-Regular.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter_18pt-Bold.ttf"),
    "Inter-SemiBold": require("../assets/fonts/Inter_18pt-SemiBold.ttf"),
    "Inter-ExtraLight": require("../assets/fonts/Inter_18pt-ExtraLight.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "PlayfairDisplay-Black": require("../assets/fonts/PlayfairDisplay-Black.ttf"),
  });

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

  /* -------------------- LOADING STATE -------------------- */
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={{ color: Theme.textPrimary }}>
          Loading resources...
        </Text>
      </View>
    );
  }

  /* -------------------- APP UI -------------------- */
  return (
    <SafeAreaProvider>
      <View style={styles.container}>
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
              headerTitle: () => (
                <AppHeaderTitle title="Questions" />
              ),
            }}
          />

          {/* QUESTION DETAILS */}
          <Stack.Screen
            name="questions/[id]"
            options={{
              headerTitle: () => (
                <AppHeaderTitle title="Question Details" />
              ),
            }}
          />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },

  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.background,
  },

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