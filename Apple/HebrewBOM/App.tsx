import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AppProvider, useAppContext } from './src/context/AppContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const { isLoading, darkMode } = useAppContext();
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'DavidLibre-Regular': require('./assets/fonts/DavidLibre-Regular.ttf'),
    'DavidLibre-Medium': require('./assets/fonts/DavidLibre-Medium.ttf'),
    'DavidLibre-Bold': require('./assets/fonts/DavidLibre-Bold.ttf'),
    'CrimsonPro-Regular': require('./assets/fonts/CrimsonPro-Regular.ttf'),
    'CrimsonPro-Italic': require('./assets/fonts/CrimsonPro-Italic.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#b8860b" />
      </View>
    );
  }

  return (
    <AppProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf8f5',
  },
});
