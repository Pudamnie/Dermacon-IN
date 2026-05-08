import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { COLORS, SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await apiClient.get('/reports/my-reports');
      setReports(res.data.reports);
    } catch (error) {
      console.error(error);
    }
  };

  const clearAllReports = async () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all recent scan results? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: async () => {
            try {
              await apiClient.put('/reports/clear-all');
              setReports([]);
              Alert.alert("Success", "All reports hidden from dashboard.");
            } catch (e) {
              Alert.alert("Error", "Could not clear reports.");
            }
          } 
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.full_name}</Text>
            <Text style={styles.subtitle}>Your Health Dashboard</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => Alert.alert("Notification", "New message from Dr. Smith", [
                { text: "View Chat", onPress: () => navigation.navigate('Consult') }
              ])}
            >
              <Ionicons name="notifications-outline" size={26} color={COLORS.primary} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <View style={styles.profileIconContainer}>
                <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Upload')}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="scan" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionTitle}>New Scan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Chatbot')}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.secondary + '20' }]}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionTitle}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <View style={styles.sectionButtons}>
            <TouchableOpacity onPress={() => navigation.navigate('History')} style={styles.headerLink}>
              <Ionicons name="time-outline" size={14} color={COLORS.primary} />
              <Text style={styles.linkText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearAllReports} style={styles.headerLink}>
              <Ionicons name="trash-outline" size={14} color={COLORS.error} />
              <Text style={[styles.linkText, { color: COLORS.error }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyStateText}>No reports yet. Start a scan to see your AI predictions.</Text>
          </View>
        ) : (
          reports.map((report, index) => (
            <View key={report.id || index} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportDate}>{new Date(report.created_at).toLocaleDateString()}</Text>
                <View style={[styles.badge, { backgroundColor: report.confidence > 80 ? COLORS.error + '20' : COLORS.warning + '20' }]}>
                  <Text style={[styles.badgeText, { color: report.confidence > 80 ? COLORS.error : COLORS.warning }]}>
                    {report.confidence.toFixed(1)}% Confidence
                  </Text>
                </View>
              </View>
              <Text style={styles.reportPrediction}>{report.prediction}</Text>
              {report.doctor_feedback && (
                <View style={styles.feedbackContainer}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.feedbackText}>Reviewed by Doctor</Text>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
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
  profileIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollContent: {
    padding: SIZES.md,
    paddingBottom: 110, // Extra padding to prevent overlap with floating tab bar
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.xs,
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
    marginLeft: SIZES.md,
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
  emptyState: {
    alignItems: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.md,
  },
  emptyStateText: {
    marginTop: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  reportPrediction: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '10',
    padding: SIZES.sm,
    borderRadius: SIZES.sm,
  },
  feedbackText: {
    marginLeft: SIZES.xs,
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
});
