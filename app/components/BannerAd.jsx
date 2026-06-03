import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PRODUCTION_AD_UNIT_ID = 'ca-app-pub-9553974808339903/2259127557';

export default function SafeBannerAd({ unitId, size, style }) {
  // --- 1. DECLARE ALL HOOKS AT THE TOP (UNCONDITIONALLY) ---
  const [Ads, setAds] = useState(null);
  const [adError, setAdError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  // Even if we don't use these immediately, they MUST be declared here
  const handleAdLoaded = useCallback(() => {
    setAdError(false);
  }, []);

  const handleAdFailed = useCallback((error) => {
    setAdError(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosed(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const ads = await import('react-native-google-mobile-ads');
        if (mounted) {
          setAds(ads);
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setIsLoading(false);
          setAdError(true);
        }
      }
    })();
    return () => { mounted = false; };
  }, []);

  // --- 2. CONDITIONAL RETURNS MUST COME AFTER ALL HOOKS ---
  if (isLoading || !Ads || Platform.OS === 'web' || adError || isClosed) {
    return <View style={[styles.container, style]} />;
  }

  // --- 3. AD LOGIC ---
  const { BannerAd, BannerAdSize, TestIds } = Ads;
  const finalUnitId = unitId || (__DEV__ ? TestIds.BANNER : PRODUCTION_AD_UNIT_ID);
  const finalSize = size || BannerAdSize.ANCHORED_ADAPTIVE_BANNER;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.adContainer}>
        <BannerAd
          unitId={finalUnitId}
          size={finalSize}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          onAdLoaded={handleAdLoaded}
          onAdFailedToLoad={handleAdFailed}
        />
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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