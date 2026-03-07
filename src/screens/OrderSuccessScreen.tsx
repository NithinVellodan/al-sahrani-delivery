import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TEAL = '#2EA87E';

// ─── Animated confetti dot ────────────────────────────────────────────────────
function ConfettiDot({
  color,
  size,
  delay,
  startX,
  startY,
}: {
  color: string;
  size: number;
  delay: number;
  startX: number;
  startY: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -120 - Math.random() * 80,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 160,
          duration: 900,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
  }, [delay, opacity, rotate, translateX, translateY]);

  const spin = rotate.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']});

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: startY,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          transform: [{translateX}, {translateY}, {rotate: spin}],
        },
      ]}
    />
  );
}

const CONFETTI_COLORS = ['#2EA87E', '#E9B95F', '#E53935', '#0288D1', '#7B1FA2', '#F9A825'];
const DOTS = Array.from({length: 18}, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  size: 6 + (i % 3) * 4,
  delay: 300 + i * 45,
  startX: 120 + (i % 6) * 20,
  startY: 10,
}));

// ─── Order step row ───────────────────────────────────────────────────────────
function OrderStep({
  icon,
  label,
  sub,
  done,
  active,
  isLast,
}: {
  icon: React.ComponentProps<typeof Lucide>['name'];
  label: string;
  sub: string;
  done?: boolean;
  active?: boolean;
  isLast?: boolean;
}) {
  const iconBg = done ? '#E8F5F0' : active ? TEAL : '#F0F0F0';
  const iconColor = done ? TEAL : active ? '#fff' : '#AAAAAA';
  return (
    <View style={tr.stepRow}>
      <View style={tr.stepLeft}>
        <View style={[tr.stepIconBox, {backgroundColor: iconBg}]}>
          <Lucide name={icon} size={16} color={iconColor} />
        </View>
        {!isLast && <View style={tr.stepLine} />}
      </View>
      <View style={tr.stepTexts}>
        <Text style={[tr.stepLabel, active && tr.stepLabelActive]}>{label}</Text>
        <Text style={tr.stepSub}>{sub}</Text>
      </View>
      {done && (
        <Lucide name="check" size={14} color={TEAL} />
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function OrderSuccessScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();

  // Entrance animations
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const cardY = useRef(new Animated.Value(60)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.spring(checkScale, {toValue: 1, friction: 5, tension: 80, useNativeDriver: true}),
        Animated.timing(checkOpacity, {toValue: 1, duration: 300, useNativeDriver: true}),
        Animated.spring(ringScale, {toValue: 1, friction: 5, tension: 60, useNativeDriver: true}),
      ]),
      Animated.parallel([
        Animated.timing(cardY, {toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
        Animated.timing(cardOpacity, {toValue: 1, duration: 400, useNativeDriver: true}),
      ]),
    ]).start();
  }, [cardOpacity, cardY, checkOpacity, checkScale, ringScale]);

  const goHome = () => {
    navigation.reset({index: 0, routes: [{name: 'MainTabs'}]});
  };

  const trackOrder = () => {
    navigation.reset({index: 0, routes: [{name: 'MainTabs', state: {routes: [{name: 'Orders'}]}}]});
  };

  return (
    <View style={[s.root, {paddingTop: insets.top}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, {paddingBottom: insets.bottom + 32}]}>

        {/* ── Hero check ── */}
        <View style={s.heroSection}>
          {/* Confetti */}
          <View style={s.confettiWrap} pointerEvents="none">
            {DOTS.map(d => (
              <ConfettiDot key={d.id} {...d} />
            ))}
          </View>

          {/* Ring + check icon */}
          <Animated.View
            style={[s.ringOuter, {transform: [{scale: ringScale}], opacity: checkOpacity}]}>
            <Animated.View
              style={[s.checkCircle, {transform: [{scale: checkScale}]}]}>
              <Lucide name="check" size={44} color="#fff" />
            </Animated.View>
          </Animated.View>

          <Animated.View style={{opacity: checkOpacity, marginTop: 24}}>
            <Text style={s.heroTitle}>Order Placed!</Text>
            <Text style={s.heroSub}>Your order is confirmed and being prepared</Text>
          </Animated.View>
        </View>

        {/* ── Order summary card ── */}
        <Animated.View style={[s.card, {transform: [{translateY: cardY}], opacity: cardOpacity}]}>
          <View style={s.orderId}>
            <Text style={s.orderIdLabel}>Order ID</Text>
            <Text style={s.orderIdValue}>#AZL-2026-00847</Text>
          </View>

          <View style={s.divider} />

          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Lucide name="clock" size={16} color={TEAL} />
              <Text style={s.summaryLabel}>Estimated</Text>
              <Text style={s.summaryValue}>20–25 min</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Lucide name="map-pin" size={16} color={TEAL} />
              <Text style={s.summaryLabel}>Delivery</Text>
              <Text style={s.summaryValue}>Home</Text>
            </View>
            <View style={s.summaryDivider} />
            <View style={s.summaryItem}>
              <Lucide name="receipt" size={16} color={TEAL} />
              <Text style={s.summaryLabel}>Paid</Text>
              <Text style={s.summaryValue}>SAR 135</Text>
            </View>
          </View>
        </Animated.View>

        {/* ── Live tracking card ── */}
        <Animated.View style={[s.card, {transform: [{translateY: cardY}], opacity: cardOpacity}]}>
          <View style={s.trackingHeader}>
            <Text style={s.cardTitle}>Live Tracking</Text>
            <View style={s.liveBadge}>
              <View style={s.liveDot} />
              <Text style={s.liveTxt}>LIVE</Text>
            </View>
          </View>

          <View style={tr.steps}>
            <OrderStep
              icon="check-circle"
              label="Order Confirmed"
              sub="Just now"
              done
            />
            <OrderStep
              icon="chef-hat"
              label="Preparing your order"
              sub="Al Zahrani Kitchen"
              active
            />
            <OrderStep
              icon="bike"
              label="Out for delivery"
              sub="~15 mins away"
            />
            <OrderStep
              icon="house"
              label="Delivered"
              sub="As Sulay, Riyadh"
              isLast
            />
          </View>
        </Animated.View>

        {/* ── Delivery address ── */}
        <Animated.View style={[s.card, {transform: [{translateY: cardY}], opacity: cardOpacity}]}>
          <Text style={s.cardTitle}>Delivery Address</Text>
          <View style={s.addressRow}>
            <View style={s.addressIconBox}>
              <Lucide name="home" size={16} color={TEAL} />
            </View>
            <View style={s.addressTexts}>
              <Text style={s.addressLabel}>Home</Text>
              <Text style={s.addressSub}>8056, 3117 As Sulay, Riyadh 14275, Saudi Arabia</Text>
            </View>
          </View>
          <View style={s.deliveryPersonRow}>
            <View style={s.avatarSmall}>
              <Lucide name="user" size={16} color="#fff" />
            </View>
            <View style={s.deliveryPersonTexts}>
              <Text style={s.deliveryPersonName}>Safar Al-Zahrani</Text>
              <Text style={s.deliveryPersonPhone}>+966 50 000 0000</Text>
            </View>
            <Pressable style={s.callBtn}>
              <Lucide name="phone-call" size={14} color={TEAL} />
            </Pressable>
          </View>
        </Animated.View>

        {/* ── Savings banner ── */}
        <Animated.View style={[s.savingsBanner, {transform: [{translateY: cardY}], opacity: cardOpacity}]}>
          <Lucide name="tag" size={18} color="#E9B95F" />
          <Text style={s.savingsText}>
            You saved <Text style={s.savingsBold}>SAR 50</Text> on this order 🎉
          </Text>
        </Animated.View>

        {/* ── Buttons ── */}
        <Animated.View style={[s.btnGroup, {transform: [{translateY: cardY}], opacity: cardOpacity}]}>
          <Pressable style={s.primaryBtn} onPress={trackOrder}>
            <Lucide name="map" size={18} color="#fff" />
            <Text style={s.primaryBtnTxt}>Track My Order</Text>
          </Pressable>
          <Pressable style={s.secondaryBtn} onPress={goHome}>
            <Lucide name="house" size={18} color={TEAL} />
            <Text style={s.secondaryBtnTxt}>Back to Home</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Tracking step styles ─────────────────────────────────────────────────────
const tr = StyleSheet.create({
  steps: {paddingTop: 4},
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    minHeight: 58,
  },
  stepLeft: {alignItems: 'center'},
  stepIconBox: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  stepLine: {width: 2, flex: 1, backgroundColor: '#E8E8E8', marginTop: 4, marginBottom: 0},
  stepTexts: {flex: 1, paddingTop: 6},
  stepLabel: {fontSize: 14, ...FONTS.medium, color: COLORS.textSecondary},
  stepLabelActive: {color: TEAL, ...FONTS.bold},
  stepSub: {fontSize: 12, ...FONTS.regular, color: COLORS.mediumGray, marginTop: 2},
});

// ─── Main styles ──────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F2F2F2'},
  scroll: {paddingHorizontal: 16, gap: 14},

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  confettiWrap: {
    position: 'absolute',
    width: '100%',
    height: 180,
    top: 20,
    alignItems: 'center',
  },
  ringOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(46,168,126,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: TEAL,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 6},
  },
  heroTitle: {
    fontSize: 28,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  heroSub: {
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginTop: 6,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  cardTitle: {fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: 14},
  divider: {height: StyleSheet.hairlineWidth, backgroundColor: '#EEEEEE', marginVertical: 14},

  // Order ID
  orderId: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  orderIdLabel: {fontSize: 12, ...FONTS.regular, color: COLORS.mediumGray},
  orderIdValue: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary, letterSpacing: 0.5},

  // Summary row
  summaryRow: {flexDirection: 'row'},
  summaryItem: {flex: 1, alignItems: 'center', gap: 6},
  summaryDivider: {width: StyleSheet.hairlineWidth, backgroundColor: '#EEEEEE', marginVertical: 4},
  summaryLabel: {fontSize: 11, ...FONTS.regular, color: COLORS.mediumGray},
  summaryValue: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary},

  // Tracking header
  trackingHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14},
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FFF1F1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  liveDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: '#E53935'},
  liveTxt: {fontSize: 10, ...FONTS.bold, color: '#E53935', letterSpacing: 1},

  // Address
  addressRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 14},
  addressIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#E8F5F0', alignItems: 'center', justifyContent: 'center',
  },
  addressTexts: {flex: 1},
  addressLabel: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary},
  addressSub: {fontSize: 12, ...FONTS.regular, color: COLORS.mediumGray, marginTop: 2, lineHeight: 17},

  // Delivery person
  deliveryPersonRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8F8F8', borderRadius: 12, padding: 12,
  },
  avatarSmall: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center',
  },
  deliveryPersonTexts: {flex: 1},
  deliveryPersonName: {fontSize: 13, ...FONTS.bold, color: COLORS.textPrimary},
  deliveryPersonPhone: {fontSize: 11, ...FONTS.regular, color: COLORS.mediumGray},
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
  },

  // Savings
  savingsBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF8E7', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: '#F4E0A0',
  },
  savingsText: {flex: 1, fontSize: 13, ...FONTS.regular, color: COLORS.textPrimary},
  savingsBold: {fontSize: 13, ...FONTS.bold, color: COLORS.gold},

  // Buttons
  btnGroup: {gap: 10, paddingBottom: 8},
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: TEAL, borderRadius: 16, paddingVertical: 15,
    elevation: 4, shadowColor: TEAL, shadowOpacity: 0.35, shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  primaryBtnTxt: {fontSize: 15, ...FONTS.bold, color: '#fff'},
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: COLORS.white, borderRadius: 16, paddingVertical: 15,
    borderWidth: 1.5, borderColor: TEAL,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
  },
  secondaryBtnTxt: {fontSize: 15, ...FONTS.bold, color: TEAL},
});
