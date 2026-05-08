import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import PharmacyDashboard from '../screens/pharmacy/DashboardScreen';
import ProductsScreen from '../screens/pharmacy/ProductsScreen';
import HistoryScreen from '../screens/shared/HistoryScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';

import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function PharmacyNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: 'transparent',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
          position: 'absolute',
          bottom: 10,
          left: 10,
          right: 10,
          borderRadius: 25,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'home';
          if (route.name === 'Orders') iconName = focused ? 'receipt' : 'receipt-outline';
          else if (route.name === 'Products') iconName = focused ? 'cube' : 'cube-outline';
          else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Orders" component={PharmacyDashboard} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
