import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppContext, DisplayMode } from '../context/AppContext';

const modes: { key: DisplayMode; label: string }[] = [
  { key: 'interlinear', label: 'Interlinear' },
  { key: 'hebrew', label: 'Hebrew' },
  { key: 'dual', label: 'Dual' },
];

export default function ModeBar() {
  const theme = useTheme();
  const { displayMode, setDisplayMode, fontSize, setFontSize, showTransliteration, setShowTransliteration } = useAppContext();

  return (
    <View style={[styles.bar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      <View style={styles.modeRow}>
        {modes.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.modeBtn,
              displayMode === m.key && { backgroundColor: theme.accent },
            ]}
            onPress={() => setDisplayMode(m.key)}
          >
            <Text style={[
              styles.modeText,
              { color: displayMode === m.key ? '#fff' : theme.textSecondary },
            ]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))} style={styles.sizeBtn}>
          <Text style={[styles.sizeText, { color: theme.textSecondary }]}>A-</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFontSize(Math.min(28, fontSize + 2))} style={styles.sizeBtn}>
          <Text style={[styles.sizeText, { color: theme.textSecondary }]}>A+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowTransliteration(!showTransliteration)}
          style={[styles.tlBtn, showTransliteration && { backgroundColor: theme.accentLight }]}
        >
          <Text style={[styles.sizeText, { color: showTransliteration ? theme.accent : theme.textSecondary }]}>
            Tl
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1,
  },
  modeRow: { flexDirection: 'row', gap: 6 },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  modeText: { fontSize: 13, fontWeight: '600' },
  controls: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  sizeBtn: { padding: 6 },
  sizeText: { fontSize: 14, fontWeight: '600' },
  tlBtn: { padding: 6, borderRadius: 4 },
});
