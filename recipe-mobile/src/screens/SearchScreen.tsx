import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';

export default function SearchScreen() {
  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <View style={globalStyles.contentContainer}>
        <Text style={globalStyles.headingLarge}>Cari Resep</Text>
        <Text style={globalStyles.mutedText}>
          Pilih bahan yang Anda miliki untuk menemukan resep
        </Text>
      </View>
    </LinearGradient>
  );
}
