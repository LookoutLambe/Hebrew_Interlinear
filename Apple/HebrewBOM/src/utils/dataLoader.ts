// Data loaders — load bundled JSON assets
import versesData from '../../assets/data/official_verses.json';
import crossrefsData from '../../assets/data/crossrefs.json';
import frontMatterData from '../../assets/data/front_matter.json';
import rootsGlossaryData from '../../assets/data/roots_glossary.json';
import chapterHeadingsData from '../../assets/data/chapter_headings.json';
import chapterHeadingsHebData from '../../assets/data/chapter_headings_heb.json';
import scriptureVersesData from '../../assets/data/scripture_verses.json';

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

// Cached parsed data
let _verses: Record<string, VerseData[]> | null = null;
let _crossrefs: Record<string, any> | null = null;
let _frontMatter: any[] | null = null;
let _rootsGlossary: Record<string, RootGlossaryInfo> | null = null;
let _chapterHeadings: Record<string, string> | null = null;
let _chapterHeadingsHeb: Record<string, string> | null = null;
let _scriptureVerses: Record<string, string> | null = null;

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

// Get verses for a specific chapter
export function getChapterVerses(chapterId: string): VerseData[] {
  const all = getVerses();
  return (all as any)[chapterId] || [];
}
