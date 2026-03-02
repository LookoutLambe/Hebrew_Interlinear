import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAppContext, DisplayMode } from '../context/AppContext';
import { transliterate } from '../utils/transliterate';

interface Props {
  hebrew: string;
  gloss: string;
  onPress?: () => void;
  isHeading?: boolean;
}

function WordUnit({ hebrew, gloss, onPress, isHeading }: Props) {
  const theme = useTheme();
  const { displayMode, fontSize, showTransliteration } = useAppContext();

  const tl = showTransliteration ? transliterate(hebrew) : '';
  const hebSize = isHeading ? fontSize * 1.1 : fontSize;
  const glossSize = isHeading ? fontSize * 0.6 : fontSize * 0.65;
  const tlSize = isHeading ? fontSize * 0.55 : fontSize * 0.6;

  if (displayMode === 'hebrew') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
        <Text style={[styles.hw, { fontSize: hebSize, color: theme.hebrew }]}>
          {hebrew}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.unit} activeOpacity={0.6}>
      <Text style={[styles.hw, { fontSize: hebSize, color: theme.hebrew, fontFamily: 'DavidLibre-Regular' }]}>
        {hebrew}
      </Text>
      {showTransliteration && tl ? (
        <Text style={[styles.tl, { fontSize: tlSize, color: theme.translit }]} numberOfLines={1}>
          {tl}
        </Text>
      ) : null}
      {gloss ? (
        <Text style={[styles.gl, { fontSize: glossSize, color: theme.gloss }]} numberOfLines={1}>
          {gloss}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default memo(WordUnit);

const styles = StyleSheet.create({
  unit: { alignItems: 'center', marginHorizontal: 3, marginBottom: 6 },
  hw: { textAlign: 'center', writingDirection: 'rtl' },
  tl: { textAlign: 'center', fontStyle: 'italic', marginTop: 1 },
  gl: { textAlign: 'center', marginTop: 1 },
});
