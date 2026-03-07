import React, {useState} from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';

const {width: SCREEN_W} = Dimensions.get('window');
const IMAGE_H = Math.round(SCREEN_W * 0.72);
const MAX_SPECIAL = 70;

type Nav = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
type RouteT = RouteProp<RootStackParamList, 'ProductDetail'>;

function ProductDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteT>();
  const insets = useSafeAreaInsets();

  const {
    name = 'Special Family Pack Chicken Biryani Medium 8 Person',
    price = 'SAR 50',
    originalPrice = 'SAR 100',
    discount = '50% off',
    image = 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
    description = 'Medium family chicken biryani, including raita and mirchi ka salan. Upto 8 family members.',
  } = route.params ?? {};

  const [qty, setQty] = useState(1);
  const [request, setRequest] = useState('');

  const decrement = () => setQty(q => Math.max(1, q - 1));
  const increment = () => setQty(q => q + 1);

  return (
    <View style={styles.root}>
      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120 + insets.bottom}}>
        {/* Hero image */}
        <View style={styles.heroWrap}>
          <Image source={{uri: image}} style={styles.heroImg} resizeMode="cover" />
          {/* Close button */}
          <Pressable
            style={[styles.closeBtn, {top: insets.top + 12}]}
            onPress={() => navigation.goBack()}
            hitSlop={10}>
            <Lucide name="x" size={20} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* ── Product info ── */}
        <View style={styles.info}>
          {/* Name */}
          <Text style={styles.name}>{name}</Text>

          {/* Price row */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{price}</Text>
            {originalPrice ? (
              <Text style={styles.originalPrice}>{originalPrice}</Text>
            ) : null}
            {discount ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discount}</Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Special request ── */}
        <View style={styles.specialSection}>
          <Text style={styles.specialTitle}>Special request</Text>
          <View style={styles.requestInputWrap}>
            <TextInput
              style={styles.requestInput}
              placeholder={
                'We will notify the restaurant of your request. If it cannot be fulfilled, the order cannot be cancelled or refunded.'
              }
              placeholderTextColor={COLORS.mediumGray}
              multiline
              maxLength={MAX_SPECIAL}
              value={request}
              onChangeText={setRequest}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {request.length}/{MAX_SPECIAL}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Fixed bottom bar ── */}
      <View
        style={[
          styles.footer,
          {paddingBottom: Math.max(insets.bottom, 16)},
        ]}>
        {/* Quantity selector */}
        <View style={styles.qtySelector}>
          <Pressable
            style={styles.qtyBtn}
            onPress={decrement}
            hitSlop={8}>
            <Lucide
              name="minus"
              size={18}
              color={qty <= 1 ? COLORS.mediumGray : COLORS.textPrimary}
            />
          </Pressable>
          <Text style={styles.qtyText}>{qty}</Text>
          <Pressable style={styles.qtyBtn} onPress={increment} hitSlop={8}>
            <Lucide name="plus" size={18} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* Add to cart button */}
        <Pressable
          style={styles.addToCartBtn}
          onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.addToCartLabel}>Add to cart</Text>
          <View style={styles.addToCartPriceCol}>
            <Text style={styles.addToCartPrice}>{price}</Text>
            {originalPrice ? (
              <Text style={styles.addToCartOriginalPrice}>{originalPrice}</Text>
            ) : null}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    flex: 1,
  },

  // Hero
  heroWrap: {
    width: SCREEN_W,
    height: IMAGE_H,
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  heroImg: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },

  // Info section
  info: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
  },
  name: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: 28,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    ...FONTS.bold,
    color: '#E53935',
  },
  originalPrice: {
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: COLORS.warmYellow,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 13,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    lineHeight: 19,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 20,
  },

  // Special request
  specialSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  specialTitle: {
    fontSize: 17,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  requestInputWrap: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    padding: 14,
    minHeight: 110,
  },
  requestInput: {
    fontSize: 13,
    ...FONTS.regular,
    color: COLORS.textPrimary,
    minHeight: 70,
    paddingTop: Platform.OS === 'ios' ? 0 : 0,
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    marginTop: 6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: -3},
  },
  qtySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 12,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 17,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    minWidth: 22,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.warmYellow,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  addToCartLabel: {
    fontSize: 15,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  addToCartPriceCol: {
    alignItems: 'flex-end',
  },
  addToCartPrice: {
    fontSize: 15,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  addToCartOriginalPrice: {
    fontSize: 11,
    ...FONTS.regular,
    color: 'rgba(0,0,0,0.45)',
    textDecorationLine: 'line-through',
  },
});

export default ProductDetailScreen;
