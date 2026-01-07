export default {
  expo: {
    name: 'RecipeMobile',
    slug: 'recipe-mobile',
    version: '1.0.0',
    platforms: ['ios', 'android'],
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    updates: {
      enabled: false,
    },
    android: {
      package: 'com.recipemobile.app',
    },
    extra: {
      apiUrl: process.env.API_URL || 'http://192.168.100.3:5000/api',
    },
  },
};
