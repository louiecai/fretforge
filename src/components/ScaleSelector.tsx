/**
 * ScaleSelector.tsx
 *
 * Provides a dropdown selector for choosing a scale type and root note.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */

import React, { useState } from 'react';

/**
 * Props for ScaleSelector component.
 */
interface ScaleSelectorProps {
  /** Callback when the scale or root changes */
  onScaleChange: (scale: string, root: string) => void;
  /** Whether to display notes as flats (♭) or sharps (♯) */
  preferFlat?: boolean;
}

const ScaleSelector: React.FC<ScaleSelectorProps> = ({ onScaleChange, preferFlat = false }) => {
  const [scale, setScale] = useState('diatonicMinor'); // Default to diatonicMinor
  const [root, setRoot] = useState('C'); // Default to C

  /**
   * Handles the change of the scale type.
   * @param event - The event triggered by the scale dropdown.
   */
  const handleScaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newScale = event.target.value;
    setScale(newScale);
    onScaleChange(newScale, root);
  };

  /**
   * Handles the change of the root note.
   * @param event - The event triggered by the root dropdown.
   */
  const handleRootChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoot = event.target.value;
    setRoot(newRoot);
    onScaleChange(scale, newRoot);
  };

  // Generate root note options based on preferFlat
  const ROOTS = Array.from({ length: 12 }, (_, i) => require('../lib/Note').Note.getNoteName(i, preferFlat));

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
      <label className="text-white text-sm">
        Scale:
        <select
          value={scale}
          onChange={handleScaleChange}
          className="ml-2 p-1 sm:p-2 bg-gray-800 text-white rounded text-xs sm:text-sm"
        >
          <option value="diatonicMinor">Diatonic Minor</option>
          <option value="diatonicMajor">Diatonic Major</option>
          <option value="pentatonicMinor">Pentatonic Minor</option>
          <option value="pentatonicMajor">Pentatonic Major</option>
          <option value="bluesMinor">Blues Minor</option>
          <option value="bluesMajor">Blues Major</option>
        </select>
      </label>

      <label className="text-white text-sm">
        Root:
        <select
          value={root}
          onChange={handleRootChange}
          className="ml-2 p-1 sm:p-2 bg-gray-800 text-white rounded text-xs sm:text-sm"
        >
          {ROOTS.map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default ScaleSelector;
