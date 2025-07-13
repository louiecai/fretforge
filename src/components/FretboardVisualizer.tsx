import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Accidentals, type PitchClass } from '../lib/constants'; // Corrected import for PitchClass
import { Fretboard } from '../lib/Fretboard';
import { Note } from "../lib/Note.ts";
import FretboardGrid from './FretboardGrid';
import ScaleManager from './ScaleManager';
import Tooltip from './Tooltip';

interface Props {
  preferFlat?: boolean;
  numFrets?: number;
}

const FretboardVisualizer: React.FC<Props> = ({
  preferFlat = false,
  numFrets = 22,
}) => {
  const fretboard = React.useMemo(() => new Fretboard(numFrets), [numFrets]);
  const board = React.useMemo(() => fretboard.getFretboard(), [fretboard]);

  const [hoveredNote, setHoveredNote] = useState<{
    string: number;
    fret: number;
    noteStr: string;
    x: number;
    y: number;
  } | null>(null);

  const [scales, setScales] = useState<{ scale: string; root: string; color: string }[]>([]);
  const [highlightedNotes, setHighlightedNotes] = useState<Record<string, string[]>>({});

  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHoverStart = (info: typeof hoveredNote) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setHoveredNote(info);
    }, 800);
  };

  const handleHoverEnd = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredNote(null);
  };

  const handleAddScale = (scale: string, root: string, color: string) => {
    console.log('Adding scale:', { scale, root, color });
    setScales((prev) => {
      const newScales = [...prev, { scale, root, color }];
      console.log('New scales state:', newScales);
      return newScales;
    });
  };

  const handleRemoveScale = (index: number) => {
    console.log('Removing scale at index:', index);
    setScales((prev) => {
      const newScales = prev.filter((_, i) => i !== index);
      console.log('New scales state after removal:', newScales);
      return newScales;
    });
  };

  useEffect(() => {
    console.log('useEffect triggered with scales:', scales);
    const highlightedNotes: Record<string, string[]> = {};

    scales.forEach(({ scale, root, color }) => {
      console.log('Processing scale:', { scale, root, color });
      const rootIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(root);
      const rootNote = new Note(rootIndex as PitchClass, Accidentals.NATURAL, 4);
      const scaleNotes = fretboard.getScaleNotes(rootNote, scale);
      console.log('Scale notes for', root, scale, ':', scaleNotes.map(n => n.toString(preferFlat)));

      scaleNotes.forEach((note) => {
        // Remove octave number to match the fretboard display format
        const noteStr = note.toString(preferFlat).replace(/[0-9]/g, '');
        if (!highlightedNotes[noteStr]) highlightedNotes[noteStr] = [];
        highlightedNotes[noteStr].push(color);
      });
    });

    console.log('Final highlighted notes:', highlightedNotes);
    setHighlightedNotes(highlightedNotes);
  }, [scales, preferFlat, fretboard]);

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <div className="overflow-x-auto p-2 sm:p-4 bg-gray-800 text-white rounded-lg">
        <FretboardGrid
          board={board}
          highlightedNotes={highlightedNotes}
          preferFlat={preferFlat}
          hasScalesSelected={scales.length > 0}
          onNoteHoverStart={(info) => handleHoverStart({
            ...info,
            noteStr: info.noteStr,
          })}
          onNoteHoverEnd={handleHoverEnd}
        />
        {hoveredNote && (
          <Tooltip
            x={hoveredNote.x - 10}
            y={hoveredNote.y + 20}
            text={hoveredNote.noteStr}
          />
        )}
      </div>

      <div className="mt-4 p-2 sm:p-4 bg-gray-800 rounded-lg">
        <div className="mb-4">
          <ScaleManager onAddScale={handleAddScale} />
        </div>

        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-bold mb-2">Added Scales:</h2>
          <ul className="space-y-2">
            {scales.map((scale, index) => (
              <li key={index} className="flex items-center justify-between space-x-2 sm:space-x-4">
                <span className="text-xs sm:text-sm">{scale.root} {scale.scale}</span>
                <button
                  onClick={() => handleRemoveScale(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden sm:block">
          <h2 className="text-base sm:text-lg font-bold mb-2">Highlighted Notes:</h2>
          <pre className="bg-gray-700 p-2 sm:p-4 rounded text-xs overflow-auto">
            {JSON.stringify(highlightedNotes, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default FretboardVisualizer;
