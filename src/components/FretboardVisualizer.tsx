import * as htmlToImage from 'html-to-image';
import Cookies from 'js-cookie';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Accidentals, type PitchClass } from '../lib/constants'; // Corrected import for PitchClass
import { Fretboard, stringTuningToNotes } from '../lib/Fretboard';
import { Note } from "../lib/Note.ts";
import FretboardGrid from './FretboardGrid';
import ScaleManager from './ScaleManager';
import Settings from './Settings';
import Tooltip from './Tooltip';

interface Props {
  preferFlat?: boolean;
  numFrets?: number;
}

const COOKIE_KEY = 'guitar-visualizer-prefs';

const FretboardVisualizer: React.FC<Props> = ({
  preferFlat = false,
  numFrets = 22,
}) => {
  // Load from cookie if present
  const cookiePrefs = (() => {
    try {
      const raw = Cookies.get(COOKIE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [currentNumFrets, setCurrentNumFrets] = useState(cookiePrefs?.numFrets ?? numFrets);
  const [currentPreferFlat, setCurrentPreferFlat] = useState(cookiePrefs?.preferFlat ?? preferFlat);
  const [numStrings, setNumStrings] = useState(cookiePrefs?.numStrings ?? 6);
  const [tuning, setTuning] = useState(cookiePrefs?.tuning ?? ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
  const [scales, setScales] = useState<{ scale: string; root: string; color: string }[]>(cookiePrefs?.scales ?? []);
  const [highlightedNotes, setHighlightedNotes] = useState<Record<string, string[]>>({});
  const [blendOverlaps, setBlendOverlaps] = useState(cookiePrefs?.blendOverlaps ?? false);

  // Add state for orientation warning
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);

  const fretboard = React.useMemo(() => {
    try {
      const tuningNotes = stringTuningToNotes(tuning);
      return new Fretboard(currentNumFrets, tuningNotes);
    } catch (error) {
      console.error('Invalid tuning:', error);
      return new Fretboard(currentNumFrets);
    }
  }, [currentNumFrets, tuning]);

  const board = React.useMemo(() => fretboard.getFretboard(), [fretboard]);

  const [hoveredNote, setHoveredNote] = useState<{
    string: number;
    fret: number;
    noteStr: string;
    x: number;
    y: number;
  } | null>(null);

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

  useEffect(() => {
    const highlightedNotes: Record<string, string[]> = {};
    scales.forEach(({ scale, root, color }) => {
      const rootIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(root);
      const rootNote = new Note(rootIndex as PitchClass, Accidentals.NATURAL, 4);
      const scaleNotes = fretboard.getScaleNotes(rootNote, scale);
      scaleNotes.forEach((note) => {
        const noteStr = note.toString(currentPreferFlat).replace(/[0-9]/g, '');
        if (!highlightedNotes[noteStr]) highlightedNotes[noteStr] = [];
        highlightedNotes[noteStr].push(color);
      });
    });
    setHighlightedNotes(highlightedNotes);
  }, [scales, currentPreferFlat, fretboard]);

  // Save preferences to cookie on change
  useEffect(() => {
    Cookies.set(
      COOKIE_KEY,
      JSON.stringify({
        numFrets: currentNumFrets,
        preferFlat: currentPreferFlat,
        numStrings,
        tuning,
        scales,
        blendOverlaps,
      }),
      { expires: 365 }
    );
  }, [currentNumFrets, currentPreferFlat, numStrings, tuning, scales, blendOverlaps]);

  // Check orientation and show warning if needed
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isPortrait = window.innerHeight > window.innerWidth;

      // Show warning for mobile devices in portrait mode or very narrow screens
      if (isMobile && isPortrait) {
        setShowOrientationWarning(true);
      } else if (!isMobile && isPortrait && window.innerWidth < 768) {
        setShowOrientationWarning(true);
      } else {
        setShowOrientationWarning(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const fretboardGridRef = useRef<HTMLDivElement>(null);

  const handleExportPng = async () => {
    if (!fretboardGridRef.current) return;
    const dataUrl = await htmlToImage.toPng(fretboardGridRef.current, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = 'fretboard.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      {/* Orientation Warning - as a banner instead of full overlay */}
      {showOrientationWarning && (
        <div className="bg-yellow-600 text-white p-3 text-center text-sm font-medium mb-4 rounded-lg shadow">
          <div className="flex items-center justify-center gap-2">
            <span>📱</span>
            <span>
              {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                ? "Rotate your device for better experience"
                : "Make the window wider for better experience"
              }
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button
          onClick={handleExportPng}
          className="px-3 py-1 bg-accent text-white rounded hover:bg-accentlight text-xs font-semibold shadow"
        >
          Export PNG
        </button>
      </div>
      <div className="p-1 sm:p-2 sm:pr-4 sm:pr-8 bg-panel text-textprimary rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold">Fretboard</h2>
          <Settings
            numFrets={currentNumFrets}
            onNumFretsChange={setCurrentNumFrets}
            preferFlat={currentPreferFlat}
            onPreferFlatChange={setCurrentPreferFlat}
            numStrings={numStrings}
            onNumStringsChange={setNumStrings}
            tuning={tuning}
            onTuningChange={setTuning}
            blendOverlaps={blendOverlaps}
            onBlendOverlapsChange={setBlendOverlaps}
          />
        </div>
        <div ref={fretboardGridRef}>
          <FretboardGrid
            board={board}
            highlightedNotes={highlightedNotes}
            preferFlat={currentPreferFlat}
            hasScalesSelected={scales.length > 0}
            blendOverlaps={blendOverlaps}
            onNoteHoverStart={(info) => handleHoverStart({
              ...info,
              noteStr: info.noteStr,
            })}
            onNoteHoverEnd={handleHoverEnd}
          />
        </div>
        {hoveredNote && (
          <Tooltip
            x={hoveredNote.x - 10}
            y={hoveredNote.y + 20}
            text={hoveredNote.noteStr}
          />
        )}
      </div>
      <div className="mt-2 sm:mt-4 p-1 sm:p-2 sm:p-4 bg-panel rounded-lg shadow">
        <ScaleManager scales={scales} onScalesChange={setScales} />
      </div>
    </div>
  );
};

export default FretboardVisualizer;
