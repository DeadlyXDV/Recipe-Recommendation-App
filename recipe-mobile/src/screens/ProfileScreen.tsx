import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogOut, LogIn } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { theme } from '../theme';
import { globalStyles } from '../styles/globalStyles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Apakah Anda yakin ingin keluar?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // Show login prompt if not logged in
  if (!user) {
    return (
      <LinearGradient
        colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={globalStyles.container}
      >
        <View style={styles.loginContainer}>
          <User size={80} color={theme.colors.mutedForeground} />
          <Text style={globalStyles.headingMedium}>Belum Login</Text>
          <Text style={[globalStyles.mutedText, { textAlign: 'center', paddingHorizontal: theme.spacing[6] }]}>
            Masuk untuk menyimpan resep favorit, memberikan like, dan komentar
          </Text>
          
          <TouchableOpacity
            style={[globalStyles.buttonPrimary, { marginTop: theme.spacing[4], width: '80%' }]}
            onPress={() => navigation.navigate('Login')}
          >
            <LogIn size={20} color={theme.colors.background} />
            <Text style={globalStyles.buttonText}>Masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[globalStyles.buttonSecondary, { marginTop: theme.spacing[3], width: '80%' }]}
            onPress={() => navigation.navigate('Signup')}
          >
            <Text style={globalStyles.buttonSecondaryText}>Daftar Akun Baru</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.orange50, theme.colors.background, theme.colors.amber50]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={globalStyles.container}
    >
      <View style={globalStyles.contentContainer}>
        <Text style={globalStyles.headingLarge}>Profil</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={40} color={theme.colors.orange600} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={globalStyles.mutedText}>{user?.email}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[globalStyles.buttonSecondary, styles.logoutButton]}
          onPress={handleLogout}
        >
          <LogOut size={16} color={theme.colors.orange700} />
          <Text style={globalStyles.buttonSecondaryText}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    gap: theme.spacing[4],
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    gap: theme.spacing[4],
  },
  profileCard: {
    ...globalStyles.card,
    marginTop: theme.spacing[6],
    padding: theme.spacing[6],
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.orange100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.foreground,
  },
  logoutButton: {
    marginTop: theme.spacing[6],
  },
});
