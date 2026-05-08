import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import PatientDashboard from '../screens/patient/DashboardScreen';
import UploadImageScreen from '../screens/patient/UploadImageScreen';
import ChatbotScreen from '../screens/patient/ChatbotScreen';
import StoreScreen from '../screens/patient/StoreScreen';
import ConsultationsScreen from '../screens/patient/ConsultationsScreen';
import ProfileScreen from '../screens/patient/ProfileScreen';
import ChatScreen from '../screens/shared/ChatScreen';
import HistoryScreen from '../screens/shared/HistoryScreen';

import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PatientTabs() {
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
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Upload') iconName = focused ? 'camera' : 'camera-outline';
          else if (route.name === 'Consult') iconName = focused ? 'medkit' : 'medkit-outline';
          else if (route.name === 'Chatbot') iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
          else if (route.name === 'Store') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={PatientDashboard} />
      <Tab.Screen name="Upload" component={UploadImageScreen} />
      <Tab.Screen name="Consult" component={ConsultationsScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Store" component={StoreScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function PatientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
      <Stack.Screen name="ChatRoom" component={ChatScreen} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ headerShown: true, title: 'My History' }} />
    </Stack.Navigator>
  );
}
