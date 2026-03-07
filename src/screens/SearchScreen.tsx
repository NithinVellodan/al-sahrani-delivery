import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';

type SearchNav = NativeStackNavigationProp<RootStackParamList>;

// ─── Data ─────────────────────────────────────────────────────────────────────
const ALL_DISHES = [
  {
    id: 's1', name: 'Grilled Chicken Plate', category: 'Grills', price: 42,
    rating: '4.5', time: '20-25 mins', tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's2', name: 'Beef Shawarma', category: 'Wraps', price: 28,
    rating: '4.2', time: '15-20 mins', tag: '',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's3', name: 'Mixed Grill Platter', category: 'Grills', price: 65,
    rating: '4.7', time: '30-35 mins', tag: "Chef's Choice",
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's4', name: 'Fresh Fruit Bowl', category: 'Healthy', price: 22,
    rating: '4.1', time: '10-15 mins', tag: 'Veg',
    image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's5', name: 'Arabic Mezze Platter', category: 'Starters', price: 35,
    rating: '4.4', time: '15-20 mins', tag: 'Veg',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's6', name: 'Lamb Mandi', category: 'Rice', price: 55,
    rating: '4.8', time: '35-40 mins', tag: 'Popular',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's7', name: 'Crispy Falafel', category: 'Starters', price: 18,
    rating: '4.0', time: '10-15 mins', tag: 'Veg',
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 's8', name: 'Cheese Pizza', category: 'Pizza', price: 38,
    rating: '4.3', time: '25-30 mins', tag: '',
    image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=400&q=80',
  },
];

const INITIAL_RECENTS = ['Shawarma', 'Grilled Chicken', 'Biryani'];

const TRENDING = [
  {id: 't1', label: 'Mandi', icon: 'flame'},
  {id: 't2', label: 'Shawarma', icon: 'flame'},
  {id: 't3', label: 'Pizza', icon: 'trending-up'},
  {id: 't4', label: 'Burger', icon: 'trending-up'},
  {id: 't5', label: 'Mezze', icon: 'star'},
  {id: 't6', label: 'Grills', icon: 'star'},
] as const;

const CATEGORIES = ['All', 'Grills', 'Wraps', 'Rice', 'Pizza', 'Starters', 'Healthy'];

// ─── Animated result row ──────────────────────────────────────────────────────
function ResultRow({
  item,
  index,
  listAnim,
  onPress,
}: {
  item: (typeof ALL_DISHES)[0];
  index: number;
  listAnim: Animated.Value;
  onPress: () => void;
}) {
  const translateY = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24 + index * 6, 0],
  });
  const opacity = listAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View style={{opacity, transform: [{translateY}]}}>
      <Pressable style={s.resultRow} onPress={onPress} android_ripple={{color: '#F5F5F5'}}>
        <Image source={{uri: item.image}} style={s.resultImg} />
        <View style={s.resultInfo}>
          <View style={s.resultTopRow}>
            <Text style={s.resultName} numberOfLines={1}>{item.name}</Text>
            {item.tag ? (
              <View style={s.resultTag}>
                <Text style={s.resultTagTxt}>{item.tag}</Text>
              </View>
            ) : null}
          </View>
          <Text style={s.resultCategory}>{item.category}</Text>
          <View style={s.resultMeta}>
            <View style={s.ratingPill}>
              <Text style={s.ratingTxt}>⭐ {item.rating}</Text>
            </View>
            <Text style={s.dot}>·</Text>
            <Lucide name="clock" size={11} color={COLORS.mediumGray} />
            <Text style={s.timeTxt}>{item.time}</Text>
          </View>
        </View>
        <View style={s.resultRight}>
          <Text style={s.resultPrice}>SAR {item.price}</Text>
          <Pressable style={s.addBtn} onPress={onPress}>
            <Lucide name="plus" size={15} color={COLORS.white} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<SearchNav>();
  const route = useRoute<any>();
  const initialQuery = route.params?.query ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [recents, setRecents] = useState<string[]>(INITIAL_RECENTS);

  // ── Animations ──
  const headerSlide = useRef(new Animated.Value(-12)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;
  const clearScale = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const emptyAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  // Mount animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerSlide, {toValue: 0, useNativeDriver: true, tension: 80, friction: 10}),
      Animated.timing(headerOpacity, {toValue: 1, duration: 280, useNativeDriver: true}),
    ]).start(() => inputRef.current?.focus());
  }, [headerOpacity, headerSlide]);

  // Clear button animation
  useEffect(() => {
    Animated.spring(clearScale, {
      toValue: query.length > 0 ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
  }, [clearScale, query]);

  // Results animation on query/category change
  useEffect(() => {
    listAnim.setValue(0);
    emptyAnim.setValue(0);
    Animated.timing(listAnim, {toValue: 1, duration: 320, useNativeDriver: true}).start();
    Animated.timing(emptyAnim, {toValue: 1, duration: 400, useNativeDriver: true}).start();
  }, [emptyAnim, listAnim, query, activeCategory]);

  // Focus border animation
  const handleFocus = () => {
    setFocused(true);
    Animated.timing(focusAnim, {toValue: 1, duration: 200, useNativeDriver: false}).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(focusAnim, {toValue: 0, duration: 200, useNativeDriver: false}).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E8E8E8', COLORS.softGold],
  });

  const clearQuery = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const removeRecent = (term: string) => setRecents(r => r.filter(x => x !== term));

  const selectTrending = (label: string) => setQuery(label);

  const filtered = ALL_DISHES.filter(d => {
    const q = query.toLowerCase().trim();
    const matchesQuery = !q || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
    const matchesCat = activeCategory === 'All' || d.category === activeCategory;
    return matchesQuery && matchesCat;
  });

  const handleSelectItem = useCallback((item: (typeof ALL_DISHES)[0]) => {
    if (!recents.includes(item.name)) {
      setRecents(r => [item.name, ...r].slice(0, 5));
    }
    navigation.navigate('ProductDetail', {
      id: item.id,
      name: item.name,
      price: `SAR ${item.price}`,
      originalPrice: `SAR ${Math.round(item.price * 1.2)}`,
      discount: '20% off',
      image: item.image,
      description: `Freshly prepared ${item.name.toLowerCase()}. Category: ${item.category}.`,
    });
  }, [navigation, recents]);

  const showEmpty = query.trim().length === 0;

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ── Animated header ── */}
      <Animated.View
        style={[
          s.header,
          {paddingTop: insets.top + 10},
          {opacity: headerOpacity, transform: [{translateY: headerSlide}]},
        ]}>
        <Pressable style={s.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Lucide name="arrow-left" size={22} color={COLORS.textPrimary} />
        </Pressable>

        <Animated.View style={[s.searchBar, {borderColor}]}>
          <Lucide name="search" size={17} color={focused ? COLORS.softGold : COLORS.mediumGray} />
          <TextInput
            ref={inputRef}
            style={s.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search food, restaurants..."
            placeholderTextColor={COLORS.mediumGray}
            onFocus={handleFocus}
            onBlur={handleBlur}
            returnKeyType="search"
            autoCorrect={false}
          />
          <Animated.View style={{transform: [{scale: clearScale}]}}>
            <Pressable onPress={clearQuery} hitSlop={10}>
              <View style={s.clearBtn}>
                <Lucide name="x" size={13} color={COLORS.white} />
              </View>
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Pressable hitSlop={10}>
          <Lucide name="mic" size={20} color={COLORS.mediumGray} />
        </Pressable>
      </Animated.View>

      {showEmpty ? (
        /* ── Empty state: recents + trending ── */
        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.scrollContent, {paddingBottom: insets.bottom + 24}]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Recent searches */}
          {recents.length > 0 && (
            <Animated.View style={{opacity: headerOpacity}}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>Recent Searches</Text>
                <Pressable onPress={() => setRecents([])}>
                  <Text style={s.clearAllTxt}>Clear all</Text>
                </Pressable>
              </View>
              {recents.map(term => (
                <Pressable
                  key={term}
                  style={s.recentRow}
                  onPress={() => setQuery(term)}>
                  <View style={s.recentIconWrap}>
                    <Lucide name="clock" size={15} color={COLORS.mediumGray} />
                  </View>
                  <Text style={s.recentTxt}>{term}</Text>
                  <Pressable onPress={() => removeRecent(term)} hitSlop={10}>
                    <Lucide name="x" size={15} color="#C0C0C0" />
                  </Pressable>
                </Pressable>
              ))}
            </Animated.View>
          )}

          {/* Trending */}
          <Animated.View style={{opacity: headerOpacity}}>
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Trending Now</Text>
            </View>
            <View style={s.trendingGrid}>
              {TRENDING.map(item => (
                <Pressable
                  key={item.id}
                  style={s.trendingChip}
                  onPress={() => selectTrending(item.label)}>
                  <Lucide
                    name={item.icon as 'flame' | 'trending-up' | 'star'}
                    size={13}
                    color={COLORS.softGold}
                  />
                  <Text style={s.trendingTxt}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          {/* Browse all */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Browse All</Text>
          </View>
          {ALL_DISHES.slice(0, 4).map((item, index) => (
            <ResultRow
              key={item.id}
              item={item}
              index={index}
              listAnim={listAnim}
              onPress={() => handleSelectItem(item)}
            />
          ))}
        </ScrollView>
      ) : (
        /* ── Search results ── */
        <>
          {/* Category chips */}
          <View style={s.chipWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.chipRow}>
              {CATEGORIES.map(cat => {
                const active = activeCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[s.chip, active && s.chipActive]}
                    onPress={() => setActiveCategory(cat)}>
                    <Text style={[s.chipTxt, active && s.chipTxtActive]}>{cat}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={item => item.id}
            contentContainerStyle={[s.listContent, {paddingBottom: insets.bottom + 24}]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({item, index}) => (
              <ResultRow
                item={item}
                index={index}
                listAnim={listAnim}
                onPress={() => handleSelectItem(item)}
              />
            )}
            ListEmptyComponent={
              <Animated.View style={[s.emptyWrap, {opacity: emptyAnim}]}>
                <View style={s.emptyIconWrap}>
                  <Lucide name="search" size={36} color={COLORS.border} />
                </View>
                <Text style={s.emptyTitle}>No results found</Text>
                <Text style={s.emptySub}>
                  We couldn't find anything for "{query}".{'\n'}Try a different keyword.
                </Text>
              </Animated.View>
            }
          />
        </>
      )}
    </KeyboardAvoidingView>
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
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  backBtn: {
    width: 34,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    paddingHorizontal: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scroll: {flex: 1},
  scrollContent: {paddingTop: 8},

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.4,
  },
  clearAllTxt: {
    fontSize: 12,
    ...FONTS.medium,
    color: COLORS.softGold,
  },

  // Recent searches
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  recentIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTxt: {
    flex: 1,
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.textPrimary,
  },

  // Trending
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 8,
    paddingBottom: 4,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#EBEBEB',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
  },
  trendingTxt: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.textPrimary,
  },

  // Category chips
  chipWrap: {
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EBEBEB',
  },
  chipRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  chipTxt: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.textPrimary,
  },
  chipTxtActive: {color: COLORS.white},

  // Result list
  listContent: {paddingTop: 8, paddingHorizontal: 16, gap: 10},

  // Result row
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
  },
  resultImg: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#EEE',
  },
  resultInfo: {flex: 1, gap: 3},
  resultTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  resultName: {
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
  resultTag: {
    backgroundColor: COLORS.sandExtraLight,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  resultTagTxt: {
    fontSize: 9,
    ...FONTS.bold,
    color: COLORS.gold,
  },
  resultCategory: {
    fontSize: 12,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  ratingPill: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  ratingTxt: {fontSize: 10, ...FONTS.bold, color: '#2E7D32'},
  dot: {color: COLORS.mediumGray, fontSize: 12},
  timeTxt: {fontSize: 11, ...FONTS.regular, color: COLORS.mediumGray},
  resultRight: {alignItems: 'flex-end', gap: 8},
  resultPrice: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary},
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});
