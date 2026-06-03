import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import PostImage from "../assets/images/splash-icon.png";
// Ads
import { showInterstitial } from "../components/InterstitialAd";

// --- DESIGN SYSTEM ---
const COLORS = {
  gradientStart: "#040D1F",
  gradientMid: "#0A1B3A",
  gradientEnd: "#1A3263",
  primary: "#007AFF",
  primaryDark: "#0056B3",
  accent: "#FF9500",
  card: "#FFFFFF",
  headline: "#FFFFFF",
  subtitle: "rgba(255, 255, 255, 0.9)",
  body: "rgba(255, 255, 255, 0.65)",
  shadowColor: "rgba(0, 0, 0, 0.8)",
};

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // --- Responsive Image Size ---
  const imageSize = Math.min(Math.max(width * 0.55, 200), 320);

  // --- Animations ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Float animation (up & down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fade & scale entry animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 10, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  // --- Handle "Get Started" ---
  const handleGetStarted = () => {
    Animated.sequence([
      Animated.spring(buttonScale, { toValue: 0.95, speed: 30, useNativeDriver: true }),
      Animated.spring(buttonScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true }),
    ]).start();

    // Show interstitial ad before navigation
    showInterstitial(() => {
      router.push("/topics");
    });
  };

  const floatInterp = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });

  // --- Responsive Text Sizes ---
  const headlineSize = width < 360 ? 26 : 34;
  const subtitleSize = width < 360 ? 15 : 17;
  const subtitleLineHeight = width < 360 ? 22 : 26;

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMid, COLORS.gradientEnd]}
      style={styles.gradientBackground}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.mainContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            {/* --- HERO IMAGE --- */}
            <Animated.View
              style={[
                styles.heroImageContainer,
                { width: imageSize, height: imageSize, transform: [{ translateY: floatInterp }] },
              ]}
            >
              <Image source={PostImage} style={styles.heroImage} resizeMode="contain" />
            </Animated.View>

            {/* --- TEXT CONTENT --- */}
            <View style={styles.textBlock}>
              <Text style={[styles.headline, { fontSize: headlineSize }]}>Master Computer Studies</Text>
              <Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: subtitleLineHeight }]}>
                Access thousands of solved questions and expert explanations to strengthen your knowledge and ace
                your exams.
              </Text>

              {/* --- STATS BADGE --- */}
              <View style={styles.statsBadge}>
                <Ionicons name="flash-outline" size={18} color={COLORS.accent} />
                <Text style={styles.statsText}>10,000+ Questions • 98% Success Rate</Text>
              </View>
            </View>

            {/* --- GET STARTED BUTTON --- */}
            <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: buttonScale }] }]}>
              <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.9} style={styles.shadow}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  <View style={styles.buttonContent}>
                    <Ionicons name="rocket-outline" size={22} color={COLORS.card} style={{ marginRight: 15 }} />
                    <Text style={styles.buttonText}>Get Started Now</Text>
                    <Ionicons
                      name="chevron-forward-circle"
                      size={30}
                      color={COLORS.card}
                      style={{ marginLeft: 15 }}
                    />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center" },

  shadow: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 20,
  },

  mainContent: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, paddingVertical: 32 },

  heroImageContainer: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    marginBottom: 20,
  },
  heroImage: { width: "100%", height: "100%" },

  textBlock: { alignItems: "center", paddingHorizontal: 10, marginBottom: 20 },
  headline: {
    color: COLORS.headline,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: { color: COLORS.subtitle, textAlign: "center", marginBottom: 20 },

  statsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 122, 255, 0.15)",
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  statsText: { color: COLORS.subtitle, marginLeft: 10, fontSize: 13, fontWeight: "600" },

  buttonWrapper: { width: "100%", maxWidth: 340, marginTop: 24, marginBottom: 12, borderRadius: 30 },
  button: { borderRadius: 30, paddingVertical: 18 },
  buttonContent: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  buttonText: { color: COLORS.card, fontSize: 16, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
});