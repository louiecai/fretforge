import {Note} from './Note';
import {type Accidental, Accidentals, type PitchClass, PitchClasses} from './constants';

const STANDARD_TUNING: [PitchClass, Accidental, number][] = [
  [PitchClasses.E, Accidentals.NATURAL, 2],
  [PitchClasses.A, Accidentals.NATURAL, 2],
  [PitchClasses.D, Accidentals.NATURAL, 3],
  [PitchClasses.G, Accidentals.NATURAL, 3],
  [PitchClasses.B, Accidentals.NATURAL, 3],
  [PitchClasses.E, Accidentals.NATURAL, 4],
];


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
    };

    const intervals = scaleIntervals[scaleType];
    if (!intervals) {
      throw new Error(`Unknown scale type: ${scaleType}`);
    }

    const scaleNotes: Note[] = intervals.map(interval => rootNote.getHalfStepNote(interval));

    // Ensure all notes are unique (e.g., avoid duplicates in scales like blues)
    return scaleNotes.filter((note, index, self) =>
      index === self.findIndex(n => n.equals(note))
    );
  }
}
