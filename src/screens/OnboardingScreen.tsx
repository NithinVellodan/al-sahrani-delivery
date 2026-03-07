import React, {useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import {setOnboardingDone} from '../utils/storage';

const {width, height} = Dimensions.get('window');
const TEAL = '#2EA87E';
const IMG_H = height * 0.52;

type Slide = {
  id: string;
  icon: 'utensils' | 'heart' | 'map-pin';
  iconBg: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
};

const slides: Slide[] = [
  {
    id: '1',
    icon: 'utensils',
    iconBg: '#E8F7F1',
    title: 'Order Fresh',
    highlight: 'Food',
    description:
      'Browse restaurants and order your favourite meals delivered right to your door.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '2',
    icon: 'heart',
    iconBg: '#FEE8E8',
    title: 'Save to',
    highlight: 'Favourites',
    description:
      "Save dishes you love and check out when you're ready — no rush.",
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: '3',
    icon: 'map-pin',
    iconBg: '#EEF0FF',
    title: 'Track Your',
    highlight: 'Order',
    description:
      'From kitchen to your door — follow every step of the delivery in real time.',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80',
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const isLastSlide = activeIndex === slides.length - 1;
  const activeSlide = slides[activeIndex];

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    animateContent(() => setActiveIndex(idx));
  };

  const animateContent = (cb: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(cb, 120);
  };

  const nextSlide = async () => {
    if (isLastSlide) {
      await setOnboardingDone();
      navigation.replace('Login');
      return;
    }
    const next = activeIndex + 1;
    listRef.current?.scrollToIndex({index: next, animated: true});
    animateContent(() => setActiveIndex(next));
  };

  const skip = async () => {
    await setOnboardingDone();
    navigation.replace('Login');
  };

  return (
    <View style={styles.root}>
      {/* ── Hero image (full-bleed) ── */}
      <View style={styles.imgContainer}>
        <FlatList
          ref={listRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <Image
              source={{uri: item.image}}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          scrollEventThrottle={16}
        />
        {/* Gradient-like fade at bottom */}
        <View style={styles.imgFade} />

        {/* Skip button overlay */}
        <Pressable
          style={[styles.skipBtn, {top: insets.top + 16}]}
          onPress={skip}
          hitSlop={10}>
          <Text style={styles.skipTxt}>Skip</Text>
        </Pressable>
      </View>

      {/* ── Content card ── */}
      <View style={[styles.card, {paddingBottom: insets.bottom + 20}]}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {slides.map((s, i) => (
            <View
              key={s.id}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Icon badge + title */}
        <Animated.View style={{opacity: fadeAnim}}>
          <View style={styles.iconRow}>
            <View
              style={[
                styles.iconBadge,
                {backgroundColor: activeSlide.iconBg},
              ]}>
              <Lucide name={activeSlide.icon} size={22} color={TEAL} />
            </View>
          </View>

          <Text style={styles.title}>
            {activeSlide.title}{' '}
            <Text style={styles.titleHighlight}>{activeSlide.highlight}</Text>
          </Text>

          <Text style={styles.description}>{activeSlide.description}</Text>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.btnArea}>
          <Pressable
            style={({pressed}) => [
              styles.primaryBtn,
              pressed && {opacity: 0.88},
            ]}
            onPress={nextSlide}>
            <Text style={styles.primaryTxt}>
              {isLastSlide ? 'Get Started' : 'Continue'}
            </Text>
            <Lucide
              name={isLastSlide ? 'rocket' : 'arrow-right'}
              size={18}
              color="#fff"
            />
          </Pressable>
        </View>

        {/* Terms */}
        <Text style={styles.terms}>
          By continuing you agree to our{' '}
          <Text style={styles.termsLink}>Terms</Text> &{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Image
  imgContainer: {
    height: IMG_H,
    width,
  },
  image: {
    width,
    height: IMG_H,
  },
  imgFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: COLORS.white,
    opacity: 0.18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  skipBtn: {
    position: 'absolute',
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  skipTxt: {
    fontSize: 13,
    ...FONTS.medium,
    color: '#fff',
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 24,
    paddingTop: 22,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: -4},
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6,
  },
  dot: {
    height: 4,
    width: 20,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    width: 40,
    backgroundColor: TEAL,
  },

  // Icon
  iconRow: {
    marginBottom: 14,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  title: {
    fontSize: 30,
    lineHeight: 38,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  titleHighlight: {
    color: TEAL,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    ...FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 28,
  },

  // Buttons
  btnArea: {
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    backgroundColor: TEAL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: TEAL,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  primaryTxt: {
    fontSize: 15,
    ...FONTS.bold,
    color: '#fff',
  },

  // Terms
  terms: {
    textAlign: 'center',
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    lineHeight: 17,
  },
  termsLink: {
    color: TEAL,
    textDecorationLine: 'underline',
  },
});
