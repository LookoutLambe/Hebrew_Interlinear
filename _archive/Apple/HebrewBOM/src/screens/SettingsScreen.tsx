import React from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';

export default function SettingsScreen() {
  const theme = useTheme();
  const {
    darkMode, setDarkMode,
    showTransliteration, setShowTransliteration,
    fontSize, setFontSize,
  } = useAppContext();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.header, { color: theme.text }]}>Display</Text>

        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: theme.border, true: theme.accent }}
          />
        </View>

        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Transliteration</Text>
          <Switch
            value={showTransliteration}
            onValueChange={setShowTransliteration}
            trackColor={{ false: theme.border, true: theme.accent }}
          />
        </View>

        <View style={[styles.row, { borderBottomColor: theme.border }]}>
          <Text style={[styles.label, { color: theme.text }]}>Font Size: {fontSize}</Text>
          <View style={styles.sizeControls}>
            <Text
              style={[styles.sizeBtn, { color: theme.accent }]}
              onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            >
              A-
            </Text>
            <Text
              style={[styles.sizeBtn, { color: theme.accent }]}
              onPress={() => setFontSize(Math.min(28, fontSize + 2))}
            >
              A+
            </Text>
          </View>
        </View>

        <Text style={[styles.header, { color: theme.text, marginTop: 24 }]}>About</Text>
        <Text style={[styles.about, { color: theme.textSecondary }]}>
          Hebrew Interlinear Book of Mormon{'\n'}
          Version 1.0.0{'\n\n'}
          A complete Hebrew translation with interlinear English glosses,
          transliteration, root word analysis, and cross-references.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  header: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1,
  },
  label: { fontSize: 16 },
  sizeControls: { flexDirection: 'row', gap: 16 },
  sizeBtn: { fontSize: 18, fontWeight: '700', padding: 4 },
  about: { fontSize: 14, lineHeight: 20 },
});
