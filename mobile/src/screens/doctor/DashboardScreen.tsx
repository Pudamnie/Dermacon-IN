import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Feedback Modal State
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReports = async () => {
    try {
      const res = await apiClient.get('/reports/all-patient-reports');
      setReports(res.data.reports);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Could not fetch patient reports.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const openFeedbackModal = (report: any) => {
    setSelectedReportId(report.id);
    setFeedbackText(report.doctor_feedback || '');
    setSeverity(report.severity || 'medium');
    setFeedbackModalVisible(true);
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert("Error", "Please enter your feedback.");
      return;
    }

    setSubmittingFeedback(true);
    try {
      await apiClient.post('/reports/feedback', {
        report_id: selectedReportId,
        feedback: feedbackText,
        severity: severity
      });
      Alert.alert("Success", "Feedback submitted successfully");
      setFeedbackModalVisible(false);
      onRefresh();
    } catch (e) {
      Alert.alert("Error", "Could not submit feedback");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.patient_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalPatients: [...new Set(reports.map(r => r.patient_id))].length,
    pendingReviews: reports.filter(r => !r.doctor_feedback).length,
  };

  const renderReport = ({ item }: { item: any }) => (
    <View style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientName}>{item.patient_name || 'Unknown Patient'}</Text>
          {item.patient_phone ? <Text style={styles.patientPhone}>{item.patient_phone}</Text> : null}
        </View>
        <Text style={styles.reportDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
      
      <View style={styles.predictionRow}>
        <Text style={styles.predictionLabel}>AI Prediction:</Text>
        <Text style={styles.predictionValue}>{item.prediction} ({item.confidence.toFixed(1)}%)</Text>
      </View>

      <View style={styles.statusRow}>
        {item.doctor_feedback ? (
          <View style={styles.reviewedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.reviewedText}>Reviewed</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Ionicons name="time" size={16} color={COLORS.warning} />
            <Text style={styles.pendingText}>Pending</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.reviewButton, item.doctor_feedback && styles.editButton]}
            onPress={() => openFeedbackModal(item)}
          >
            <Text style={styles.reviewButtonText}>{item.doctor_feedback ? 'Edit' : 'Review'}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('ChatRoom', { 
                userId: item.patient_id, 
                userName: item.patient_name,
                userRole: 'patient'
            })}
          >
            <Ionicons name="chatbubbles" size={16} color={COLORS.surface} />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const clearAllReports = async () => {
    Alert.alert(
      "Clear Dashboard",
      "Hide all currently visible reports? You can still view them in History.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: async () => {
            try {
              await apiClient.put('/reports/clear-for-doctor');
              setReports([]);
              Alert.alert("Success", "Dashboard cleared.");
            } catch (e) {
              Alert.alert("Error", "Could not clear dashboard.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Dr. {user?.full_name}</Text>
            <Text style={styles.subtitle}>Doctor's Dashboard</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton} onPress={() => onRefresh()}>
              <Ionicons name="refresh-outline" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="person-circle-outline" size={28} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalPatients}</Text>
            <Text style={styles.statLabel}>Unique Patients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingReviews}</Text>
            <Text style={styles.statLabel}>Pending Reviews</Text>
          </View>
        </View>

        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchBar}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Patient Reports</Text>
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

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReport}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="documents-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No patient reports to review.</Text>
            </View>
          }
        />
      )}

      {/* Feedback Modal */}
      <Modal visible={feedbackModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medical Review</Text>
              <TouchableOpacity onPress={() => setFeedbackModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <Text style={styles.label}>Clinical Feedback</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter your professional assessment and recommendations..."
                multiline
                numberOfLines={6}
                value={feedbackText}
                onChangeText={setFeedbackText}
              />

              <Text style={styles.label}>Severity Level</Text>
              <View style={styles.severityContainer}>
                {['low', 'medium', 'high'].map((level) => (
                  <TouchableOpacity 
                    key={level}
                    style={[
                      styles.severityButton, 
                      severity === level && { backgroundColor: level === 'low' ? COLORS.success : level === 'medium' ? COLORS.warning : COLORS.error }
                    ]}
                    onPress={() => setSeverity(level)}
                  >
                    <Text style={[styles.severityText, severity === level && { color: COLORS.surface }]}>
                      {level.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.submitFeedbackButton} 
                onPress={submitFeedback}
                disabled={submittingFeedback}
              >
                {submittingFeedback ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <Text style={styles.submitFeedbackButtonText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Clean off-white/gray background
  },
  header: {
    padding: SIZES.lg,
    paddingTop: SIZES.xxl * 1.2,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: SIZES.md,
    padding: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: SIZES.md,
    borderRadius: SIZES.md,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.md,
    backgroundColor: '#F8FAFC',
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
    borderColor: '#F1F5F9',
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: SIZES.md,
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.lg,
    height: 50,
  },
  searchIcon: {
    marginRight: SIZES.sm,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  listContainer: {
    padding: SIZES.md,
    paddingBottom: 100,
  },
  reportCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.lg,
    marginBottom: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: SIZES.sm,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  patientPhone: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reportDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SIZES.sm,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
    backgroundColor: '#F8FAFC',
    padding: SIZES.sm,
    borderRadius: SIZES.sm,
  },
  predictionLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginRight: SIZES.xs,
  },
  predictionValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  reviewedText: {
    marginLeft: 4,
    fontSize: 11,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '15',
    paddingHorizontal: SIZES.sm,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pendingText: {
    marginLeft: 4,
    fontSize: 11,
    color: COLORS.warning,
    fontWeight: 'bold',
  },
  reviewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: SIZES.sm,
  },
  editButton: {
    backgroundColor: COLORS.textSecondary,
  },
  reviewButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.md,
    paddingVertical: 6,
    borderRadius: SIZES.sm,
    marginLeft: SIZES.xs,
  },
  chatButtonText: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.xl,
  },
  emptyText: {
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SIZES.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
    paddingBottom: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalBody: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
    marginTop: SIZES.md,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: SIZES.md,
    padding: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  severityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.xs,
    marginBottom: SIZES.xl,
  },
  severityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: SIZES.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  severityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  submitFeedbackButton: {
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  submitFeedbackButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
