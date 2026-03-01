import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, I18nManager,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { BOOK_DATA, toHebNum, SINGLE_CHAPTER_BOOKS } from '../data/bookData';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const theme = useTheme();
  const { setCurrentChapter } = useAppContext();

  const navigateTo = (chapterId: string) => {
    setCurrentChapter(chapterId);
    navigation.navigate('Reader', { chapterId });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={[styles.titleHeb, { color: theme.accent }]}>
            סֵפֶר מוֹרְמוֹן
          </Text>
          <Text style={[styles.titleEn, { color: theme.text }]}>
            The Book of Mormon
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Hebrew Interlinear Edition
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('FrontMatter', {})}
          >
            <Text style={styles.actionText}>Introduction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('Search')}
          >
            <Text style={styles.actionText}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.accent }]}
            onPress={() => navigation.navigate('Glossary', {})}
          >
            <Text style={styles.actionText}>Glossary</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.actions, { marginTop: -12 }]}>
          <TouchableOpacity
            style={[styles.actionBtnOutline, { borderColor: theme.accent }]}
            onPress={() => navigation.navigate('Notes')}
          >
            <Text style={[styles.actionTextOutline, { color: theme.accent }]}>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtnOutline, { borderColor: theme.accent }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={[styles.actionTextOutline, { color: theme.accent }]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Book grid */}
        {BOOK_DATA.map(book => (
          <View key={book.prefix} style={styles.bookSection}>
            <TouchableOpacity
              onPress={() => navigateTo(book.prefix + '1')}
            >
              <View style={styles.bookHeader}>
                <Text style={[styles.bookNameHeb, { color: theme.accent }]}>
                  {book.hebrewName}
                </Text>
                <Text style={[styles.bookNameEn, { color: theme.text }]}>
                  {book.name}
                </Text>
              </View>
            </TouchableOpacity>

            {!SINGLE_CHAPTER_BOOKS.has(book.prefix) && (
              <View style={styles.chapterGrid}>
                {Array.from({ length: book.count }, (_, i) => i + 1).map(ch => (
                  <TouchableOpacity
                    key={ch}
                    style={[styles.chapterCell, { borderColor: theme.border }]}
                    onPress={() => navigateTo(book.prefix + ch)}
                  >
                    <Text style={[styles.chapterNum, { color: theme.text }]}>
                      {ch}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  titleBlock: { alignItems: 'center', marginTop: 30, marginBottom: 24 },
  titleHeb: { fontSize: 36, fontFamily: 'DavidLibre-Bold', writingDirection: 'rtl' },
  titleEn: { fontSize: 20, marginTop: 4, fontWeight: '600' },
  subtitle: { fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  actionBtnOutline: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1.5 },
  actionTextOutline: { fontWeight: '600', fontSize: 14 },
  bookSection: { marginBottom: 20 },
  bookHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 8 },
  bookNameHeb: { fontSize: 22, fontFamily: 'DavidLibre-Bold', writingDirection: 'rtl' },
  bookNameEn: { fontSize: 16, fontWeight: '500' },
  chapterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chapterCell: {
    width: 38, height: 38, borderRadius: 6, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center',
  },
  chapterNum: { fontSize: 14, fontWeight: '500' },
});
