export const PitchClasses = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
} as const;

export type PitchClass = typeof PitchClasses[keyof typeof PitchClasses];

export const Accidentals = {
  NATURAL: 0,
  SHARP: 1,
  FLAT: -1,
} as const;

export type Accidental = typeof Accidentals[keyof typeof Accidentals];
