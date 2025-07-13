import React, { useState } from 'react';

interface ScaleSelectorProps {
  onScaleChange: (scale: string, root: string) => void;
}

const ScaleSelector: React.FC<ScaleSelectorProps> = ({ onScaleChange }) => {
  const [scale, setScale] = useState('diatonicMinor'); // Default to diatonicMinor
  const [root, setRoot] = useState('C'); // Default to C

  const handleScaleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newScale = event.target.value;
    setScale(newScale);
    onScaleChange(newScale, root);
  };

  const handleRootChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoot = event.target.value;
    setRoot(newRoot);
    onScaleChange(scale, newRoot);
  };

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
          {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(note => (
            <option key={note} value={note}>{note}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default ScaleSelector;
