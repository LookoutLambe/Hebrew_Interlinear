import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BOOK_DATA, SINGLE_CHAPTER_BOOKS } from '../data/bookData';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'ChapterSelect'> };

export default function ChapterSelectScreen({ navigation }: Props) {
  const theme = useTheme();
  const { setCurrentChapter } = useAppContext();
  const [expandedBook, setExpandedBook] = useState<string | null>(null);

  const selectChapter = (chapterId: string) => {
    setCurrentChapter(chapterId);
    navigation.navigate('Reader', { chapterId });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {BOOK_DATA.map(book => {
          const isExpanded = expandedBook === book.prefix;
          const isSingle = SINGLE_CHAPTER_BOOKS.has(book.prefix);

          return (
            <View key={book.prefix} style={styles.bookSection}>
              <TouchableOpacity
                style={[styles.bookRow, { borderBottomColor: theme.border }]}
                onPress={() => {
                  if (isSingle) {
                    selectChapter(book.prefix + '1');
                  } else {
                    setExpandedBook(isExpanded ? null : book.prefix);
                  }
                }}
              >
                <View style={styles.bookInfo}>
                  <Text style={[styles.bookHeb, { color: theme.accent }]}>
                    {book.hebrewName}
                  </Text>
                  <Text style={[styles.bookEn, { color: theme.text }]}>
                    {book.name}
                  </Text>
                </View>
                {!isSingle && (
                  <Text style={[styles.chevron, { color: theme.textSecondary }]}>
                    {isExpanded ? '▾' : '▸'}
                  </Text>
                )}
              </TouchableOpacity>

              {isExpanded && !isSingle && (
                <View style={styles.chapterGrid}>
                  {Array.from({ length: book.count }, (_, i) => i + 1).map(ch => (
                    <TouchableOpacity
                      key={ch}
                      style={[styles.chapterCell, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => selectChapter(book.prefix + ch)}
                    >
                      <Text style={[styles.chapterNum, { color: theme.text }]}>{ch}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16 },
  bookSection: { marginBottom: 2 },
  bookRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1,
  },
  bookInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  bookHeb: { fontSize: 20, fontFamily: 'DavidLibre-Bold', writingDirection: 'rtl' },
  bookEn: { fontSize: 16 },
  chevron: { fontSize: 18, paddingHorizontal: 8 },
  chapterGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingVertical: 12, paddingHorizontal: 4,
  },
  chapterCell: {
    width: 44, height: 44, borderRadius: 8, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  chapterNum: { fontSize: 16, fontWeight: '500' },
});
