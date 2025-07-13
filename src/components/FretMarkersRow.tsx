import React from 'react';

const FretMarkersRow: React.FC<{ numFrets: number }> = ({numFrets}) => (
  <>
    <div></div>
    {Array.from({length: numFrets + 1}, (_, fret) => (
      <div key={`marker-${fret}`} className="flex items-center justify-center h-5 text-xs text-gray-500">
        {[3, 5, 7, 9, 15, 17, 19, 21].includes(fret)
          ? '•'
          : fret === 12 || fret === 24
            ? '••'
            : ''}
      </div>
    ))}
  </>
);

export default FretMarkersRow;
