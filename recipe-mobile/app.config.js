export default {
  expo: {
    name: 'RecipeMobile',
    slug: 'recipe-mobile',
    version: '1.0.0',
    platforms: ['ios', 'android'],
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    android: {
      package: 'com.recipemobile.app',
    },
  },
};
