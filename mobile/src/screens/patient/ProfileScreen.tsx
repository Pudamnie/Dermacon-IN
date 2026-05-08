import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { COLORS, SIZES } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, logout, checkAuth } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [idNumber, setIdNumber] = useState(user?.id_number || '');
  const [pharmacyAddress, setPharmacyAddress] = useState(user?.pharmacy_address || '');
  const [experienceYears, setExperienceYears] = useState(user?.experience_years?.toString() || '0');

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.put('/auth/profile', {
        full_name: fullName,
        phone: phone,
        id_number: idNumber,
        pharmacy_address: pharmacyAddress,
        experience_years: parseInt(experienceYears) || 0,
      });
      await checkAuth(); // Refresh user data globally
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (uri: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      await apiClient.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await checkAuth();
      Alert.alert('Success', 'Profile picture updated');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to upload image. Ensure Cloudinary is configured.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarPlaceholder} onPress={pickImage} disabled={uploading}>
          {uploading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{user?.full_name?.charAt(0).toUpperCase()}</Text>
          )}
          <View style={styles.editAvatarIcon}>
            <Ionicons name="camera" size={14} color={COLORS.surface} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.role}>{user?.role.toUpperCase()}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <TouchableOpacity onPress={() => editMode ? handleSave() : setEditMode(true)} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.editButtonText}>{editMode ? 'Save' : 'Edit'}</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
          <View style={styles.flex1}>
            <Text style={styles.infoLabel}>National ID Number</Text>
            {editMode ? (
              <TextInput style={styles.input} value={idNumber} onChangeText={setIdNumber} placeholder="Enter NIC/ID" />
            ) : (
              <Text style={styles.infoValue}>{user?.id_number || 'Not provided'}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
          <View>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
          <View style={styles.flex1}>
            <Text style={styles.infoLabel}>Full Name</Text>
            {editMode ? (
              <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
            ) : (
              <Text style={styles.infoValue}>{user?.full_name}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
          <View style={styles.flex1}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            {editMode ? (
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            ) : (
              <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
            )}
          </View>
        </View>

        {user?.role === 'doctor' && (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="medkit-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
              <View>
                <Text style={styles.infoLabel}>Doctor License No.</Text>
                <Text style={styles.infoValue}>{user?.license_number || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="ribbon-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
              <View style={styles.flex1}>
                <Text style={styles.infoLabel}>Years of Experience</Text>
                {editMode ? (
                  <TextInput style={styles.input} value={experienceYears} onChangeText={setExperienceYears} keyboardType="numeric" />
                ) : (
                  <Text style={styles.infoValue}>{user?.experience_years || 0} Years</Text>
                )}
              </View>
            </View>
          </>
        )}

        {user?.role === 'pharmacy' && (
          <>
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
              <View>
                <Text style={styles.infoLabel}>Pharmacy License</Text>
                <Text style={styles.infoValue}>{user?.pharmacy_license || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} style={styles.iconWidth} />
              <View style={styles.flex1}>
                <Text style={styles.infoLabel}>Pharmacy Location</Text>
                {editMode ? (
                  <TextInput style={styles.input} value={pharmacyAddress} onChangeText={setPharmacyAddress} />
                ) : (
                  <Text style={styles.infoValue}>{user?.pharmacy_address || 'Not provided'}</Text>
                )}
              </View>
            </View>
          </>
        )}
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.primary, paddingTop: SIZES.xxl * 1.5, paddingBottom: SIZES.xl, alignItems: 'center', borderBottomLeftRadius: SIZES.xl, borderBottomRightRadius: SIZES.xl },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.md, position: 'relative' },
  avatarImage: { width: 90, height: 90, borderRadius: 45 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary },
  editAvatarIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.secondary, padding: 6, borderRadius: 12, borderWidth: 2, borderColor: COLORS.surface },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.surface, marginBottom: 4 },
  role: { fontSize: 12, color: COLORS.background, fontWeight: '600', letterSpacing: 1 },
  section: { backgroundColor: COLORS.surface, margin: SIZES.md, padding: SIZES.md, borderRadius: SIZES.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingBottom: SIZES.sm },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  editButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.md },
  iconWidth: { width: 30 },
  flex1: { flex: 1 },
  infoLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 2 },
  infoValue: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  input: { borderBottomWidth: 1, borderBottomColor: COLORS.primary, fontSize: 16, color: COLORS.text, paddingVertical: 2 },
  actionSection: { marginHorizontal: SIZES.md, marginTop: SIZES.md },
  logoutButton: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: SIZES.md, borderRadius: SIZES.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.error + '50' },
  logoutText: { marginLeft: SIZES.sm, color: COLORS.error, fontSize: 16, fontWeight: 'bold' },
});
