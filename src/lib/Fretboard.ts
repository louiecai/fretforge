import { Note } from './Note';
import { type Accidental, Accidentals, type PitchClass, PitchClasses } from './constants';

const STANDARD_TUNING: [PitchClass, Accidental, number][] = [
  [PitchClasses.E, Accidentals.NATURAL, 2],
  [PitchClasses.A, Accidentals.NATURAL, 2],
  [PitchClasses.D, Accidentals.NATURAL, 3],
  [PitchClasses.G, Accidentals.NATURAL, 3],
  [PitchClasses.B, Accidentals.NATURAL, 3],
  [PitchClasses.E, Accidentals.NATURAL, 4],
];

// Utility function to convert string tuning to Note format
export function stringTuningToNotes(tuning: string[]): [PitchClass, Accidental, number][] {
  const noteMap: Record<string, [PitchClass, Accidental]> = {
    'C': [PitchClasses.C, Accidentals.NATURAL],
    'C#': [PitchClasses.C, Accidentals.SHARP],
    'Db': [PitchClasses.D, Accidentals.FLAT],
    'D': [PitchClasses.D, Accidentals.NATURAL],
    'D#': [PitchClasses.D, Accidentals.SHARP],
    'Eb': [PitchClasses.E, Accidentals.FLAT],
    'E': [PitchClasses.E, Accidentals.NATURAL],
    'F': [PitchClasses.F, Accidentals.NATURAL],
    'F#': [PitchClasses.F, Accidentals.SHARP],
    'Gb': [PitchClasses.G, Accidentals.FLAT],
    'G': [PitchClasses.G, Accidentals.NATURAL],
    'G#': [PitchClasses.G, Accidentals.SHARP],
    'Ab': [PitchClasses.A, Accidentals.FLAT],
    'A': [PitchClasses.A, Accidentals.NATURAL],
    'A#': [PitchClasses.A, Accidentals.SHARP],
    'Bb': [PitchClasses.B, Accidentals.FLAT],
    'B': [PitchClasses.B, Accidentals.NATURAL],
  };

  return tuning.map((noteWithOctave) => {
    // Extract note name and octave (e.g., "E4" -> note="E", octave=4)
    const match = noteWithOctave.match(/^([A-G]#?b?)(\d+)$/);
    if (!match) {
      throw new Error(`Invalid note format: ${noteWithOctave}. Expected format like "E4", "C#3", etc.`);
    }
    
    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    
    const noteData = noteMap[noteName];
    if (!noteData) {
      throw new Error(`Unknown note: ${noteName}`);
    }
    
    return [noteData[0], noteData[1], octave] as [PitchClass, Accidental, number];
  });
}


export class Fretboard {
  strings: Note[];
  frets: number;
  board: Note[][];

  constructor(frets = 22, tuning = STANDARD_TUNING) {
    this.strings = tuning.map(([pc, acc, oct]) => new Note(pc, acc, oct));
    this.frets = frets;
    this.board = this.generateBoard();
  }

  getNote(stringIndex: number, fret: number): Note | null {
    if (
      stringIndex < 0 || stringIndex >= this.strings.length ||
      fret < 0 || fret > this.frets
    ) return null;
    return this.board[stringIndex][fret];
  }

  getFretboard(): Note[][] {
    return this.board;
  }

  getFretboardAsStrings(preferFlat = false): string[][] {
    return this.board.map(row =>
      row.map(note => note.toString(preferFlat))
    );
  }

  private generateBoard(): Note[][] {
    return this.strings.map(openNote =>
      Array.from({length: this.frets + 1}, (_, fret) =>
        openNote.getHalfStepNote(fret)
      )
    );
  }

  getScaleNotes(rootNote: Note, scaleType: string): Note[] {
    const scaleIntervals: Record<string, number[]> = {
      diatonicMinor: [0, 2, 3, 5, 7, 8, 10],
      diatonicMajor: [0, 2, 4, 5, 7, 9, 11],
      pentatonicMinor: [0, 3, 5, 7, 10],
      pentatonicMajor: [0, 2, 4, 7, 9],
      bluesMinor: [0, 3, 5, 6, 7, 10],
      bluesMajor: [0, 2, 3, 4, 7, 9],
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
