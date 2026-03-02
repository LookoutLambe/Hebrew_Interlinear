import React, { useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getRoot } from '../utils/roots';
import { transliterate } from '../utils/transliterate';
import { stripNikkud } from '../utils/hebrew';
import { getRootsGlossary, getTopicalIndex, getTopicalGuide } from '../utils/dataLoader';
import { normFinals } from '../utils/hebrew';

interface Props {
  word: string;
  onClose: () => void;
  onNavigateToTopical?: (entryId: string) => void;
}

export default function WordPopup({ word, onClose, onNavigateToTopical }: Props) {
  const theme = useTheme();

  const info = useMemo(() => {
    const root = getRoot(word);
    const tl = transliterate(word);
    const rootTl = transliterate(root);
    const glossary = getRootsGlossary();
    const glossInfo = glossary[root] || glossary[stripNikkud(root)];

    // Topical guide lookup
    const tgIndex = getTopicalIndex();
    const wordKey = normFinals(stripNikkud(word));
    const rootKey = normFinals(stripNikkud(root));
    const tgEntryId = tgIndex[wordKey] || tgIndex[rootKey] || null;
    let tgEntry: { id: string; hebrew: string; english: string } | null = null;
    if (tgEntryId) {
      const entries = getTopicalGuide();
      const found = entries.find(e => e.id === tgEntryId);
      if (found) tgEntry = { id: found.id, hebrew: found.hebrew, english: found.english };
    }

    return {
      word,
      root,
      tl,
      rootTl,
      meaning: glossInfo?.meaning || '',
      category: glossInfo?.category || '',
      tgEntry,
    };
  }, [word]);

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <ScrollView>
            {/* Word */}
            <Text style={[styles.wordHeb, { color: theme.hebrew }]}>{info.word}</Text>
            <Text style={[styles.wordTl, { color: theme.translit }]}>{info.tl}</Text>

            {/* Root */}
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.row}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Root:</Text>
              <Text style={[styles.rootHeb, { color: theme.accent }]}>{info.root}</Text>
              <Text style={[styles.rootTl, { color: theme.translit }]}>{info.rootTl}</Text>
            </View>

            {info.meaning ? (
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Meaning:</Text>
                <Text style={[styles.meaning, { color: theme.text }]}>{info.meaning}</Text>
              </View>
            ) : null}

            {info.category ? (
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Category:</Text>
                <Text style={[styles.category, { color: theme.text }]}>{info.category}</Text>
              </View>
            ) : null}
            {info.tgEntry && onNavigateToTopical && (
              <>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
                <TouchableOpacity
                  style={styles.tgLink}
                  onPress={() => {
                    onClose();
                    setTimeout(() => onNavigateToTopical!(info.tgEntry!.id), 100);
                  }}
                >
                  <Text style={[styles.tgLinkTitle, { color: theme.accent }]}>
                    {info.tgEntry.hebrew} — {info.tgEntry.english}
                  </Text>
                  <Text style={[styles.tgLinkSub, { color: theme.textSecondary }]}>
                    See in Topical Guide
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.accent }]} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    width: '85%', maxHeight: '60%', borderRadius: 12, borderWidth: 1,
    padding: 20,
  },
  wordHeb: {
    fontSize: 32, textAlign: 'center', fontFamily: 'DavidLibre-Bold',
    writingDirection: 'rtl',
  },
  wordTl: { fontSize: 16, textAlign: 'center', fontStyle: 'italic', marginTop: 4 },
  divider: { height: 1, marginVertical: 12 },
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  rootHeb: { fontSize: 22, fontFamily: 'DavidLibre-Bold', writingDirection: 'rtl' },
  rootTl: { fontSize: 14, fontStyle: 'italic' },
  meaning: { fontSize: 15, flex: 1 },
  category: { fontSize: 14, fontStyle: 'italic' },
  closeBtn: {
    marginTop: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  tgLink: { paddingVertical: 8, alignItems: 'center' },
  tgLinkTitle: { fontSize: 16, fontWeight: '600', fontFamily: 'DavidLibre-Bold' },
  tgLinkSub: { fontSize: 12, marginTop: 2 },
});
