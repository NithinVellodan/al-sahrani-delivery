import React, {useCallback, useEffect, useRef, useState} from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'OTP'>;

const BANNER_URI =
  'https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=2340&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const OTP_LENGTH    = 6;
const RESEND_SECS   = 60;
// Mock: any code is accepted — swap with real API call
const MOCK_VALID    = '123456';

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Screen ──────────────────────────────────────────────────────────────────

function OTPScreen({route, navigation}: Props) {
  const {phone} = route.params;

  const [otp, setOtp]             = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [focusedIdx, setFocusedIdx] = useState(0);
  const [hasError, setHasError]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [seconds, setSeconds]     = useState(RESEND_SECS);

  // Input refs
  const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  // Cell scale animations — one per cell
  const cellScales = useRef(
    Array.from({length: OTP_LENGTH}, () => new Animated.Value(1)),
  ).current;

  // Shake animation on error
  const shakeX = useRef(new Animated.Value(0)).current;

  // Entrance animations
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const title      = useFadeSlide(200);
  const subtitle   = useFadeSlide(320);
  const otpRow     = useFadeSlide(440);
  const verifyBtn  = useFadeSlide(540);
  const resendRow  = useFadeSlide(640);
  const backRow    = useFadeSlide(740);

  const btnScale = useRef(new Animated.Value(1)).current;

  // ── Entrance ───────────────────────────────────────────────────────────────

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
        otpRow.animate(),
        verifyBtn.animate(),
        resendRow.animate(),
        backRow.animate(),
      ]),
    ]).start(() => {
      // Focus first box after entrance
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Resend countdown ───────────────────────────────────────────────────────

  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setSeconds(RESEND_SECS);
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer]);

  // ── Cell animations ────────────────────────────────────────────────────────

  const popCell = (index: number) => {
    cellScales[index].setValue(0.72);
    Animated.spring(cellScales[index], {
      toValue: 1,
      stiffness: 320,
      damping: 13,
      useNativeDriver: true,
    }).start();
  };

  const shake = () => {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, {toValue: 11,  duration: 55, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: -11, duration: 55, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: 8,   duration: 50, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: -8,  duration: 50, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: 4,   duration: 45, useNativeDriver: true}),
      Animated.timing(shakeX, {toValue: 0,   duration: 45, useNativeDriver: true}),
    ]).start();
  };

  // ── Input handlers ─────────────────────────────────────────────────────────

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setHasError(false);

    if (digit) {
      popCell(index);
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
        setFocusedIdx(index + 1);
      } else {
        inputRefs.current[index]?.blur();
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        const next = [...otp];
        next[index - 1] = '';
        setOtp(next);
        inputRefs.current[index - 1]?.focus();
        setFocusedIdx(index - 1);
      }
    }
  };

  // ── Verify ─────────────────────────────────────────────────────────────────

  const onVerify = async () => {
    const code = otp.join('');

    if (code.length < OTP_LENGTH) {
      setHasError(true);
      shake();
      toast.warning(`Enter all ${OTP_LENGTH} digits.`, {title: 'Incomplete code'});
      return;
    }

    if (code !== MOCK_VALID) {
      setHasError(true);
      shake();
      toast.error('The code you entered is incorrect. Try again.', {
        title: 'Wrong code',
        duration: 4000,
      });
      // Clear all cells and refocus first
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
        setFocusedIdx(0);
      }, 200);
      return;
    }

    setLoading(true);
    toast.info('Verifying your code…', {duration: 1800});
    await new Promise(resolve => setTimeout(resolve, 1400));
    setLoading(false);
    toast.success('Account verified! Please log in to continue.', {
      title: 'Verified ✓',
      duration: 3500,
    });
    setTimeout(
      () => navigation.reset({index: 0, routes: [{name: 'Login'}]}),
      700,
    );
  };

  // ── Resend ─────────────────────────────────────────────────────────────────

  const onResend = () => {
    if (seconds > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setHasError(false);
    startTimer();
    toast.info(`New code sent to +966 ${phone}`, {title: 'Code resent', duration: 3500});
    setTimeout(() => {
      inputRefs.current[0]?.focus();
      setFocusedIdx(0);
    }, 300);
  };

  // ── Button press scale ─────────────────────────────────────────────────────

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

  // ── Render ─────────────────────────────────────────────────────────────────

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
            Enter{'\n'}Reset Code
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, subtitle.style]}>
            We sent a {OTP_LENGTH}-digit code to{'\n'}
            <Text style={styles.phoneHighlight}>+966 {phone}</Text>
          </Animated.Text>

          {/* OTP Cells */}
          <Animated.View style={[otpRow.style]}>
            <Animated.View
              style={[
                styles.cellsRow,
                {transform: [{translateX: shakeX}]},
              ]}>
              {Array.from({length: OTP_LENGTH}).map((_, i) => {
                const isFocused = focusedIdx === i;
                const isFilled  = !!otp[i];

                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.cellWrap,
                      {transform: [{scale: cellScales[i]}]},
                    ]}>
                    <View
                      style={[
                        styles.cell,
                        isFocused && !hasError && styles.cellFocused,
                        isFilled  && !hasError && styles.cellFilled,
                        hasError  && (isFilled || isFocused) && styles.cellError,
                      ]}>
                      <TextInput
                        ref={ref => {
                          inputRefs.current[i] = ref;
                        }}
                        value={otp[i]}
                        onChangeText={text => handleChange(text, i)}
                        onKeyPress={({nativeEvent}) =>
                          handleKeyPress(nativeEvent.key, i)
                        }
                        onFocus={() => setFocusedIdx(i)}
                        keyboardType="number-pad"
                        maxLength={1}
                        selectTextOnFocus
                        caretHidden
                        style={[
                          styles.cellInput,
                          isFilled && styles.cellInputFilled,
                          hasError && styles.cellInputError,
                        ]}
                      />
                      {/* Blinking caret when focused and empty */}
                      {isFocused && !otp[i] ? (
                        <BlinkingCaret />
                      ) : null}
                    </View>
                  </Animated.View>
                );
              })}
            </Animated.View>
          </Animated.View>

          {/* Verify Button */}
          <Animated.View
            style={[verifyBtn.style, {transform: [{scale: btnScale}]}]}>
            <Pressable
              style={[styles.actionBtn, loading && styles.actionBtnDisabled]}
              onPress={onVerify}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={loading}>
              <Text style={styles.actionBtnLabel}>
                {loading ? 'Verifying…' : 'Verify Code'}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Resend row */}
          <Animated.View style={[styles.resendRow, resendRow.style]}>
            {seconds > 0 ? (
              <Text style={styles.resendTimer}>
                Resend code in{' '}
                <Text style={styles.resendCountdown}>
                  0:{String(seconds).padStart(2, '0')}
                </Text>
              </Text>
            ) : (
              <TouchableOpacity activeOpacity={0.7} onPress={onResend}>
                <Text style={styles.resendLink}>Resend code</Text>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Back */}
          <Animated.View style={[styles.backRow, backRow.style]}>
            <Text style={styles.backGrey}>Wrong number? </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backLink}>Change it</Text>
            </TouchableOpacity>
          </Animated.View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Blinking Caret ───────────────────────────────────────────────────────────

function BlinkingCaret() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 0, duration: 500, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 1, duration: 500, useNativeDriver: true}),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, [opacity]);

  return (
    <Animated.View style={[styles.caret, {opacity}]} pointerEvents="none" />
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
    marginBottom: 34,
    lineHeight: 23,
  },
  phoneHighlight: {
    color: '#1A1A1A',
    ...FONTS.bold,
  },

  /* OTP cells */
  cellsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  cellWrap: {
    // wraps a single animated cell
  },
  cell: {
    width: 48,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellFocused: {
    borderColor: COLORS.softGold,
    backgroundColor: '#FFFBF2',
    shadowColor: COLORS.softGold,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  cellFilled: {
    borderColor: COLORS.softGold,
    backgroundColor: '#FFF8E8',
  },
  cellError: {
    borderColor: '#D94F4F',
    backgroundColor: '#FFF0F0',
  },
  cellInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 22,
    color: '#1A1A1A',
    ...FONTS.bold,
    padding: 0,
  },
  cellInputFilled: {
    color: COLORS.gold,
  },
  cellInputError: {
    color: '#D94F4F',
  },
  caret: {
    position: 'absolute',
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: COLORS.softGold,
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

  /* Resend */
  resendRow: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendTimer: {
    fontSize: 14,
    color: '#999999',
    ...FONTS.regular,
  },
  resendCountdown: {
    color: COLORS.brandPrimary,
    ...FONTS.bold,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.softGold,
    ...FONTS.bold,
    textDecorationLine: 'underline',
  },

  /* Back */
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

export default OTPScreen;
