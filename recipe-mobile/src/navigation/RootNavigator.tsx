import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main screens - accessible tanpa login */}
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Detail Resep',
          headerBackTitle: 'Kembali',
        }}
      />
      
      {/* Auth screens sebagai modal */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Masuk',
        }}
      />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Daftar',
        }}
      />
    </Stack.Navigator>
  );
}
