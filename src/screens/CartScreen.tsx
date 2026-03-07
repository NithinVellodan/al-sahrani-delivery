import React, {useState} from 'react';
import {
  Image,
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
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import type {RootStackParamList} from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Types ────────────────────────────────────────────────────────────────────
type CartItem = {
  id: string;
  name: string;
  unitPrice: number;
  qty: number;
  isVeg: boolean;
};
type SuggestedItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const INIT_CART: CartItem[] = [
  {id: 'c1', name: 'Cheese Chicken Burger [Jumbo]', unitPrice: 42, qty: 1, isVeg: false},
  {id: 'c2', name: 'Beef Shawarma [Regular]', unitPrice: 28, qty: 2, isVeg: false},
  {id: 'c3', name: 'Fresh Hummus Plate', unitPrice: 22, qty: 1, isVeg: true},
];

const SUGGESTIONS: SuggestedItem[] = [
  {
    id: 's1', name: 'French Fries\n[Large]', price: 12, isVeg: true,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 's2', name: 'Cheese Zinger\nChicken Wrap', price: 35, isVeg: false,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 's3', name: 'Crispy Wings\n[6 Pcs]', price: 38, isVeg: false,
    image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 's4', name: 'Cheese Fries\n[Medium]', price: 18, isVeg: true,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=200&q=80',
  },
];

const DELIVERY_FEE = 8;
const TAXES_RATE = 0.15;
const DISCOUNT = 25;
const COUPON_CODE = 'GETOFF25';

// ─── Sub-components ───────────────────────────────────────────────────────────
function VegBox({isVeg}: {isVeg: boolean}) {
  return (
    <View style={[s.vegBox, isVeg ? s.vegGreen : s.vegOrange]}>
      <View style={[s.vegDot, isVeg ? s.vegDotGreen : s.vegDotOrange]} />
    </View>
  );
}

function QtyControl({
  qty,
  onDec,
  onInc,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View style={s.qtyControl}>
      <Pressable style={s.qtyBtn} onPress={onDec} hitSlop={8}>
        <Lucide name="minus" size={14} color={COLORS.softGold} />
      </Pressable>
      <Text style={s.qtyNum}>{qty}</Text>
      <Pressable style={s.qtyBtn} onPress={onInc} hitSlop={8}>
        <Lucide name="plus" size={14} color={COLORS.softGold} />
      </Pressable>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CartScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();

  const [cart, setCart] = useState<CartItem[]>(INIT_CART);
  const [couponApplied, setCouponApplied] = useState(false);
  const [offerAdded, setOfferAdded] = useState(false);
  const [cutlery, setCutlery] = useState(true);

  const updateQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(it => (it.id === id ? {...it, qty: it.qty + delta} : it))
        .filter(it => it.qty > 0),
    );
  };

  const subtotal = cart.reduce((sum, it) => sum + it.unitPrice * it.qty, 0);
  const discount = couponApplied ? DISCOUNT : 0;
  const taxes = Math.round((subtotal - discount) * TAXES_RATE);
  const total = subtotal - discount + DELIVERY_FEE + taxes;
  const savedTotal = discount + DISCOUNT; // loyalty + coupon

  return (
    <View style={[s.root, {paddingTop: insets.top}]}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Lucide name="arrow-left" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={s.headerMid}>
          <Text style={s.restaurantName}>Al Zahrani Kitchen</Text>
          <Pressable style={s.headerDeliveryRow}>
            <Text style={s.deliveryLabel}>
              <Text style={s.deliveryBold}>20-25 mins</Text> to Home
            </Text>
            <Text style={s.deliveryAddr} numberOfLines={1}>
              {' '}8056 As Sulay, Riyadh...{' '}
            </Text>
            <Lucide name="chevron-down" size={13} color={COLORS.mediumGray} />
          </Pressable>
        </View>
        <Pressable style={s.shareBtn} hitSlop={10}>
          <Lucide name="share-2" size={20} color={COLORS.textPrimary} />
        </Pressable>
      </View>

      {/* ── Savings banner ── */}
      <View style={s.savingsBanner}>
        <Text style={s.savingsEmoji}>🏅</Text>
        <Text style={s.savingsText}>
          You saved <Text style={s.savingsBold}>SAR {savedTotal}</Text> on this order
        </Text>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, {paddingBottom: 100 + insets.bottom}]}>

        {/* ── Special offer card ── */}
        <View style={s.section}>
          <View style={s.offerHeader}>
            <Text style={s.offerTitle}>Special offer for you</Text>
            <Text style={s.offerEmoji}>🎁</Text>
          </View>
          <View style={s.offerCard}>
            <View style={s.offerLogoWrap}>
              <Image
                source={{uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80'}}
                style={s.offerLogo}
              />
            </View>
            <View style={s.offerBody}>
              <Text style={s.offerName}>Get SAR 15 off on next order!</Text>
              <Text style={s.offerSub}>Claim voucher after order is placed</Text>
            </View>
            <Pressable
              style={[s.offerBtn, offerAdded && s.offerBtnAdded]}
              onPress={() => setOfferAdded(v => !v)}>
              <Text style={[s.offerBtnTxt, offerAdded && s.offerBtnTxtAdded]}>
                {offerAdded ? 'ADDED ×' : 'ADD'}
              </Text>
              {!offerAdded && (
                <Text style={s.offerFreeTag}>FREE</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Cart items ── */}
        <View style={s.section}>
          {cart.map((item, idx) => (
            <View key={item.id}>
              <View style={s.cartItem}>
                <VegBox isVeg={item.isVeg} />
                <View style={s.cartItemInfo}>
                  <Text style={s.cartItemName}>{item.name}</Text>
                  <Pressable style={s.editRow}>
                    <Text style={s.editText}>Edit</Text>
                    <Lucide name="chevron-right" size={12} color={COLORS.softGold} />
                  </Pressable>
                </View>
                <View style={s.cartItemRight}>
                  <QtyControl
                    qty={item.qty}
                    onDec={() => updateQty(item.id, -1)}
                    onInc={() => updateQty(item.id, 1)}
                  />
                  <Text style={s.cartItemPrice}>
                    SAR {item.unitPrice * item.qty}
                  </Text>
                </View>
              </View>
              {idx < cart.length - 1 && <View style={s.itemDivider} />}
            </View>
          ))}

          {/* Add more items */}
          <Pressable
            style={s.addMoreRow}
            onPress={() => navigation.navigate('Search')}>
            <Lucide name="plus" size={16} color={COLORS.softGold} />
            <Text style={s.addMoreText}>Add more items</Text>
          </Pressable>

          <View style={s.itemDivider} />

          {/* Note / Cutlery buttons */}
          <View style={s.actionBtnsRow}>
            <Pressable style={s.actionBtn}>
              <Lucide name="file-text" size={14} color={COLORS.textSecondary} />
              <Text style={s.actionBtnTxt}>Add a note for the restaurant</Text>
            </Pressable>
            <View style={s.actionBtnDivider} />
            <Pressable
              style={s.actionBtn}
              onPress={() => setCutlery(v => !v)}>
              <Lucide
                name="utensils"
                size={14}
                color={cutlery ? COLORS.softGold : COLORS.textSecondary}
              />
              <Text style={[s.actionBtnTxt, cutlery && s.actionBtnActive]}>
                {cutlery ? 'Cutlery added' : "Don't send cutlery"}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Complete your meal ── */}
        <View style={s.section}>
          <View style={s.completeMealHeader}>
            <View style={s.gridIcon}>
              <Lucide name="layout-grid" size={16} color={COLORS.textSecondary} />
            </View>
            <Text style={s.completeMealTitle}>Complete your meal with</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.suggestionsRow}>
            {SUGGESTIONS.map(item => (
              <View key={item.id} style={s.suggestionCard}>
                <View style={s.suggestionImgWrap}>
                  <Image source={{uri: item.image}} style={s.suggestionImg} />
                  <View style={s.suggestionVeg}>
                    <VegBox isVeg={item.isVeg} />
                  </View>
                  <Pressable style={s.suggestionAddBtn}>
                    <Lucide name="plus" size={14} color={COLORS.softGold} />
                  </Pressable>
                </View>
                <Text style={s.suggestionName}>{item.name}</Text>
                <Text style={s.suggestionPrice}>SAR {item.price}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── Coupon ── */}
        <View style={s.section}>
          <View style={s.couponRow}>
            <Lucide name="tag" size={18} color={COLORS.textSecondary} />
            <View style={s.couponTexts}>
              <Text style={s.couponTitle}>
                Save SAR {DISCOUNT} with '{COUPON_CODE}'
              </Text>
              <Pressable style={s.viewCouponsRow}>
                <Text style={s.viewCoupons}>View all coupons</Text>
                <Lucide name="chevron-right" size={12} color={COLORS.softGold} />
              </Pressable>
            </View>
            <Pressable
              style={[s.applyBtn, couponApplied && s.applyBtnApplied]}
              onPress={() => setCouponApplied(v => !v)}>
              <Text style={[s.applyBtnTxt, couponApplied && s.applyBtnTxtApplied]}>
                {couponApplied ? 'REMOVE' : 'APPLY'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Delivery details ── */}
        <View style={s.section}>
          {/* Delivery time */}
          <View style={s.deliveryDetailRow}>
            <Lucide name="clock" size={18} color={COLORS.textSecondary} />
            <View style={s.deliveryDetailTexts}>
              <Text style={s.deliveryDetailMain}>
                Delivery in <Text style={s.bold}>20-25 mins</Text>
              </Text>
              <Pressable>
                <Text style={s.scheduleLink}>Want this later? Schedule it</Text>
              </Pressable>
            </View>
          </View>
          <View style={s.rowDivider} />

          {/* Delivery address */}
          <Pressable style={s.deliveryDetailRow}>
            <Lucide name="map-pin" size={18} color={COLORS.textSecondary} />
            <View style={s.deliveryDetailTexts}>
              <Text style={s.deliveryDetailMain}>
                Delivery at <Text style={s.bold}>Home</Text>
              </Text>
              <Text style={s.deliveryDetailSub} numberOfLines={1}>
                8056, 3117 As Sulay, Riyadh 14275, Sa...
              </Text>
              <Pressable>
                <Text style={s.scheduleLink}>Add instructions for delivery partner</Text>
              </Pressable>
            </View>
            <Lucide name="chevron-right" size={16} color={COLORS.mediumGray} />
          </Pressable>
          <View style={s.rowDivider} />

          {/* Contact */}
          <Pressable style={s.deliveryDetailRow}>
            <Lucide name="phone-call" size={18} color={COLORS.textSecondary} />
            <View style={s.deliveryDetailTexts}>
              <Text style={s.deliveryDetailMain}>Abdullah Al Zahrani, +966-50-000-0000</Text>
            </View>
            <Lucide name="chevron-right" size={16} color={COLORS.mediumGray} />
          </Pressable>
          <View style={s.rowDivider} />

          {/* Total bill */}
          <Pressable style={s.deliveryDetailRow}>
            <Lucide name="receipt" size={18} color={COLORS.textSecondary} />
            <View style={s.deliveryDetailTexts}>
              <View style={s.billRow}>
                <Text style={s.billOriginal}>SAR {subtotal + taxes + DELIVERY_FEE}</Text>
                <Text style={s.billTotal}> SAR {total}</Text>
                <View style={s.savedBadge}>
                  <Text style={s.savedBadgeTxt}>You saved SAR {discount}</Text>
                </View>
              </View>
              <Text style={s.deliveryDetailSub}>Incl. taxes and charges</Text>
            </View>
            <Lucide name="chevron-right" size={16} color={COLORS.mediumGray} />
          </Pressable>
        </View>

        {/* ── Bill breakdown ── */}
        <View style={s.section}>
          <Text style={s.billBreakTitle}>Bill Details</Text>
          <View style={s.billLine}>
            <Text style={s.billLineLabel}>Item total</Text>
            <Text style={s.billLineValue}>SAR {subtotal}</Text>
          </View>
          {discount > 0 && (
            <View style={s.billLine}>
              <Text style={[s.billLineLabel, {color: COLORS.successGreen}]}>
                Coupon discount
              </Text>
              <Text style={[s.billLineValue, {color: COLORS.successGreen}]}>
                - SAR {discount}
              </Text>
            </View>
          )}
          <View style={s.billLine}>
            <Text style={s.billLineLabel}>Delivery fee</Text>
            <Text style={s.billLineValue}>SAR {DELIVERY_FEE}</Text>
          </View>
          <View style={s.billLine}>
            <Text style={s.billLineLabel}>Taxes (15% VAT)</Text>
            <Text style={s.billLineValue}>SAR {taxes}</Text>
          </View>
          <View style={[s.billLine, s.billTotalLine]}>
            <Text style={s.billTotalLabel}>To Pay</Text>
            <Text style={s.billTotalValue}>SAR {total}</Text>
          </View>
        </View>

        {/* ── Wallet balance ── */}
        <View style={s.walletRow}>
          <Text style={s.walletText}>
            AlZahrani Wallet: SAR 0 •{' '}
          </Text>
          <Pressable>
            <Text style={s.addMoneyLink}>Add Money &gt;</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Fixed footer ── */}
      <View style={[s.footer, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        <View style={s.footerLeft}>
          <View style={s.payUsingRow}>
            <Text style={s.payUsingLabel}>PAY USING</Text>
            <Lucide name="chevron-up" size={12} color={COLORS.textSecondary} />
          </View>
          <View style={s.cardRow}>
            <Lucide name="credit-card" size={16} color={COLORS.textPrimary} />
            <View>
              <Text style={s.cardName}>Mada / Visa Card</Text>
              <Text style={s.cardSub}>**** 6174  |  Secured</Text>
            </View>
          </View>
        </View>
        <Pressable
          style={s.placeOrderBtn}
          onPress={() => navigation.navigate('OrderSuccess')}>
          <View>
            <Text style={s.placeOrderTotal}>SAR {total}</Text>
            <Text style={s.placeOrderTotalLabel}>TOTAL</Text>
          </View>
          <View style={s.placeOrderDivider} />
          <Text style={s.placeOrderLabel}>Place Order ▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F5F5F5'},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    gap: 10,
  },
  backBtn: {width: 32, alignItems: 'center'},
  headerMid: {flex: 1},
  restaurantName: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary},
  headerDeliveryRow: {flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'},
  deliveryLabel: {fontSize: 12, ...FONTS.regular, color: COLORS.mediumGray},
  deliveryBold: {fontSize: 12, ...FONTS.bold, color: COLORS.textPrimary},
  deliveryAddr: {fontSize: 11, ...FONTS.regular, color: COLORS.mediumGray},
  shareBtn: {width: 32, alignItems: 'center'},

  // Savings banner
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  savingsEmoji: {fontSize: 18},
  savingsText: {fontSize: 13, ...FONTS.regular, color: COLORS.textPrimary},
  savingsBold: {fontSize: 13, ...FONTS.bold, color: COLORS.gold},

  // Scroll
  scroll: {flex: 1},
  scrollContent: {gap: 10, paddingTop: 10},

  // Section card
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Offer
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  offerTitle: {fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary},
  offerEmoji: {fontSize: 20},
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  offerLogoWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#EEE',
  },
  offerLogo: {width: '100%', height: '100%'},
  offerBody: {flex: 1},
  offerName: {fontSize: 13, ...FONTS.bold, color: COLORS.textPrimary},
  offerSub: {fontSize: 11, ...FONTS.regular, color: COLORS.softGold, marginTop: 2},
  offerBtn: {
    borderWidth: 1,
    borderColor: COLORS.softGold,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 60,
  },
  offerBtnAdded: {backgroundColor: COLORS.softGold, borderColor: COLORS.softGold},
  offerBtnTxt: {fontSize: 11, ...FONTS.bold, color: COLORS.softGold},
  offerBtnTxtAdded: {color: COLORS.white},
  offerFreeTag: {fontSize: 10, ...FONTS.bold, color: COLORS.successGreen, marginTop: 2},

  // Veg box
  vegBox: {
    width: 16, height: 16, borderRadius: 3, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  vegGreen: {borderColor: '#2E7D32'},
  vegOrange: {borderColor: '#E65100'},
  vegDot: {width: 7, height: 7, borderRadius: 3.5},
  vegDotGreen: {backgroundColor: '#2E7D32'},
  vegDotOrange: {backgroundColor: '#E65100'},

  // Cart item
  cartItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 10,
  },
  cartItemInfo: {flex: 1},
  cartItemName: {fontSize: 14, ...FONTS.medium, color: COLORS.textPrimary},
  editRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  editText: {fontSize: 12, ...FONTS.bold, color: COLORS.softGold},
  cartItemRight: {alignItems: 'flex-end', gap: 6},
  cartItemPrice: {fontSize: 13, ...FONTS.bold, color: COLORS.textPrimary},
  itemDivider: {height: 1, backgroundColor: '#F5F5F5'},

  // Qty control
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.softGold,
    borderRadius: 8,
    overflow: 'hidden',
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF8F0',
  },
  qtyNum: {
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.softGold,
    paddingHorizontal: 12,
  },

  // Add more / actions
  addMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  addMoreText: {fontSize: 13, ...FONTS.bold, color: COLORS.softGold},
  actionBtnsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    gap: 0,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionBtnDivider: {width: 1, backgroundColor: '#E0E0E0', marginHorizontal: 8},
  actionBtnTxt: {fontSize: 11, ...FONTS.regular, color: COLORS.textSecondary, flexShrink: 1},
  actionBtnActive: {color: COLORS.softGold},

  // Complete your meal
  completeMealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  gridIcon: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center', justifyContent: 'center',
  },
  completeMealTitle: {fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary},
  suggestionsRow: {gap: 12, paddingBottom: 4},
  suggestionCard: {width: 110},
  suggestionImgWrap: {width: 110, height: 90, borderRadius: 10, overflow: 'hidden', position: 'relative', marginBottom: 6},
  suggestionImg: {width: '100%', height: '100%'},
  suggestionVeg: {position: 'absolute', top: 6, left: 6},
  suggestionAddBtn: {
    position: 'absolute', bottom: 6, right: 6,
    width: 26, height: 26, borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.softGold,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
  },
  suggestionName: {fontSize: 11, ...FONTS.medium, color: COLORS.textPrimary, lineHeight: 15},
  suggestionPrice: {fontSize: 12, ...FONTS.bold, color: COLORS.textPrimary, marginTop: 2},

  // Coupon
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  couponTexts: {flex: 1},
  couponTitle: {fontSize: 13, ...FONTS.medium, color: COLORS.textPrimary},
  viewCouponsRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  viewCoupons: {fontSize: 12, ...FONTS.regular, color: COLORS.softGold},
  applyBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.softGold,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  applyBtnApplied: {backgroundColor: COLORS.softGold},
  applyBtnTxt: {fontSize: 12, ...FONTS.bold, color: COLORS.softGold},
  applyBtnTxtApplied: {color: COLORS.white},

  // Delivery details
  deliveryDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    gap: 12,
  },
  deliveryDetailTexts: {flex: 1},
  deliveryDetailMain: {fontSize: 13, ...FONTS.regular, color: COLORS.textPrimary},
  deliveryDetailSub: {fontSize: 11, ...FONTS.regular, color: COLORS.mediumGray, marginTop: 2},
  scheduleLink: {fontSize: 12, ...FONTS.regular, color: COLORS.softGold, marginTop: 4},
  rowDivider: {height: 1, backgroundColor: '#F5F5F5'},
  bold: {...FONTS.bold},

  // Bill row
  billRow: {flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap'},
  billOriginal: {
    fontSize: 13, ...FONTS.regular, color: COLORS.mediumGray,
    textDecorationLine: 'line-through',
  },
  billTotal: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary},
  savedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: 6,
  },
  savedBadgeTxt: {fontSize: 10, ...FONTS.bold, color: COLORS.successGreen},

  // Bill breakdown
  billBreakTitle: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: 12},
  billLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  billLineLabel: {fontSize: 13, ...FONTS.regular, color: COLORS.textSecondary},
  billLineValue: {fontSize: 13, ...FONTS.medium, color: COLORS.textPrimary},
  billTotalLine: {
    borderTopWidth: 1, borderTopColor: '#EEE',
    marginTop: 6, paddingTop: 10,
  },
  billTotalLabel: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary},
  billTotalValue: {fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary},

  // Wallet
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  walletText: {fontSize: 13, ...FONTS.regular, color: COLORS.textSecondary},
  addMoneyLink: {fontSize: 13, ...FONTS.bold, color: COLORS.softGold},

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    gap: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: -3},
  },
  footerLeft: {flex: 1, gap: 2},
  payUsingRow: {flexDirection: 'row', alignItems: 'center', gap: 4},
  payUsingLabel: {fontSize: 10, ...FONTS.bold, color: COLORS.mediumGray, letterSpacing: 0.5},
  cardRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  cardName: {fontSize: 13, ...FONTS.bold, color: COLORS.textPrimary},
  cardSub: {fontSize: 10, ...FONTS.regular, color: COLORS.mediumGray},
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softGold,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 10,
  },
  placeOrderTotal: {fontSize: 15, ...FONTS.bold, color: COLORS.white},
  placeOrderTotalLabel: {fontSize: 9, ...FONTS.bold, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5},
  placeOrderDivider: {width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.3)'},
  placeOrderLabel: {fontSize: 14, ...FONTS.bold, color: COLORS.white},
});
