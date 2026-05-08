import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Image, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function HistoryScreen() {
  const { user } = useContext(AuthContext);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = records.filter(item => {
    const query = searchQuery.toLowerCase();
    if (user?.role === 'pharmacy') {
      return (
        item.patient_name?.toLowerCase().includes(query) ||
        item.id?.toLowerCase().includes(query)
      );
    } else {
      return (
        item.prediction?.toLowerCase().includes(query) ||
        item.patient_name?.toLowerCase().includes(query)
      );
    }
  });

  const fetchHistory = async () => {
    try {
      if (user?.role === 'patient') {
        const res = await apiClient.get('/reports/my-history');
        setRecords(res.data.history);
      } else {
        const res = await apiClient.get('/orders/history');
        setRecords(res.data.history);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    if (user?.role === 'pharmacy') {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Order #{item.id?.slice(-6).toUpperCase()}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.label}>Patient: <Text style={styles.value}>{item.patient_name}</Text></Text>
            <Text style={styles.label}>Total: <Text style={styles.price}>Rs. {item.total_amount?.toLocaleString()}</Text></Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>COMPLETED</Text>
          </View>
        </View>
      );
    } else if (user?.role === 'patient') {
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.prediction}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.confidenceRow}>
              <Text style={styles.label}>Confidence: </Text>
              <Text style={[styles.value, { color: COLORS.primary }]}>{item.confidence?.toFixed(1)}%</Text>
            </View>
            {item.doctor_feedback && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackLabel}>Doctor's Feedback:</Text>
                <Text style={styles.feedbackText}>{item.doctor_feedback}</Text>
              </View>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: item.severity === 'high' ? COLORS.error + '20' : COLORS.success + '20' }]}>
            <Text style={[styles.badgeText, { color: item.severity === 'high' ? COLORS.error : COLORS.success }]}>
              {item.doctor_feedback ? 'REVIEWED' : 'PENDING REVIEW'}
            </Text>
          </View>
        </View>
      );
    } else {
      // Doctor History (Reviewed Reports)
      return (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.patient_name}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.label}>Prediction: <Text style={styles.value}>{item.prediction}</Text></Text>
            <Text style={styles.feedbackLabel}>Feedback:</Text>
            <Text style={styles.feedbackText} numberOfLines={2}>{item.doctor_feedback}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: COLORS.success + '20' }]}>
            <Text style={[styles.badgeText, { color: COLORS.success }]}>REVIEWED</Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity History</Text>
        <Text style={styles.subtitle}>Records of past interactions</Text>
        
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search records..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="time-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>
                {searchQuery ? "No matching records found." : "No history records yet."}
              </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: SIZES.md,
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.md,
    height: 45,
  },
  searchBar: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: SIZES.xs,
  },
  listContainer: {
    padding: SIZES.md,
    paddingBottom: 110, // Extra padding to prevent overlap with floating tab bar
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SIZES.sm,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardBody: {
    marginBottom: SIZES.sm,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  value: {
    color: COLORS.text,
    fontWeight: '600',
  },
  price: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SIZES.sm,
  },
  feedbackText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.primary + '15',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackBox: {
    marginTop: SIZES.sm,
    padding: SIZES.sm,
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyText: {
    marginTop: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
