/**
 * theory.ts
 *
 * Comprehensive music theory analysis library for the fretboard visualizer.
 * Provides key detection, scale degree analysis, interval analysis, and harmonic relationships.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */

import { Note } from './Note';
import { Accidentals, PitchClasses } from './constants';

/**
 * Represents a musical key with its tonic and mode
 */
export interface Key {
  tonic: string;
  mode: 'major' | 'minor';
  keySignature: string[];
}

/**
 * Represents a scale degree with its function and quality
 */
export interface ScaleDegree {
  degree: number;
  note: string;
  function: string;
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'perfect';
  chordFunction?: string; // Roman numeral for chord function
}

/**
 * Represents an interval between two notes
 */
export interface Interval {
  from: string;
  to: string;
  semitones: number;
  quality: string;
  name: string;
  consonance: 'consonant' | 'dissonant' | 'neutral';
}

/**
 * Represents a chord with its analysis
 */
export interface ChordAnalysis {
  notes: string[];
  root: string;
  quality: string;
  extensions: string[];
  romanNumeral: string;
  function: string;
}

/**
 * Theory analysis results for a set of notes
 */
export interface TheoryAnalysis {
  detectedKey?: Key;
  scaleDegrees: ScaleDegree[];
  intervals: Interval[];
  chordAnalysis?: ChordAnalysis;
  harmonicTension: number;
  suggestions: string[];
}

/**
 * Major scale intervals (W-W-H-W-W-W-H)
 */
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];

/**
 * Natural minor scale intervals (W-H-W-W-H-W-W)
 */
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

/**
 * Scale degree names and functions
 */
const SCALE_DEGREE_INFO = [
  { name: 'Tonic', function: 'I', quality: 'perfect' },
  { name: 'Supertonic', function: 'ii', quality: 'minor' },
  { name: 'Mediant', function: 'iii', quality: 'minor' },
  { name: 'Subdominant', function: 'IV', quality: 'major' },
  { name: 'Dominant', function: 'V', quality: 'major' },
  { name: 'Submediant', function: 'vi', quality: 'minor' },
  { name: 'Leading Tone', function: 'vii°', quality: 'diminished' },
];

/**
 * Interval qualities and names
 */
const INTERVAL_QUALITIES = {
  0: { name: 'Perfect Unison', consonance: 'consonant' },
  1: { name: 'Minor Second', consonance: 'dissonant' },
  2: { name: 'Major Second', consonance: 'dissonant' },
  3: { name: 'Minor Third', consonance: 'consonant' },
  4: { name: 'Major Third', consonance: 'consonant' },
  5: { name: 'Perfect Fourth', consonance: 'neutral' },
  6: { name: 'Tritone', consonance: 'dissonant' },
  7: { name: 'Perfect Fifth', consonance: 'consonant' },
  8: { name: 'Minor Sixth', consonance: 'consonant' },
  9: { name: 'Major Sixth', consonance: 'consonant' },
  10: { name: 'Minor Seventh', consonance: 'dissonant' },
  11: { name: 'Major Seventh', consonance: 'dissonant' },
  12: { name: 'Perfect Octave', consonance: 'consonant' },
};

/**
 * Key signatures for all major and minor keys
 */
const KEY_SIGNATURES: Record<string, string[]> = {
  // Major keys
  'C': [],
  'G': ['F♯'],
  'D': ['F♯', 'C♯'],
  'A': ['F♯', 'C♯', 'G♯'],
  'E': ['F♯', 'C♯', 'G♯', 'D♯'],
  'B': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯'],
  'F♯': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯'],
  'C♯': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'],
  
  // Flat major keys
  'F': ['B♭'],
  'B♭': ['B♭', 'E♭'],
  'E♭': ['B♭', 'E♭', 'A♭'],
  'A♭': ['B♭', 'E♭', 'A♭', 'D♭'],
  'D♭': ['B♭', 'E♭', 'A♭', 'D♭', 'G♭'],
  'G♭': ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭'],
  'C♭': ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'],
  
  // Minor keys (relative minors)
  'Am': ['C', 'F', 'G'], // A minor (relative to C major)
  'Em': ['F♯', 'C♯'], // E minor (relative to G major)
  'Bm': ['F♯', 'C♯', 'G♯'], // B minor (relative to D major)
  'F♯m': ['F♯', 'C♯', 'G♯', 'D♯'], // F♯ minor (relative to A major)
  'C♯m': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯'], // C♯ minor (relative to E major)
  'G♯m': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯'], // G♯ minor (relative to B major)
  'D♯m': ['F♯', 'C♯', 'G♯', 'D♯', 'A♯', 'E♯', 'B♯'], // D♯ minor (relative to F♯ major)
  
  // Flat minor keys
  'Dm': ['B♭', 'E♭'], // D minor (relative to F major)
  'Gm': ['B♭', 'E♭', 'A♭'], // G minor (relative to B♭ major)
  'Cm': ['B♭', 'E♭', 'A♭', 'D♭'], // C minor (relative to E♭ major)
  'Fm': ['B♭', 'E♭', 'A♭', 'D♭', 'G♭'], // F minor (relative to A♭ major)
  'B♭m': ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭'], // B♭ minor (relative to D♭ major)
  'E♭m': ['B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'C♭', 'F♭'], // E♭ minor (relative to G♭ major)
};

/**
 * Detect the most likely key from a set of notes
 */
export function detectKey(notes: string[]): Key | undefined {
  if (notes.length === 0) return undefined;
  
  // Count frequency of each note
  const noteCount: Record<string, number> = {};
  notes.forEach(note => {
    const cleanNote = note.replace(/[0-9]/g, '');
    noteCount[cleanNote] = (noteCount[cleanNote] || 0) + 1;
  });
  
  // Try to match against major and minor scales
  const possibleKeys: Array<{ key: Key; score: number }> = [];
  
  // Test all major keys
  for (const [tonic, signature] of Object.entries(KEY_SIGNATURES)) {
    if (signature.length <= 7) { // Only test reasonable keys
      const majorScale = generateScale(tonic, 'major');
      const score = calculateKeyScore(majorScale, noteCount);
      possibleKeys.push({
        key: { tonic, mode: 'major', keySignature: signature },
        score
      });
    }
  }
  
  // Test all minor keys
  for (const [tonic, signature] of Object.entries(KEY_SIGNATURES)) {
    if (signature.length <= 7 && tonic.endsWith('m')) {
      const cleanTonic = tonic.replace('m', '');
      const minorScale = generateScale(cleanTonic, 'minor');
      const score = calculateKeyScore(minorScale, noteCount);
      possibleKeys.push({
        key: { tonic: cleanTonic, mode: 'minor', keySignature: signature },
        score
      });
    }
  }
  
  // Return the key with the highest score
  possibleKeys.sort((a, b) => b.score - a.score);
  return possibleKeys[0]?.score > 0.3 ? possibleKeys[0].key : undefined;
}

/**
 * Generate a scale from a root note and mode
 */
function generateScale(root: string, mode: 'major' | 'minor'): string[] {
  const intervals = mode === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
  const rootNote = new Note(PitchClasses[root as keyof typeof PitchClasses] || 0, Accidentals.NATURAL, 4);
  
  return intervals.map(interval => {
    const note = rootNote.getHalfStepNote(interval);
    return note.toString(true).replace(/[0-9]/g, ''); // Use flat notation
  });
}

/**
 * Calculate how well a scale matches the given notes
 */
function calculateKeyScore(scale: string[], noteCount: Record<string, number>): number {
  let score = 0;
  let totalNotes = 0;
  
  // Count total notes
  Object.values(noteCount).forEach(count => {
    totalNotes += count;
  });
  
  // Score based on scale notes present
  scale.forEach(scaleNote => {
    if (noteCount[scaleNote]) {
      score += noteCount[scaleNote] / totalNotes;
    }
  });
  
  // Bonus for having the tonic
  if (noteCount[scale[0]]) {
    score += 0.2;
  }
  
  // Bonus for having the dominant (5th scale degree)
  if (noteCount[scale[4]]) {
    score += 0.1;
  }
  
  return score;
}

/**
 * Analyze scale degrees for a set of notes in a given key
 */
export function analyzeScaleDegrees(notes: string[], key: Key): ScaleDegree[] {
  const scale = generateScale(key.tonic, key.mode);
  const scaleDegrees: ScaleDegree[] = [];
  
  notes.forEach(note => {
    const cleanNote = note.replace(/[0-9]/g, '');
    const degreeIndex = scale.indexOf(cleanNote);
    
    if (degreeIndex !== -1) {
      const degreeInfo = SCALE_DEGREE_INFO[degreeIndex];
      scaleDegrees.push({
        degree: degreeIndex + 1,
        note: cleanNote,
        function: degreeInfo.name,
        quality: degreeInfo.quality as 'major' | 'minor' | 'diminished' | 'augmented' | 'perfect',
        chordFunction: degreeInfo.function
      });
    }
  });
  
  return scaleDegrees;
}

/**
 * Analyze intervals between all pairs of notes
 */
export function analyzeIntervals(notes: string[]): Interval[] {
  const intervals: Interval[] = [];
  
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      const from = notes[i].replace(/[0-9]/g, '');
      const to = notes[j].replace(/[0-9]/g, '');
      
      const interval = calculateInterval(from, to);
      if (interval) {
        intervals.push(interval);
      }
    }
  }
  
  return intervals;
}

/**
 * Calculate the interval between two notes
 */
function calculateInterval(from: string, to: string): Interval | null {
  try {
    const fromNote = new Note(PitchClasses[from as keyof typeof PitchClasses] || 0, Accidentals.NATURAL, 4);
    const toNote = new Note(PitchClasses[to as keyof typeof PitchClasses] || 0, Accidentals.NATURAL, 4);
    
    const semitones = (toNote.index - fromNote.index + 12) % 12;
    const intervalInfo = INTERVAL_QUALITIES[semitones as keyof typeof INTERVAL_QUALITIES];
    
    if (!intervalInfo) return null;
    
    return {
      from,
      to,
      semitones,
      quality: intervalInfo.name.split(' ')[0],
      name: intervalInfo.name,
      consonance: intervalInfo.consonance as 'consonant' | 'dissonant' | 'neutral'
    };
  } catch {
    return null;
  }
}

/**
 * Analyze chord from a set of notes
 */
export function analyzeChord(notes: string[]): ChordAnalysis | undefined {
  if (notes.length < 3) return undefined;
  
  const cleanNotes = notes.map(note => note.replace(/[0-9]/g, ''));
  const uniqueNotes = [...new Set(cleanNotes)];
  
  if (uniqueNotes.length < 3) return undefined;
  
  // Simple chord analysis - in a real implementation, this would be more sophisticated
  const root = uniqueNotes[0];
  const third = uniqueNotes[1];
  const fifth = uniqueNotes[2];
  
  // Determine chord quality based on intervals
  const rootToThird = calculateInterval(root, third);
  const rootToFifth = calculateInterval(root, fifth);
  
  let quality = 'unknown';
  let romanNumeral = '';
  let function_ = '';
  
  if (rootToThird && rootToFifth) {
    if (rootToThird.semitones === 4 && rootToFifth.semitones === 7) {
      quality = 'major';
      romanNumeral = 'I';
      function_ = 'Tonic';
    } else if (rootToThird.semitones === 3 && rootToFifth.semitones === 7) {
      quality = 'minor';
      romanNumeral = 'i';
      function_ = 'Tonic';
    } else if (rootToThird.semitones === 3 && rootToFifth.semitones === 6) {
      quality = 'diminished';
      romanNumeral = 'i°';
      function_ = 'Leading Tone';
    }
  }
  
  return {
    notes: uniqueNotes,
    root,
    quality,
    extensions: uniqueNotes.slice(3),
    romanNumeral,
    function: function_
  };
}

/**
 * Calculate harmonic tension of a set of notes
 */
export function calculateHarmonicTension(notes: string[]): number {
  const intervals = analyzeIntervals(notes);
  let tension = 0;
  
  intervals.forEach(interval => {
    if (interval.consonance === 'dissonant') {
      tension += 1;
    } else if (interval.consonance === 'consonant') {
      tension -= 0.5;
    }
  });
  
  return Math.max(0, Math.min(10, tension + 5)); // Normalize to 0-10
}

/**
 * Generate theory suggestions based on analysis
 */
export function generateSuggestions(analysis: TheoryAnalysis): string[] {
  const suggestions: string[] = [];
  
  if (analysis.detectedKey) {
    suggestions.push(`Key detected: ${analysis.detectedKey.tonic} ${analysis.detectedKey.mode}`);
    
    if (analysis.scaleDegrees.length > 0) {
      const tonic = analysis.scaleDegrees.find(d => d.degree === 1);
      if (!tonic) {
        suggestions.push('Try adding the tonic note for stronger key establishment');
      }
    }
  }
  
  if (analysis.harmonicTension > 7) {
    suggestions.push('High harmonic tension - consider resolving dissonant intervals');
  } else if (analysis.harmonicTension < 3) {
    suggestions.push('Low harmonic tension - consider adding more complex harmonies');
  }
  
  if (analysis.intervals.length > 0) {
    const dissonantIntervals = analysis.intervals.filter(i => i.consonance === 'dissonant');
    if (dissonantIntervals.length > 0) {
      suggestions.push(`Dissonant intervals present: ${dissonantIntervals.map(i => i.name).join(', ')}`);
    }
  }
  
  return suggestions;
}

/**
 * Perform comprehensive theory analysis on a set of notes
 */
export function analyzeTheory(notes: string[]): TheoryAnalysis {
  const detectedKey = detectKey(notes);
  const scaleDegrees = detectedKey ? analyzeScaleDegrees(notes, detectedKey) : [];
  const intervals = analyzeIntervals(notes);
  const chordAnalysis = analyzeChord(notes);
  const harmonicTension = calculateHarmonicTension(notes);
  
  const analysis: TheoryAnalysis = {
    detectedKey,
    scaleDegrees,
    intervals,
    chordAnalysis,
    harmonicTension,
    suggestions: []
  };
  
  analysis.suggestions = generateSuggestions(analysis);
  
  return analysis;
} 