import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import toast from '../components/Toast';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationSelect'>;

const {width: W, height: H} = Dimensions.get('window');
const MAP_HEIGHT = H * 0.26;

const MAP_URI =
  'https://staticmap.openstreetmap.de/staticmap.php?center=24.6877,46.6918&zoom=13&size=800x600';

// ─── Mock SA locations ────────────────────────────────────────────────────────
const ALL_LOCATIONS = [
  {id: '1',  name: 'Al Olaya District',        address: 'Al Olaya, Riyadh 12211, Saudi Arabia'},
  {id: '2',  name: 'Al Nakheel',               address: 'Al Nakheel, Riyadh 13321, Saudi Arabia'},
  {id: '3',  name: 'Al Malaz',                 address: 'Al Malaz, Riyadh 12836, Saudi Arabia'},
  {id: '4',  name: 'Al Muhammadiyah',          address: 'Al Muhammadiyah, Riyadh 12362, Saudi Arabia'},
  {id: '5',  name: 'King Abdullah District',   address: 'King Abdullah, Riyadh 14322, Saudi Arabia'},
  {id: '6',  name: 'As Sulay',                 address: '8056, 3117 As Sulay, Riyadh 14275, Saudi Arabia'},
  {id: '7',  name: 'Al Rawdah',                address: 'Al Rawdah, Riyadh 12434, Saudi Arabia'},
  {id: '8',  name: 'Al Sulaimaniyah',          address: 'Al Sulaimaniyah, Riyadh 12243, Saudi Arabia'},
  {id: '9',  name: 'Hittin District',          address: 'Hittin, Riyadh 13512, Saudi Arabia'},
  {id: '10', name: 'Al Muruj',                 address: 'Al Muruj, Riyadh 12261, Saudi Arabia'},
  {id: '11', name: 'Al Madinah Al Munawwarah', address: 'Medina, Al Madinah 42311, Saudi Arabia'},
  {id: '12', name: 'Al Corniche, Jeddah',      address: 'Al Corniche Rd, Jeddah 23326, Saudi Arabia'},
  {id: '13', name: 'Al Khobar',                address: 'Al Khobar, Eastern Province 34622, Saudi Arabia'},
  {id: '14', name: 'Dammam City Centre',       address: 'Al Faisaliyah, Dammam 32412, Saudi Arabia'},
  {id: '15', name: 'Makkah Al Mukarramah',     address: 'Makkah, Makkah Province 24231, Saudi Arabia'},
];

const CURRENT_LOCATION = {
  id: 'current',
  name: 'Current Location',
  address: 'Al Olaya, Riyadh 12211, Saudi Arabia',
};

// ─── Staggered item wrapper ───────────────────────────────────────────────────

function AnimatedResultItem({
  item,
  index,
  isSelected,
  onPress,
}: {
  item: (typeof ALL_LOCATIONS)[0];
  index: number;
  isSelected: boolean;
  onPress: () => void;
}) {
  const fadeY  = useRef(new Animated.Value(22)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeY, {
        toValue: 0,
        duration: 340,
        delay: index * 55,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay: index * 55,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: isSelected ? 1 : 0,
      stiffness: 260,
      damping: 16,
      useNativeDriver: true,
    }).start();
  }, [isSelected, checkScale]);

  const onPressIn = () =>
    Animated.spring(pressScale, {toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 4}).start();
  const onPressOut = () =>
    Animated.spring(pressScale, {toValue: 1, useNativeDriver: true, speed: 50, bounciness: 6}).start();

  return (
    <Animated.View style={{opacity, transform: [{translateY: fadeY}, {scale: pressScale}]}}>
      <TouchableOpacity
        style={[styles.resultItem, isSelected && styles.resultItemSelected]}
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}>

        {/* Pin icon badge */}
        <View style={[styles.resultPinWrap, isSelected && styles.resultPinWrapSelected]}>
          <Lucide
            name="map-pin"
            size={18}
            color={isSelected ? COLORS.softGold : COLORS.mediumGray}
          />
        </View>

        {/* Text */}
        <View style={styles.resultTexts}>
          <Text
            style={[styles.resultName, isSelected && styles.resultNameSelected]}
            numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.resultAddress} numberOfLines={2}>
            {item.address}
          </Text>
        </View>

        {/* Animated checkmark */}
        <Animated.View style={[styles.checkWrap, {transform: [{scale: checkScale}]}]}>
          <Lucide name="check" size={14} color={COLORS.white} />
        </Animated.View>

      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

function LocationSelectScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();

  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState(ALL_LOCATIONS.slice(0, 6));
  const [selected, setSelected]   = useState<(typeof ALL_LOCATIONS)[0] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // ── Animated values ─────────────────────────────────────────────────────────
  const pulseScale1   = useRef(new Animated.Value(1)).current;
  const pulseScale2   = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.5)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.3)).current;
  const pinBounce     = useRef(new Animated.Value(-28)).current;

  const sheetY       = useRef(new Animated.Value(80)).current;
  const sheetOpacity = useRef(new Animated.Value(0)).current;

  // Search bar border colour animation
  const searchBorder  = useRef(new Animated.Value(0)).current;
  const searchElevate = useRef(new Animated.Value(0)).current;

  // Clear button pop-in
  const clearScale = useRef(new Animated.Value(0)).current;

  // Current location row pulse
  const currentLocPulse = useRef(new Animated.Value(1)).current;

  // Continue button scale
  const btnScale = useRef(new Animated.Value(1)).current;

  // ── Mount animations ────────────────────────────────────────────────────────
  useEffect(() => {
    // Sheet slide-up
    Animated.parallel([
      Animated.timing(sheetY, {
        toValue: 0, duration: 520, delay: 150,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.timing(sheetOpacity, {
        toValue: 1, duration: 400, delay: 150, useNativeDriver: true,
      }),
    ]).start();

    // Pin drop
    Animated.spring(pinBounce, {
      toValue: 0, stiffness: 160, damping: 12, useNativeDriver: true,
    }).start();

    // Pulse rings
    const ring1 = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale1, {
          toValue: 3, duration: 1900, easing: Easing.out(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity1, {
          toValue: 0, duration: 1900, useNativeDriver: true,
        }),
      ]),
    );
    const ring2 = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale2, {
          toValue: 3, duration: 1900, delay: 650, easing: Easing.out(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity2, {
          toValue: 0, duration: 1900, delay: 650, useNativeDriver: true,
        }),
      ]),
    );
    ring1.start();
    ring2.start();

    // Current location icon pulse
    const locPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(currentLocPulse, {toValue: 1.12, duration: 850, useNativeDriver: true}),
        Animated.timing(currentLocPulse, {toValue: 1, duration: 850, useNativeDriver: true}),
      ]),
    );
    locPulse.start();

    return () => {
      ring1.stop();
      ring2.stop();
      locPulse.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Search bar focus animation ───────────────────────────────────────────────
  const onSearchFocus = () => {
    setSearchFocused(true);
    Animated.parallel([
      Animated.timing(searchBorder, {
        toValue: 1, duration: 220, useNativeDriver: false,
      }),
      Animated.timing(searchElevate, {
        toValue: 1, duration: 220, useNativeDriver: false,
      }),
    ]).start();
  };
  const onSearchBlur = () => {
    setSearchFocused(false);
    Animated.parallel([
      Animated.timing(searchBorder, {
        toValue: 0, duration: 220, useNativeDriver: false,
      }),
      Animated.timing(searchElevate, {
        toValue: 0, duration: 220, useNativeDriver: false,
      }),
    ]).start();
  };

  const borderColor = searchBorder.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.softGold],
  });
  const shadowOpacity = searchElevate.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.18],
  });

  // ── Search filter ───────────────────────────────────────────────────────────
  const onSearch = useCallback((text: string) => {
    setQuery(text);
    setSelected(null);

    // Animate clear button
    Animated.spring(clearScale, {
      toValue: text.length > 0 ? 1 : 0,
      stiffness: 300, damping: 18, useNativeDriver: true,
    }).start();

    if (!text.trim()) {
      setResults(ALL_LOCATIONS.slice(0, 6));
      return;
    }
    const lower = text.toLowerCase();
    setResults(
      ALL_LOCATIONS.filter(
        l =>
          l.name.toLowerCase().includes(lower) ||
          l.address.toLowerCase().includes(lower),
      ),
    );
  }, [clearScale]);

  // ── Use current location ────────────────────────────────────────────────────
  const onUseCurrentLocation = async () => {
    if (detecting) {return;}
    setDetecting(true);
    toast.info('Detecting your location…', {duration: 2000});
    await new Promise(r => setTimeout(r, 1800));
    setDetecting(false);
    setSelected(CURRENT_LOCATION);
    setQuery(CURRENT_LOCATION.name);
    setResults([]);
    toast.success('Location detected: ' + CURRENT_LOCATION.address, {
      title: 'Location found', duration: 3000,
    });
  };

  // ── Pick a result ───────────────────────────────────────────────────────────
  const onPickLocation = (loc: (typeof ALL_LOCATIONS)[0]) => {
    setSelected(loc);
    setQuery(loc.name);
    setResults([]);
    Animated.spring(clearScale, {
      toValue: 0, stiffness: 300, damping: 18, useNativeDriver: true,
    }).start();
    toast.info(loc.name + ' selected', {duration: 1800});
  };

  // ── Continue ────────────────────────────────────────────────────────────────
  const onContinue = () => {
    if (!selected) {
      toast.warning('Please select a delivery location first.', {title: 'No location'});
      return;
    }
    toast.success('Delivering to ' + selected.name, {title: 'Location set', duration: 2500});
    setTimeout(() => navigation.reset({index: 0, routes: [{name: 'MainTabs'}]}), 600);
  };

  const onPressIn  = () =>
    Animated.spring(btnScale, {toValue: 0.96, useNativeDriver: true, speed: 50, bounciness: 4}).start();
  const onPressOut = () =>
    Animated.spring(btnScale, {toValue: 1, useNativeDriver: true, speed: 50, bounciness: 4}).start();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* ══ MAP ══ */}
      <View style={styles.mapContainer}>
        <Image source={{uri: MAP_URI}} style={styles.mapImage} resizeMode="cover" />
        <View style={styles.mapOverlay} />

        {/* Subtle grid */}
        <View style={styles.gridH1} />
        <View style={styles.gridH2} />
        <View style={styles.gridV1} />
        <View style={styles.gridV2} />

        {/* Pulse + pin */}
        <View style={styles.pinCenter} pointerEvents="none">
          <Animated.View style={[styles.pulseRing, {transform: [{scale: pulseScale1}], opacity: pulseOpacity1}]} />
          <Animated.View style={[styles.pulseRing, {transform: [{scale: pulseScale2}], opacity: pulseOpacity2}]} />
          <Animated.View style={[styles.pinWrap, {transform: [{translateY: pinBounce}]}]}>
            <View style={styles.pinHead}>
              <Lucide name="map-pin" size={18} color={COLORS.white} />
            </View>
            <View style={styles.pinShadow} />
          </Animated.View>
        </View>

        {/* Fade vignette at bottom */}
        <View style={styles.mapVignette} />

        {/* City label pill */}
        <View style={[styles.cityPill, {top: insets.top + 10}]} pointerEvents="none">
          <Lucide name="map-pin" size={12} color={COLORS.softGold} />
          <Text style={styles.cityPillText}>Riyadh, Saudi Arabia</Text>
        </View>

        {/* Back button */}
        <TouchableOpacity
          style={[styles.backBtn, {top: insets.top + 8}]}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}>
          <Lucide name="chevron-left" size={22} color={COLORS.brandDark} />
        </TouchableOpacity>
      </View>

      {/* ══ SHEET ══ */}
      <Animated.View style={[styles.sheet, {opacity: sheetOpacity, transform: [{translateY: sheetY}]}]}>

        {/* Handle */}
        <View style={styles.dragHandle} />

        {/* Title row */}
        <View style={styles.sheetHeader}>
          <View style={styles.titleAccent} />
          <Text style={styles.sheetTitle}>Select a location</Text>
        </View>

        {/* ── SEARCH BAR ── */}
        <Animated.View
          style={[
            styles.searchBar,
            {
              borderColor,
              shadowOpacity,
              shadowColor: COLORS.softGold,
              shadowOffset: {width: 0, height: 4},
              shadowRadius: 8,
              elevation: searchFocused ? 4 : 0,
            },
          ]}>
          <Lucide
            name="search"
            size={18}
            color={searchFocused ? COLORS.softGold : COLORS.mediumGray}
            style={styles.searchIconView}
          />
          <TextInput
            value={query}
            onChangeText={onSearch}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            placeholder="Search for area, street name…"
            placeholderTextColor="#BBBBBB"
            style={styles.searchInput}
            returnKeyType="search"
          />
          <Animated.View style={[styles.clearBtn, {transform: [{scale: clearScale}]}]}>
            <TouchableOpacity
              onPress={() => onSearch('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <View style={styles.clearBtnInner}>
                <Lucide name="x" size={11} color={COLORS.white} />
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* ── CURRENT LOCATION ── */}
        <TouchableOpacity
          style={styles.currentLocRow}
          activeOpacity={0.78}
          onPress={onUseCurrentLocation}
          disabled={detecting}>
          <View style={styles.currentLocLeft}>
            <Animated.View
              style={[styles.currentLocIcon, {transform: [{scale: currentLocPulse}]}]}>
              <Lucide name="navigation" size={18} color={COLORS.white} />
            </Animated.View>
            <View>
              <Text style={styles.currentLocLabel}>
                {detecting ? 'Detecting…' : 'Use your current location'}
              </Text>
              <Text style={styles.currentLocSub}>GPS • Automatic detection</Text>
            </View>
          </View>
          <View style={styles.currentLocChevron}>
            <Lucide name="chevron-right" size={18} color={COLORS.brandDark} />
          </View>
        </TouchableOpacity>

        {/* Divider with label */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>Nearby</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── RESULTS ── */}
        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            renderItem={({item, index}) => (
              <AnimatedResultItem
                item={item}
                index={index}
                isSelected={selected?.id === item.id}
                onPress={() => onPickLocation(item)}
              />
            )}
          />
        ) : (
          !selected && (
            <View style={styles.emptyState}>
              <Lucide name="search" size={32} color={COLORS.border} />
              <Text style={styles.emptyText}>Type to search locations</Text>
            </View>
          )
        )}

        {/* Powered by */}
        <Text style={styles.poweredBy}>
          powered by{' '}
          <Text style={styles.poweredByBold}>OpenStreetMap</Text>
        </Text>

      </Animated.View>

      {/* ══ CONTINUE FOOTER ══ */}
      <View style={[styles.continueWrap, {paddingBottom: Math.max(insets.bottom, 16)}]}>
        {selected && (
          <View style={styles.selectedBadge}>
            <Lucide name="map-pin" size={13} color={COLORS.brandDark} />
            <Text style={styles.selectedBadgeText} numberOfLines={1}>
              {selected.name}
            </Text>
            <TouchableOpacity
              style={styles.changeBadgeBtn}
              onPress={() => {
                setSelected(null);
                setQuery('');
                setResults(ALL_LOCATIONS.slice(0, 6));
              }}>
              <Text style={styles.changeBadgeText}>Change</Text>
            </TouchableOpacity>
          </View>
        )}
        <Animated.View style={{transform: [{scale: btnScale}]}}>
          <Pressable
            style={[styles.continueBtn, !selected && styles.continueBtnDim]}
            onPress={onContinue}
            onPressIn={onPressIn}
            onPressOut={onPressOut}>
            {selected && (
              <Lucide name="circle-check" size={18} color={COLORS.white} style={styles.continueBtnIcon} />
            )}
            <Text style={styles.continueBtnLabel}>
              {selected ? 'Confirm Location' : 'Select a Location'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  /* ── Map ── */
  mapContainer: {
    width: W,
    height: MAP_HEIGHT,
    backgroundColor: COLORS.brandDark,
    overflow: 'hidden',
  },
  mapImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,93,145,0.22)',
  },
  mapVignette: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridH1: {position:'absolute', top:'33%', left:0, right:0, height:1, backgroundColor:'rgba(255,255,255,0.09)'},
  gridH2: {position:'absolute', top:'66%', left:0, right:0, height:1, backgroundColor:'rgba(255,255,255,0.09)'},
  gridV1: {position:'absolute', top:0, bottom:0, left:'33%', width:1, backgroundColor:'rgba(255,255,255,0.09)'},
  gridV2: {position:'absolute', top:0, bottom:0, left:'66%', width:1, backgroundColor:'rgba(255,255,255,0.09)'},

  pinCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: COLORS.softGold,
  },
  pinWrap: {
    alignItems: 'center',
  },
  pinHead: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.softGold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: COLORS.white,
  },
  pinShadow: {
    width: 16,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.22)',
    marginTop: 3,
    alignSelf: 'center',
  },
  cityPill: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(11,93,145,0.82)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  cityPillText: {
    color: COLORS.white,
    fontSize: 12,
    ...FONTS.medium,
    letterSpacing: 0.2,
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  /* ── Sheet ── */
  sheet: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -32,
    paddingHorizontal: 18,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 14,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DEDBD5',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  titleAccent: {
    width: 4,
    height: 22,
    borderRadius: 2,
    backgroundColor: COLORS.softGold,
  },
  sheetTitle: {
    fontSize: 19,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    letterSpacing: 0.1,
  },

  /* ── Search bar ── */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: COLORS.seashell,
    paddingHorizontal: 14,
    marginBottom: 12,
    gap: 10,
  },
  searchIconView: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    ...FONTS.regular,
    padding: 0,
  },
  clearBtn: {
    flexShrink: 0,
  },
  clearBtnInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Current location ── */
  currentLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EBF5FC',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(11,93,145,0.14)',
  },
  currentLocLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  currentLocIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.brandDark,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
    flexShrink: 0,
  },
  currentLocLabel: {
    fontSize: 14,
    color: COLORS.brandDark,
    ...FONTS.bold,
    marginBottom: 2,
  },
  currentLocSub: {
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  currentLocChevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(11,93,145,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* ── Divider ── */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  /* ── Results ── */
  resultsList: {
    flex: 1,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#F2EEE6',
    marginLeft: 54,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 12,
    gap: 12,
  },
  resultItemSelected: {
    backgroundColor: '#FFF8EC',
  },
  resultPinWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultPinWrapSelected: {
    backgroundColor: COLORS.softGold + '25',
  },
  resultTexts: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  resultNameSelected: {
    color: COLORS.gold,
  },
  resultAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    ...FONTS.regular,
    lineHeight: 17,
  },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.softGold,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /* Empty state */
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },

  poweredBy: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 8,
    marginBottom: 2,
  },
  poweredByBold: {
    color: COLORS.brandDark,
    ...FONTS.medium,
  },

  /* ── Continue ── */
  continueWrap: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#EBF5FC',
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(11,93,145,0.14)',
  },
  selectedBadgeText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.brandDark,
    ...FONTS.medium,
  },
  changeBadgeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(11,93,145,0.10)',
  },
  changeBadgeText: {
    fontSize: 11,
    color: COLORS.brandDark,
    ...FONTS.bold,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.softGold,
    borderRadius: 14,
    height: 56,
    gap: 8,
    shadowColor: COLORS.softGold,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  continueBtnDim: {
    backgroundColor: '#D8D0C4',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueBtnIcon: {
    marginRight: 2,
  },
  continueBtnLabel: {
    color: COLORS.white,
    fontSize: 16,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },
});

export default LocationSelectScreen;
