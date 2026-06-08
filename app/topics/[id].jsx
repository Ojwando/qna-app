import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import HTML from "react-native-render-html";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SafeBannerAd } from "../../components/BannerAd";
import { showInterstitial } from "../../components/InterstitialAd";

const { width, height } = Dimensions.get("window");

const COLORS = {
  primary: "#1448AA",
  secondary: "#10B981",
  background: "#F4F7FA",
  card: "#FFFFFF",
  text: "#1C1C1E",
  muted: "#6A7383",
  overlay: "rgba(20,72,170,0.7)",
  error: "#EF4444",
};

export default function TopicDetails() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const topicId = params?.id;
  const topicTitle = params?.topicTitle || "Questions";
  const image = params?.image;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const bgImage = image
    ? { uri: decodeURIComponent(image) }
    : require("../../assets/images/bg.png");

  // FIXED: Memoize html styling options so they maintain identity equality references across frame re-renders
  const htmlTagStyles = useMemo(() => ({
    p: {
      color: COLORS.text,
      fontSize: 16,
      lineHeight: 24,
      marginTop: 0,
      marginBottom: 0,
    },
  }), []);

  const fetchQuestions = async (refresh = false) => {
    try {
      if (!topicId) throw new Error("Missing topic ID");

      refresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const url = `https://qna-app.edufocus.co.ke/api/topics/${topicId}/questions`;
      console.log("Fetching:", url);

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Server error (${response.status})`);

      const data = await response.json();

      const formatted = Array.isArray(data)
        ? data.map((item, index) => ({
            ...item,
            index,
          }))
        : [];

      setQuestions(formatted);
    } catch (err) {
      console.log("Fetch error:", err);
      if (err.message === "Failed to fetch") {
        setError("No internet connection");
      } else {
        setError(err.message || "Failed to load questions");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (topicId) {
      fetchQuestions();
    }
  }, [topicId]);

  const openQuestion = (item) => {
    showInterstitial(() => {
      // FIXED: Switched path mapping structure to match your defined dynamic template directory schema ('questions/[id]')
      router.push({
        pathname: `/questions/${item.id}`,
        params: { topicTitle },
      });
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Questions...</Text>
      </View>
    );
  }

  if (error && questions.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={60} color={COLORS.error} />
        <Text style={styles.errorTitle}>Failed to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchQuestions()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => openQuestion(item)}
    >
      <View style={styles.cardHeader}>
        <Ionicons name="bookmark-outline" size={18} color={COLORS.primary} />
        <Text style={styles.cardIndex}>Question {item.index + 1}</Text>
      </View>

      <HTML
        contentWidth={width - 60}
        source={{ html: item?.question_text || "<p>No question available</p>" }}
        tagsStyles={htmlTagStyles}
      />

      <View style={styles.footer}>
        <Text style={styles.viewText}>Open Details</Text>
        <Ionicons name="arrow-forward-circle-outline" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ImageBackground source={bgImage} style={styles.header}>
        {/* FIXED: Removed flex layout collisions with insets to stabilize text containment */}
        <View style={[styles.overlay, { paddingTop: insets.top + 15 }]}>
          <Text style={styles.subtitle}>{questions.length} Questions Available</Text>
          <Text style={styles.title} numberOfLines={2}>{topicTitle}</Text>
        </View>
      </ImageBackground>

      <SafeBannerAd />

      <FlatList
        data={questions}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchQuestions(true)}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.muted,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    color: COLORS.text,
  },
  errorText: {
    textAlign: "center",
    marginTop: 10,
    color: COLORS.muted,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  header: {
    minHeight: height * 0.22,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.overlay,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#E0E7FF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  listContainer: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    padding: 16,
    boxShadow: "0px 2px 6px rgba(0,0,0,0.06)", // Modern unified shadow support
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIndex: {
    marginLeft: 8,
    color: COLORS.secondary,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  viewText: {
    marginRight: 6,
    color: COLORS.primary,
    fontWeight: "700",
  },
});