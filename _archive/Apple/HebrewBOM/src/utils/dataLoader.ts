// Data loaders — load bundled JSON assets
import versesData from '../../assets/data/official_verses.json';
import crossrefsData from '../../assets/data/crossrefs.json';
import frontMatterData from '../../assets/data/front_matter.json';
import rootsGlossaryData from '../../assets/data/roots_glossary.json';
import chapterHeadingsData from '../../assets/data/chapter_headings.json';
import chapterHeadingsHebData from '../../assets/data/chapter_headings_heb.json';
import scriptureVersesData from '../../assets/data/scripture_verses.json';
import topicalGuideData from '../../assets/data/topical_guide.json';

// Types
export interface VerseData {
  book: string;
  chapter: number;
  verse: number;
  hebrew: string;
  english: string;
}

export interface CrossRefEntry {
  refs: string[];
  hebrewRoot?: string;
}

export interface GlossaryEntry {
  root: string;
  meaning: string;
  category: string;
  count: number;
  forms: Record<string, number>;
  glosses: Record<string, number>;
  exampleVerse: string;
  verseRefs: Record<string, number>;
  biblicalRefs: string[];
}

export interface RootGlossaryInfo {
  root: string;
  meaning: string;
  category: string;
  biblicalRefs?: string[];
}

export interface TopicalVerseRef {
  label: string;
  chapterId: string;
  verse: number;
  snippet?: string;
}

export interface TopicalGuideEntry {
  id: string;
  hebrew: string;
  hebrewRoot: string;
  transliteration: string;
  english: string;
  category: string;
  definitionHeb: string;
  definitionEn: string;
  hebrewForms: string[];
  verseRefs: TopicalVerseRef[];
  relatedEntries: string[];
  majorTheme: boolean;
}

// Cached parsed data
let _verses: Record<string, VerseData[]> | null = null;
let _crossrefs: Record<string, any> | null = null;
let _frontMatter: any[] | null = null;
let _rootsGlossary: Record<string, RootGlossaryInfo> | null = null;
let _chapterHeadings: Record<string, string> | null = null;
let _chapterHeadingsHeb: Record<string, string> | null = null;
let _scriptureVerses: Record<string, string> | null = null;
let _topicalGuide: TopicalGuideEntry[] | null = null;
let _topicalIndex: Record<string, string> | null = null;

export function getVerses(): Record<string, VerseData[]> {
  if (!_verses) _verses = versesData as any;
  return _verses!;
}

export function getCrossrefs(): Record<string, any> {
  if (!_crossrefs) _crossrefs = crossrefsData as any;
  return _crossrefs!;
}

export function getFrontMatter(): any[] {
  if (!_frontMatter) _frontMatter = frontMatterData as any;
  return _frontMatter!;
}

export function getRootsGlossary(): Record<string, RootGlossaryInfo> {
  if (!_rootsGlossary) _rootsGlossary = rootsGlossaryData as any;
  return _rootsGlossary!;
}

export function getChapterHeadings(): Record<string, string> {
  if (!_chapterHeadings) _chapterHeadings = chapterHeadingsData as any;
  return _chapterHeadings!;
}

export function getChapterHeadingsHeb(): Record<string, string> {
  if (!_chapterHeadingsHeb) _chapterHeadingsHeb = chapterHeadingsHebData as any;
  return _chapterHeadingsHeb!;
}

export function getScriptureVerses(): Record<string, string> {
  if (!_scriptureVerses) _scriptureVerses = scriptureVersesData as any;
  return _scriptureVerses!;
}

export function getTopicalGuide(): TopicalGuideEntry[] {
  if (!_topicalGuide) _topicalGuide = topicalGuideData as any;
  return _topicalGuide!;
}

export function getTopicalIndex(): Record<string, string> {
  if (!_topicalIndex) {
    _topicalIndex = {};
    const entries = getTopicalGuide();
    for (const entry of entries) {
      for (const form of entry.hebrewForms) {
        const key = _normFinals(_stripNikkud(form));
        if (!_topicalIndex![key]) _topicalIndex![key] = entry.id;
      }
      const rootKey = _normFinals(_stripNikkud(entry.hebrewRoot));
      if (!_topicalIndex![rootKey]) _topicalIndex![rootKey] = entry.id;
    }
  }
  return _topicalIndex!;
}

// Inline helpers to avoid circular dependency with hebrew.ts
function _stripNikkud(s: string): string {
  return s.replace(/[\u0591-\u05C7]/g, '');
}
function _normFinals(s: string): string {
  return s.replace(/ך/g, 'כ').replace(/ם/g, 'מ').replace(/ן/g, 'נ').replace(/ף/g, 'פ').replace(/ץ/g, 'צ');
}

// Get verses for a specific chapter
export function getChapterVerses(chapterId: string): VerseData[] {
  const all = getVerses();
  return (all as any)[chapterId] || [];
}
