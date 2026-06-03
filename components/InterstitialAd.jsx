import { Platform } from 'react-native';
import {
  AdEventType,
  InterstitialAd,
} from 'react-native-google-mobile-ads';

// State
let interstitial = null;
let isLoaded = false;
let lastShownTime = 0;

// ⏱ Minimum interval (5 minutes)
const MIN_INTERVAL = 5 * 60 * 1000;

// Ad Unit ID
const adUnitId = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'
  : 'ca-app-pub-9553974808339903/2104867279';

// Create interstitial
const createInterstitial = () => {
  try {
    interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
      tagForChildDirectedTreatment: true, // important for policy
    });

    interstitial.onAdEvent((event) => {
      switch (event.type) {
        case AdEventType.LOADED:
          isLoaded = true;
          break;

        case AdEventType.ERROR:
          isLoaded = false;
          break;

        case AdEventType.CLOSED:
          isLoaded = false;
          loadInterstitial(); // preload next ad
          break;
      }
    });
  } catch (e) {
    console.log('Error creating interstitial:', e);
  }
};

// Load interstitial
export const loadInterstitial = () => {
  if (Platform.OS === 'web') return;

  try {
    if (!interstitial) {
      createInterstitial();
    }

    interstitial?.load();
  } catch (e) {
    console.log('Error loading interstitial:', e);
  }
};

// Show interstitial safely
export const showInterstitial = (onDone) => {
  if (Platform.OS === 'web') {
    onDone();
    return;
  }

  try {
    const now = Date.now();
    const canShow = now - lastShownTime >= MIN_INTERVAL;

    if (!interstitial || !isLoaded || !canShow) {
      onDone(); // fallback
      return;
    }

    lastShownTime = now;

    const unsubscribe = interstitial.onAdEvent((event) => {
      if (
        event.type === AdEventType.CLOSED ||
        event.type === AdEventType.ERROR
      ) {
        unsubscribe();
        isLoaded = false;
        loadInterstitial();
        onDone();
      }
    });

    interstitial.show();
  } catch (e) {
    console.log('Error showing interstitial:', e);
    onDone(); // fail-safe
  }
};

// Optional cleanup (if needed)
export const cleanupInterstitial = () => {
  interstitial = null;
  isLoaded = false;
};

export default function InterstitialAdComponent() {
  return null;
}