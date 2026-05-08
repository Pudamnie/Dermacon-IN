import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../constants/theme';

// Navigators
import AuthNavigator from './AuthNavigator';
import PatientNavigator from './PatientNavigator';
import DoctorNavigator from './DoctorNavigator';
import PharmacyNavigator from './PharmacyNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user == null ? (
          // No token found, user isn't signed in
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // User is signed in, redirect to proper role navigator
          <>
            {user.role === 'patient' && <Stack.Screen name="Patient" component={PatientNavigator} />}
            {user.role === 'doctor' && <Stack.Screen name="Doctor" component={DoctorNavigator} />}
            {user.role === 'pharmacy' && <Stack.Screen name="Pharmacy" component={PharmacyNavigator} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
