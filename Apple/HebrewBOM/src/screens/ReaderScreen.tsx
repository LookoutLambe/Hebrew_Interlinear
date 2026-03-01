import React, { useMemo, useCallback, useRef, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  GestureResponderEvent, PanResponder,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { CHAPTER_ORDER, getChapterLabel, getBookAndChapter } from '../data/bookData';
import { getChapterVerses, getChapterHeadingsHeb, VerseData } from '../utils/dataLoader';
import { headGloss } from '../data/headGloss';
import { transliterate } from '../utils/transliterate';
import { stripPrefixes } from '../utils/hebrew';
import WordUnit from '../components/WordUnit';
import ModeBar from '../components/ModeBar';
import WordPopup from '../components/WordPopup';

type Props = NativeStackScreenProps<RootStackParamList, 'Reader'>;

export default function ReaderScreen({ navigation, route }: Props) {
  const theme = useTheme();
  const { currentChapter, setCurrentChapter, displayMode, fontSize } = useAppContext();
  const scrollRef = useRef<ScrollView>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const chapterId = route.params?.chapterId || currentChapter;
  const chapterIdx = CHAPTER_ORDER.indexOf(chapterId);
  const hasPrev = chapterIdx > 0;
  const hasNext = chapterIdx < CHAPTER_ORDER.length - 1;

  const verses = useMemo(() => getChapterVerses(chapterId), [chapterId]);
  const label = getChapterLabel(chapterId);
  const info = getBookAndChapter(chapterId);

  // Hebrew heading
  const headingsHeb = getChapterHeadingsHeb();
  const hebHeading = headingsHeb[chapterId] || '';

  const goTo = useCallback((dir: 'prev' | 'next') => {
    const idx = dir === 'prev' ? chapterIdx - 1 : chapterIdx + 1;
    if (idx >= 0 && idx < CHAPTER_ORDER.length) {
      const nextId = CHAPTER_ORDER[idx];
      setCurrentChapter(nextId);
      navigation.setParams({ chapterId: nextId });
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [chapterIdx, setCurrentChapter, navigation]);

  // Swipe navigation
  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 30 && Math.abs(gs.dy) < 30,
    onPanResponderRelease: (_, gs) => {
      // Hebrew RTL: swipe right = next, swipe left = prev
      if (gs.dx > 50 && hasNext) goTo('next');
      else if (gs.dx < -50 && hasPrev) goTo('prev');
    },
  }), [hasNext, hasPrev, goTo]);

  const onWordPress = useCallback((hw: string) => {
    setSelectedWord(hw);
  }, []);

  // Parse heading into interlinear words
  const headingWords = useMemo(() => {
    if (!hebHeading) return [];
    return hebHeading.split(/\s+/).filter(Boolean).map(hw => {
      let gloss = headGloss[hw] || '';
      return { hw, gloss };
    });
  }, [hebHeading]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Nav header */}
      <View style={[styles.navBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => hasPrev && goTo('prev')} disabled={!hasPrev} style={styles.navBtn}>
          <Text style={[styles.navArrow, { color: hasPrev ? theme.accent : theme.border }]}>‹‹</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ChapterSelect')}>
          <Text style={[styles.navTitle, { color: theme.text }]}>{label}</Text>
          {info && (
            <Text style={[styles.navTitleHeb, { color: theme.accent }]}>
              {info.book.hebrewName}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => hasNext && goTo('next')} disabled={!hasNext} style={styles.navBtn}>
          <Text style={[styles.navArrow, { color: hasNext ? theme.accent : theme.border }]}>››</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={styles.contentInner}
        {...panResponder.panHandlers}
      >
        {/* Chapter heading */}
        {headingWords.length > 0 && (
          <View style={[styles.headingBlock, { backgroundColor: theme.accentLight, borderColor: theme.border }]}>
            <View style={styles.wordFlow}>
              {headingWords.map((w, i) => (
                <WordUnit
                  key={i}
                  hebrew={w.hw}
                  gloss={w.gloss}
                  isHeading
                  onPress={() => onWordPress(w.hw)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Verses */}
        {verses.map((verse, vi) => (
          <View key={vi} style={styles.verseRow}>
            {/* Verse number */}
            <Text style={[styles.verseNum, { color: theme.verseNum, fontSize: fontSize * 0.7 }]}>
              {verse.verse}
            </Text>

            {/* Word flow */}
            <View style={styles.wordFlow}>
              {displayMode === 'dual' ? (
                // Dual mode: Hebrew on top, English below
                <View style={styles.dualBlock}>
                  <Text style={[styles.dualHeb, { fontSize, color: theme.hebrew, fontFamily: 'DavidLibre-Regular' }]}>
                    {verse.hebrew}
                  </Text>
                  <Text style={[styles.dualEn, { fontSize: fontSize * 0.85, color: theme.text }]}>
                    {verse.english}
                  </Text>
                </View>
              ) : (
                // Interlinear or Hebrew-only
                verse.hebrew.split(/\s+/).filter(Boolean).map((hw, wi) => {
                  // Simple gloss from english (word-aligned approximation)
                  const enWords = verse.english?.split(/\s+/) || [];
                  const approxGloss = enWords[wi] || '';
                  return (
                    <WordUnit
                      key={wi}
                      hebrew={hw}
                      gloss={displayMode === 'interlinear' ? approxGloss : ''}
                      onPress={() => onWordPress(hw)}
                    />
                  );
                })
              )}
            </View>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Mode bar */}
      <ModeBar />

      {/* Word popup */}
      {selectedWord && (
        <WordPopup
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1,
  },
  navBtn: { padding: 8, minWidth: 44 },
  navArrow: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  navTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  navTitleHeb: { fontSize: 14, textAlign: 'center', writingDirection: 'rtl' },
  content: { flex: 1 },
  contentInner: { padding: 16 },
  headingBlock: {
    padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 16,
  },
  verseRow: {
    flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start',
  },
  verseNum: { width: 28, fontWeight: '700', textAlign: 'center', paddingTop: 2 },
  wordFlow: {
    flex: 1, flexDirection: 'row-reverse', flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  dualBlock: { width: '100%' },
  dualHeb: { writingDirection: 'rtl', textAlign: 'right', lineHeight: 28 },
  dualEn: { marginTop: 4, lineHeight: 22 },
});
