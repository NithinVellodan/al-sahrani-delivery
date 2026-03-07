import React, {useRef, useState} from 'react';
import {
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
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import {setOnboardingDone} from '../utils/storage';

const {width, height} = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Order Fresh\nFood',
    description:
      'Browse restaurants and order your favourite meals delivered right to your door.',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
    arch: COLORS.sandLight,
  },
  {
    id: '2',
    title: 'Wishlist\n& Cart',
    description:
      "Save dishes you love and check out when you're ready \u2014 no rush.",
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
    arch: COLORS.paleCream,
  },
  {
    id: '3',
    title: 'Track Your\nOrder',
    description:
      'From kitchen to your door — follow every step of the delivery in real time.',
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80',
    arch: COLORS.lightIvory,
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

function OnboardingScreen({navigation}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<(typeof slides)[number]>>(null);

  const isLastSlide = activeIndex === slides.length - 1;
  const activeSlide = slides[activeIndex];

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const x = event.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(x / width));
  };

  const nextSlide = async () => {
    if (isLastSlide) {
      await setOnboardingDone();
      navigation.replace('Login');
      return;
    }
    listRef.current?.scrollToIndex({index: activeIndex + 1, animated: true});
  };

  const skip = async () => {
    await setOnboardingDone();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Progress dots at top */}
      <View style={styles.dotsRow}>
        {slides.map((slide, index) => (
          <View
            key={slide.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Title */}
      <Text style={styles.title}>{activeSlide.title}</Text>

      {/* Scrollable slide images */}
      <View style={styles.imageWrapper}>
        <View style={[styles.arch, {backgroundColor: activeSlide.arch}]} />
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
        />
      </View>

      {/* Description */}
      <Text style={styles.description}>{activeSlide.description}</Text>

      {/* CTA buttons */}
      <View style={styles.buttonArea}>
        <Pressable style={styles.primaryBtn} onPress={nextSlide}>
          <Text style={styles.primaryText}>
            {isLastSlide ? 'Get Started' : 'Continue'}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={skip}>
          <Text style={styles.secondaryText}>Skip</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        By continuing you agree to our{' '}
        <Text style={styles.footerLink}>Terms</Text> and{' '}
        <Text style={styles.footerLink}>Privacy Policy</Text>.
      </Text>
    </View>
  );
}

const ARCH_SIZE = width * 0.82;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
  },

  /* dots */
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 28,
  },
  dot: {
    width: 28,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.offWhite,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: COLORS.softGold,
    width: 52,
  },

  /* title */
  title: {
    fontSize: 34,
    lineHeight: 42,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: 28,
  },

  /* image area */
  imageWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    height: height * 0.38,
  },
  arch: {
    position: 'absolute',
    bottom: 0,
    width: ARCH_SIZE,
    height: ARCH_SIZE * 0.78,
    borderTopLeftRadius: ARCH_SIZE / 2,
    borderTopRightRadius: ARCH_SIZE / 2,
  },
  image: {
    width: width - 48,
    height: height * 0.38,
    borderRadius: 24,
  },

  /* description */
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.textSecondary,
    ...FONTS.regular,
    marginBottom: 32,
  },

  /* buttons */
  buttonArea: {
    gap: 12,
    marginBottom: 18,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  secondaryText: {
    fontSize:14,
    color: COLORS.textPrimary,
    ...FONTS.medium,
  },

  /* footer */
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  footerLink: {
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },
});

export default OnboardingScreen;
