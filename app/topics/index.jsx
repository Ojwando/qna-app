import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import HTML from "react-native-render-html";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Interstitial helper
import { showInterstitial } from "../components/InterstitialAd";

/* -------------------- DESIGN SYSTEM -------------------- */
const COLORS = {
  primary: "#007AFF",
  secondary: "#34C759",
  background: "#F2F5F8",
  card: "#FFFFFF",
  textPrimary: "#1C1C1E",
  textSecondary: "#8E8E93",
  shadow: "rgba(0,0,0,0.1)",
  separator: "#E5E5EA",
};

const API_URL = "https://qna-app.edufocus.co.ke/api/topics";

export default function TopicsScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  
  const [topics, setTopics] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const baseFontStyle = useMemo(() => ({
    fontFamily: Platform.OS === 'ios' ? "System" : "serif",
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  }), []);

  /* -------------------- DATA FETCHING -------------------- */
  const fetchTopics = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) throw new Error("No internet");

      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setTopics([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  /* -------------------- HANDLERS -------------------- */
  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const navigateWithInterstitial = (path) => {
    const nextCount = openCount + 1;
    setOpenCount(nextCount);

    if (nextCount % 3 === 0) {
      // Logic: Show ad, then push path on close
      showInterstitial(() => router.push(path));
    } else {
      router.push(path);
    }
  };

  /* -------------------- RENDER ITEM -------------------- */
  const renderItem = ({ item, index }) => {
    const id = item?.id ?? index;
    const isExpanded = expandedIds.includes(id);
    
    const rawDescription = typeof item?.description === "string" 
      ? item.description 
      : "No description available.";

    const previewHtml = rawDescription.length > 80 && !isExpanded
        ? `${rawDescription.slice(0, 80)}...`
        : rawDescription;

    const hasValidImage = typeof item?.image_url === "string" && item.image_url.startsWith("http");

    const path = `/topics/${id}?topicTitle=${encodeURIComponent(String(item?.title ?? ""))}
    &image=${encodeURIComponent(String(item?.image_url ?? ""))}`;

    return (
      <TouchableOpacity
        style={styles.topicCard}
        activeOpacity={0.85}
        onPress={() => navigateWithInterstitial(path)}
      >
        <View style={styles.cardHeader}>
          {hasValidImage ? (
            <Image source={{ uri: item.image_url }} style={styles.topicImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="folder-outline" size={24} color={COLORS.textSecondary} />
            </View>
          )}

          <View style={styles.titleContainer}>
            <Text style={styles.topicTitle} numberOfLines={2}>
              {String(item?.title ?? "Untitled")}
            </Text>
            <View style={styles.metadataRow}>
              <Ionicons name="school-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.gradeText}>Grade: {String(item?.grade_level ?? "-")}</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionContainer}>
          <HTML
            source={{ html: previewHtml }}
            contentWidth={windowWidth - 60}
            baseStyle={baseFontStyle}
          />

          {rawDescription.length > 80 && (
            <Pressable onPress={() => toggleExpand(id)} style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>{isExpanded ? "Show Less" : "Read More"}</Text>
              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={14} color={COLORS.primary} />
            </Pressable>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.questionCountText}>
            <Ionicons name="bulb-outline" size={14} /> View Questions
          </Text>
          <Ionicons name="arrow-forward-circle" size={28} color={COLORS.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading strands...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Strands</Text>
        <Text style={styles.headerSubtitle}>Select a strand to begin your quiz prep.</Text>
      </View>

      <FlatList
        data={topics}
        keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchTopics(true)}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: COLORS.textSecondary },
  header: {
    padding: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  headerTitle: { fontSize: 24, fontWeight: "700", color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 16, marginTop: 4, color: COLORS.textSecondary },
  listContent: { padding: 12, paddingBottom: 40 },
  topicCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
  },
  topicImage: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: { flex: 1 },
  topicTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textPrimary },
  metadataRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  gradeText: { marginLeft: 5, fontSize: 13, color: COLORS.textSecondary },
  descriptionContainer: { marginBottom: 10 },
  readMoreButton: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  readMoreText: { marginRight: 4, fontWeight: "600", color: COLORS.primary, fontSize: 13 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
  },
  questionCountText: { fontWeight: "600", color: COLORS.primary, fontSize: 14 },
});