import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import {useNavigation} from '@react-navigation/native';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabParamList, RootStackParamList} from '../navigation/types';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';
import {clearAuthToken} from '../utils/storage';

type Props = BottomTabScreenProps<BottomTabParamList, 'Account'>;
type LucideIconName = React.ComponentProps<typeof Lucide>['name'];

// ─── Quick tile ───────────────────────────────────────────────────────────────
function QuickTile({
  icon,
  iconBg,
  iconColor,
  label,
  sub,
  onPress,
}: {
  icon: LucideIconName;
  iconBg: string;
  iconColor: string;
  label: string;
  sub?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={s.quickTile} onPress={onPress} android_ripple={{color: '#F0F0F0'}}>
      <View style={[s.quickIconBox, {backgroundColor: iconBg}]}>
        <Lucide name={icon} size={20} color={iconColor} />
      </View>
      <Text style={s.quickLabel}>{label}</Text>
      {sub ? <Text style={s.quickSub}>{sub}</Text> : null}
    </Pressable>
  );
}

// ─── Menu row ─────────────────────────────────────────────────────────────────
function MenuRow({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  isLast,
  danger,
  onPress,
}: {
  icon: LucideIconName;
  iconBg?: string;
  iconColor?: string;
  label: string;
  value?: string;
  isLast?: boolean;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[s.menuRow, !isLast && s.menuBorder]}
      onPress={onPress}
      android_ripple={{color: '#F8F8F8'}}>
      <View style={[s.menuIconBox, {backgroundColor: iconBg ?? '#F5F5F5'}]}>
        <Lucide name={icon} size={15} color={iconColor ?? COLORS.textSecondary} />
      </View>
      <Text style={[s.menuLabel, danger && s.menuDanger]}>{label}</Text>
      <View style={s.menuRight}>
        {value ? <Text style={s.menuValue}>{value}</Text> : null}
        <Lucide name="chevron-right" size={15} color="#CACACA" />
      </View>
    </Pressable>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionHead({title}: {title: string}) {
  return <Text style={s.sectionHead}>{title}</Text>;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AccountScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const logout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await clearAuthToken();
          navigation.getParent()?.reset({index: 0, routes: [{name: 'Login'}]});
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[s.content, {paddingBottom: insets.bottom + 32}]}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={[s.header, {paddingTop: insets.top + 18}]}>
        <View style={s.avatarWrap}>
          <View style={s.avatarRing}>
            <View style={s.avatarCircle}>
              <Text style={s.avatarLetter}>A</Text>
            </View>
          </View>
          <View style={s.onlineDot} />
        </View>
        <View style={s.userTexts}>
          <Text style={s.userName}>Abdullah Al Zahrani</Text>
          <Text style={s.userSub}>customer@alzahrani.com</Text>
          <View style={s.memberBadge}>
            <Lucide name="star" size={10} color={COLORS.softGold} />
            <Text style={s.memberTxt}>Gold Member</Text>
          </View>
        </View>
        <Pressable
          style={s.editBtn}
          hitSlop={10}
          onPress={() => {}}>
          <Lucide name="pencil" size={16} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      {/* ── Quick actions ── */}
      <View style={s.quickCard}>
        <QuickTile
          icon="package"
          iconBg="#FFF3E0"
          iconColor="#E67E00"
          label="Orders"
          onPress={() => navigation.navigate('Orders')}
        />
        <View style={s.quickDivider} />
        <QuickTile
          icon="heart"
          iconBg="#FCE4EC"
          iconColor="#E91E8C"
          label="Favourites"
          onPress={() => rootNav.navigate('Wishlist')}
        />
        <View style={s.quickDivider} />
        <QuickTile
          icon="tag"
          iconBg="#E8F5E9"
          iconColor="#2E7D32"
          label="Offers"
          sub="2 active"
          onPress={() => {}}
        />
      </View>

      {/* ── Account ── */}
      <SectionHead title="ACCOUNT" />
      <View style={s.menuCard}>
        <MenuRow
          icon="credit-card"
          iconBg="#EDE7F6"
          iconColor="#5B6EE8"
          label="Payment methods"
          onPress={() => {}}
        />
        <MenuRow
          icon="map-pin"
          iconBg="#FFEBEE"
          iconColor="#E53935"
          label="Addresses"
          onPress={() => {}}
        />
        <MenuRow
          icon="heart"
          iconBg="#FCE4EC"
          iconColor="#E91E8C"
          label="My favourites"
          onPress={() => rootNav.navigate('Wishlist')}
          isLast
        />
      </View>

      {/* ── Preferences ── */}
      <SectionHead title="PREFERENCES" />
      <View style={s.menuCard}>
        <MenuRow
          icon="zap"
          iconBg="#E8F5E9"
          iconColor="#1BAE6D"
          label="On-time Promise"
          onPress={() => {}}
        />
        <MenuRow
          icon="globe"
          iconBg="#E3F2FD"
          iconColor="#0288D1"
          label="Language"
          value="English"
          onPress={() => rootNav.navigate('LanguageSelect')}
        />
        <MenuRow
          icon="settings"
          iconBg="#F5F5F5"
          iconColor="#757575"
          label="Settings"
          onPress={() => {}}
          isLast
        />
      </View>

      {/* ── Support ── */}
      <SectionHead title="SUPPORT" />
      <View style={s.menuCard}>
        <MenuRow
          icon="message-circle"
          iconBg="#FFF8E1"
          iconColor="#F9A825"
          label="Help & Support"
          onPress={() => {}}
        />
        <MenuRow
          icon="info"
          iconBg="#ECEFF1"
          iconColor="#546E7A"
          label="About AlZahrani"
          onPress={() => {}}
          isLast
        />
      </View>

      {/* ── Log out ── */}
      <View style={s.menuCard}>
        <MenuRow
          icon="log-out"
          iconBg="#FFEBEE"
          iconColor={COLORS.danger}
          label="Log out"
          danger
          onPress={logout}
          isLast
        />
      </View>

      <Text style={s.version}>AlZahrani Logistics · v1.0.0</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F2F2F2'},
  content: {gap: 0},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
    marginBottom: 14,
  },
  avatarWrap: {position: 'relative'},
  avatarRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.softGold,
    padding: 2,
  },
  avatarCircle: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: COLORS.softGold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 22,
    ...FONTS.bold,
    color: COLORS.white,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.successGreen,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userTexts: {flex: 1, gap: 2},
  userName: {
    fontSize: 16,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },
  userSub: {
    fontSize: 12,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8E7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  memberTxt: {
    fontSize: 10,
    ...FONTS.bold,
    color: COLORS.gold,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Quick tiles
  quickCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 6,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 18,
    gap: 7,
  },
  quickDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8E8',
    marginVertical: 14,
  },
  quickIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 12,
    ...FONTS.medium,
    color: COLORS.textPrimary,
  },
  quickSub: {
    fontSize: 10,
    ...FONTS.regular,
    color: COLORS.successGreen,
  },

  // Section heading
  sectionHead: {
    fontSize: 11,
    ...FONTS.bold,
    color: COLORS.mediumGray,
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 7,
  },

  // Menu card
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EFEFEF',
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    ...FONTS.medium,
    color: COLORS.textPrimary,
  },
  menuDanger: {color: COLORS.danger},
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuValue: {
    fontSize: 13,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },

  // Version
  version: {
    textAlign: 'center',
    fontSize: 11,
    ...FONTS.regular,
    color: '#C0C0C0',
    marginTop: 20,
  },
});
