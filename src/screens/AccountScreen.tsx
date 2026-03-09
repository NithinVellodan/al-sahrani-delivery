import React, {useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Image,
  Linking,
  Modal,
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
type TabId = 'profile' | 'services' | 'about';

const TEAL = '#2EA87E';

// ─── Quick tile ───────────────────────────────────────────────────────────────
function QuickTile({icon, iconBg, iconColor, label, sub, onPress}: {
  icon: LucideIconName; iconBg: string; iconColor: string;
  label: string; sub?: string; onPress?: () => void;
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
function MenuRow({icon, iconBg, iconColor, label, value, isLast, danger, onPress}: {
  icon: LucideIconName; iconBg?: string; iconColor?: string;
  label: string; value?: string; isLast?: boolean; danger?: boolean; onPress?: () => void;
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

function SectionHead({title}: {title: string}) {
  return <Text style={s.sectionHead}>{title}</Text>;
}

// ─── Logout Modal ─────────────────────────────────────────────────────────────
function LogoutModal({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const scale   = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale,   {toValue: 1, friction: 6, tension: 80, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 1, duration: 220, easing: Easing.out(Easing.ease), useNativeDriver: true}),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Pressable style={lm.overlay} onPress={onCancel}>
        <Animated.View
          style={[lm.card, {opacity, transform: [{scale}]}]}
          onStartShouldSetResponder={() => true}>

          {/* Icon */}
          <View style={lm.iconWrap}>
            <Lucide name="log-out" size={28} color={COLORS.danger} />
          </View>

          {/* Text */}
          <Text style={lm.title}>Log out?</Text>
          <Text style={lm.body}>
            You'll need to sign in again to access your account and orders.
          </Text>

          {/* Divider */}
          <View style={lm.divider} />

          {/* Buttons */}
          <View style={lm.btnRow}>
            <Pressable
              style={[lm.btn, lm.cancelBtn]}
              onPress={onCancel}
              android_ripple={{color: '#F0F0F0'}}>
              <Text style={lm.cancelTxt}>Cancel</Text>
            </Pressable>
            <View style={lm.btnSep} />
            <Pressable
              style={[lm.btn, lm.confirmBtn]}
              onPress={onConfirm}
              android_ripple={{color: '#FFEBEE'}}>
              <Lucide name="log-out" size={15} color={COLORS.danger} />
              <Text style={lm.confirmTxt}>Log out</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({icon, iconBg, iconColor, title, body}: {
  icon: LucideIconName; iconBg: string; iconColor: string;
  title: string; body: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview = body.slice(0, 180);
  return (
    <View style={s.serviceCard}>
      <View style={s.serviceCardHeader}>
        <View style={[s.serviceIconBox, {backgroundColor: iconBg}]}>
          <Lucide name={icon} size={22} color={iconColor} />
        </View>
        <Text style={s.serviceTitle}>{title}</Text>
      </View>
      <Text style={s.serviceBody}>
        {expanded ? body : `${preview}…`}
      </Text>
      <Pressable onPress={() => setExpanded(p => !p)} style={s.readMoreBtn}>
        <Text style={s.readMoreTxt}>{expanded ? 'Show less' : 'Read more'}</Text>
        <Lucide name={expanded ? 'chevron-up' : 'chevron-down'} size={13} color={TEAL} />
      </Pressable>
    </View>
  );
}

// ─── About stat pill ──────────────────────────────────────────────────────────
function StatPill({value, label}: {value: string; label: string}) {
  return (
    <View style={s.statPill}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AccountScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const rootNav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [showLogout, setShowLogout] = useState(false);

  const confirmLogout = async () => {
    setShowLogout(false);
    await clearAuthToken();
    navigation.getParent()?.reset({index: 0, routes: [{name: 'Login'}]});
  };

  const TABS: {id: TabId; label: string; icon: LucideIconName}[] = [
    {id: 'profile',  label: 'Profile',   icon: 'user'},
    {id: 'services', label: 'Services',  icon: 'briefcase'},
    {id: 'about',    label: 'About Us',  icon: 'building-2'},
  ];

  return (
    <View style={[s.root, {paddingTop: insets.top}]}>
      <LogoutModal
        visible={showLogout}
        onCancel={() => setShowLogout(false)}
        onConfirm={confirmLogout}
      />
      {/* ── User header (always visible) ── */}
      <View style={s.header}>
        <View style={s.avatarWrap}>
          <View style={s.avatarRing}>
            <View style={s.avatarCircle}>
              <Lucide name="user" size={28} color="#fff" />
            </View>
          </View>
          <View style={s.onlineDot} />
        </View>
        <View style={s.userTexts}>
          <Text style={s.userName}>Safar Al-Zahrani</Text>
          <Text style={s.userSub}>customer@alzahrani.com</Text>
          <View style={s.memberBadge}>
            <Lucide name="star" size={10} color={COLORS.softGold} />
            <Text style={s.memberTxt}>Gold Member</Text>
          </View>
        </View>
        <Pressable style={s.editBtn} hitSlop={10} onPress={() => {}}>
          <Lucide name="pencil" size={16} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      {/* ── Tab bar ── */}
      <View style={s.tabBar}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[s.tabItem, active && s.tabItemActive]}
              onPress={() => setActiveTab(tab.id)}>
              <Lucide name={tab.icon} size={18} color={active ? TEAL : '#AAAAAA'} />
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{tab.label}</Text>
              {active && <View style={s.tabUnderline} />}
            </Pressable>
          );
        })}
      </View>

      {/* ── Tab content ── */}
      <ScrollView
        style={s.scrollArea}
        contentContainerStyle={[s.scrollContent, {paddingBottom: insets.bottom + 32}]}
        showsVerticalScrollIndicator={false}>

        {/* ══ PROFILE TAB ══ */}
        {activeTab === 'profile' && (
          <>
            <View style={s.quickCard}>
              <QuickTile icon="package" iconBg="#FFF3E0" iconColor="#E67E00" label="Orders"
                onPress={() => navigation.navigate('Orders')} />
              <View style={s.quickDivider} />
              <QuickTile icon="heart" iconBg="#FCE4EC" iconColor="#E91E8C" label="Favourites"
                onPress={() => rootNav.navigate('Wishlist')} />
              <View style={s.quickDivider} />
              <QuickTile icon="tag" iconBg="#E8F5E9" iconColor="#2E7D32" label="Offers"
                sub="2 active" onPress={() => {}} />
            </View>

            <SectionHead title="ACCOUNT" />
            <View style={s.menuCard}>
              <MenuRow icon="credit-card" iconBg="#EDE7F6" iconColor="#5B6EE8"
                label="Payment methods" onPress={() => {}} />
              <MenuRow icon="map-pin" iconBg="#FFEBEE" iconColor="#E53935"
                label="Addresses" onPress={() => {}} />
              <MenuRow icon="heart" iconBg="#FCE4EC" iconColor="#E91E8C"
                label="My favourites" onPress={() => rootNav.navigate('Wishlist')} isLast />
            </View>

            <SectionHead title="PREFERENCES" />
            <View style={s.menuCard}>
              <MenuRow icon="zap" iconBg="#E8F5E9" iconColor="#1BAE6D"
                label="On-time Promise" onPress={() => {}} />
              <MenuRow icon="globe" iconBg="#E3F2FD" iconColor="#0288D1"
                label="Language" value="English"
                onPress={() => rootNav.navigate('LanguageSelect')} />
              <MenuRow icon="settings" iconBg="#F5F5F5" iconColor="#757575"
                label="Settings" onPress={() => {}} isLast />
            </View>

            <SectionHead title="SUPPORT" />
            <View style={s.menuCard}>
              <MenuRow icon="message-circle" iconBg="#FFF8E1" iconColor="#F9A825"
                label="Help & Support" onPress={() => {}} />
              <MenuRow icon="info" iconBg="#ECEFF1" iconColor="#546E7A"
                label="About AlZahrani" onPress={() => setActiveTab('about')} isLast />
            </View>

            <View style={s.menuCard}>
              <MenuRow icon="log-out" iconBg="#FFEBEE" iconColor={COLORS.danger}
                label="Log out" danger onPress={() => setShowLogout(true)} isLast />
            </View>

            <Text style={s.version}>AlZahrani Logistics · v1.0.0</Text>
          </>
        )}

        {/* ══ OUR SERVICES TAB ══ */}
        {activeTab === 'services' && (
          <>
            <View style={s.tabHero}>
              <View style={[s.tabHeroIcon, {backgroundColor: '#E8F5F0'}]}>
                <Lucide name="briefcase" size={28} color={TEAL} />
              </View>
              <Text style={s.tabHeroTitle}>Our Services</Text>
              <Text style={s.tabHeroSub}>End-to-end logistics solutions tailored for your business</Text>
            </View>

            <ServiceCard
              icon="warehouse"
              iconBg="#E8F5F0"
              iconColor={TEAL}
              title="Comprehensive 3PL Warehousing"
              body="At Al Zahrani Logistics, we go above and beyond to ensure that every aspect of your logistics operation is seamlessly managed. From meticulously overseeing inventory levels to orchestrating efficient order fulfillment processes, our state-of-the-art warehouses are fully equipped to handle all your storage and distribution needs with precision. Backed by our team of experienced professionals, we take pride in delivering your shipments promptly and reliably. Whether it's organizing inventory, optimizing picking and packing processes, or coordinating transportation, we leverage our expertise to streamline every step of the logistics journey. What truly sets us apart is our commitment to providing tailored solutions that align with your unique requirements. We understand that every business has its own set of challenges and objectives, which is why we work closely with you to develop strategies that enhance your supply chain efficiency and drive success. With Al Zahrani Logistics, you can rest assured that your logistics operations are in capable hands."
            />

            <ServiceCard
              icon="users"
              iconBg="#EDE7F6"
              iconColor="#5B6EE8"
              title="Experienced Delivery Associates"
              body="Al Zahrani Logistics prides itself on providing a team of experienced delivery associates who are not only skilled in their craft but also fully compliant with all necessary documentation. Each of our delivery associates holds a valid iqama (residency permit) and a driving license, ensuring that they are legally authorized to operate within the Kingdom of Saudi Arabia. Whether you require our delivery associates to work under our sponsorship or on a temporary basis, rest assured that they are prepared to meet your needs with the utmost professionalism and efficiency. Our associates are trained to handle a variety of delivery scenarios, from last-mile deliveries to bulk shipments, with care and precision. Additionally, our commitment to compliance extends beyond documentation to encompass rigorous safety and security protocols. We prioritize the safety of our associates, your shipments, and the communities we serve, adhering to all relevant regulations and standards."
            />

            <ServiceCard
              icon="truck"
              iconBg="#FFF3E0"
              iconColor="#E67E00"
              title="Vehicle Solutions"
              body="At Al Zahrani Logistics, we take pride in our extensive fleet of vehicles, meticulously maintained to ensure optimal performance and reliability in transporting shipments of any size. Our fleet encompasses a variety of vehicles, including vans, sedans, and dynas, providing flexibility to accommodate diverse transportation needs and cargo types. Each vehicle undergoes regular maintenance checks and inspections to uphold our stringent quality standards. Our dedicated team of mechanics ensures that every vehicle is in top condition, minimizing the risk of breakdowns and delays during transportation. Furthermore, our vehicles are equipped with advanced tracking systems that enable real-time monitoring of shipments. This technology allows us to closely monitor the location and status of each delivery, ensuring secure and punctual arrivals at their destinations. With our comprehensive fleet and advanced tracking capabilities, Al Zahrani Logistics is equipped to handle any transportation challenge with efficiency and reliability."
            />

            <ServiceCard
              icon="hard-hat"
              iconBg="#FFEBEE"
              iconColor="#E53935"
              title="Logistics Professionals & Associates"
              body="At Al Zahrani Logistics, we take great pride in our team of highly skilled logistics professionals and warehouse associates, each possessing the expertise and qualifications necessary to excel in their roles. Our commitment to excellence is reflected in the meticulous selection process we undertake to ensure that every member of our team meets our stringent standards of competence and professionalism. Each logistics professional and warehouse associate at Al Zahrani Logistics is equipped with valid documentation, including residency permits (iqama) and relevant licenses, to ensure full compliance with legal requirements. Whether you require experienced personnel for strategic planning, supply chain management, inventory control, or warehouse operations, our team of logistics professionals is prepared to meet your needs with proficiency and efficiency. Partner with Al Zahrani Logistics today and leverage the expertise of our highly skilled logistics professionals to streamline your operations and achieve your business goals."
            />

            <View style={s.contactCard}>
              <Lucide name="mail" size={18} color={TEAL} />
              <Text style={s.contactTxt}>info@alzahranilogistics.com</Text>
              <Pressable
                style={s.contactBtn}
                onPress={() => Linking.openURL('mailto:info@alzahranilogistics.com')}>
                <Text style={s.contactBtnTxt}>Email Us</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* ══ ABOUT US TAB ══ */}
        {activeTab === 'about' && (
          <>
            <View style={s.aboutBannerWrap}>
              <Image
                source={require('../images/logo-no-background.png')}
                style={s.aboutBanner}
                resizeMode="contain"
              />
            </View>

            <View style={s.aboutCard}>
              <Text style={s.aboutSectionTitle}>About Us</Text>
              <Text style={s.aboutBody}>
                Established in 2018, Al Zahrani Logistics has quickly emerged as a distinguished leader in the field of project logistics and relocation management. Our expertise lies in providing cost-effective solutions tailored to the unique needs of clients across the Middle East.{'\n\n'}
                With a focus on excellence, we specialize in crafting bespoke project logistics and relocation service plans that exceed expectations. At Al Zahrani Logistics, we pride ourselves on our client-centric approach, which begins with a comprehensive understanding of our clients' precise objectives, both internal and external.{'\n\n'}
                In addition to our specialization in project logistics and relocation management, we also excel in last-mile deliveries, further enhancing our capabilities as a comprehensive logistics provider.
              </Text>
            </View>

            <View style={s.statsRow}>
              <StatPill value="2018" label="Founded" />
              <StatPill value="500+" label="Clients" />
              <StatPill value="KSA" label="Base" />
              <StatPill value="24/7" label="Support" />
            </View>

            <View style={s.missionVisionRow}>
              <View style={[s.mvCard, {flex: 1}]}>
                <View style={[s.mvIconBox, {backgroundColor: '#E8F5F0'}]}>
                  <Lucide name="target" size={18} color={TEAL} />
                </View>
                <Text style={s.mvTitle}>Our Mission</Text>
                <Text style={s.mvBody}>
                  To redefine the standards of excellence in the logistics industry by providing innovative, reliable, and cost-effective solutions tailored to meet the unique needs of our clients.
                </Text>
              </View>
              <View style={[s.mvCard, {flex: 1}]}>
                <View style={[s.mvIconBox, {backgroundColor: '#E3F2FD'}]}>
                  <Lucide name="eye" size={18} color="#0288D1" />
                </View>
                <Text style={s.mvTitle}>Our Vision</Text>
                <Text style={s.mvBody}>
                  To be recognized as the premier logistics provider in the region, setting the benchmark for excellence and innovation, and being the trusted partner of choice for businesses.
                </Text>
              </View>
            </View>

            <View style={s.contactCard}>
              <Lucide name="mail" size={18} color={TEAL} />
              <Text style={s.contactTxt}>info@alzahranilogistics.com</Text>
              <Pressable
                style={s.contactBtn}
                onPress={() => Linking.openURL('mailto:info@alzahranilogistics.com')}>
                <Text style={s.contactBtnTxt}>Email Us</Text>
              </Pressable>
            </View>

            <Text style={s.version}>Al Zahrani Logistics · Riyadh, KSA · Est. 2018</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#F2F2F2'},

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
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
  userName: {fontSize: 16, ...FONTS.bold, color: COLORS.textPrimary},
  userSub: {fontSize: 12, ...FONTS.regular, color: COLORS.mediumGray},
  memberBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', backgroundColor: '#FFF8E7',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
    marginTop: 4, borderWidth: 1, borderColor: COLORS.border,
  },
  memberTxt: {fontSize: 10, ...FONTS.bold, color: COLORS.gold},
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8E8',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 10,
    position: 'relative',
  },
  tabItemActive: {},
  tabLabel: {fontSize: 11, ...FONTS.medium, color: '#AAAAAA', textAlign: 'center'},
  tabLabelActive: {color: TEAL},
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 8, right: 8,
    height: 2.5, backgroundColor: TEAL, borderRadius: 2,
  },

  // Scroll area
  scrollArea: {flex: 1},
  scrollContent: {gap: 0, paddingTop: 14},

  // Quick tiles
  quickCard: {
    flexDirection: 'row', backgroundColor: COLORS.white,
    marginHorizontal: 16, marginBottom: 6, borderRadius: 16,
    overflow: 'hidden', elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
  },
  quickTile: {flex: 1, alignItems: 'center', paddingVertical: 18, gap: 7},
  quickDivider: {width: StyleSheet.hairlineWidth, backgroundColor: '#E8E8E8', marginVertical: 14},
  quickIconBox: {width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center'},
  quickLabel: {fontSize: 12, ...FONTS.medium, color: COLORS.textPrimary},
  quickSub: {fontSize: 10, ...FONTS.regular, color: COLORS.successGreen},

  // Section heading
  sectionHead: {
    fontSize: 11, ...FONTS.bold, color: COLORS.mediumGray,
    letterSpacing: 0.8, marginHorizontal: 20, marginTop: 18, marginBottom: 7,
  },

  // Menu card
  menuCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    marginHorizontal: 16, overflow: 'hidden', elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
  },
  menuRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 14,
  },
  menuBorder: {borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EFEFEF'},
  menuIconBox: {width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  menuLabel: {flex: 1, fontSize: 14, ...FONTS.medium, color: COLORS.textPrimary},
  menuDanger: {color: COLORS.danger},
  menuRight: {flexDirection: 'row', alignItems: 'center', gap: 4},
  menuValue: {fontSize: 13, ...FONTS.regular, color: COLORS.mediumGray},

  // Version
  version: {
    textAlign: 'center', fontSize: 11, ...FONTS.regular,
    color: '#C0C0C0', marginTop: 20, marginBottom: 8,
  },

  // Tab hero banner
  tabHero: {
    alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20,
    backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 14,
    borderRadius: 16, elevation: 1,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
  },
  tabHeroIcon: {
    width: 60, height: 60, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  tabHeroTitle: {fontSize: 20, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: 6},
  tabHeroSub: {
    fontSize: 13, ...FONTS.regular, color: COLORS.mediumGray,
    textAlign: 'center', lineHeight: 19,
  },

  // Service card
  serviceCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 12, padding: 18,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: {width: 0, height: 1},
  },
  serviceCardHeader: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12},
  serviceIconBox: {width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center'},
  serviceTitle: {flex: 1, fontSize: 15, ...FONTS.bold, color: COLORS.textPrimary},
  serviceBody: {fontSize: 13, ...FONTS.regular, color: COLORS.textSecondary, lineHeight: 20},
  readMoreBtn: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, alignSelf: 'flex-start'},
  readMoreTxt: {fontSize: 12, ...FONTS.medium, color: TEAL},

  // Contact card
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 12, marginTop: 4,
    paddingHorizontal: 18, paddingVertical: 16,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: {width: 0, height: 1},
  },
  contactTxt: {flex: 1, fontSize: 13, ...FONTS.medium, color: COLORS.textPrimary},
  contactBtn: {
    backgroundColor: TEAL, paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
  },
  contactBtnTxt: {fontSize: 12, ...FONTS.bold, color: '#fff'},

  // About banner
  aboutBanner: {
    width: '100%',
    height: 200,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
  },
  aboutBannerWrap: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    backgroundColor: '#F0F0F0',
  },

  // About card
  aboutCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    marginHorizontal: 16, marginBottom: 14, padding: 20,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: {width: 0, height: 1},
  },
  aboutSectionTitle: {fontSize: 20, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: 10},
  aboutBody: {fontSize: 13, ...FONTS.regular, color: COLORS.textSecondary, lineHeight: 21},

  // Stats row
  statsRow: {
    flexDirection: 'row', gap: 10,
    marginHorizontal: 16, marginBottom: 14,
  },
  statPill: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 14,
    alignItems: 'center', paddingVertical: 14,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: {width: 0, height: 1},
  },
  statValue: {fontSize: 18, ...FONTS.bold, color: TEAL},
  statLabel: {fontSize: 10, ...FONTS.regular, color: COLORS.mediumGray, marginTop: 2},

  // Mission / Vision
  missionVisionRow: {
    flexDirection: 'row', gap: 12,
    marginHorizontal: 16, marginBottom: 14,
  },
  mvCard: {
    backgroundColor: COLORS.white, borderRadius: 16, padding: 16,
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: {width: 0, height: 1},
  },
  mvIconBox: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  mvTitle: {fontSize: 14, ...FONTS.bold, color: COLORS.textPrimary, marginBottom: 6},
  mvBody: {fontSize: 12, ...FONTS.regular, color: COLORS.textSecondary, lineHeight: 18},
});

// ─── Logout modal styles ───────────────────────────────────────────────────────
const lm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 0,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
  },
  iconWrap: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#FFF0F0',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  body: {
    fontSize: 13,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EEEEEE',
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
  },
  cancelBtn: {},
  confirmBtn: {},
  btnSep: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  cancelTxt: {
    fontSize: 15,
    ...FONTS.medium,
    color: COLORS.textSecondary,
  },
  confirmTxt: {
    fontSize: 15,
    ...FONTS.bold,
    color: COLORS.danger,
  },
});
