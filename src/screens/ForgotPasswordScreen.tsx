import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import BrandLogo from '../components/BrandLogo';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import toast from '../components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const BANNER_URI =
  'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

function useFadeSlide(delay = 0) {
  const anim = useRef(new Animated.Value(0)).current;
  return {
    anim,
    animate: () =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 520,
        delay,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    style: {
      opacity: anim,
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [32, 0],
          }),
        },
      ],
    },
  };
}

function ForgotPasswordScreen({navigation}: Props) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const bannerStyle = {
    opacity: bannerAnim,
    transform: [
      {
        scale: bannerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1.06, 1],
        }),
      },
    ],
  };

  const title      = useFadeSlide(200);
  const subtitle   = useFadeSlide(320);
  const phoneRow   = useFadeSlide(420);
  const sendBtn    = useFadeSlide(520);
  const backLink   = useFadeSlide(620);

  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(btnScale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  const onPressOut = () =>
    Animated.spring(btnScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.stagger(0, [
        title.animate(),
        subtitle.animate(),
        phoneRow.animate(),
        sendBtn.animate(),
        backLink.animate(),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSend = async () => {
    if (!phone.trim()) {
      toast.warning('Please enter your registered mobile number.', {
        title: 'Missing number',
      });
      return;
    }
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setLoading(false);
    toast.success('Reset code sent to +966 ' + phone.trim(), {
      title: 'Code sent',
      duration: 3000,
    });
    setTimeout(() => navigation.navigate('OTP', {phone: phone.trim()}), 600);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.root}
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Hero Banner */}
        <Animated.View style={bannerStyle}>
          <Image
            source={{uri: BANNER_URI}}
            style={styles.banner}
            resizeMode="cover"
          />
          <BrandLogo />
        </Animated.View>

        <View style={styles.content}>

          {/* Title */}
          <Animated.Text style={[styles.title, title.style]}>
            Forgot{'\n'}Password?
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, subtitle.style]}>
            Enter your registered mobile number — we'll send you a reset code.
          </Animated.Text>

          {/* Phone Row */}
          <Animated.View style={[styles.phoneRow, phoneRow.style]}>
            <TouchableOpacity style={styles.countryPicker} activeOpacity={0.7}>
              <Text style={styles.flagEmoji}>🇸🇦</Text>
              <Text style={styles.chevron}>▾</Text>
            </TouchableOpacity>
            <View style={styles.verticalDivider} />
            <Text style={styles.countryCode}>+966</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter Mobile Number"
              keyboardType="phone-pad"
              placeholderTextColor="#AAAAAA"
              style={styles.phoneInput}
            />
          </Animated.View>

          {/* Send Button */}
          <Animated.View
            style={[sendBtn.style, {transform: [{scale: btnScale}]}]}>
            <Pressable
              style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
              onPress={onSend}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}>
              <Text style={styles.actionBtnLabel}>
                {loading ? 'Sending…' : 'Send Reset Code'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Back to Login */}
          <Animated.View style={[styles.backRow, backLink.style]}>
            <Text style={styles.backGrey}>Remember your password? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backLink}>Log in</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  banner: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  content: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 48,
  },
  title: {
    fontSize: 24,
    lineHeight: 34,
    color: '#1A1A1A',
    ...FONTS.bold,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#888888',
    ...FONTS.regular,
    marginBottom: 26,
    lineHeight: 22,
  },

  /* Phone row */
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    height: 56,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 24,
  },
  chevron: {
    fontSize: 11,
    color: '#666',
    marginLeft: 3,
    marginTop: 1,
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  countryCode: {
    fontSize: 15,
    color: '#333333',
    ...FONTS.medium,
    marginRight: 6,
  },
  phoneInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    ...FONTS.regular,
    padding: 0,
  },

  /* Action button */
  actionBtn: {
    backgroundColor: COLORS.softGold,
    borderRadius: 10,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: COLORS.softGold,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtnDisabled: {
    opacity: 0.65,
  },
  actionBtnLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },

  /* Back link */
  backRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backGrey: {
    fontSize: 14,
    color: '#999999',
    ...FONTS.regular,
  },
  backLink: {
    fontSize: 14,
    color: COLORS.brandPrimary,
    ...FONTS.bold,
    textDecorationLine: 'underline',
  },
});

export default ForgotPasswordScreen;
