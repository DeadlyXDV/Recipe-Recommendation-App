import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        // Login berhasil, kembali ke screen sebelumnya
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Email atau password salah');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={globalStyles.headingLarge}>Selamat Datang</Text>
            <Text style={globalStyles.mutedText}>Masuk ke akun Anda</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Masukkan password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[globalStyles.buttonPrimary, styles.loginButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={globalStyles.buttonText}>
                {isLoading ? 'Memproses...' : 'Masuk'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupPrompt}>
              <Text style={globalStyles.mutedText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  form: {
    gap: theme.spacing[4],
  },
  inputGroup: {
    gap: theme.spacing[2],
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  loginButton: {
    marginTop: theme.spacing[2],
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLink: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.orange600,
  },
});
