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
  useWindowDimensions,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import {setAppLanguage} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'LanguageSelect'>;

const LIGHT_GOLD = '#fff'; // light gold for top background
// const LIGHT_GOLD = '#1c6aa1'; // light gold for top background

function LanguageSelectScreen({navigation}: Props) {
  const {height} = useWindowDimensions();
  const topSectionHeight = height * 0.70;

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  const selectLanguage = async (language: 'en' | 'ar') => {
    await setAppLanguage(language);

    if (language === 'ar' && !I18nManager.isRTL) {
      Alert.alert(
        'Restart Required',
        'Arabic layout will apply after app restart. Continuing with saved language.',
      );
    }
    navigation.replace('Onboarding');
  };

  return (
    <View style={styles.container}>
      {/* Top section: light gold background + app icon */}
      <View style={[styles.topSection, {height: topSectionHeight}]}>
        <Animated.View
          style={{opacity, transform: [{scale}, {translateY}]}}>
          <Image
            source={require('../images/latest-logo.png')}
            style={styles.appIcon}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Bottom modal sheet */}
      <View style={styles.modalSheet}>
        <View style={styles.dragHandle} />
        <Text style={styles.modalTitle}>Select Your Language</Text>

        <Pressable
          style={styles.languageRow}
          onPress={() => selectLanguage('en')}
          android_ripple={{color: COLORS.greyClr}}>
          <Text style={styles.languageLabel}>English</Text>
        </Pressable>

        <View style={styles.separator} />

        <Pressable
          style={styles.languageRow}
          onPress={() => selectLanguage('ar')}
          android_ripple={{color: COLORS.greyClr}}>
          <Text style={styles.languageLabel}>العربية</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIGHT_GOLD,
  },
  topSection: {
    backgroundColor: LIGHT_GOLD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIcon: {
    width: 160,
    height: 160,
  },
  modalSheet: {
    flex: 1,
    backgroundColor: COLORS.black,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.lightGrey2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    ...FONTS.bold,
    color: COLORS.white,
    marginBottom: 16,
  },
  languageRow: {
    paddingVertical: 18,
    paddingHorizontal: 4,
    alignSelf: 'stretch',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.lightGrey2,
  },
  languageLabel: {
    fontSize: 18,
    ...FONTS.medium,
    color: COLORS.white,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
});

export default LanguageSelectScreen;
