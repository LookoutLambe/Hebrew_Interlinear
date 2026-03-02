import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import ReaderScreen from '../screens/ReaderScreen';
import ChapterSelectScreen from '../screens/ChapterSelectScreen';
import GlossaryScreen from '../screens/GlossaryScreen';
import SearchScreen from '../screens/SearchScreen';
import FrontMatterScreen from '../screens/FrontMatterScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotesScreen from '../screens/NotesScreen';
import TopicalGuideScreen from '../screens/TopicalGuideScreen';
import { useTheme } from '../context/ThemeContext';

export type RootStackParamList = {
  Home: undefined;
  Reader: { chapterId?: string };
  ChapterSelect: undefined;
  Glossary: { rootWord?: string };
  Search: undefined;
  FrontMatter: { section?: string };
  Settings: undefined;
  Notes: undefined;
  TopicalGuide: { entryId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.accent,
          headerTitleStyle: { color: theme.headerText, fontWeight: '600' },
          contentStyle: { backgroundColor: theme.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Reader"
          component={ReaderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChapterSelect"
          component={ChapterSelectScreen}
          options={{ title: 'Select Chapter' }}
        />
        <Stack.Screen
          name="Glossary"
          component={GlossaryScreen}
          options={{ title: 'Root Glossary' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ title: 'Search' }}
        />
        <Stack.Screen
          name="FrontMatter"
          component={FrontMatterScreen}
          options={{ title: 'Introduction' }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
        <Stack.Screen
          name="Notes"
          component={NotesScreen}
          options={{ title: 'My Notes' }}
        />
        <Stack.Screen
          name="TopicalGuide"
          component={TopicalGuideScreen}
          options={{ title: 'Topical Guide' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
