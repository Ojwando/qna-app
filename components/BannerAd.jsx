import { useState } from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

import { Ionicons } from "@expo/vector-icons";

/* -------------------- PRODUCTION AD UNIT -------------------- */
const PRODUCTION_AD_UNIT_ID =
  "ca-app-pub-9553974808339903/2259127557";

/* -------------------- COMPONENT -------------------- */
export default function SafeBannerAd({
  unitId,
  size,
  style,
  closable = true,
}) {
  const [visible, setVisible] = useState(true);

  /* -------------------- HIDE ON WEB -------------------- */
  if (Platform.OS === "web") {
    return null;
  }

  /* -------------------- CLOSED BY USER -------------------- */
  if (!visible) {
    return null;
  }

  /* -------------------- FINAL CONFIG -------------------- */
  const finalUnitId =
    unitId ||
    (__DEV__
      ? TestIds.BANNER
      : PRODUCTION_AD_UNIT_ID);

  const finalSize =
    size ||
    BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

  /* -------------------- UI -------------------- */
  return (
    <View style={[styles.wrapper, style]}>
      {/* CLOSE BUTTON */}
      {closable && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setVisible(false)}
        >
          <Ionicons
            name="close"
            size={18}
            color="#666"
          />
        </TouchableOpacity>
      )}

      {/* GOOGLE BANNER */}
      <BannerAd
        unitId={finalUnitId}
        size={finalSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
          tagForChildDirectedTreatment: true,
        }}
        onAdLoaded={() => {
          console.log("Banner loaded");
        }}
        onAdFailedToLoad={(error) => {
          console.log(
            "Banner failed to load:",
            error
          );
        }}
      />
    </View>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    paddingTop: 8,
    backgroundColor: "#fff",
  },

  closeButton: {
    alignSelf: "flex-end",
    marginRight: 14,
    marginBottom: 6,
    padding: 4,
  },
});