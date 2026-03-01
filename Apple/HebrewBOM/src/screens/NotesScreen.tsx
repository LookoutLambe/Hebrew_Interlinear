import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const NOTES_KEY = '@hebrewbom_notes';

interface Note {
  id: string;
  verseRef: string;
  text: string;
  timestamp: number;
}

export default function NotesScreen() {
  const theme = useTheme();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(NOTES_KEY).then(raw => {
      if (raw) {
        try { setNotes(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const saveNotes = useCallback(async (updated: Note[]) => {
    setNotes(updated);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  }, []);

  const deleteNote = useCallback((id: string) => {
    Alert.alert('Delete Note', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        saveNotes(notes.filter(n => n.id !== id));
      }},
    ]);
  }, [notes, saveNotes]);

  const saveEdit = useCallback((id: string) => {
    const updated = notes.map(n => n.id === id ? { ...n, text: editText } : n);
    saveNotes(updated);
    setEditingId(null);
  }, [notes, editText, saveNotes]);

  const renderNote = ({ item }: { item: Note }) => {
    const isEditing = editingId === item.id;
    const date = new Date(item.timestamp).toLocaleDateString();

    return (
      <View style={[styles.noteCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.noteHeader}>
          <Text style={[styles.noteRef, { color: theme.accent }]}>{item.verseRef}</Text>
          <Text style={[styles.noteDate, { color: theme.textSecondary }]}>{date}</Text>
        </View>
        {isEditing ? (
          <View>
            <TextInput
              style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
              value={editText}
              onChangeText={setEditText}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              onPress={() => saveEdit(item.id)}
            >
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={[styles.noteText, { color: theme.text }]}>{item.text}</Text>
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => { setEditingId(item.id); setEditText(item.text); }}>
                <Text style={[styles.actionText, { color: theme.accent }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteNote(item.id)}>
                <Text style={[styles.actionText, { color: '#cc4444' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No notes yet
            </Text>
            <Text style={[styles.emptyHint, { color: theme.textSecondary }]}>
              Tap on a verse while reading to add a note
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  noteCard: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 12 },
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  noteRef: { fontSize: 14, fontWeight: '700' },
  noteDate: { fontSize: 12 },
  noteText: { fontSize: 15, lineHeight: 21 },
  noteActions: { flexDirection: 'row', gap: 16, marginTop: 10 },
  actionText: { fontSize: 14, fontWeight: '600' },
  editInput: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 15, minHeight: 60 },
  saveBtn: { marginTop: 8, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptyHint: { fontSize: 14, marginTop: 8 },
});
