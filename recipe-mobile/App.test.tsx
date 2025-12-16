import 'react-native-gesture-handler';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Recipe Mobile App</Text>
      <Text style={styles.subtext}>Testing Basic Setup</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF7ED',
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#C2410C',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#717182',
  },
});
