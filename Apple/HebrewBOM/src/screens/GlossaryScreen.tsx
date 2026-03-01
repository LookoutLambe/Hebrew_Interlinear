import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { getRootsGlossary } from '../utils/dataLoader';
import { transliterate } from '../utils/transliterate';
import { stripNikkud } from '../utils/hebrew';

type Props = NativeStackScreenProps<RootStackParamList, 'Glossary'>;

type Tab = 'all' | 'category' | 'top100';

const CATEGORIES = [
  'Verb', 'Noun', 'Adjective', 'Particle', 'Proper Noun',
  'Adverb', 'Preposition', 'Conjunction', 'Pronoun', 'Uncategorized',
];

export default function GlossaryScreen({ navigation }: Props) {
  const theme = useTheme();
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('Verb');

  const glossary = useMemo(() => {
    const raw = getRootsGlossary();
    return Object.entries(raw).map(([root, info]) => ({
      root,
      meaning: info.meaning || '',
      category: info.category || 'Uncategorized',
      tl: transliterate(root),
    }));
  }, []);

  const filtered = useMemo(() => {
    let list = glossary;

    if (tab === 'top100') {
      list = [...list].slice(0, 100);
    } else if (tab === 'category') {
      list = list.filter(e => e.category === selectedCat);
    }

    if (query.length >= 2) {
      const q = query.toLowerCase();
      const qStripped = stripNikkud(q);
      list = list.filter(e =>
        e.root.includes(q) ||
        stripNikkud(e.root).includes(qStripped) ||
        e.meaning.toLowerCase().includes(q) ||
        e.tl.toLowerCase().includes(q)
      );
    }

    return list;
  }, [glossary, tab, query, selectedCat]);

  const renderItem = ({ item }: { item: typeof glossary[0] }) => (
    <View style={[styles.entry, { borderBottomColor: theme.border }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.rootHeb, { color: theme.accent }]}>{item.root}</Text>
        <Text style={[styles.rootTl, { color: theme.translit }]}>{item.tl}</Text>
        <Text style={[styles.cat, { color: theme.textSecondary }]}>{item.category}</Text>
      </View>
      <Text style={[styles.meaning, { color: theme.text }]}>{item.meaning}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Search roots..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([['all', 'All'], ['category', 'Category'], ['top100', 'Top 100']] as const).map(([k, l]) => (
          <TouchableOpacity
            key={k}
            style={[styles.tab, tab === k && { backgroundColor: theme.accent }]}
            onPress={() => setTab(k)}
          >
            <Text style={{ color: tab === k ? '#fff' : theme.textSecondary, fontWeight: '600', fontSize: 13 }}>
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category picker */}
      {tab === 'category' && (
        <View style={styles.catRow}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, selectedCat === cat && { backgroundColor: theme.accentLight }]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={{ color: selectedCat === cat ? theme.accent : theme.textSecondary, fontSize: 12 }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.count, { color: theme.textSecondary }]}>
        {filtered.length} roots
      </Text>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.root}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { margin: 12, marginBottom: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14 },
  input: { height: 40, fontSize: 15 },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 12, marginBottom: 8 },
  catChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  count: { paddingHorizontal: 16, marginBottom: 4, fontSize: 12 },
  list: { paddingHorizontal: 16 },
  entry: { paddingVertical: 10, borderBottomWidth: 1 },
  entryHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  rootHeb: { fontSize: 20, fontFamily: 'DavidLibre-Bold', writingDirection: 'rtl' },
  rootTl: { fontSize: 14, fontStyle: 'italic' },
  cat: { fontSize: 12 },
  meaning: { fontSize: 14, marginTop: 2 },
});
