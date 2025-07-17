/**
 * Note.ts
 *
 * Defines the Note class for representing musical notes, including pitch class, accidental, and octave.
 * Provides utilities for note naming, conversion, and manipulation.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */

import { type Accidental, Accidentals, type PitchClass } from './constants';

/**
 * Represents a musical note with pitch class, accidental, and octave.
 */
export class Note {
  pitchClass: PitchClass;
  accidental: Accidental;
  octave: number;

  /**
   * Create a new Note.
   * @param pitchClass - The pitch class (0-11)
   * @param accidental - The accidental (NATURAL, SHARP, FLAT)
   * @param octave - The octave number
   */
  constructor(pitchClass: PitchClass, accidental: Accidental = Accidentals.NATURAL, octave: number) {
    this.pitchClass = pitchClass;
    this.accidental = accidental;
    this.octave = octave;
  }

  /**
   * The chromatic index of the note (0-11).
   */
  get index(): number {
    return (this.pitchClass + this.accidental + 12) % 12;
  }

  /**
   * Get the note name for a given chromatic index, using unicode symbols.
   * @param index - Chromatic index (0-11)
   * @param preferFlat - Whether to use flats (♭) instead of sharps (♯)
   * @returns The note name as a string (e.g., 'C♯', 'E♭')
   */
  static getNoteName(index: number, preferFlat = false): string {
    const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    return preferFlat ? FLAT_NAMES[index] : SHARP_NAMES[index];
  }

  /**
   * Create a Note from a chromatic index and octave.
   * @param index - Chromatic index (0-11)
   * @param octave - Octave number
   * @param preferFlat - Whether to use flats (♭) instead of sharps (♯)
   * @returns A new Note instance
   */
  static fromIndex(index: number, octave: number, preferFlat = false): Note {
    const SHARP_COMPONENTS: Record<number, [PitchClass, number]> = {
      0: [0, 0],   // C
      1: [0, 1],   // C♯
      2: [2, 0],   // D
      3: [2, 1],   // D♯
      4: [4, 0],   // E
      5: [5, 0],   // F
      6: [5, 1],   // F♯
      7: [7, 0],   // G
      8: [7, 1],   // G♯
      9: [9, 0],   // A
      10: [9, 1],  // A♯
      11: [11, 0], // B
    };

    const FLAT_COMPONENTS: Record<number, [PitchClass, number]> = {
      0: [0, 0],    // C
      1: [2, -1],   // D♭
      2: [2, 0],    // D
      3: [4, -1],   // E♭
      4: [4, 0],    // E
      5: [5, 0],    // F
      6: [7, -1],   // G♭
      7: [7, 0],    // G
      8: [9, -1],   // A♭
      9: [9, 0],    // A
      10: [11, -1], // B♭
      11: [11, 0],  // B
    };

    const [pc, acc] = preferFlat ? FLAT_COMPONENTS[index] : SHARP_COMPONENTS[index];
    return new Note(pc as PitchClass, acc as Accidental, octave);
  }

  /**
   * Get the MIDI number for this note.
   */
  getMidiNumber(): number {
    return this.octave * 12 + this.index;
  }

  /**
   * Get the frequency (Hz) for this note.
   * @param a4Freq - Reference frequency for A4 (default 440 Hz)
   */
  getFrequency(a4Freq = 440): number {
    const midi = this.getMidiNumber();
    return +(a4Freq * Math.pow(2, (midi - 69) / 12)).toFixed(2);
  }

  /**
   * Get a new Note a given number of half steps away from this note.
   * @param steps - Number of half steps
   * @returns A new Note instance
   */
  getHalfStepNote(steps: number): Note {
    const newMidi = this.getMidiNumber() + steps;
    const newIndex = (newMidi + 1200) % 12;
    const newOctave = Math.floor(newMidi / 12);
    return Note.fromIndex(newIndex, newOctave);
  }

  /**
   * Get the string representation of the note (e.g., 'C♯4', 'E♭3').
   * @param preferFlat - Whether to use flats (♭) instead of sharps (♯)
   * @returns The note name with octave
   */
  toString(preferFlat = false): string {
    return `${Note.getNoteName(this.index, preferFlat)}${this.octave}`;
  }

  /**
   * Check if this note is equal to another note (ignores octave).
   * @param other - The other Note to compare
   * @returns True if pitch class and accidental match
   */
  equals(other: Note): boolean {
    return this.index === other.index;
  }
}

/**
 * Get the interval name between two notes (ignoring octave).
 * @param from - The root/center Note
 * @param to - The Note to compare
 * @returns Interval name (e.g., P1, m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7)
 */
export function getIntervalName(from: Note, to: Note): string {
  const semitones = (to.index - from.index + 12) % 12;
  const intervalNames = [
    'P1',  // 0
    'm2',  // 1
    'M2',  // 2
    'm3',  // 3
    'M3',  // 4
    'P4',  // 5
    'TT',  // 6 (tritone)
    'P5',  // 7
    'm6',  // 8
    'M6',  // 9
    'm7',  // 10
    'M7',  // 11
  ];
  return intervalNames[semitones];
}
