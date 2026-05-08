import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get('/orders/my-orders');
      setOrders(res.data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllOrders = async () => {
    Alert.alert(
      "Clear Dashboard",
      "Hide all currently visible orders? They will still be available in History.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: async () => {
            try {
              await apiClient.put('/orders/clear-all');
              setOrders([]);
              Alert.alert("Success", "Dashboard cleared.");
            } catch (e) {
              Alert.alert("Error", "Could not clear dashboard.");
            }
          } 
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.put(`/orders/${orderId}/status`, { status: newStatus });
      onRefresh();
      Alert.alert("Success", `Order status updated to ${newStatus}`);
    } catch (e) {
      Alert.alert("Error", "Could not update order status");
    }
  };

  const clearOrder = async (orderId: string) => {
    try {
      await apiClient.put(`/orders/${orderId}/clear`);
      onRefresh();
    } catch (e) {
      Alert.alert("Error", "Could not clear order");
    }
  };

  const renderOrder = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{item.id?.slice(-6).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'delivered' ? COLORS.success + '20' : 
                           item.status === 'processing' ? COLORS.primary + '20' : 
                           COLORS.warning + '20' 
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === 'delivered' ? COLORS.success : 
                   item.status === 'processing' ? COLORS.primary : 
                   COLORS.warning
          }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.detailLabel}>Patient: <Text style={styles.detailValue}>{item.patient_name}</Text></Text>
        <Text style={styles.detailLabel}>Address: <Text style={styles.detailValue}>{item.delivery_address}</Text></Text>
        <Text style={styles.detailLabel}>Total: <Text style={styles.amount}>Rs. {item.total_amount?.toLocaleString()}</Text></Text>
      </View>

      <Text style={styles.itemsTitle}>Items ({item.items?.length || 0})</Text>

      {item.status !== 'delivered' ? (
        <View style={styles.actionRow}>
          {item.status === 'pending' && (
            <TouchableOpacity style={styles.actionButton} onPress={() => updateStatus(item.id, 'processing')}>
              <Text style={styles.actionButtonText}>Process Order</Text>
            </TouchableOpacity>
          )}
          {item.status === 'processing' && (
            <TouchableOpacity style={styles.actionButton} onPress={() => updateStatus(item.id, 'shipped')}>
              <Text style={styles.actionButtonText}>Mark as Shipped</Text>
            </TouchableOpacity>
          )}
          {item.status === 'shipped' && (
            <TouchableOpacity style={styles.actionButtonSuccess} onPress={() => updateStatus(item.id, 'delivered')}>
              <Text style={styles.actionButtonText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.clearButton} onPress={() => clearOrder(item.id)}>
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            <Text style={styles.clearButtonText}>Clear from List</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{user?.pharmacy_name || user?.full_name}</Text>
            <Text style={styles.subtitle}>Pharmacy Dashboard</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => onRefresh()}
            >
              <Ionicons name="refresh-outline" size={26} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Alert.alert("Profile", "Navigating to Profile...")}>
              <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Orders</Text>
        <View style={styles.sectionButtons}>
          <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.headerLink}>
            <Ionicons name="time-outline" size={14} color={COLORS.primary} />
            <Text style={styles.linkText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAllOrders} style={styles.headerLink}>
            <Ionicons name="trash-outline" size={14} color={COLORS.error} />
            <Text style={[styles.linkText, { color: COLORS.error }]}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No orders found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    paddingTop: SIZES.xxl * 1.2,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: SIZES.md,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  listContainer: {
    padding: SIZES.md,
    paddingBottom: 110, // Extra padding to prevent overlap with floating tab bar
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SIZES.sm,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  orderDetails: {
    marginBottom: SIZES.sm,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.text,
    fontWeight: '500',
  },
  amount: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: COLORS.background,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SIZES.sm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SIZES.xs,
    marginBottom: SIZES.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.sm,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.sm,
  },
  actionButtonSuccess: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.sm,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyText: {
    marginTop: SIZES.sm,
    color: COLORS.textSecondary,
  },
});
