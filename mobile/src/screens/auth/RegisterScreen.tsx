import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { AuthContext, UserRole } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { COLORS, SIZES } from '../../constants/theme';

export default function RegisterScreen({ navigation }: any) {
  const [role, setRole] = useState<UserRole>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [pharmacyLicense, setPharmacyLicense] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Please fill in all basic fields');
      return;
    }
    
    setLoading(true);
    try {
      const payload: any = {
        full_name: fullName,
        email,
        password,
        role,
        phone,
        id_number: idNumber,
      };

      if (role === 'doctor') {
        payload.license_number = licenseNumber;
      } else if (role === 'pharmacy') {
        payload.pharmacy_license = pharmacyLicense;
        payload.pharmacy_address = pharmacyAddress;
      }
      
      const response = await apiClient.post('/auth/register', payload);
      const { access_token, user } = response.data;
      await login(access_token, user);
    } catch (error: any) {
      let msg = 'Registration failed. Please try again.';
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          msg = error.response.data.detail[0]?.msg || msg;
        } else if (typeof error.response.data.detail === 'string') {
          msg = error.response.data.detail;
        }
      } else if (error.message) {
        msg = error.message === 'Network Error' ? 'Cannot connect to server. Check your network or IP address.' : error.message;
      }
      
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join SkinCare AI today</Text>
        </View>

        <View style={styles.form}>
          
          <View style={styles.roleContainer}>
            {(['patient', 'doctor', 'pharmacy'] as UserRole[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleButton, role === r && styles.roleButtonActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>



          <View style={styles.inputContainer}>
            <Text style={styles.label}>National ID (NIC)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your ID number"
              value={idNumber}
              onChangeText={setIdNumber}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {role === 'doctor' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Doctor Registration Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your medical license number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />
            </View>
          )}

          {role === 'pharmacy' && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Pharmacy Registration Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter pharmacy license number"
                  value={pharmacyLicense}
                  onChangeText={setPharmacyLicense}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Pharmacy Location</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter physical address"
                  value={pharmacyAddress}
                  onChangeText={setPharmacyAddress}
                />
              </View>
            </>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password (min 6 chars)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <Text style={styles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  header: {
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.xl,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.sm,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderRadius: SIZES.sm,
  },
  roleButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  roleText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  roleTextActive: {
    color: COLORS.surface,
  },
  inputContainer: {
    marginBottom: SIZES.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.sm,
    padding: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
  },
  registerButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    marginTop: SIZES.sm,
  },
  registerButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.xl,
  },
  loginText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
