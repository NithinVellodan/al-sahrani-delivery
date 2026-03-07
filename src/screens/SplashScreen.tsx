import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Image, StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import {getAppLanguage, getAuthToken, isOnboardingDone} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

function SplashScreen({navigation}: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const dots = useRef(
    Array.from({length: 3}).map(() => new Animated.Value(0.35)),
  ).current;

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 850,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    const dotLoops = dots.map((dot, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 140),
          Animated.timing(dot, {
            toValue: 1,
            duration: 520,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.35,
            duration: 520,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    entrance.start();
    dotLoops.forEach(loop => loop.start());

    const boot = setTimeout(async () => {
      const [language, onboardingDone, token] = await Promise.all([
        getAppLanguage(),
        isOnboardingDone(),
        getAuthToken(),
      ]);

      if (!language) {
        navigation.replace('LanguageSelect');
        return;
      }
      if (!onboardingDone) {
        navigation.replace('Onboarding');
        return;
      }
      if (!token) {
        navigation.replace('Login');
        return;
      }
      navigation.replace('MainTabs');
    }, 1800);

    return () => {
      clearTimeout(boot);
      dotLoops.forEach(loop => loop.stop());
      entrance.stop();
    };
  }, [dots, logoOpacity, logoScale, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoWrap,
          {opacity: logoOpacity, transform: [{scale: logoScale}]},
        ]}>
        <Image
          source={require('../images/latest-logo.png')}
          style={styles.appIcon}
          resizeMode="contain"
        />
        {/* <Text style={styles.brandSubTitle}>Food Delivery</Text> */}
      </Animated.View>

      <View style={styles.loaderRow}>
        {dots.map((dot, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: dot,
                transform: [
                  {
                    scale: dot.interpolate({
                      inputRange: [0.35, 1],
                      outputRange: [0.9, 1.22],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
  },
  appIcon: {
    width: 140,
    height: 140,
    marginBottom: 4,
  },
  brandSubTitle: {
    marginTop: 8,
    color: COLORS.sandLight,
    fontSize: 16,
    ...FONTS.medium,
  },
  loaderRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 5,
    backgroundColor: COLORS.softGold,
  },
});

export default SplashScreen;
