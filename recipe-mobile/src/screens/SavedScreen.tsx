import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';

export default function SavedScreen() {
  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <View style={globalStyles.contentContainer}>
        <Text style={globalStyles.headingLarge}>Resep Tersimpan</Text>
        <Text style={globalStyles.mutedText}>
          Koleksi resep favorit Anda
        </Text>
      </View>
    </LinearGradient>
  );
}
