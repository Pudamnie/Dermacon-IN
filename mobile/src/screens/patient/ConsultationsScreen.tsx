import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';
import { useNavigation } from '@react-navigation/native';

export default function ConsultationsScreen() {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<any>();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // New Consultation Form
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchConsultations = async () => {
    try {
      const res = await apiClient.get('/consultations/my-consultations');
      setConsultations(res.data.consultations);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...');
      const res = await apiClient.get('/auth/doctors');
      console.log('Doctors fetched:', res.data.doctors.length);
      setDoctors(res.data.doctors);
    } catch (error: any) {
      console.error('Fetch doctors error:', error);
      Alert.alert('Error', 'Failed to fetch doctor list. Please check your connection.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConsultations();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchConsultations();
    fetchDoctors();
  }, []);

  const handleRequestConsultation = async () => {
    if (!selectedDoctorId) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/consultations/', {
        doctor_id: selectedDoctorId,
        symptoms: symptoms,
      });
      Alert.alert('Success', 'Consultation requested successfully');
      setModalVisible(false);
      setSymptoms('');
      setSelectedDoctorId('');
      onRefresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to request consultation');
    } finally {
      setSubmitting(false);
    }
  };

  const renderConsultation = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.doctorName}>Dr. {item.doctor_name}</Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 'completed' ? COLORS.success + '20' : 
                           item.status === 'accepted' ? COLORS.primary + '20' : 
                           COLORS.warning + '20' 
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === 'completed' ? COLORS.success : 
                   item.status === 'accepted' ? COLORS.primary : 
                   COLORS.warning
          }]}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.dateText}>Requested: {new Date(item.created_at).toLocaleDateString()}</Text>
      {item.symptoms ? <Text style={styles.symptomsText} numberOfLines={2}>Symptoms: {item.symptoms}</Text> : null}
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.chatButton}
          onPress={() => navigation.navigate('ChatRoom', { 
            userId: item.doctor_id, 
            userName: `Dr. ${item.doctor_name}`,
            userRole: 'doctor'
          })}
        >
          <Ionicons name="chatbubbles" size={16} color={COLORS.surface} />
          <Text style={styles.chatButtonText}>Message Doctor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Consultations</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={consultations}
          keyExtractor={(item) => item.id}
          renderItem={renderConsultation}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Ionicons name="medkit-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No consultations yet. Request one to speak to a doctor.</Text>
            </View>
          }
        />
      )}

      {/* Request Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Consultation</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.label}>Select a Dermatologist</Text>
            {doctors.length === 0 ? (
              <View style={styles.emptyDoctorContainer}>
                <Ionicons name="people-outline" size={40} color={COLORS.border} />
                <Text style={styles.emptyDoctorText}>No doctors are currently available. Please ensure doctors are registered and approved.</Text>
              </View>
            ) : (
              <FlatList
                data={doctors}
                keyExtractor={(d) => d._id}
                style={{ maxHeight: 350, marginBottom: SIZES.lg }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View 
                    style={[styles.doctorDetailCard, selectedDoctorId === item._id && styles.doctorDetailCardSelected]}
                  >
                    <View style={styles.doctorCardTop}>
                      <View style={styles.doctorAvatar}>
                        <Ionicons name="person" size={30} color={selectedDoctorId === item._id ? COLORS.surface : COLORS.primary} />
                      </View>
                      <View style={styles.doctorMainInfo}>
                        <Text style={[styles.doctorCardName, selectedDoctorId === item._id && { color: COLORS.surface }]}>
                          Dr. {item.full_name}
                        </Text>
                        <Text style={[styles.doctorCardSpec, selectedDoctorId === item._id && { color: COLORS.surface + 'CC' }]}>
                          {item.specialization || 'Dermatologist'} • {item.experience_years || 0} yrs exp
                        </Text>
                        <Text style={[styles.doctorRegText, selectedDoctorId === item._id && { color: COLORS.surface + 'AA' }]}>
                          Reg No: {item.license_number || 'N/A'}
                        </Text>
                      </View>
                      
                      <TouchableOpacity 
                        style={[styles.selectButton, selectedDoctorId === item._id && styles.deselectButton]}
                        onPress={() => setSelectedDoctorId(selectedDoctorId === item._id ? '' : item._id)}
                      >
                        <Text style={[styles.selectButtonText, selectedDoctorId === item._id && styles.deselectButtonText]}>
                          {selectedDoctorId === item._id ? 'Deselect' : 'Select'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {item.bio ? (
                      <Text style={[styles.doctorCardBio, selectedDoctorId === item._id && { color: COLORS.surface + 'CC' }]} numberOfLines={2}>
                        {item.bio}
                      </Text>
                    ) : null}
                  </View>
                )}
              />
            )}

            <Text style={styles.label}>Describe your symptoms</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="E.g., Itchy red patch on my arm..."
              value={symptoms}
              onChangeText={setSymptoms}
              multiline
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleRequestConsultation} disabled={submitting || !selectedDoctorId}>
              {submitting ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.submitButtonText}>Submit Request</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    backgroundColor: COLORS.secondary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  symptomsText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.sm,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.sm,
  },
  chatButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: SIZES.xs,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: SIZES.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SIZES.sm,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.sm,
    padding: SIZES.md,
    fontSize: 16,
    marginBottom: SIZES.xl,
  },
  doctorDetailCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.md,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  doctorDetailCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  doctorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  doctorMainInfo: {
    flex: 1,
  },
  doctorCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  doctorCardSpec: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  doctorRegText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  doctorCardBio: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginTop: SIZES.xs,
  },
  selectButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  deselectButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  selectButtonText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  deselectButtonText: {
    color: COLORS.error,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    marginBottom: SIZES.md,
  },
  emptyDoctorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.md,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyDoctorText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.sm,
    fontSize: 14,
  }
});
