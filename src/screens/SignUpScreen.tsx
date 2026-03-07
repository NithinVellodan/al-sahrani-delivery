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

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

// Different food image — Middle-Eastern / Arabic spread
const BANNER_URI =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2340&auto=format&fit=crop';

const GOOGLE_ICON_URI =
  'https://cdn.iconscout.com/icon/free/png-256/free-google-icon-svg-download-png-1507807.png';

const APPLE_ICON_URI =
  'https://1000logos.net/wp-content/uploads/2016/10/Apple-Logo-1536x864.png';

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

function SignUpScreen({navigation}: Props) {
  const [name, setName]   = useState('');
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
  const nameRow    = useFadeSlide(400);
  const phoneRow   = useFadeSlide(480);
  const createBtn  = useFadeSlide(560);
  const orRow      = useFadeSlide(640);
  const social     = useFadeSlide(720);
  const loginLink  = useFadeSlide(800);

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
        nameRow.animate(),
        phoneRow.animate(),
        createBtn.animate(),
        orRow.animate(),
        social.animate(),
        loginLink.animate(),
      ]),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreate = async () => {
    if (!name.trim()) {
      toast.warning('Please enter your full name.', {title: 'Missing name'});
      return;
    }
    if (!phone.trim()) {
      toast.warning('Please enter your mobile number.', {
        title: 'Missing number',
      });
      return;
    }
    if (phone.trim().length < 9) {
      toast.error('Enter a valid 9-digit Saudi mobile number.', {
        title: 'Invalid number',
      });
      return;
    }

    setLoading(true);
    toast.info('Sending verification code…', {duration: 2000});
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    toast.success(`Code sent to +966 ${phone.trim()}`, {
      title: 'Code sent',
      duration: 3000,
    });
    setTimeout(
      () => navigation.navigate('OTP', {phone: phone.trim()}),
      600,
    );
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

        {/* Hero Banner — different food image */}
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
            Create{'\n'}Account
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, subtitle.style]}>
            Fill in your details to get started
          </Animated.Text>

          {/* Full Name Input */}
          <Animated.View style={[styles.inputRow, nameRow.style]}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Full Name"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
              returnKeyType="next"
              style={styles.textInput}
            />
          </Animated.View>

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

          {/* Create Account Button */}
          <Animated.View
            style={[createBtn.style, {transform: [{scale: btnScale}]}]}>
            <Pressable
              style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
              onPress={onCreate}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}>
              <Text style={styles.actionBtnLabel}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* OR Divider */}
          <Animated.View style={[styles.orRow, orRow.style]}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or sign up with</Text>
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

          {/* Already have an account */}
          <Animated.View style={[styles.loginRow, loginLink.style]}>
            <Text style={styles.loginGrey}>Already have an account? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Log in</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Social button with its own press-scale animation */
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

  /* Name input */
  inputRow: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    height: 56,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 15,
    color: '#1A1A1A',
    ...FONTS.regular,
    padding: 0,
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
    marginBottom: 22,
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

  /* Login link */
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginGrey: {
    fontSize: 14,
    color: '#999999',
    ...FONTS.regular,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.brandPrimary,
    ...FONTS.bold,
    textDecorationLine: 'underline',
  },
});

export default SignUpScreen;
