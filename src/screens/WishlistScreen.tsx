import React, {useState, useRef} from 'react';
import {
  Animated,
  FlatList,
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
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Types ────────────────────────────────────────────────────────────────────

type WishItem = {
  id: string;
  name: string;
  restaurant: string;
  price: string;
  originalPrice: string;
  discount: string;
  rating: number;
  reviews: number;
  deliveryTime: string;
  tag?: string;
  tagColor?: string;
  image: string;
  isVeg: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_ITEMS: WishItem[] = [
  {
    id: 'w1',
    name: 'Grilled Chicken Plate',
    restaurant: 'Arabian Grill House',
    price: 'SAR 42',
    originalPrice: 'SAR 55',
    discount: '24% OFF',
    rating: 4.5,
    reviews: 238,
    deliveryTime: '25 mins',
    tag: 'Bestseller',
    tagColor: '#E85D04',
    image:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
  },
  {
    id: 'w2',
    name: 'Beef Shawarma',
    restaurant: 'Kuttichira Biriyani Centre',
    price: 'SAR 28',
    originalPrice: 'SAR 35',
    discount: '20% OFF',
    rating: 4.3,
    reviews: 192,
    deliveryTime: '20 mins',
    image:
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
  },
  {
    id: 'w3',
    name: 'Mixed Grill Platter',
    restaurant: 'Al Aseel Roastery',
    price: 'SAR 65',
    originalPrice: 'SAR 80',
    discount: '19% OFF',
    rating: 4.7,
    reviews: 415,
    deliveryTime: '35 mins',
    tag: 'Must Try',
    tagColor: '#2EA87E',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
  },
  {
    id: 'w4',
    name: 'Falafel Wrap',
    restaurant: 'Zatar & Zeit',
    price: 'SAR 18',
    originalPrice: 'SAR 22',
    discount: '18% OFF',
    rating: 4.1,
    reviews: 97,
    deliveryTime: '15 mins',
    tag: 'Veg',
    tagColor: '#2EA87E',
    image:
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
  },
  {
    id: 'w5',
    name: 'Lamb Mandi',
    restaurant: 'Mandi Palace',
    price: 'SAR 95',
    originalPrice: 'SAR 120',
    discount: '21% OFF',
    rating: 4.8,
    reviews: 603,
    deliveryTime: '40 mins',
    tag: 'Top Rated',
    tagColor: '#F4A261',
    image:
      'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=600&q=80',
    isVeg: false,
  },
  {
    id: 'w6',
    name: 'Hummus & Bread',
    restaurant: 'Levant Kitchen',
    price: 'SAR 22',
    originalPrice: 'SAR 28',
    discount: '21% OFF',
    rating: 4.2,
    reviews: 148,
    deliveryTime: '18 mins',
    image:
      'https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function VegDot({isVeg}: {isVeg: boolean}) {
  return (
    <View style={[s.vegDot, {borderColor: isVeg ? '#2EA87E' : '#E53935'}]}>
      <View
        style={[
          s.vegDotInner,
          {backgroundColor: isVeg ? '#2EA87E' : '#E53935'},
        ]}
      />
    </View>
  );
}

function StarRow({rating, reviews}: {rating: number; reviews: number}) {
  return (
    <View style={s.starRow}>
      <Lucide name="star" size={12} color="#F4A261" />
      <Text style={s.ratingTxt}>{rating}</Text>
      <Text style={s.reviewTxt}>({reviews})</Text>
    </View>
  );
}

function WishCard({
  item,
  onRemove,
  onAddToCart,
}: {
  item: WishItem;
  onRemove: (id: string) => void;
  onAddToCart: (item: WishItem) => void;
}) {
  return (
    <View style={s.card}>
      {/* Image */}
      <View style={s.imgWrap}>
        <Image source={{uri: item.image}} style={s.img} />
        {item.tag && (
          <View style={[s.tagBadge, {backgroundColor: item.tagColor}]}>
            <Text style={s.tagTxt}>{item.tag}</Text>
          </View>
        )}
        <Pressable
          style={s.heartBtn}
          onPress={() => onRemove(item.id)}
          hitSlop={8}>
          <Lucide name="heart" size={16} color="#E53935" />
        </Pressable>
      </View>

      {/* Body */}
      <View style={s.cardBody}>
        <View style={s.nameRow}>
          <VegDot isVeg={item.isVeg} />
          <Text style={s.name} numberOfLines={1}>
            {item.name}
          </Text>
        </View>

        <Text style={s.restaurant} numberOfLines={1}>
          {item.restaurant}
        </Text>

        <StarRow rating={item.rating} reviews={item.reviews} />

        <View style={s.priceRow}>
          <Text style={s.price}>{item.price}</Text>
          <Text style={s.original}>{item.originalPrice}</Text>
          <View style={s.discountBadge}>
            <Text style={s.discountTxt}>{item.discount}</Text>
          </View>
        </View>

        <View style={s.footer}>
          <View style={s.deliveryRow}>
            <Lucide name="clock" size={11} color={COLORS.mediumGray} />
            <Text style={s.deliveryTxt}>{item.deliveryTime}</Text>
          </View>
          <Pressable style={s.addBtn} onPress={() => onAddToCart(item)}>
            <Text style={s.addBtnTxt}>Add</Text>
            <Lucide name="plus" size={13} color="#fff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({onBrowse}: {onBrowse: () => void}) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIcon}>
        <Lucide name="heart" size={44} color={COLORS.softGold} />
      </View>
      <Text style={s.emptyTitle}>Nothing saved yet</Text>
      <Text style={s.emptySub}>
        Tap the heart on any dish to save it here for quick access.
      </Text>
      <Pressable style={s.browseBtn} onPress={onBrowse}>
        <Text style={s.browseBtnTxt}>Browse Menu</Text>
      </Pressable>
    </View>
  );
}

// ─── Filter Tab Bar ───────────────────────────────────────────────────────────

const FILTERS: {key: string; label: string; icon: 'layout-grid' | 'leaf' | 'flame' | 'star'}[] = [
  {key: 'All',       label: 'All',       icon: 'layout-grid'},
  {key: 'Veg',       label: 'Veg',       icon: 'leaf'},
  {key: 'Non-Veg',   label: 'Non-Veg',   icon: 'flame'},
  {key: 'Top Rated', label: 'Top Rated', icon: 'star'},
];

const SORT_OPTIONS = ['Relevance', 'Price: Low–High', 'Price: High–Low', 'Rating'];

function FilterBar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (k: string) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
      bounces={false}>
      {FILTERS.map(f => {
        const isActive = f.key === active;
        const iconColor = isActive ? '#2EA87E' : '#999';
        return (
          <Pressable
            key={f.key}
            style={[s.chip, isActive && s.chipActive]}
            onPress={() => onSelect(f.key)}>
            <Lucide name={f.icon} size={13} color={iconColor} />
            <Text style={[s.chipTxt, isActive && s.chipTxtActive]}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SortSheet({
  visible,
  active,
  onSelect,
  onClose,
}: {
  visible: boolean;
  active: string;
  onSelect: (s: string) => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <Pressable style={s.sortOverlay} onPress={onClose}>
      <View style={s.sortSheet}>
        <View style={s.sortHandle} />
        <Text style={s.sortTitle}>Sort by</Text>
        {SORT_OPTIONS.map(opt => (
          <Pressable
            key={opt}
            style={s.sortRow}
            onPress={() => {
              onSelect(opt);
              onClose();
            }}>
            <Text style={[s.sortRowTxt, active === opt && s.sortRowActive]}>
              {opt}
            </Text>
            {active === opt && (
              <Lucide name="check" size={16} color="#2EA87E" />
            )}
          </Pressable>
        ))}
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WishlistScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<WishItem[]>(INITIAL_ITEMS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Relevance');
  const [sortOpen, setSortOpen] = useState(false);
  const sortAnim = useRef(new Animated.Value(0)).current;

  const openSort = () => {
    setSortOpen(true);
    Animated.spring(sortAnim, {toValue: 1, useNativeDriver: true}).start();
  };
  const closeSort = () => {
    setSortOpen(false);
  };

  const filtered = items
    .filter(item => {
      if (activeFilter === 'Veg') return item.isVeg;
      if (activeFilter === 'Non-Veg') return !item.isVeg;
      if (activeFilter === 'Top Rated') return item.rating >= 4.5;
      return true;
    })
    .sort((a, b) => {
      if (activeSort === 'Rating') return b.rating - a.rating;
      if (activeSort === 'Price: Low–High')
        return parseInt(a.price.replace(/\D/g, ''), 10) - parseInt(b.price.replace(/\D/g, ''), 10);
      if (activeSort === 'Price: High–Low')
        return parseInt(b.price.replace(/\D/g, ''), 10) - parseInt(a.price.replace(/\D/g, ''), 10);
      return 0;
    });

  const handleRemove = (id: string) =>
    setItems(prev => prev.filter(i => i.id !== id));

  const handleAddToCart = (_item: WishItem) => navigation.navigate('Cart');

  return (
    <View style={[s.root, {paddingTop: insets.top}]}>
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={s.headerTitle}>Favourites</Text>
          <Text style={s.headerSub}>{items.length} saved items</Text>
        </View>
        <Pressable
          style={s.clearBtn}
          onPress={() => setItems([])}
          hitSlop={8}>
          <Lucide name="trash-2" size={14} color={COLORS.textSecondary} />
          <Text style={s.clearTxt}>Clear all</Text>
        </Pressable>
      </View>

      {/* ── Filter + Sort bar ── */}
      <View style={s.controlBar}>
        <FilterBar active={activeFilter} onSelect={setActiveFilter} />
        <Pressable style={s.sortBtn} onPress={openSort}>
          <Lucide name="arrow-up-down" size={14} color={COLORS.textPrimary} />
          <Text style={s.sortBtnTxt}>Sort</Text>
        </Pressable>
      </View>

      {/* ── Active sort label ── */}
      {activeSort !== 'Relevance' && (
        <View style={s.activeSortBanner}>
          <Text style={s.activeSortTxt}>Sorted by: {activeSort}</Text>
          <Pressable onPress={() => setActiveSort('Relevance')} hitSlop={8}>
            <Lucide name="x" size={14} color="#2EA87E" />
          </Pressable>
        </View>
      )}

      {/* ── List / Empty ── */}
      {filtered.length === 0 ? (
        <EmptyState onBrowse={() => navigation.navigate('MainTabs')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={s.row}
          contentContainerStyle={[
            s.list,
            {paddingBottom: insets.bottom + 16},
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <WishCard
              item={item}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
            />
          )}
        />
      )}

      {/* ── Sort sheet ── */}
      <SortSheet
        visible={sortOpen}
        active={activeSort}
        onSelect={setActiveSort}
        onClose={closeSort}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F7F7F7'},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 24,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginTop: 4,
    backgroundColor: '#FAFAFA',
  },
  clearTxt: {
    fontSize: 12,
    ...FONTS.medium,
    color: COLORS.textSecondary,
  },

  // Control bar (filters + sort)
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  filterRow: {
    flex: 1,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  chipActive: {
    backgroundColor: '#E8F7F1',
    borderColor: '#2EA87E',
  },
  chipTxt: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.textSecondary,
  },
  chipTxtActive: {
    color: '#2EA87E',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: '#EBEBEB',
  },
  sortBtnTxt: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.textPrimary,
  },

  // Active sort banner
  activeSortBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#E8F7F1',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#B8E8D4',
  },
  activeSortTxt: {
    fontSize: 12,
    ...FONTS.medium,
    color: '#2EA87E',
  },

  // Sort sheet
  sortOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 99,
  },
  sortSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
  sortHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sortTitle: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F0F0',
  },
  sortRowTxt: {
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.textPrimary,
  },
  sortRowActive: {
    ...FONTS.bold,
    color: '#2EA87E',
  },

  // Grid
  list: {
    paddingHorizontal: 12,
    paddingTop: 14,
    gap: 12,
  },
  row: {
    gap: 12,
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  imgWrap: {
    position: 'relative',
  },
  img: {
    width: '100%',
    height: 120,
  },
  tagBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagTxt: {
    fontSize: 10,
    ...FONTS.bold,
    color: '#fff',
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Card body
  cardBody: {
    padding: 10,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vegDot: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  vegDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  name: {
    flex: 1,
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  restaurant: {
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },
  starRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingTxt: {
    fontSize: 12,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  reviewTxt: {
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  price: {
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  original: {
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#FFF4E5',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  discountTxt: {
    fontSize: 10,
    ...FONTS.bold,
    color: '#E85D04',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  deliveryTxt: {
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#2EA87E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  addBtnTxt: {
    fontSize: 12,
    ...FONTS.bold,
    color: '#fff',
  },

  // Empty state
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF4E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  browseBtn: {
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#2EA87E',
  },
  browseBtnTxt: {
    fontSize: 14,
    ...FONTS.bold,
    color: '#fff',
  },
});
