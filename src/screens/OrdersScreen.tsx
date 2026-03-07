import React, {useState} from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Lucide} from '@react-native-vector-icons/lucide';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../theme/colors';
import {FONTS} from '../theme/typography';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {name: string; size: string; qty: number; isVeg: boolean};
type Order = {
  id: string;
  restaurantName: string;
  location: string;
  image: string;
  items: OrderItem[];
  date: string;
  status: 'Delivered' | 'In Transit' | 'Preparing' | 'Cancelled';
  amount: string;
  canReorder: boolean;
  userRating: number;
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const INITIAL_ORDERS: Order[] = [
  {
    id: 'o1',
    restaurantName: 'Arabian Grill',
    location: 'As Sulay, Riyadh',
    image:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80',
    items: [{name: 'Al Faham Mandi', size: 'Quarter', qty: 1, isVeg: false}],
    date: '19 Feb, 11:40 PM',
    status: 'Delivered',
    amount: 'SAR 152',
    canReorder: true,
    userRating: 0,
  },
  {
    id: 'o2',
    restaurantName: 'Kuttichira Biriyani Centre',
    location: 'Palayam, Riyadh',
    image:
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80',
    items: [
      {
        name: 'Chicken Dum Biryani',
        size: 'Full [Serves 1-2]',
        qty: 1,
        isVeg: false,
      },
    ],
    date: '03 Feb, 4:59 PM',
    status: 'Delivered',
    amount: 'SAR 189',
    canReorder: false,
    userRating: 0,
  },
  {
    id: 'o3',
    restaurantName: 'Shawarma Palace',
    location: 'Malaz, Riyadh',
    image:
      'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=200&q=80',
    items: [
      {name: 'Chicken Shawarma', size: 'Regular', qty: 2, isVeg: false},
      {name: 'Hummus Plate', size: 'Small', qty: 1, isVeg: true},
    ],
    date: '28 Jan, 2:15 PM',
    status: 'Delivered',
    amount: 'SAR 56',
    canReorder: true,
    userRating: 4,
  },
  {
    id: 'o4',
    restaurantName: 'Al Baik',
    location: 'Olaya, Riyadh',
    image:
      'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=200&q=80',
    items: [{name: 'Broast Meal', size: '3 Pcs + Fries', qty: 1, isVeg: false}],
    date: '15 Jan, 7:30 PM',
    status: 'Delivered',
    amount: 'SAR 38',
    canReorder: true,
    userRating: 5,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function VegIndicator({isVeg}: {isVeg: boolean}) {
  return (
    <View style={[styles.vegBox, isVeg ? styles.vegBoxGreen : styles.vegBoxOrange]}>
      <View style={[styles.vegDot, isVeg ? styles.vegDotGreen : styles.vegDotOrange]} />
    </View>
  );
}

function StarRating({
  rating,
  onRate,
}: {
  rating: number;
  onRate: (n: number) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map(n => (
        <Pressable key={n} onPress={() => onRate(n)} hitSlop={6}>
            <Text style={{fontSize: 20, color: n <= rating ? '#F4C54B' : '#D0D0D0'}}>
            {n <= rating ? '★' : '☆'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function StatusBadge({status}: {status: Order['status']}) {
  const color =
    status === 'Delivered'
      ? COLORS.successGreen
      : status === 'In Transit'
      ? '#E67E00'
      : status === 'Preparing'
      ? '#1565C0'
      : COLORS.danger;
  return <Text style={[styles.statusText, {color}]}>{status}</Text>;
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
  order,
  onRate,
  onReorder,
}: {
  order: Order;
  onRate: (id: string, n: number) => void;
  onReorder: (id: string) => void;
}) {
  return (
    <View style={styles.card}>
      {/* Restaurant header */}
      <View style={styles.cardHeader}>
        <Image source={{uri: order.image}} style={styles.restaurantImg} />
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{order.restaurantName}</Text>
          <Text style={styles.restaurantLocation}>{order.location}</Text>
          <Pressable style={styles.viewMenuRow}>
            <Text style={styles.viewMenuText}>View menu</Text>
            <Lucide name="chevron-right" size={13} color="#E53935" />
          </Pressable>
        </View>
        <Pressable hitSlop={10} style={styles.dotsBtn}>
          <Lucide name="ellipsis-vertical" size={20} color={COLORS.mediumGray} />
        </Pressable>
      </View>

      <View style={styles.divider} />

      {/* Order items */}
      {order.items.map((item, i) => (
        <View key={i} style={styles.itemRow}>
          <VegIndicator isVeg={item.isVeg} />
          <View style={styles.itemTexts}>
            <Text style={styles.itemName}>
              {item.qty} x {item.name}
            </Text>
            <Text style={styles.itemSize}>{item.size}</Text>
          </View>
        </View>
      ))}

      <View style={styles.divider} />

      {/* Date / amount row */}
      <Pressable style={styles.dateAmountRow}>
        <View>
          <Text style={styles.dateText}>Order placed on {order.date}</Text>
          <StatusBadge status={order.status} />
        </View>
        <View style={styles.amountWrap}>
          <Text style={styles.amountText}>{order.amount}</Text>
          <Lucide name="chevron-right" size={16} color={COLORS.textSecondary} />
        </View>
      </Pressable>

      <View style={styles.divider} />

      {/* Rating + Reorder */}
      <View style={styles.cardFooter}>
        <View style={styles.rateRow}>
          <Text style={styles.rateLabel}>Rate</Text>
          <StarRating
            rating={order.userRating}
            onRate={n => onRate(order.id, n)}
          />
        </View>
        {order.canReorder ? (
          <Pressable
            style={styles.reorderBtn}
            onPress={() => onReorder(order.id)}>
            <Lucide name="rotate-ccw" size={14} color="#fff" style={styles.reorderIcon} />
            <Text style={styles.reorderText}>Reorder</Text>
          </Pressable>
        ) : (
          <View style={styles.notDeliveringBtn}>
            <Text style={styles.notDeliveringText}>
              Currently not{'\n'}delivering
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [search, setSearch] = useState('');

  const handleRate = (id: string, n: number) => {
    setOrders(prev =>
      prev.map(o => (o.id === id ? {...o, userRating: n} : o)),
    );
  };

  const handleReorder = (_id: string) => {
    // navigate to cart in real app
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      o.restaurantName.toLowerCase().includes(q) ||
      o.items.some(i => i.name.toLowerCase().includes(q))
    );
  });

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={10}>
          <Lucide name="chevron-down" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Lucide name="search" size={18} color={COLORS.mediumGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by restaurant or dish"
          placeholderTextColor={COLORS.mediumGray}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Lucide name="x" size={16} color={COLORS.mediumGray} />
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Lucide name="package" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
        renderItem={({item}) => (
          <OrderCard
            order={item}
            onRate={handleRate}
            onReorder={handleReorder}
          />
        )}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backBtn: {
    width: 36,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 1},
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    ...FONTS.regular,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 14,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 12,
  },
  restaurantImg: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#EEE',
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 15,
    ...FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  restaurantLocation: {
    fontSize: 12,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    marginBottom: 5,
  },
  viewMenuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewMenuText: {
    fontSize: 12,
    ...FONTS.bold,
    color: '#E53935',
  },
  dotsBtn: {
    padding: 4,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 14,
  },

  // Veg indicator
  vegBox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  vegBoxGreen: {borderColor: '#2E7D32'},
  vegBoxOrange: {borderColor: '#E65100'},
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  vegDotGreen: {backgroundColor: '#2E7D32'},
  vegDotOrange: {backgroundColor: '#E65100'},

  // Order items
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  itemTexts: {flex: 1},
  itemName: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemSize: {
    fontSize: 12,
    ...FONTS.regular,
    color: COLORS.mediumGray,
  },

  // Date / amount
  dateAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 12,
    ...FONTS.regular,
    color: COLORS.mediumGray,
    marginBottom: 3,
  },
  statusText: {
    fontSize: 12,
    ...FONTS.bold,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  amountText: {
    fontSize: 14,
    ...FONTS.bold,
    color: COLORS.textPrimary,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateLabel: {
    fontSize: 13,
    ...FONTS.medium,
    color: COLORS.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },

  // Reorder
  reorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 24,
    gap: 6,
  },
  reorderIcon: {},
  reorderText: {
    fontSize: 13,
    ...FONTS.bold,
    color: '#fff',
  },
  notDeliveringBtn: {
    backgroundColor: '#D0D0D0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: 'center',
  },
  notDeliveringText: {
    fontSize: 11,
    ...FONTS.medium,
    color: '#555',
    textAlign: 'center',
    lineHeight: 15,
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    marginTop: 80,
    gap: 16,
  },
  emptyText: {
    fontSize: 15,
    ...FONTS.medium,
    color: COLORS.mediumGray,
  },
});

export default OrdersScreen;
