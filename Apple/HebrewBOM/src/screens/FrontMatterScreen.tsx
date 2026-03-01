import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { getFrontMatter } from '../utils/dataLoader';

type Props = NativeStackScreenProps<RootStackParamList, 'FrontMatter'>;

export default function FrontMatterScreen({ route }: Props) {
  const theme = useTheme();
  const frontMatter = useMemo(() => getFrontMatter(), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {frontMatter.map((section: any, i: number) => (
          <View key={i} style={styles.section}>
            {section.title && (
              <Text style={[styles.title, { color: theme.accent }]}>{section.title}</Text>
            )}
            {section.titleHeb && (
              <Text style={[styles.titleHeb, { color: theme.hebrew }]}>{section.titleHeb}</Text>
            )}
            {section.content && (
              <Text style={[styles.content, { color: theme.text }]}>{section.content}</Text>
            )}
            {section.contentHeb && (
              <Text style={[styles.contentHeb, { color: theme.hebrew }]}>{section.contentHeb}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20 },
  section: { marginBottom: 24 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  titleHeb: {
    fontSize: 22, fontFamily: 'DavidLibre-Bold', writingDirection: 'rtl',
    textAlign: 'right', marginBottom: 8,
  },
  content: { fontSize: 15, lineHeight: 22 },
  contentHeb: {
    fontSize: 18, fontFamily: 'DavidLibre-Regular', writingDirection: 'rtl',
    textAlign: 'right', lineHeight: 28,
  },
});
