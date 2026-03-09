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
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {FONTS} from '../theme/typography';
import {setAppLanguage} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

const TEAL = '#2EA87E';
const TEAL_LIGHT = '#E8F7F1';
const SCREEN_W = Dimensions.get('window').width;

const LANGUAGES = [
  {
    code: 'en' as const,
    label: 'English',
    native: 'English',
    flag: '🇬🇧',
    dir: 'LTR',
    hint: 'Left to right',
  },
  {
    code: 'ar' as const,
    label: 'Arabic',
    native: 'العربية',
    flag: '🇸🇦',
    dir: 'RTL',
    hint: 'Right to left',
  },
];

export default function LanguageSelectScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();

  // Hero section animations
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroY = useRef(new Animated.Value(-24)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;

  // Card animations (staggered)
  const card1 = useRef(new Animated.Value(0)).current;
  const card2 = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Hero fades + slides down
      Animated.parallel([
        Animated.timing(heroOpacity, {toValue: 1, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true}),
        Animated.timing(heroY, {toValue: 0, duration: 500, easing: Easing.out(Easing.ease), useNativeDriver: true}),
        Animated.spring(logoScale, {toValue: 1, friction: 7, tension: 60, useNativeDriver: true}),
      ]),
      // Cards stagger in
      Animated.stagger(100, [
        Animated.timing(card1, {toValue: 1, duration: 380, easing: Easing.out(Easing.ease), useNativeDriver: true}),
        Animated.timing(card2, {toValue: 1, duration: 380, easing: Easing.out(Easing.ease), useNativeDriver: true}),
      ]),
      Animated.timing(footerOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const cardAnims = [card1, card2];

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>

      {/* ── Teal hero panel ── */}
      <View style={styles.hero}>
        {/* Soft decorative rings */}
        <View style={styles.ring1} />
        <View style={styles.ring2} />

        <Animated.View
          style={[
            styles.heroContent,
            {opacity: heroOpacity, transform: [{translateY: heroY}, {scale: logoScale}]},
          ]}>
          <Image
            source={require('../images/logo-no-background.png')}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>Al Zahrani</Text>
          <View style={styles.tagPill}>
            <Text style={styles.tagTxt}>FOOD DELIVERY</Text>
          </View>
        </Animated.View>
      </View>

      {/* ── Bottom sheet ── */}
      <View style={[styles.sheet, {paddingBottom: insets.bottom + 24}]}>

        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Section label */}
        <View style={styles.sectionRow}>
          <View style={styles.globeBadge}>
            <Lucide name="globe" size={16} color={TEAL} />
          </View>
          <View>
            <Text style={styles.sheetTitle}>Choose Language</Text>
            <Text style={styles.sheetSub}>Select your preferred language to continue</Text>
          </View>
        </View>

        {/* Language options */}
        <View style={styles.optionList}>
          {LANGUAGES.map((lang, idx) => {
            const anim = cardAnims[idx];
            return (
              <Animated.View
                key={lang.code}
                style={{
                  opacity: anim,
                  transform: [{translateY: anim.interpolate({inputRange: [0, 1], outputRange: [20, 0]})}],
                }}>
                {idx > 0 && <View style={styles.divider} />}
                <Pressable
                  style={({pressed}) => [
                    styles.optionRow,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => selectLanguage(lang.code)}
                  android_ripple={{color: TEAL_LIGHT}}>

                  {/* Flag circle */}
                  <View style={styles.flagWrap}>
                    <Text style={styles.flagEmoji}>{lang.flag}</Text>
                  </View>

                  {/* Labels */}
                  <View style={styles.optionTexts}>
                    <Text style={styles.optionNative}>{lang.native}</Text>
                    <Text style={styles.optionMeta}>{lang.label} · {lang.hint}</Text>
                  </View>

                  {/* Direction badge + arrow */}
                  <View style={styles.optionRight}>
                    <View style={styles.dirBadge}>
                      <Text style={styles.dirTxt}>{lang.dir}</Text>
                    </View>
                    <View style={styles.arrowWrap}>
                      <Lucide name="chevron-right" size={16} color={TEAL} />
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Footer note */}
        <Animated.Text style={[styles.footer, {opacity: footerOpacity}]}>
          You can change this anytime from your Profile settings
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TEAL,
  },

  // ── Hero (teal top half) ──────────────────────────────────────────────────
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring1: {
    position: 'absolute',
    width: SCREEN_W * 1.4,
    height: SCREEN_W * 1.4,
    borderRadius: SCREEN_W * 0.7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    top: -SCREEN_W * 0.55,
  },
  ring2: {
    position: 'absolute',
    width: SCREEN_W * 0.9,
    height: SCREEN_W * 0.9,
    borderRadius: SCREEN_W * 0.45,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    top: -SCREEN_W * 0.25,
    right: -SCREEN_W * 0.2,
  },
  heroContent: {
    alignItems: 'center',
  },
  logoImg: {
    width: 160,
    height: 64,
    tintColor: '#fff',
  },
  brandName: {
    marginTop: 10,
    fontSize: 28,
    ...FONTS.bold,
    color: '#fff',
    letterSpacing: 1,
  },
  tagPill: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  tagTxt: {
    fontSize: 11,
    ...FONTS.bold,
    color: '#fff',
    letterSpacing: 2,
  },

  // ── Bottom sheet (white) ─────────────────────────────────────────────────
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: -6},
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 22,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  globeBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: TEAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sheetTitle: {
    fontSize: 18,
    ...FONTS.bold,
    color: '#222',
  },
  sheetSub: {
    fontSize: 12,
    ...FONTS.regular,
    color: '#999',
    marginTop: 2,
  },

  // ── Language option cards ────────────────────────────────────────────────
  optionList: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EBEBEB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    backgroundColor: '#fff',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    gap: 14,
  },
  optionPressed: {
    backgroundColor: '#F5FDFB',
  },
  flagWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#EBEBEB',
  },
  flagEmoji: {
    fontSize: 26,
  },
  optionTexts: {
    flex: 1,
  },
  optionNative: {
    fontSize: 17,
    ...FONTS.bold,
    color: '#222',
  },
  optionMeta: {
    fontSize: 12,
    ...FONTS.regular,
    color: '#999',
    marginTop: 2,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dirBadge: {
    backgroundColor: TEAL_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  dirTxt: {
    fontSize: 10,
    ...FONTS.bold,
    color: TEAL,
    letterSpacing: 0.5,
  },
  arrowWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: TEAL_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer: {
    marginTop: 20,
    fontSize: 12,
    ...FONTS.regular,
    color: '#BDBDBD',
    textAlign: 'center',
    lineHeight: 18,
  },
});
