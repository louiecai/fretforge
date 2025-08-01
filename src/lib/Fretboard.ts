/**
 * Fretboard.ts
 *
 * Provides the Fretboard class for generating and managing a guitar fretboard model.
 * Includes utilities for converting string tunings, generating fretboard notes, and calculating scale/chord notes.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */

import { Note } from './Note';
import { type Accidental, Accidentals, type PitchClass, PitchClasses } from './constants';

/**
 * The standard tuning for a 6-string guitar (E2, A2, D3, G3, B3, E4).
 */
const STANDARD_TUNING: [PitchClass, Accidental, number][] = [
  [PitchClasses.E, Accidentals.NATURAL, 2],
  [PitchClasses.A, Accidentals.NATURAL, 2],
  [PitchClasses.D, Accidentals.NATURAL, 3],
  [PitchClasses.G, Accidentals.NATURAL, 3],
  [PitchClasses.B, Accidentals.NATURAL, 3],
  [PitchClasses.E, Accidentals.NATURAL, 4],
];

/**
 * Convert a string tuning array (e.g., ["E2", "A2", ...]) to Note format.
 * Accepts both ASCII (#/b) and unicode (♯/♭) accidentals, but always outputs unicode.
 * @param tuning - Array of string notes with octaves (e.g., ["E2", "C♯3"])
 * @returns Array of [PitchClass, Accidental, octave] tuples
 */
export function stringTuningToNotes(tuning: string[]): [PitchClass, Accidental, number][] {
  const noteMap: Record<string, [PitchClass, Accidental]> = {
    'C': [PitchClasses.C, Accidentals.NATURAL],
    'C#': [PitchClasses.C, Accidentals.SHARP],
    'C♯': [PitchClasses.C, Accidentals.SHARP],
    'Db': [PitchClasses.D, Accidentals.FLAT],
    'D♭': [PitchClasses.D, Accidentals.FLAT],
    'D': [PitchClasses.D, Accidentals.NATURAL],
    'D#': [PitchClasses.D, Accidentals.SHARP],
    'D♯': [PitchClasses.D, Accidentals.SHARP],
    'Eb': [PitchClasses.E, Accidentals.FLAT],
    'E♭': [PitchClasses.E, Accidentals.FLAT],
    'E': [PitchClasses.E, Accidentals.NATURAL],
    'F': [PitchClasses.F, Accidentals.NATURAL],
    'F#': [PitchClasses.F, Accidentals.SHARP],
    'F♯': [PitchClasses.F, Accidentals.SHARP],
    'Gb': [PitchClasses.G, Accidentals.FLAT],
    'G♭': [PitchClasses.G, Accidentals.FLAT],
    'G': [PitchClasses.G, Accidentals.NATURAL],
    'G#': [PitchClasses.G, Accidentals.SHARP],
    'G♯': [PitchClasses.G, Accidentals.SHARP],
    'Ab': [PitchClasses.A, Accidentals.FLAT],
    'A♭': [PitchClasses.A, Accidentals.FLAT],
    'A': [PitchClasses.A, Accidentals.NATURAL],
    'A#': [PitchClasses.A, Accidentals.SHARP],
    'A♯': [PitchClasses.A, Accidentals.SHARP],
    'Bb': [PitchClasses.B, Accidentals.FLAT],
    'B♭': [PitchClasses.B, Accidentals.FLAT],
    'B': [PitchClasses.B, Accidentals.NATURAL],
  };

  return tuning.map((noteWithOctave) => {
    // Accept both #/b and ♯/♭ in input, but always output unicode
    const match = noteWithOctave.match(/^([A-G](?:#|b|♯|♭)?)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid note format: ${noteWithOctave}. Expected format like "E4", "C♯3", etc.`);
    }
    
    let [, noteName, octaveStr] = match;
    noteName = noteName.replace('#', '♯').replace('b', '♭');
    const octave = parseInt(octaveStr, 10);
    
    const noteData = noteMap[noteName];
    if (!noteData) {
      throw new Error(`Unknown note: ${noteName}`);
    }
    
    return [noteData[0], noteData[1], octave] as [PitchClass, Accidental, number];
  });
}

/**
 * Fretboard class for generating and managing a guitar fretboard.
 */
export class Fretboard {
  strings: Note[];
  frets: number;
  board: Note[][];

  /**
   * Create a new Fretboard.
   * @param frets - Number of frets (default 22)
   * @param tuning - Array of [PitchClass, Accidental, octave] for each string
   */
  constructor(frets = 22, tuning = STANDARD_TUNING) {
    this.strings = tuning.map(([pc, acc, oct]) => new Note(pc, acc, oct));
    this.frets = frets;
    this.board = this.generateBoard();
  }

  /**
   * Get the Note at a given string and fret.
   * @param stringIndex - String index (0 = lowest string)
   * @param fret - Fret number
   * @returns The Note or null if out of bounds
   */
  getNote(stringIndex: number, fret: number): Note | null {
    if (
      stringIndex < 0 || stringIndex >= this.strings.length ||
      fret < 0 || fret > this.frets
    ) return null;
    return this.board[stringIndex][fret];
  }

  /**
   * Generate the 2D array of Notes for the fretboard.
   * @returns 2D array of Notes
   */
  private generateBoard(): Note[][] {
    return this.strings.map(openNote =>
      Array.from({ length: this.frets + 1 }, (_, fret) => openNote.getHalfStepNote(fret))
    );
  }

  /**
   * Get the full fretboard as a 2D array of Notes.
   * @returns 2D array of Notes
   */
  getFretboard(): Note[][] {
    return this.board;
  }

  /**
   * Get the fretboard as a 2D array of note strings (e.g., 'C♯4').
   * @param preferFlat - Whether to use flats (♭) instead of sharps (♯)
   * @returns 2D array of note strings
   */
  getFretboardAsStrings(preferFlat = false): string[][] {
    return this.board.map(row =>
      row.map(note => note.toString(preferFlat))
    );
  }

  /**
   * Get the notes for a given scale or chord type, starting from a root note.
   * @param rootNote - The root Note
   * @param scaleType - The scale or chord type string
   * @returns Array of Notes in the scale/chord
   */
  getScaleNotes(rootNote: Note, scaleType: string): Note[] {
    const scaleIntervals: Record<string, number[]> = {
      // Traditional Scales
      minor: [0, 2, 3, 5, 7, 8, 10],
      major: [0, 2, 4, 5, 7, 9, 11],
      harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
      melodicMinor: [0, 2, 3, 5, 7, 9, 11],
      pentatonicMinor: [0, 3, 5, 7, 10],
      pentatonicMajor: [0, 2, 4, 7, 9],
      bluesMinor: [0, 3, 5, 6, 7, 10],
      bluesMajor: [0, 2, 3, 4, 7, 9],

      // Modes
      dorian: [0, 2, 3, 5, 7, 9, 10],
      phrygian: [0, 1, 4, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      mixolydian: [0, 2, 4, 5, 7, 9, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10],

      // Jazz Scales
      altered: [0, 1, 3, 4, 6, 8, 10],
      lydianDominant: [0, 2, 4, 6, 7, 9, 10],
      wholeTone: [0, 2, 4, 6, 8, 10],
      diminished: [0, 2, 3, 5, 6, 8, 9, 11],

      // World Music Scales
      hirajoshi: [0, 2, 3, 7, 8],
      phrygianDominant: [0, 1, 4, 5, 7, 8, 10],
      hungarianMinor: [0, 2, 3, 6, 7, 8, 11],
      persian: [0, 1, 4, 5, 6, 8, 11],

      // Modern Scales
      octatonic: [0, 2, 3, 5, 6, 8, 9, 11],
      hexatonic: [0, 2, 4, 6, 8, 10],
      chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      tritone: [0, 6],

      // Chords
      maj: [0, 4, 7], // Major triad
      min: [0, 3, 7], // Minor triad
      dim: [0, 3, 6], // Diminished triad
      aug: [0, 4, 8], // Augmented triad
      maj7: [0, 4, 7, 11], // Major 7th
      min7: [0, 3, 7, 10], // Minor 7th
      '7': [0, 4, 7, 10], // Dominant 7th
      dim7: [0, 3, 6, 9], // Diminished 7th
      m7b5: [0, 3, 6, 10], // Half-diminished 7th
      maj9: [0, 4, 7, 11, 14], // Major 9th
      min9: [0, 3, 7, 10, 14], // Minor 9th
      '9': [0, 4, 7, 10, 14], // Dominant 9th
      maj6: [0, 4, 7, 9], // Major 6th
      min6: [0, 3, 7, 9], // Minor 6th
      sus2: [0, 2, 7], // Suspended 2nd
      sus4: [0, 5, 7], // Suspended 4th
    };

    const intervals = scaleIntervals[scaleType];
    if (!intervals) {
      throw new Error(`Unknown scale or chord type: ${scaleType}`);
    }

    const scaleNotes: Note[] = intervals.map(interval => rootNote.getHalfStepNote(interval));

    // Ensure all notes are unique (e.g., avoid duplicates in scales like blues)
    return scaleNotes.filter((note, index, self) =>
      index === self.findIndex(n => n.equals(note))
    );
  }
}
