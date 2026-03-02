import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView,
  SectionList, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { getTopicalGuide, TopicalGuideEntry } from '../utils/dataLoader';
import { stripNikkud, hebrewSort, hebrewFirstLetter } from '../utils/hebrew';
import { transliterate } from '../utils/transliterate';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'TopicalGuide'>;

const HEBREW_LETTERS = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת'];

const CATEGORIES = [
  'Salvation', 'God', 'Covenant', 'Righteousness', 'Sin',
  'Blessing', 'Worship', 'Revelation', 'Humanity', 'Trial', 'Prophecy',
];

type Tab = 'major' | 'all' | 'category';

export default function TopicalGuideScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const entryId = route.params?.entryId;
  const sectionListRef = useRef<SectionList>(null);

  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>(entryId ? 'all' : 'major');
  const [expandedId, setExpandedId] = useState<string | null>(entryId || null);
  const [selectedCat, setSelectedCat] = useState('Salvation');

  const allEntries = useMemo(() => {
    const entries = getTopicalGuide();
    return [...entries].sort((a, b) => hebrewSort(a.hebrew, b.hebrew));
  }, []);

  // Build sections grouped by first Hebrew letter
  const sections = useMemo(() => {
    let filtered = allEntries;

    if (tab === 'major') {
      filtered = allEntries.filter(e => e.majorTheme);
    } else if (tab === 'category') {
      filtered = allEntries.filter(e => e.category === selectedCat);
    }

    // Search filtering
    if (query.length >= 2) {
      const q = query.toLowerCase();
      const qStripped = stripNikkud(q);
      filtered = allEntries.filter(e =>
        e.hebrew.includes(q) ||
        stripNikkud(e.hebrew).includes(qStripped) ||
        e.english.toLowerCase().includes(q) ||
        e.transliteration.toLowerCase().includes(q)
      );
    }

    // Group by first Hebrew letter
    const groups: Record<string, TopicalGuideEntry[]> = {};
    for (const entry of filtered) {
      const letter = hebrewFirstLetter(entry.hebrew);
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(entry);
    }

    // Build sections in Hebrew alphabetical order
    return HEBREW_LETTERS
      .filter(l => groups[l] && groups[l].length > 0)
      .map(l => ({ title: l, data: groups[l] }));
  }, [allEntries, tab, query, selectedCat]);

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const scrollToLetter = useCallback((letter: string) => {
    const sectionIdx = sections.findIndex(s => s.title === letter);
    if (sectionIdx >= 0 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: sectionIdx,
        itemIndex: 0,
        animated: true,
      });
    }
  }, [sections]);

  const navigateToVerse = useCallback((chapterId: string) => {
    navigation.navigate('Reader', { chapterId });
  }, [navigation]);

  const navigateToRelated = useCallback((relatedId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(relatedId);
    setTab('all');
    setQuery('');
    // Try to scroll to the entry
    const sectionIdx = sections.findIndex(s =>
      s.data.some(e => e.id === relatedId)
    );
    if (sectionIdx >= 0 && sectionListRef.current) {
      const itemIdx = sections[sectionIdx].data.findIndex(e => e.id === relatedId);
      sectionListRef.current.scrollToLocation({
        sectionIndex: sectionIdx,
        itemIndex: Math.max(0, itemIdx),
        animated: true,
      });
    }
  }, [sections]);

  const renderEntry = useCallback(({ item }: { item: TopicalGuideEntry }) => {
    const isExpanded = expandedId === item.id;
    return (
      <View>
        <TouchableOpacity
          style={[styles.entryRow, { borderBottomColor: theme.border }]}
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.entryHeader}>
            <Text style={[styles.entryHeb, { color: theme.hebrew }]}>{item.hebrew}</Text>
            <Text style={[styles.entryTl, { color: theme.translit }]}>{item.transliteration}</Text>
            {item.majorTheme && <Text style={styles.star}>★</Text>}
          </View>
          <Text style={[styles.entryEn, { color: theme.text }]}>{item.english}</Text>
          <Text style={[styles.entryCat, { color: theme.textSecondary }]}>{item.category}</Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={[styles.expandedBlock, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Hebrew definition */}
            <Text style={[styles.defLabel, { color: theme.accent }]}>הַגְדָּרָה</Text>
            <Text style={[styles.defHeb, { color: theme.hebrew }]}>{item.definitionHeb}</Text>

            {/* English definition */}
            <Text style={[styles.defLabel, { color: theme.accent, marginTop: 12 }]}>Definition</Text>
            <Text style={[styles.defEn, { color: theme.text }]}>{item.definitionEn}</Text>

            {/* Verse references */}
            <Text style={[styles.defLabel, { color: theme.accent, marginTop: 12 }]}>
              Book of Mormon References
            </Text>
            {item.verseRefs.map((ref, i) => (
              <TouchableOpacity
                key={i}
                style={styles.refRow}
                onPress={() => navigateToVerse(ref.chapterId)}
              >
                <Text style={[styles.refLabel, { color: theme.accent }]}>{ref.label}</Text>
                {ref.snippet ? (
                  <Text style={[styles.refSnippet, { color: theme.textSecondary }]}>
                    — {ref.snippet}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}

            {/* Related entries */}
            {item.relatedEntries.length > 0 && (
              <>
                <Text style={[styles.defLabel, { color: theme.accent, marginTop: 12 }]}>
                  Related Topics
                </Text>
                <View style={styles.relatedRow}>
                  {item.relatedEntries.map(relId => {
                    const rel = allEntries.find(e => e.id === relId);
                    if (!rel) return null;
                    return (
                      <TouchableOpacity
                        key={relId}
                        style={[styles.relatedChip, { borderColor: theme.accent }]}
                        onPress={() => navigateToRelated(relId)}
                      >
                        <Text style={[styles.relatedText, { color: theme.accent }]}>
                          {rel.hebrew} {rel.english}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  }, [expandedId, theme, allEntries, toggleExpand, navigateToVerse, navigateToRelated]);

  const renderSectionHeader = useCallback(({ section }: { section: any }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.bg, borderBottomColor: theme.border }]}>
      <Text style={[styles.sectionLetter, { color: theme.accent }]}>{section.title}</Text>
    </View>
  ), [theme]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Search topics..."
          placeholderTextColor={theme.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { borderBottomColor: theme.border }]}>
        {(['major', 'all', 'category'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
            onPress={() => { setTab(t); setQuery(''); }}
          >
            <Text style={[styles.tabText, { color: tab === t ? theme.accent : theme.textSecondary }]}>
              {t === 'major' ? 'Major Themes' : t === 'all' ? 'All' : 'By Category'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category chips */}
      {tab === 'category' && (
        <View style={styles.catRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                styles.catChip,
                { borderColor: theme.accent },
                selectedCat === c && { backgroundColor: theme.accent },
              ]}
              onPress={() => setSelectedCat(c)}
            >
              <Text style={[
                styles.catChipText,
                { color: selectedCat === c ? '#fff' : theme.accent },
              ]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.body}>
        {/* Alphabet sidebar */}
        {tab === 'all' && !query && (
          <View style={styles.alphaBar}>
            {HEBREW_LETTERS.map(l => (
              <TouchableOpacity key={l} onPress={() => scrollToLetter(l)} style={styles.alphaBtn}>
                <Text style={[styles.alphaText, { color: theme.accent }]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Entry list */}
        <SectionList
          ref={sectionListRef}
          sections={sections}
          keyExtractor={item => item.id}
          renderItem={renderEntry}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No topics found
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  input: {
    height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 15,
  },
  tabRow: {
    flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabText: { fontSize: 13, fontWeight: '600' },
  catRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 10,
  },
  catChip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1,
  },
  catChipText: { fontSize: 12, fontWeight: '500' },
  body: { flex: 1, flexDirection: 'row' },
  alphaBar: {
    width: 24, paddingTop: 4, alignItems: 'center', justifyContent: 'space-evenly',
  },
  alphaBtn: { paddingVertical: 1 },
  alphaText: { fontSize: 11, fontWeight: '700' },
  listContent: { paddingBottom: 40 },
  sectionHeader: {
    paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionLetter: { fontSize: 20, fontWeight: '700', fontFamily: 'DavidLibre-Bold' },
  entryRow: {
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  entryHeader: {
    flexDirection: 'row', alignItems: 'baseline', gap: 8,
  },
  entryHeb: { fontSize: 22, fontFamily: 'DavidLibre-Bold', writingDirection: 'rtl' },
  entryTl: { fontSize: 14, fontStyle: 'italic' },
  star: { fontSize: 14, color: '#d4a843' },
  entryEn: { fontSize: 16, fontWeight: '500', marginTop: 2 },
  entryCat: { fontSize: 12, marginTop: 2 },
  expandedBlock: {
    marginHorizontal: 12, marginBottom: 8, padding: 16,
    borderRadius: 10, borderWidth: 1,
  },
  defLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  defHeb: {
    fontSize: 17, fontFamily: 'DavidLibre-Regular', writingDirection: 'rtl',
    textAlign: 'right', lineHeight: 26,
  },
  defEn: { fontSize: 15, lineHeight: 22 },
  refRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 6,
    paddingVertical: 5, paddingLeft: 8,
  },
  refLabel: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  refSnippet: { fontSize: 13, fontStyle: 'italic', flex: 1 },
  relatedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  relatedChip: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1,
  },
  relatedText: { fontSize: 13 },
  emptyContainer: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 16 },
});
