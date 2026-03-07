import React, {useState, useRef, useEffect} from 'react';
import {
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import type {RootStackParamList} from '../navigation/types';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CARD_W = Math.floor((SCREEN_WIDTH - 32 - 12) / 2);

// ─── Data ─────────────────────────────────────────────────────────────────────

const BANNER_SLIDES = [
  {
    id: 'b1',
    badge: 'FREE DELIVERY',
    badgeBg: '#E53935',
    title: 'Get FREE DELIVERY\non your first order',
    sub: 'under 7 km',
    bgColor: '#FEE8DC',
    image:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'b2',
    badge: '50% OFF',
    badgeBg: '#2E7D32',
    title: 'Up to 50% Off\non weekend specials',
    sub: 'limited time offer',
    bgColor: '#E8F5E9',
    image:
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=300&q=80',
  },
  {
    id: 'b3',
    badge: 'NEW',
    badgeBg: '#1565C0',
    title: 'Premium Grills\nnow available',
    sub: 'order before 10 PM',
    bgColor: '#E3F2FD',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80',
  },
];

type Category = {id: string; label: string; image: string; special: boolean};
const CATEGORIES: Category[] = [
  {id: 'c0', label: 'Explore', image: '', special: true},
  {
    id: 'c1',
    label: 'All',
    image:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80',
    special: false,
  },
  {
    id: 'c2',
    label: 'Biryani',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
    special: false,
  },
  {
    id: 'c3',
    label: 'Pizza',
    image:
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=200&q=80',
    special: false,
  },
  {
    id: 'c4',
    label: 'Burgers',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
    special: false,
  },
  {
    id: 'c5',
    label: 'Wraps',
    image:
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=200&q=80',
    special: false,
  },
  {
    id: 'c6',
    label: 'Salads',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=200&q=80',
    special: false,
  },
  {
    id: 'c7',
    label: 'Desserts',
    image:
      'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=80',
    special: false,
  },
];

type FilterChip = {label: string; isNew?: boolean};
const FILTER_CHIPS: FilterChip[] = [
  {label: 'Filters'},
  {label: 'Under SAR 20'},
  {label: 'Schedule', isNew: true},
  {label: 'Under 30 min'},
  {label: 'Top Rated'},
  {label: 'New Arrivals'},
];

const RECOMMENDED = [
  {
    id: 'r1',
    name: "McDonald's",
    offer: '50% OFF up to SAR 20',
    rating: '4.0',
    time: '30-35 mins',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'r2',
    name: 'Subway',
    offer: '40% OFF',
    rating: '3.8',
    time: '30-35 mins',
    image:
      'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'r3',
    name: 'Boojee Cafe',
    offer: '50% OFF up to SAR 15',
    rating: '4.4',
    time: '40-45 mins',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'r4',
    name: 'Al Baik',
    offer: 'FLAT 50% OFF',
    rating: '4.5',
    time: '25-30 mins',
    image:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'r5',
    name: 'Shawarma House',
    offer: 'FLAT 50% OFF',
    rating: '4.2',
    time: '20-25 mins',
    image:
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'r6',
    name: 'Pizza Hut',
    offer: 'FLAT 50% OFF',
    rating: '4.1',
    time: '35-40 mins',
    image:
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=400&q=80',
  },
];

const RECENTLY_VIEWED = [
  {
    id: 'rv1',
    name: 'Grilled Chicken',
    price: 'SAR 42',
    image:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rv2',
    name: 'Beef Shawarma',
    price: 'SAR 28',
    image:
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rv3',
    name: 'Mixed Grill',
    price: 'SAR 65',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'rv4',
    name: 'Fresh Salad',
    price: 'SAR 22',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
  },
];

const TOP_PICKS = [
  {
    id: 'tp1',
    name: 'Crispy Falafel',
    price: 'SAR 18',
    tag: 'Bestseller',
    image:
      'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tp2',
    name: 'Lamb Mandi',
    price: 'SAR 55',
    tag: 'Chef\'s Choice',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tp3',
    name: 'Cheese Pizza',
    price: 'SAR 38',
    tag: 'Popular',
    image:
      'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'tp4',
    name: 'Chicken Burger',
    price: 'SAR 32',
    tag: 'New',
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

// ─── Component ────────────────────────────────────────────────────────────────

function HomeScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [activeCat, setActiveCat] = useState('c1');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const bannerRef = useRef<ScrollView>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const startAutoPlay = () => {
    clearAutoPlay();
    timerRef.current = setInterval(() => {
      setBannerIdx(prev => {
        const next = (prev + 1) % BANNER_SLIDES.length;
        bannerRef.current?.scrollTo({x: next * SCREEN_WIDTH, animated: true});
        return next;
      });
    }, 3000);
  };

  useEffect(() => {
    startAutoPlay();
    return clearAutoPlay;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFilter = (label: string) =>
    setActiveFilters(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label],
    );

  const recRows = chunk(RECOMMENDED, 2);

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* ── Fixed Header ── */}
      <View style={styles.header}>
        {/* Row 1: Location + icons */}
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.locBtn}
            onPress={() => navigation.navigate('LocationSelect')}
            hitSlop={8}>
            <View style={styles.locIconWrap}>
              <Lucide name="map-pin" size={15} color="#fff" />
            </View>
            <View style={styles.locTexts}>
              <Text style={styles.locLabel}>Delivering to</Text>
              <Text style={styles.locName}>As Sulay, Riyadh</Text>
            </View>
            <Lucide name="chevron-down" size={16} color={COLORS.mediumGray} />
          </Pressable>
          <View style={styles.headerIcons}>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Cart')}
              hitSlop={8}>
              <Lucide name="shopping-bag" size={20} color={COLORS.textPrimary} />
            </Pressable>
          </View>
        </View>

        {/* Row 2: Search + map */}
        <View style={styles.searchRow}>
          <Pressable
            style={styles.search}
            onPress={() => navigation.navigate('Search')}>
            <Lucide name="search" size={17} color={COLORS.mediumGray} />
            <Text style={styles.searchHint}>Type of food, restaurant name...</Text>
          </Pressable>
          <Pressable
            style={styles.mapBtn}
            onPress={() => navigation.navigate('LocationSelect')}
            hitSlop={8}>
            <Lucide name="map" size={22} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 24},
        ]}>

      {/* ── Auto-play Banner Carousel ── */}
      <View>
        <ScrollView
          ref={bannerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollBeginDrag={clearAutoPlay}
          onMomentumScrollEnd={e => {
            const i = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
            );
            setBannerIdx(i);
            startAutoPlay();
          }}>
          {BANNER_SLIDES.map(slide => (
            <View
              key={slide.id}
              style={[styles.bannerSlide, {backgroundColor: slide.bgColor}]}>
              <View style={styles.bannerLeft}>
                <View
                  style={[
                    styles.bannerBadge,
                    {backgroundColor: slide.badgeBg},
                  ]}>
                  <Text style={styles.bannerBadgeTxt}>{slide.badge}</Text>
                </View>
                <Text style={styles.bannerTitle}>{slide.title}</Text>
                <Text style={styles.bannerSub}>{slide.sub}</Text>
              </View>
              <Image source={{uri: slide.image}} style={styles.bannerImg} />
            </View>
          ))}
        </ScrollView>
        <View style={styles.bannerDots}>
          {BANNER_SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === bannerIdx ? styles.dotOn : styles.dotOff,
              ]}
            />
          ))}
        </View>
      </View>

      {/* ── Categories ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catRow}>
        {CATEGORIES.map(cat => {
          const active = activeCat === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={styles.catItem}
              onPress={() => setActiveCat(cat.id)}>
              {cat.special ? (
                <View style={styles.catExplore}>
                  <Text style={styles.catExploreLbl}>{'FLAT\n50%\nOFF'}</Text>
                </View>
              ) : (
                <View
                  style={[styles.catCircle, active && styles.catCircleActive]}>
                  <Image source={{uri: cat.image}} style={styles.catImg} />
                </View>
              )}
              <Text
                style={[
                  styles.catLabel,
                  active && !cat.special && styles.catLabelOn,
                ]}>
                {cat.label}
              </Text>
              {active && !cat.special && <View style={styles.catBar} />}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.sep} />

      {/* ── Filter Chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}>
        {FILTER_CHIPS.map((chip, i) => {
          const on = activeFilters.includes(chip.label);
          const hasArrow =
            chip.label === 'Filters' || chip.label === 'Schedule';
          return (
            <Pressable
              key={chip.label}
              style={[styles.chip, on && styles.chipOn]}
              onPress={() => toggleFilter(chip.label)}>
              {i === 0 && (
                <Lucide
                  name="sliders-horizontal"
                  size={12}
                  color={on ? '#fff' : COLORS.textPrimary}
                  style={styles.chipIcon}
                />
              )}
              {chip.isNew && (
                <View style={styles.chipNew}>
                  <Text style={styles.chipNewTxt}>New</Text>
                </View>
              )}
              <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>
                {chip.label}
              </Text>
              {hasArrow && (
                <Lucide
                  name="chevron-down"
                  size={11}
                  color={on ? '#fff' : COLORS.textPrimary}
                  style={styles.chipArrow}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ── Recommended For You ── */}
      <View style={styles.secRow}>
        <Text style={styles.secTitle}>RECOMMENDED FOR YOU</Text>
      </View>
      {recRows.map((row, ri) => (
        <View key={ri} style={styles.gridRow}>
          {row.map(item => (
            <Pressable
              key={item.id}
              style={styles.prodCard}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  id: item.id,
                  name: item.name,
                  price: 'SAR 50',
                  originalPrice: 'SAR 100',
                  discount: '50% off',
                  image: item.image,
                  description:
                    'Freshly prepared with premium ingredients. Order now for a delicious experience delivered to your door.',
                })
              }>
              <View style={styles.prodImgBox}>
                <Image source={{uri: item.image}} style={styles.prodImg} />
                <View style={styles.offerBanner}>
                  <Text style={styles.offerTxt}>{item.offer}</Text>
                </View>
                <View style={styles.ratingPill}>
                  <Text style={styles.ratingTxt}>⭐ {item.rating}</Text>
                </View>
              </View>
              <Text style={styles.prodName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.timeRow}>
                <Lucide name="clock" size={11} color={COLORS.mediumGray} />
                <Text style={styles.timeTxt}>{item.time}</Text>
              </View>
            </Pressable>
          ))}
          {row.length === 1 && <View style={{width: CARD_W}} />}
        </View>
      ))}

      {/* ── Top Picks ── */}
      <View style={styles.secRow}>
        <Text style={styles.secTitle}>TOP PICKS FOR YOU</Text>
        <Pressable hitSlop={8} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topPicksRow}>
        {TOP_PICKS.map(item => (
          <Pressable
            key={item.id}
            style={styles.topPickCard}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                id: item.id,
                name: item.name,
                price: item.price,
                originalPrice: 'SAR 80',
                discount: '30% off',
                image: item.image,
                description:
                  'One of our top picks. Crafted fresh daily for the best taste.',
              })
            }>
            <View style={styles.topPickImgWrap}>
              <Image source={{uri: item.image}} style={styles.topPickImg} />
              <View style={styles.topPickTag}>
                <Text style={styles.topPickTagTxt}>{item.tag}</Text>
              </View>
            </View>
            <Text style={styles.topPickName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.topPickBottom}>
              <Text style={styles.topPickPrice}>{item.price}</Text>
          <Pressable
              style={styles.topPickAddBtn}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                })
              }>
                <Lucide name="plus" size={14} color="#fff" />
              </Pressable>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Recently Viewed ── */}
      <View style={styles.secRow}>
        <Text style={styles.secTitle}>RECENTLY VIEWED</Text>
        <Pressable hitSlop={8} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recentRow}>
        {RECENTLY_VIEWED.map(item => (
          <Pressable
            key={item.id}
            style={styles.recentCard}
            onPress={() =>
              navigation.navigate('ProductDetail', {
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
              })
            }>
            <Image source={{uri: item.image}} style={styles.recentImg} />
            <Text style={styles.recentName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.recentPrice}>{item.price}</Text>
            <Pressable
              style={styles.addBtn}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  image: item.image,
                })
              }>
              <Text style={styles.addBtnTxt}>+ Add</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>

      {/* ── Promo Footer Banner ── */}
      <Pressable
        style={styles.promoBanner}
        onPress={() => navigation.navigate('Cart')}>
        <View style={styles.promoLeft}>
          <Text style={styles.promoTag}>LIMITED TIME</Text>
          <Text style={styles.promoTitle}>Free delivery on{'\n'}orders above SAR 50</Text>
          <Text style={styles.promoAction}>Order now →</Text>
        </View>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80',
          }}
          style={styles.promoImg}
        />
      </Pressable>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F7F7F7'},
  scroll: {flex: 1},
  container: {},

  // Header (fixed at top)
  header: {
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  locIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2EA87E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locTexts: {
    flex: 1,
  },
  locLabel: {
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    lineHeight: 14,
  },
  locName: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2B2B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#fff',
    fontSize: 15,
    ...FONTS.bold,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderRadius: 24,
    backgroundColor: '#F3F3F3',
    paddingHorizontal: 16,
    gap: 8,
  },
  searchHint: {
    flex: 1,
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },
  mapBtn: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Legacy unused (kept to avoid ref errors)
  locSub: {fontSize: 1},
  headerRight: {flexDirection: 'row'},
  searchWrap: {height: 0, overflow: 'hidden'},
  vegToggle: {height: 0},
  vegLabel: {
    fontSize: 8,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  vegSwitch: {
    marginTop: 4,
    width: 28,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#CCC',
  },

  // Banner
  bannerSlide: {
    width: SCREEN_WIDTH,
    height: 160,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  bannerLeft: {flex: 1, paddingRight: 8},
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  bannerBadgeTxt: {
    color: '#fff',
    fontSize: 11,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 16,
    ...FONTS.bold,
    color: '#111',
    lineHeight: 22,
  },
  bannerSub: {
    fontSize: 12,
    ...FONTS.regular,
    color: '#555',
    marginTop: 4,
  },
  bannerImg: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 5,
    backgroundColor: COLORS.white,
  },
  dot: {height: 5, borderRadius: 3},
  dotOn: {width: 18, backgroundColor: COLORS.textPrimary},
  dotOff: {width: 5, backgroundColor: '#CCC'},

  // Categories
  catRow: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
  },
  catItem: {
    alignItems: 'center',
    width: 70,
    marginHorizontal: 4,
  },
  catCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  catCircleActive: {
    borderColor: COLORS.softGold,
  },
  catExplore: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFF3D6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.softGold,
  },
  catExploreLbl: {
    fontSize: 9,
    ...FONTS.bold,
    color: COLORS.gold,
    textAlign: 'center',
    lineHeight: 13,
  },
  catImg: {width: '100%', height: '100%'},
  catLabel: {
    marginTop: 6,
    fontSize: 11,
    ...FONTS.medium,
    color: COLORS.mediumGray,
    textAlign: 'center',
  },
  catLabelOn: {color: COLORS.textPrimary, ...FONTS.bold},
  catBar: {
    marginTop: 4,
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.textPrimary,
  },

  // Separator
  sep: {
    height: 6,
    backgroundColor: '#F0F0F0',
  },

  // Filter chips
  chipRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#fff',
    marginRight: 8,
  },
  chipOn: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  chipIcon: {marginRight: 4},
  chipArrow: {marginLeft: 2},
  chipNew: {
    backgroundColor: '#2E7D32',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginRight: 4,
  },
  chipNewTxt: {
    fontSize: 9,
    ...FONTS.bold,
    color: '#fff',
  },
  chipTxt: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.textPrimary,
  },
  chipTxtOn: {color: '#fff'},

  // Section header
  secRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  secTitle: {
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.6,
  },
  seeAll: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.softGold,
  },

  // Product grid
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 14,
  },
  prodCard: {
    width: CARD_W,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.09,
    shadowRadius: 5,
  },
  prodImgBox: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  prodImg: {width: '100%', height: '100%'},
  offerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  offerTxt: {
    color: '#fff',
    fontSize: 10,
    ...FONTS.bold,
  },
  ratingPill: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    backgroundColor: '#1E8C45',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingTxt: {
    color: '#fff',
    fontSize: 10,
    ...FONTS.bold,
  },
  prodName: {
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 9,
    paddingBottom: 2,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  timeTxt: {
    fontSize: 11,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },

  // Top Picks
  topPicksRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  topPickCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  topPickImgWrap: {
    position: 'relative',
  },
  topPickImg: {
    width: '100%',
    height: 110,
  },
  topPickTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.softGold,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  topPickTagTxt: {
    fontSize: 9,
    ...FONTS.bold,
    color: '#fff',
  },
  topPickName: {
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  topPickBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  topPickPrice: {
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.gold,
  },
  topPickAddBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recently Viewed
  recentRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  recentCard: {
    width: 130,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },
  recentImg: {
    width: '100%',
    height: 100,
  },
  recentName: {
    fontSize: 12,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 2,
  },
  recentPrice: {
    fontSize: 12,
    ...FONTS.medium,
    color: COLORS.softGold,
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  addBtn: {
    marginHorizontal: 8,
    marginBottom: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.softGold,
    alignItems: 'center',
  },
  addBtnTxt: {
    fontSize: 12,
    ...FONTS.bold,
    color: '#fff',
  },

  // Promo footer banner
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: COLORS.sandLight,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  promoLeft: {
    flex: 1,
    padding: 18,
  },
  promoTag: {
    fontSize: 10,
    ...FONTS.bold,
    color: COLORS.softGold,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  promoTitle: {
    fontSize: 15,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    lineHeight: 21,
    marginBottom: 10,
  },
  promoAction: {
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.gold,
  },
  promoImg: {
    width: 110,
    height: 110,
  },
});

export default HomeScreen;
