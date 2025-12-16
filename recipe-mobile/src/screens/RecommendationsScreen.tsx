import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';

export default function RecommendationsScreen() {
  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <View style={globalStyles.contentContainer}>
        <Text style={globalStyles.headingLarge}>Rekomendasi</Text>
        <Text style={globalStyles.mutedText}>
          Resep yang mungkin Anda suka
        </Text>
      </View>
    </LinearGradient>
  );
}
