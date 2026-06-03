import { Platform } from "react-native";
import mobileAds, {
  AdEventType,
  InterstitialAd,
  TestIds,
} from "react-native-google-mobile-ads";

/* --------------------------------------------------
   Ad Unit ID
-------------------------------------------------- */
const AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-9553974808339903/2104867279";

/* --------------------------------------------------
   Singleton state
-------------------------------------------------- */
let interstitial = null;
let isLoaded = false;
let isLoading = false;
let isInitialized = false;

/* --------------------------------------------------
   Initialize Mobile Ads (ONCE)
-------------------------------------------------- */
const initAds = async () => {
  if (Platform.OS === "web" || isInitialized) return;

  await mobileAds().initialize();
  isInitialized = true;
};

/* --------------------------------------------------
   Create interstitial (ONCE)
-------------------------------------------------- */
const createInterstitial = () => {
  if (interstitial) return;

  interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
    isLoading = false;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    loadInterstitial();
  });

  interstitial.addAdEventListener(AdEventType.ERROR, (err) => {
    isLoaded = false;
    isLoading = false;
  });
};

/* --------------------------------------------------
   Preload interstitial
-------------------------------------------------- */
export const loadInterstitial = async () => {
  if (Platform.OS === "web") return;

  await initAds();
  createInterstitial();

  if (isLoaded || isLoading) return;

  isLoading = true;
  interstitial.load();
};

/* --------------------------------------------------
   Show interstitial
-------------------------------------------------- */
export const showInterstitial = (onDone = () => {}) => {
  if (Platform.OS === "web") {
    onDone();
    return;
  }

  if (isLoaded && interstitial) {
    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubscribe();
        onDone();
      }
    );

    interstitial.show();
  } else {
    onDone();
    loadInterstitial();
  }
};

/* --------------------------------------------------
   Auto preload
-------------------------------------------------- */
if (Platform.OS !== "web") {
  loadInterstitial().catch(() => {});
}

export default function InterstitialAdComponent() {
  return null;
}
