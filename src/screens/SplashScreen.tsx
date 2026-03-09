import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {FONTS} from '../theme/typography';
import {getAppLanguage, getAuthToken, isOnboardingDone} from '../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const {width: W} = Dimensions.get('window');
const TEAL = '#2EA87E';
const TEAL_LIGHT = '#E8F5F0';

// ─── Floating particle ────────────────────────────────────────────────────────
const PARTICLES = [
  {x: -55, delay: 1100, size: 7,  color: TEAL},
  {x:  40, delay: 1250, size: 5,  color: '#E9B95F'},
  {x: -20, delay: 1350, size: 4,  color: TEAL},
  {x:  65, delay: 1150, size: 6,  color: '#5B6EE8'},
  {x: -70, delay: 1400, size: 5,  color: '#E91E8C'},
  {x:  20, delay: 1200, size: 4,  color: TEAL},
];

function Particle({x, delay, size, color}: typeof PARTICLES[0]) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale,      {toValue: 1,    duration: 200, useNativeDriver: true}),
        Animated.timing(opacity,    {toValue: 0.85, duration: 200, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(translateY, {toValue: -110, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true}),
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(opacity,  {toValue: 0,    duration: 600, useNativeDriver: true}),
        ]),
      ]),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 60,
        left: W / 2 + x - size / 2,
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{translateY}, {scale}],
      }}
    />
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
function SplashScreen({navigation}: Props) {

  // Ripple rings
  const ring1Scale   = useRef(new Animated.Value(0)).current;
  const ring1Opacity = useRef(new Animated.Value(0.55)).current;
  const ring2Scale   = useRef(new Animated.Value(0)).current;
  const ring2Opacity = useRef(new Animated.Value(0.38)).current;
  const ring3Scale   = useRef(new Animated.Value(0)).current;
  const ring3Opacity = useRef(new Animated.Value(0.22)).current;

  // Logo
  const logoScale   = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate  = useRef(new Animated.Value(-12)).current;

  // Heartbeat after logo lands
  const heartbeat   = useRef(new Animated.Value(1)).current;

  // Aura pulse
  const auraScale   = useRef(new Animated.Value(1)).current;
  const auraOpacity = useRef(new Animated.Value(0)).current;

  // Orbiting dot
  const orbitAngle  = useRef(new Animated.Value(0)).current;

  // Words
  const wordAlX           = useRef(new Animated.Value(-70)).current;
  const wordAlOpacity     = useRef(new Animated.Value(0)).current;
  const wordZahraniX      = useRef(new Animated.Value(70)).current;
  const wordZahraniOpacity= useRef(new Animated.Value(0)).current;

  // Shimmer sweep
  const shimmerX    = useRef(new Animated.Value(-W * 0.6)).current;
  const shimmerOp   = useRef(new Animated.Value(0)).current;

  // Tag
  const tagY            = useRef(new Animated.Value(24)).current;
  const tagOpacity      = useRef(new Animated.Value(0)).current;
  const tagLetterSpacing= useRef(new Animated.Value(0)).current;

  // Bottom dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const dot4 = useRef(new Animated.Value(0)).current;
  const dot5 = useRef(new Animated.Value(0)).current;

  // Exit
  const exitScale   = useRef(new Animated.Value(1)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {

    // ── Rings ripple ──────────────────────────────────────────────────────────
    const rings = Animated.stagger(180, [
      Animated.parallel([
        Animated.timing(ring1Scale,   {toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
        Animated.timing(ring1Opacity, {toValue: 0, duration: 750, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(ring2Scale,   {toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
        Animated.timing(ring2Opacity, {toValue: 0, duration: 750, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(ring3Scale,   {toValue: 1, duration: 750, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
        Animated.timing(ring3Opacity, {toValue: 0, duration: 750, useNativeDriver: true}),
      ]),
    ]);

    // ── Logo spring in ────────────────────────────────────────────────────────
    const logoIn = Animated.parallel([
      Animated.spring(logoScale,   {toValue: 1, friction: 5, tension: 65, useNativeDriver: true}),
      Animated.timing(logoOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),
      Animated.spring(logoRotate,  {toValue: 0, friction: 6, tension: 80, useNativeDriver: true}),
    ]);

    // ── Heartbeat (2 pulses) ──────────────────────────────────────────────────
    const hb = Animated.sequence([
      Animated.timing(heartbeat, {toValue: 1.09, duration: 160, useNativeDriver: true}),
      Animated.timing(heartbeat, {toValue: 1,    duration: 160, useNativeDriver: true}),
      Animated.delay(80),
      Animated.timing(heartbeat, {toValue: 1.06, duration: 160, useNativeDriver: true}),
      Animated.timing(heartbeat, {toValue: 1,    duration: 160, useNativeDriver: true}),
    ]);

    // ── Aura breathe loop ─────────────────────────────────────────────────────
    const auraLoop = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(auraScale,   {toValue: 1.4,  duration: 950, easing: Easing.out(Easing.ease), useNativeDriver: true}),
        Animated.timing(auraOpacity, {toValue: 0.16, duration: 475, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(auraScale,   {toValue: 1,    duration: 950, easing: Easing.in(Easing.ease), useNativeDriver: true}),
        Animated.timing(auraOpacity, {toValue: 0,    duration: 475, useNativeDriver: true}),
      ]),
    ]));

    // ── Orbiting dot (continuous spin) ────────────────────────────────────────
    const orbitLoop = Animated.loop(
      Animated.timing(orbitAngle, {toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true}),
    );

    // ── Words slide in ────────────────────────────────────────────────────────
    const words = Animated.stagger(130, [
      Animated.parallel([
        Animated.spring(wordAlX,       {toValue: 0, friction: 7, tension: 90, useNativeDriver: true}),
        Animated.timing(wordAlOpacity, {toValue: 1, duration: 280, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.spring(wordZahraniX,       {toValue: 0, friction: 7, tension: 90, useNativeDriver: true}),
        Animated.timing(wordZahraniOpacity, {toValue: 1, duration: 280, useNativeDriver: true}),
      ]),
    ]);

    // ── Shimmer sweep ─────────────────────────────────────────────────────────
    const shimmer = Animated.sequence([
      Animated.timing(shimmerOp, {toValue: 1, duration: 80, useNativeDriver: true}),
      Animated.timing(shimmerX,  {toValue: W * 0.6, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      Animated.timing(shimmerOp, {toValue: 0, duration: 120, useNativeDriver: true}),
    ]);

    // ── Tag rises + letter spacing opens ─────────────────────────────────────
    const tag = Animated.parallel([
      Animated.timing(tagY,            {toValue: 0,  duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
      Animated.timing(tagOpacity,      {toValue: 1,  duration: 420, useNativeDriver: true}),
      Animated.timing(tagLetterSpacing,{toValue: 7,  duration: 650, easing: Easing.out(Easing.ease),  useNativeDriver: false}),
    ]);

    // ── Bottom dots fill in one by one ────────────────────────────────────────
    const dots = Animated.stagger(180, [dot1, dot2, dot3, dot4, dot5].map(d =>
      Animated.spring(d, {toValue: 1, friction: 4, tension: 120, useNativeDriver: true}),
    ));

    // ── Exit collapse before navigate ─────────────────────────────────────────
    const exitAnim = Animated.parallel([
      Animated.timing(exitScale,   {toValue: 0.88, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true}),
      Animated.timing(exitOpacity, {toValue: 0,    duration: 300, useNativeDriver: true}),
    ]);

    // ── Master sequence ───────────────────────────────────────────────────────
    Animated.sequence([
      rings,
      Animated.parallel([logoIn, auraLoop]),
      hb,
      Animated.parallel([words, shimmer]),
      Animated.parallel([tag, dots]),
    ]).start();

    orbitLoop.start();

    const boot = setTimeout(async () => {
      exitAnim.start(async () => {
        const [language, onboardingDone, token] = await Promise.all([
          getAppLanguage(),
          isOnboardingDone(),
          getAuthToken(),
        ]);
        if (!language)       { navigation.replace('LanguageSelect'); return; }
        if (!onboardingDone) { navigation.replace('Onboarding');     return; }
        if (!token)          { navigation.replace('Login');           return; }
        navigation.replace('MainTabs');
      });
    }, 3400);

    return () => {
      clearTimeout(boot);
      auraLoop.stop();
      orbitLoop.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoRotateDeg = logoRotate.interpolate({
    inputRange: [-12, 0], outputRange: ['-12deg', '0deg'],
  });

  const orbitDeg = orbitAngle.interpolate({
    inputRange: [0, 1], outputRange: ['0deg', '360deg'],
  });

  const ORBIT_R = 76;

  return (
    <Animated.View style={[s.root, {opacity: exitOpacity, transform: [{scale: exitScale}]}]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Soft radial background blobs ── */}
      <View style={s.blobTopRight}  pointerEvents="none" />
      <View style={s.blobBottomLeft} pointerEvents="none" />

      {/* ── Ripple rings ── */}
      <View style={s.ringsWrap} pointerEvents="none">
        {[
          {scale: ring1Scale, opacity: ring1Opacity, size: 360},
          {scale: ring2Scale, opacity: ring2Opacity, size: 255},
          {scale: ring3Scale, opacity: ring3Opacity, size: 168},
        ].map((r, i) => (
          <Animated.View key={i} style={[s.ring, {
            width: r.size, height: r.size, borderRadius: r.size / 2,
            transform: [{scale: r.scale}], opacity: r.opacity,
          }]} />
        ))}
      </View>

      {/* ── Floating particles ── */}
      {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}

      {/* ── Center logo area ── */}
      <View style={s.center}>

        {/* Aura glow */}
        <Animated.View pointerEvents="none"
          style={[s.aura, {transform: [{scale: auraScale}], opacity: auraOpacity}]}
        />

        {/* Orbiting dot */}
        <Animated.View pointerEvents="none"
          style={[s.orbitTrack, {transform: [{rotate: orbitDeg}]}]}>
          <View style={[s.orbitDot, {transform: [{translateX: ORBIT_R}]}]} />
        </Animated.View>

        {/* Logo with heartbeat + rotation in */}
        <Animated.View style={{
          opacity: logoOpacity,
          transform: [
            {scale: Animated.multiply(logoScale, heartbeat)},
            {rotate: logoRotateDeg},
          ],
        }}>
          <Image
            source={require('../images/logo-no-background.png')}
            style={s.logoImg}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand name + shimmer */}
        <View style={s.nameWrap}>
          <View style={s.nameRow}>
            <Animated.Text style={[s.wordAl, {
              opacity: wordAlOpacity,
              transform: [{translateX: wordAlX}],
            }]}>
              Al
            </Animated.Text>
            <Animated.Text style={[s.wordZahrani, {
              opacity: wordZahraniOpacity,
              transform: [{translateX: wordZahraniX}],
            }]}>
              Zahrani
            </Animated.Text>
          </View>

          {/* Shimmer streak */}
          <Animated.View pointerEvents="none"
            style={[s.shimmer, {opacity: shimmerOp, transform: [{translateX: shimmerX}]}]}
          />
        </View>

        {/* Tag line */}
        <Animated.Text style={[s.tag, {
          opacity: tagOpacity,
          transform: [{translateY: tagY}],
          letterSpacing: tagLetterSpacing,
        }]}>
          FOOD DELIVERY
        </Animated.Text>
      </View>

      {/* ── Bottom dots loader ── */}
      <View style={s.dotsRow}>
        {[dot1, dot2, dot3, dot4, dot5].map((d, i) => (
          <Animated.View key={i} style={[
            s.loaderDot,
            {transform: [{scale: d}], opacity: d},
          ]} />
        ))}
      </View>

      {/* ── Footer text ── */}
      <Animated.Text style={[s.footerTxt, {opacity: tagOpacity}]}>
        Fresh · Fast · Saudi
      </Animated.Text>

    </Animated.View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Background blobs
  blobTopRight: {
    position: 'absolute',
    top: -80, right: -80,
    width: 260, height: 260,
    borderRadius: 130,
    backgroundColor: TEAL_LIGHT,
    opacity: 0.5,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: -100, left: -80,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: TEAL_LIGHT,
    opacity: 0.35,
  },

  // Rings
  ringsWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: TEAL,
    backgroundColor: TEAL_LIGHT,
  },

  // Center
  center: {alignItems: 'center'},

  // Aura
  aura: {
    position: 'absolute',
    width: 168, height: 168, borderRadius: 84,
    backgroundColor: TEAL,
  },

  // Orbit
  orbitTrack: {
    position: 'absolute',
    width: 2, height: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: TEAL,
    opacity: 0.7,
  },

  // Logo
  logoImg: {
    width: 130, height: 130,
    marginBottom: 22,
  },

  // Name
  nameWrap: {
    overflow: 'hidden',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  wordAl: {
    fontSize: 40,
    ...FONTS.bold,
    color: TEAL,
    letterSpacing: 1,
  },
  wordZahrani: {
    fontSize: 40,
    ...FONTS.bold,
    color: '#1A1A1A',
    letterSpacing: 1,
  },

  // Shimmer
  shimmer: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.55)',
    transform: [{skewX: '-18deg'}],
  },

  // Tag
  tag: {
    fontSize: 11,
    ...FONTS.bold,
    color: '#AAAAAA',
  },

  // Bottom dots
  dotsRow: {
    position: 'absolute',
    bottom: 54,
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
  },
  loaderDot: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: TEAL,
  },

  footerTxt: {
    position: 'absolute',
    bottom: 28,
    fontSize: 11,
    ...FONTS.regular,
    color: '#C8C8C8',
    letterSpacing: 2.5,
  },
});

export default SplashScreen;
