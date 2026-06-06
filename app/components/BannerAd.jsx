import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRODUCTION_AD_UNIT_ID = 'ca-app-pub-9553974808339903/2259127557';

export default function SafeBannerAd({ unitId, size, style }) {
  const [Ads, setAds] = useState(null);
  const [adError, setAdError] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // Always safe hooks
  const handleAdLoaded = useCallback(() => {
    setAdError(false);
  }, []);

  const handleAdFailed = useCallback(() => {
    setAdError(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosed(true);
  }, []);

  // Load ads ONLY on native platforms
  useEffect(() => {
    if (Platform.OS === 'web') return;

    let mounted = true;

    const loadAds = async () => {
      try {
        const adsModule = await import('react-native-google-mobile-ads');

        if (mounted) {
          setAds(adsModule);
        }
      } catch (e) {
        if (mounted) {
          setAdError(true);
        }
      }
    };

    loadAds();

    return () => {
      mounted = false;
    };
  }, []);

  // -----------------------------
  // WEB OR ERROR STATES
  // -----------------------------
  if (
    Platform.OS === 'web' ||
    isClosed ||
    adError ||
    !Ads
  ) {
    return <View style={[styles.container, style]} />;
  }

  const { BannerAd, BannerAdSize, TestIds } = Ads;

  const finalUnitId =
    unitId || (__DEV__ ? TestIds.BANNER : PRODUCTION_AD_UNIT_ID);

  const finalSize =
    size || BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.adContainer}>
        <BannerAd
          unitId={finalUnitId}
          size={finalSize}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailed}
        />

        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    minHeight: 50,
  },
  adContainer: {
    position: 'relative',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});