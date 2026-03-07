import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  I18nManager,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import {setAppLanguage} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

const TEAL = '#2EA87E';

const LANGUAGES = [
  {
    code: 'en' as const,
    label: 'English',
    native: 'English',
    flag: '🇬🇧',
    dir: 'LTR',
  },
  {
    code: 'ar' as const,
    label: 'Arabic',
    native: 'العربية',
    flag: '🇸🇦',
    dir: 'RTL',
  },
];

export default function LanguageSelectScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();

  // Entrance animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const sheetY = useRef(new Animated.Value(60)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(sheetY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(sheetOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [logoOpacity, logoScale, sheetY, sheetOpacity]);

  const selectLanguage = async (language: 'en' | 'ar') => {
    await setAppLanguage(language);
    if (language === 'ar' && !I18nManager.isRTL) {
      Alert.alert(
        'Restart Required',
        'Arabic layout will apply after the app restarts.',
      );
    }
    navigation.replace('Onboarding');
  };

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* ── Background decoration ── */}
      <View style={styles.topBlob} />
      <View style={styles.bottomBlob} />

      {/* ── Logo area ── */}
      <Animated.View
        style={[
          styles.logoSection,
          {opacity: logoOpacity, transform: [{scale: logoScale}]},
        ]}>
        <Image
          source={require('../images/latest-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Fresh. Fast. Saudi.</Text>
      </Animated.View>

      {/* ── Language card ── */}
      <Animated.View
        style={[
          styles.card,
          {opacity: sheetOpacity, transform: [{translateY: sheetY}]},
        ]}>
        {/* Globe badge */}
        <View style={styles.globeBadge}>
          <Lucide name="globe" size={20} color={TEAL} />
        </View>

        <Text style={styles.cardTitle}>Choose your language</Text>
        <Text style={styles.cardSub}>
          You can change this anytime from your profile.
        </Text>

        <View style={styles.optionList}>
          {LANGUAGES.map((lang, idx) => (
            <React.Fragment key={lang.code}>
              {idx > 0 && <View style={styles.divider} />}
              <Pressable
                style={({pressed}) => [
                  styles.optionRow,
                  pressed && styles.optionPressed,
                ]}
                onPress={() => selectLanguage(lang.code)}
                android_ripple={{color: '#E8F7F1'}}>
                {/* Flag circle */}
                <View style={styles.flagWrap}>
                  <Text style={styles.flagEmoji}>{lang.flag}</Text>
                </View>

                {/* Text */}
                <View style={styles.optionTexts}>
                  <Text style={styles.optionLabel}>{lang.native}</Text>
                  <Text style={styles.optionSub}>
                    {lang.label} · {lang.dir}
                  </Text>
                </View>

                {/* Arrow */}
                <View style={styles.arrowWrap}>
                  <Lucide name="chevron-right" size={18} color={COLORS.mediumGray} />
                </View>
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </Animated.View>

      {/* ── Footer ── */}
      <Text style={[styles.footer, {marginBottom: insets.bottom + 16}]}>
        Al Zahrani Logistics · Riyadh, KSA
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7F9F8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Decorative blobs
  topBlob: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D4F0E4',
    opacity: 0.5,
  },
  bottomBlob: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#D4F0E4',
    opacity: 0.35,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: 180,
    height: 72,
  },
  tagline: {
    marginTop: 10,
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.mediumGray,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Card
  card: {
    width: '88%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
  },
  globeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F7F1',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 13,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    lineHeight: 19,
  },

  // Options
  optionList: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EBEBEB',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EBEBEB',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    gap: 14,
  },
  optionPressed: {
    backgroundColor: '#F5FDFB',
  },
  flagWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 24,
  },
  optionTexts: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  optionSub: {
    fontSize: 12,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    letterSpacing: 0.4,
  },
});
