import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { getVerses, VerseData } from '../utils/dataLoader';
import { CHAPTER_ORDER, getChapterLabel } from '../data/bookData';
import { stripNikkud } from '../utils/hebrew';

type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

interface SearchResult {
  chapterId: string;
  verse: VerseData;
  label: string;
}

export default function SearchScreen({ navigation }: Props) {
  const theme = useTheme();
  const { setCurrentChapter } = useAppContext();
  const [query, setQuery] = useState('');

  const allVerses = useMemo(() => getVerses(), []);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    const qStripped = stripNikkud(q);
    const matches: SearchResult[] = [];

    for (const chId of CHAPTER_ORDER) {
      const vs = (allVerses as any)[chId] || [];
      for (const v of vs) {
        const heb = v.hebrew || '';
        const en = v.english || '';
        if (
          heb.includes(q) ||
          stripNikkud(heb).includes(qStripped) ||
          en.toLowerCase().includes(q)
        ) {
          matches.push({
            chapterId: chId,
            verse: v,
            label: getChapterLabel(chId) + ':' + v.verse,
          });
          if (matches.length >= 100) break;
        }
      }
      if (matches.length >= 100) break;
    }
    return matches;
  }, [query, allVerses]);

  const goToVerse = useCallback((chId: string) => {
    setCurrentChapter(chId);
    navigation.navigate('Reader', { chapterId: chId });
  }, [navigation, setCurrentChapter]);

  const renderItem = useCallback(({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={[styles.result, { borderBottomColor: theme.border }]}
      onPress={() => goToVerse(item.chapterId)}
    >
      <Text style={[styles.ref, { color: theme.accent }]}>{item.label}</Text>
      <Text style={[styles.heb, { color: theme.hebrew }]} numberOfLines={1}>
        {item.verse.hebrew}
      </Text>
      <Text style={[styles.en, { color: theme.textSecondary }]} numberOfLines={1}>
        {item.verse.english}
      </Text>
    </TouchableOpacity>
  ), [theme, goToVerse]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search Hebrew or English..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.length >= 2 ? (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>No results found</Text>
          ) : (
            <Text style={[styles.empty, { color: theme.textSecondary }]}>
              Type at least 2 characters to search
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 12, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14 },
  input: { height: 44, fontSize: 16 },
  list: { padding: 12 },
  result: { paddingVertical: 10, borderBottomWidth: 1 },
  ref: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  heb: { fontSize: 16, writingDirection: 'rtl', fontFamily: 'DavidLibre-Regular' },
  en: { fontSize: 13, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 15 },
});
