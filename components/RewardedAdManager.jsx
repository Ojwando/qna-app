import { Platform } from 'react-native';
import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';

// --- STATE ---
let rewardedAd = null;
let isAdLoaded = false;

// --- AD UNIT ID ---
const AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/5224354917' // Test ID
  : 'ca-app-pub-9553974808339903/1378517427'; // Production ID

// --- CREATE REWARDED AD INSTANCE ---
const createRewardedAd = () => {
  if (Platform.OS === 'web') return;

  try {
    rewardedAd = RewardedAd.createForAdRequest(AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
      tagForChildDirectedTreatment: true, // policy compliance
    });

    rewardedAd.onAdEvent((event) => {
      if (event.type === RewardedAdEventType.LOADED) {
        isAdLoaded = true;
      }
    });
  } catch (error) {
    console.warn('[RewardedAd] Error creating ad:', error);
  }
};

// --- LOAD REWARDED AD ---
export const loadRewardedAd = () => {
  if (Platform.OS === 'web') return;

  try {
    if (!rewardedAd) createRewardedAd();
    rewardedAd?.load();
  } catch (error) {
    console.warn('[RewardedAd] Error loading ad:', error);
  }
};

// --- SHOW REWARDED AD ---
export const showRewardedAd = (onReward) => {
  if (Platform.OS === 'web') {
    onReward?.();
    return;
  }

  try {
    if (!rewardedAd || !isAdLoaded) {
      console.log('[RewardedAd] Ad not ready, giving reward anyway.');
      onReward?.(); // fallback
      return;
    }

    let rewardedGranted = false;

    const unsubscribe = rewardedAd.onAdEvent((event) => {
      switch (event.type) {
        case RewardedAdEventType.EARNED_REWARD:
          rewardedGranted = true;
          break;

        case RewardedAdEventType.CLOSED:
        case RewardedAdEventType.ERROR:
          unsubscribe(); // cleanup listener
          isAdLoaded = false;
          loadRewardedAd(); // preload next ad

          // Ensure reward is given even on error/close
          if (!rewardedGranted) onReward?.();
          break;
      }
    });

    rewardedAd.show();
  } catch (error) {
    console.warn('[RewardedAd] Error showing ad:', error);
    onReward?.(); // fail-safe
  }
};