import {type Accidental, Accidentals, type PitchClass} from './constants';

export class Note {
  pitchClass: PitchClass;
  accidental: Accidental;
  octave: number;

  constructor(pitchClass: PitchClass, accidental: Accidental = Accidentals.NATURAL, octave: number) {
    this.pitchClass = pitchClass;
    this.accidental = accidental;
    this.octave = octave;
  }

  get index(): number {
    return (this.pitchClass + this.accidental + 12) % 12;
  }

  static getNoteName(index: number, preferFlat = false): string {
    const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    return preferFlat ? FLAT_NAMES[index] : SHARP_NAMES[index];
  }

  static fromIndex(index: number, octave: number, preferFlat = false): Note {
    const SHARP_COMPONENTS: Record<number, [PitchClass, number]> = {
      0: [0, 0],   // C
      1: [0, 1],   // C#
      2: [2, 0],   // D
      3: [2, 1],   // D#
      4: [4, 0],   // E
      5: [5, 0],   // F
      6: [5, 1],   // F#
      7: [7, 0],   // G
      8: [7, 1],   // G#
      9: [9, 0],   // A
      10: [9, 1],  // A#
      11: [11, 0], // B
    };

    const FLAT_COMPONENTS: Record<number, [PitchClass, number]> = {
      0: [0, 0],    // C
      1: [2, -1],   // Db
      2: [2, 0],    // D
      3: [4, -1],   // Eb
      4: [4, 0],    // E
      5: [5, 0],    // F
      6: [7, -1],   // Gb
      7: [7, 0],    // G
      8: [9, -1],   // Ab
      9: [9, 0],    // A
      10: [11, -1], // Bb
      11: [11, 0],  // B
    };

    const [pc, acc] = preferFlat ? FLAT_COMPONENTS[index] : SHARP_COMPONENTS[index];
    return new Note(pc as PitchClass, acc as Accidental, octave);
  }

  getMidiNumber(): number {
    return this.octave * 12 + this.index;
  }

  getFrequency(a4Freq = 440): number {
    const midi = this.getMidiNumber();
    return +(a4Freq * Math.pow(2, (midi - 69) / 12)).toFixed(2);
  }

  getHalfStepNote(steps: number): Note {
    const newMidi = this.getMidiNumber() + steps;
    const newIndex = (newMidi + 1200) % 12;
    const newOctave = Math.floor(newMidi / 12);
    return Note.fromIndex(newIndex, newOctave);
  }

  toString(preferFlat = false): string {
    return `${Note.getNoteName(this.index, preferFlat)}${this.octave}`;
  }

  equals(other: Note): boolean {
    return this.index === other.index && this.octave === other.octave;
  }

  distanceTo(other: Note): number {
    return other.getMidiNumber() - this.getMidiNumber();
  }
}
