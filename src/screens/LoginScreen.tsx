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
import {Lucide} from '@react-native-vector-icons/lucide';
import BrandLogo from '../components/BrandLogo';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import {setAuthToken} from '../utils/storage';
import toast from '../components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

// ─── Mock credentials ─────────────────────────────────────────────────────────
const VALID_PHONE    = '9999999999';
const VALID_PASSWORD = '123456';

const BANNER_URI =
  'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const GOOGLE_ICON_URI =
  'https://cdn.iconscout.com/icon/free/png-256/free-google-icon-svg-download-png-1507807.png';

const APPLE_ICON_URI =
  'https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo-1536x864.png';

// ─── Shared fade-slide hook ───────────────────────────────────────────────────

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

// ─── Screen ───────────────────────────────────────────────────────────────────

function LoginScreen({navigation}: Props) {
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  // Banner zoom-fade
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

  // Staggered field entrances
  const title       = useFadeSlide(200);
  const subtitle    = useFadeSlide(320);
  const phoneRow    = useFadeSlide(400);
  const passwordRow = useFadeSlide(460);
  const forgotRow   = useFadeSlide(510);
  const continueBtn = useFadeSlide(560);
  const orRow       = useFadeSlide(640);
  const social      = useFadeSlide(720);
  const terms       = useFadeSlide(800);

  // Button press-scale
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
        passwordRow.animate(),
        forgotRow.animate(),
        continueBtn.animate(),
        orRow.animate(),
        social.animate(),
        terms.animate(),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login logic ─────────────────────────────────────────────────────────────

  const onLogin = async () => {
    if (!phone.trim()) {
      toast.warning('Please enter your mobile number.', {title: 'Missing number'});
      return;
    }
    if (!password) {
      toast.warning('Please enter your password.', {title: 'Missing password'});
      return;
    }

    setLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 900));

    // Unknown phone → redirect to sign-up
    if (phone.trim() !== VALID_PHONE) {
      setLoading(false);
      toast.error(
        'No account found for this number. Create one to continue.',
        {title: 'Not registered', duration: 4500},
      );
      setTimeout(() => navigation.navigate('SignUp'), 1200);
      return;
    }

    // Known phone, wrong password
    if (password !== VALID_PASSWORD) {
      setLoading(false);
      toast.error('Incorrect password. Please try again or reset it.', {
        title: 'Wrong password',
        duration: 4000,
      });
      return;
    }

    // ✓ Correct credentials
    await setAuthToken(`alz-token-${Date.now()}`);
    setLoading(false);
    toast.success('Welcome back! Select your delivery location.', {
      title: 'Logged in',
      duration: 2500,
    });
    setTimeout(
      () => navigation.navigate('LocationSelect'),
      500,
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
          {/* <Animated.Text style={[styles.title, title.style]}>
            Welcome back 👋
          </Animated.Text> */}

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, subtitle.style]}>
            Log in to continue your order
          </Animated.Text>

          {/* Phone Row */}
          <Animated.View style={[styles.phoneRow, phoneRow.style]}>
            <TouchableOpacity style={styles.countryPicker} activeOpacity={0.7}>
              <Text style={styles.flagEmoji}>🇸🇦</Text>
              <Lucide name="chevron-down" size={14} color="#2EA87E" />
            </TouchableOpacity>
            <View style={styles.verticalDivider} />
            <Text style={styles.countryCode}>+966</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              placeholderTextColor="#AAAAAA"
              returnKeyType="next"
              style={styles.phoneInput}
            />
          </Animated.View>

          {/* Password Row */}
          <Animated.View style={[styles.passwordRow, passwordRow.style]}>
            <Lucide name="lock" size={18} color="#2EA87E" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPass}
              placeholderTextColor="#AAAAAA"
              returnKeyType="done"
              onSubmitEditing={onLogin}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPass(v => !v)}
              hitSlop={8}>
              <Lucide
                name={showPass ? 'eye-off' : 'eye'}
                size={18}
                color="#2EA87E"
              />
            </TouchableOpacity>
          </Animated.View>

          {/* Forgot Password */}
          <Animated.View style={[styles.forgotRow, forgotRow.style]}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotLink}>Forgot password?</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Login Button */}
          <Animated.View
            style={[continueBtn.style, {transform: [{scale: btnScale}]}]}>
            <Pressable
              style={[styles.continueBtn, loading && styles.continueBtnDisabled]}
              onPress={onLogin}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}>
              <Text style={styles.continueBtnLabel}>
                {loading ? 'Please wait…' : 'Log In'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* OR Divider */}
          <Animated.View style={[styles.orRow, orRow.style]}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or continue with</Text>
            <View style={styles.orLine} />
          </Animated.View>

          {/* Social Buttons */}
          <Animated.View style={[styles.socialRow, social.style]}>
            <SocialButton>
              <Image
                source={{uri: GOOGLE_ICON_URI}}
                style={styles.socialIcon}
                resizeMode="contain"
              />
            </SocialButton>
            <SocialButton>
              <Image
                source={{uri: APPLE_ICON_URI}}
                style={[styles.socialIcon, {width: 46, height: 46}]}
                resizeMode="contain"
              />
            </SocialButton>
            <SocialButton>
              <Text style={styles.moreDots}>•••</Text>
            </SocialButton>
          </Animated.View>

          {/* Terms */}
          <Animated.View style={[styles.termsWrap, terms.style]}>
            <Text style={styles.termsGrey}>By continuing, you agree to our</Text>
            <View style={styles.termsLinks}>
              <Text style={styles.termsLink}>Terms of Service</Text>
              <Text style={styles.termsGrey}>{'   '}</Text>
              <Text style={styles.termsLink}>Privacy Policy</Text>
              <Text style={styles.termsGrey}>{'   '}</Text>
              <Text style={styles.termsLink}>Content Policies</Text>
            </View>
          </Animated.View>

          {/* Sign Up link */}
          <Animated.View style={[styles.signupRow, terms.style]}>
            <Text style={styles.signupGrey}>New here? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signupLink}>Create an account</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Social button ────────────────────────────────────────────────────────────

function SocialButton({children}: {children: React.ReactNode}) {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 60,
      bounciness: 6,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 10,
    }).start();

  return (
    <TouchableOpacity activeOpacity={1} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View style={[styles.socialBtn, {transform: [{scale}]}]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 24,
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

  /* Password row */
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    height: 56,
    paddingHorizontal: 14,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    ...FONTS.regular,
    padding: 0,
  },

  /* Forgot */
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  forgotLink: {
    fontSize: 13,
    color: COLORS.brandPrimary,
    ...FONTS.medium,
    textDecorationLine: 'underline',
  },

  /* Continue button */
  continueBtn: {
    backgroundColor: COLORS.softGold,
    borderRadius: 10,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: COLORS.softGold,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  continueBtnDisabled: {
    opacity: 0.65,
  },
  continueBtnLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },

  /* OR row */
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EBEBEB',
  },
  orText: {
    paddingHorizontal: 14,
    color: '#999999',
    fontSize: 14,
    ...FONTS.regular,
  },

  /* Social */
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 36,
  },
  socialBtn: {
    width: 76,
    height: 52,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  socialIcon: {
    width: 26,
    height: 26,
  },
  moreDots: {
    fontSize: 18,
    color: '#444444',
    letterSpacing: 3,
    ...FONTS.bold,
  },

  /* Terms */
  termsWrap: {
    alignItems: 'center',
  },
  termsGrey: {
    fontSize: 12,
    color: '#999999',
    ...FONTS.regular,
    textAlign: 'center',
  },
  termsLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
  },
  termsLink: {
    fontSize: 12,
    color: COLORS.brandPrimary,
    ...FONTS.medium,
    textDecorationLine: 'underline',
  },

  /* Sign up */
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupGrey: {
    fontSize: 14,
    color: '#999999',
    ...FONTS.regular,
  },
  signupLink: {
    fontSize: 14,
    color: COLORS.brandPrimary,
    ...FONTS.bold,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
