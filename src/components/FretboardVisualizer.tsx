import * as htmlToImage from 'html-to-image';
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react';
import { Accidentals, type PitchClass } from '../lib/constants'; // Corrected import for PitchClass
import { Fretboard, stringTuningToNotes } from '../lib/Fretboard';
import { Note } from '../lib/Note';
import CreditsModal from './CreditsModal';
import FretboardGrid from './FretboardGrid';
import ImportDropzoneModal from './ImportDropzoneModal';
import SaveLoadConfirmModal from './SaveLoadConfirmModal';
import ScaleManager from './ScaleManager';
import SettingsModal from './SettingsModal';
import Tooltip from './Tooltip';
import Topbar from './Topbar';

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
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Validate scales array
      if (parsed?.scales && !Array.isArray(parsed.scales)) {
        console.warn('Invalid scales in cookie, resetting preferences.');
        Cookies.remove(COOKIE_KEY);
        return null;
      }
      if (parsed?.scales && Array.isArray(parsed.scales)) {
        // Check that each scale has root, scale, color
        const valid = parsed.scales.every(
          (s: any) => s && typeof s.root === 'string' && typeof s.scale === 'string' && typeof s.color === 'string'
        );
        if (!valid) {
          console.warn('Malformed scale objects in cookie, resetting preferences.');
          Cookies.remove(COOKIE_KEY);
          return null;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  })();

  const [currentNumFrets, setCurrentNumFrets] = useState(cookiePrefs?.numFrets ?? numFrets);
  const [currentPreferFlat, setCurrentPreferFlat] = useState(cookiePrefs?.preferFlat ?? preferFlat);
  const [numStrings, setNumStrings] = useState(cookiePrefs?.numStrings ?? 6);
  const [tuning, setTuning] = useState(cookiePrefs?.tuning ?? ['E2', 'A2', 'D3', 'G3', 'B3', 'E4']);
  const [scales, setScales] = useState<{ scale: string; root: string; color: string; hidden?: boolean }[]>(cookiePrefs?.scales ?? []);
  const [highlightedNotes, setHighlightedNotes] = useState<Record<string, string[]>>({});
  const [blendOverlaps, setBlendOverlaps] = useState(cookiePrefs?.blendOverlaps ?? false);
  const [showFretMarkers, setShowFretMarkers] = useState(cookiePrefs?.showFretMarkers ?? true);
  const [customScaleNotes, setCustomScaleNotes] = useState<string[]>([]);
  const [noteOverrides, setNoteOverrides] = useState<Record<string, string>>(cookiePrefs?.noteOverrides ?? {});
  const [tritoneLabel, setTritoneLabel] = useState('♭5');

  // Add state for orientation warning
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);
  const [noteCenter, setNoteCenter] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<'interval' | 'degree'>('interval');
  const [octaveSelectionMode, setOctaveSelectionMode] = useState(false);

  // Note selection state
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [dragSelecting, setDragSelecting] = useState(false);
  const [dragToggled, setDragToggled] = useState<Set<string>>(new Set());
  const [manuallySelectedNotes, setManuallySelectedNotes] = useState<Set<string>>(new Set());

  const [saveLoadModalOpen, setSaveLoadModalOpen] = useState(false);
  const [saveLoadMode, setSaveLoadMode] = useState<'export' | 'import'>('export');
  const [importData, setImportData] = useState<{
    scales: { scale: string; root: string; color: string; hidden?: boolean }[];
    noteOverrides: Record<string, string>;
  } | null>(null);
  const [pendingImport, setPendingImport] = useState(false);
  const [importDropzoneOpen, setImportDropzoneOpen] = useState(false);

  /**
   * Handle Export/Import dropdown selection
   */
  const handleExportImport = (type: 'export' | 'import') => {
    setSaveLoadMode(type);
    if (type === 'export') {
      setSaveLoadModalOpen(true);
    } else {
      setImportDropzoneOpen(true);
    }
  };

  /**
   * Handle export confirm: download selected data as JSON
   */
  const handleExportConfirm = ({ selectedScales, includeNoteOverrides }: { selectedScales: number[]; includeNoteOverrides: boolean; }) => {
    const exportScales = selectedScales.map(i => scales[i]);
    const exportNoteOverrides = includeNoteOverrides ? noteOverrides : {};
    const data = {
      scales: exportScales,
      noteOverrides: exportNoteOverrides,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fretforge-data.json';
    a.click();
    URL.revokeObjectURL(url);
    setSaveLoadModalOpen(false);
  };

  /**
   * Handle import confirm: update state with selected data
   */
  const handleImportConfirm = ({ selectedScales, includeNoteOverrides, overrideOnImport, importData: importDataArg }: {
    selectedScales: number[];
    includeNoteOverrides: boolean;
    overrideOnImport?: boolean;
    importData?: {
      scales: { scale: string; root: string; color: string; hidden?: boolean }[];
      noteOverrides: Record<string, string>;
    };
  }) => {
    if (!importDataArg) return;
    const newScales = selectedScales.map(i => importDataArg.scales[i]);
    if (overrideOnImport) {
      setScales(newScales);
      setNoteOverrides(includeNoteOverrides ? importDataArg.noteOverrides : {});
    } else {
      setScales(prev => [...prev, ...newScales]);
      setNoteOverrides(prev => includeNoteOverrides ? { ...prev, ...importDataArg.noteOverrides } : prev);
    }
    setSaveLoadModalOpen(false);
    setImportData(null);
  };

  /**
   * Handle file parsed from ImportDropzoneModal
   */
  const handleDropzoneFileParsed = (data: any, error?: string) => {
    if (error || !data) {
      // Optionally show error toast
      return;
    }
    // Validate structure
    if (!Array.isArray(data.scales) || typeof data.noteOverrides !== 'object') {
      // Optionally show error toast
      return;
    }
    setImportData({
      scales: data.scales,
      noteOverrides: data.noteOverrides,
    });
    setImportDropzoneOpen(false);
    setSaveLoadModalOpen(true);
  };

  // Handler to toggle note selection (multi-select is default)
  const handleNoteSelect = (key: string, event: React.MouseEvent) => {
    if (!octaveSelectionMode) {
      // Normal mode: toggle individual note
      setManuallySelectedNotes(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      setSelectedNotes(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      // Drag-select start
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        setDragSelecting(true);
        setDragToggled(new Set([key]));
      }
      return;
    }
    // Octave selection mode: select/deselect all notes of the same name
    // Extract note name from key
    const match = key.match(/^s\d+-f(\d+)$/);
    if (!match) return;
    // Find the note name for this cell
    let noteName = '';
    outer: for (let s = 0; s < board.length; ++s) {
      for (let f = 0; f < board[0].length; ++f) {
        if (`s${s}-f${f}` === key) {
          noteName = board[s][f]?.toString(currentPreferFlat).replace(/[0-9]/g, '');
          break outer;
        }
      }
    }
    if (!noteName) return;
    // Find all keys with this note name
    const allKeys: string[] = [];
    for (let s = 0; s < board.length; ++s) {
      for (let f = 0; f < board[0].length; ++f) {
        if (board[s][f]?.toString(currentPreferFlat).replace(/[0-9]/g, '') === noteName) {
          allKeys.push(`s${s}-f${f}`);
        }
      }
    }
    // In octave mode, store the originally clicked note in manuallySelectedNotes
    // but show all octaves in selectedNotes
    setManuallySelectedNotes(prev => {
      const next = new Set(prev);
      // Toggle the clicked note in manuallySelectedNotes
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
    setSelectedNotes(prev => {
      const next = new Set(prev);
      const allSelected = allKeys.every(k => next.has(k));
      if (allSelected) {
        allKeys.forEach(k => next.delete(k));
      } else {
        allKeys.forEach(k => next.add(k));
      }
      return next;
    });
  };

  // Handler for drag-select over a note
  const handleNoteDragOver = (key: string, event: React.MouseEvent) => {
    if (dragSelecting && (event.buttons === 1 || event.buttons === 3)) {
      setDragToggled(prev => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
    }
  };

  // Handler for drag-select end
  const handleNoteDragEnd = () => {
    if (dragSelecting) {
      setSelectedNotes(prev => {
        const next = new Set(prev);
        dragToggled.forEach(key => {
          if (next.has(key)) {
            next.delete(key);
          } else {
            next.add(key);
          }
        });
        return next;
      });
      setDragSelecting(false);
      setDragToggled(new Set());
    }
  };

  // Handler to clear all selections
  const handleClearSelection = () => {
    setSelectedNotes(new Set());
    setManuallySelectedNotes(new Set());
  };

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

    // Add regular scales
    scales.forEach(({ scale, root, color, hidden }) => {
      if (hidden) return; // Skip hidden scales
      if (scale === 'custom') return; // Skip custom scales here, handle separately

      // Convert note name to chromatic index, handling both ASCII and unicode symbols
      const noteToIndex: Record<string, number> = {
        'C': 0, 'B♯': 0,
        'C♯': 1, 'C#': 1, 'D♭': 1, 'Db': 1,
        'D': 2,
        'D♯': 3, 'D#': 3, 'E♭': 3, 'Eb': 3,
        'E': 4, 'F♭': 4, 'Fb': 4,
        'F': 5, 'E♯': 5, 'E#': 5,
        'F♯': 6, 'F#': 6, 'G♭': 6, 'Gb': 6,
        'G': 7,
        'G♯': 8, 'G#': 8, 'A♭': 8, 'Ab': 8,
        'A': 9,
        'A♯': 10, 'A#': 10, 'B♭': 10, 'Bb': 10,
        'B': 11, 'C♭': 11, 'Cb': 11
      };
      const rootIndex = noteToIndex[root];
      if (rootIndex === undefined) {
        console.warn(`Unknown root note: ${root}`);
        return;
      }
      const rootNote = new Note(rootIndex as PitchClass, Accidentals.NATURAL, 4);
      const scaleNotes = fretboard.getScaleNotes(rootNote, scale);
      scaleNotes.forEach((note) => {
        const noteStr = note.toString(currentPreferFlat).replace(/[0-9]/g, '');
        if (!highlightedNotes[noteStr]) highlightedNotes[noteStr] = [];
        highlightedNotes[noteStr].push(color);
      });
    });

    // Add custom scales
    scales.forEach(({ scale, root, color, hidden }) => {
      if (hidden || scale !== 'custom') return;
      // For custom scales, we need to parse the notes from the root field
      // This is a simplified approach - in a real implementation you'd store the notes properly
      const customNotes = root.split(',').map(n => n.trim());
      customNotes.forEach((noteStr) => {
        if (!highlightedNotes[noteStr]) highlightedNotes[noteStr] = [];
        highlightedNotes[noteStr].push(color);
      });
    });

    // Apply note overrides - these take precedence over all other colors
    Object.entries(noteOverrides).forEach(([note, color]) => {
      if (highlightedNotes[note]) {
        highlightedNotes[note] = [color]; // Override with single color
      } else {
        highlightedNotes[note] = [color];
      }
    });

    setHighlightedNotes(highlightedNotes);
  }, [scales, currentPreferFlat, fretboard, customScaleNotes, noteOverrides]);

  // Handle mode switching - sync selectedNotes with manuallySelectedNotes when switching to normal mode
  useEffect(() => {
    if (!octaveSelectionMode) {
      setSelectedNotes(new Set(manuallySelectedNotes));
    }
  }, [octaveSelectionMode, manuallySelectedNotes]);

  // When octaveSelectionMode is turned on, auto-select all octaves of selected notes
  useEffect(() => {
    if (!octaveSelectionMode) return;
    // For each note in manuallySelectedNotes, select all keys with the same note name
    setSelectedNotes(prev => {
      const next = new Set(prev);
      manuallySelectedNotes.forEach(key => {
        // Find the note name for this key
        const match = key.match(/^s(\d+)-f(\d+)$/);
        if (!match) return;
        const s = parseInt(match[1]);
        const f = parseInt(match[2]);
        const noteName = board[s][f]?.toString(currentPreferFlat).replace(/[0-9]/g, '');
        if (!noteName) return;
        // Find all keys with this note name
        for (let si = 0; si < board.length; ++si) {
          for (let fi = 0; fi < board[0].length; ++fi) {
            if (board[si][fi]?.toString(currentPreferFlat).replace(/[0-9]/g, '') === noteName) {
              next.add(`s${si}-f${fi}`);
            }
          }
        }
      });
      return next;
    });
  }, [octaveSelectionMode]);

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
        showFretMarkers,
        noteOverrides,
      }),
      { expires: 365 }
    );
  }, [currentNumFrets, currentPreferFlat, numStrings, tuning, scales, blendOverlaps, showFretMarkers, noteOverrides]);

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

  const handleNoteClick = (note: string) => {
    const noteStr = note.replace(/[0-9]/g, '');
    setCustomScaleNotes(prev => {
      const index = prev.indexOf(noteStr);
      if (index > -1) {
        return prev.filter((_, i) => i !== index);
      } else {
        return [...prev, noteStr];
      }
    });
  };

  // Add global mouseup listener to end drag-select
  React.useEffect(() => {
    if (!dragSelecting) return;
    const handleUp = () => handleNoteDragEnd();
    window.addEventListener('mouseup', handleUp);
    return () => window.removeEventListener('mouseup', handleUp);
  }, [dragSelecting]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [creditsModalOpen, setCreditsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#181A20] text-textprimary flex flex-col">
      <Topbar
        preferFlat={currentPreferFlat}
        onPreferFlatChange={setCurrentPreferFlat}
        octaveSelectionMode={octaveSelectionMode}
        onOctaveSelectionModeChange={setOctaveSelectionMode}
        onExport={handleExportPng}
        onOpenSettings={() => setSettingsOpen(true)}
        onExportImport={handleExportImport}
        onOpenCredits={() => setCreditsModalOpen(true)}
      />
      <main className="flex-1 flex flex-col w-full px-2 sm:px-4 md:px-6 lg:px-12">
        {/* Orientation Warning */}
        {showOrientationWarning && (
          <div className="bg-yellow-600 text-white p-3 text-center text-sm font-medium mb-4 rounded-lg shadow w-full max-w-2xl mx-auto mt-4">
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
        {/* Shared horizontal scroll container for fretboard and panel */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-max">
            {/* Fretboard Card */}
            <section className="w-full flex flex-col items-center mt-6">
              <div className="bg-[#23272F] rounded-xl shadow-lg p-4 w-full max-w-4xl min-w-max flex flex-col">
                <div className="w-full flex flex-col gap-2 mb-4">
                  {/* Note Center, Interval/Degree, Clear Selection */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label htmlFor="note-center" className="text-sm font-semibold text-textprimary">Note Center:</label>
                      <select
                        id="note-center"
                        value={noteCenter ?? ''}
                        onChange={e => setNoteCenter(e.target.value || null)}
                        className="bg-panel text-textprimary rounded px-3 py-2 text-sm border border-gray-700 focus:ring-2 focus:ring-accent"
                      >
                        <option value="">(None)</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={Note.getNoteName(i, currentPreferFlat)}>
                            {Note.getNoteName(i, currentPreferFlat)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="px-2 py-1 bg-gray-700 hover:bg-accent text-white rounded text-xs font-semibold shadow transition-colors"
                        title="Autopick most frequent root"
                        onClick={() => {
                          // Count frequency of each root among non-hidden, non-custom scales
                          const freq: Record<string, number> = {};
                          scales.forEach(s => {
                            if (!s.hidden && s.scale !== 'custom') {
                              freq[s.root] = (freq[s.root] || 0) + 1;
                            }
                          });
                          // Find the most frequent root
                          let max = 0;
                          let picked: string | null = null;
                          for (const root of Object.keys(freq)) {
                            if (freq[root] > max) {
                              max = freq[root];
                              picked = root;
                            }
                          }
                          if (picked) setNoteCenter(picked);
                        }}
                      >Autopick</button>
                      <div className="flex items-center gap-1 ml-4">
                        <label className="text-xs text-textsecondary">Display:</label>
                        <button
                          type="button"
                          className={`px-2 py-1 rounded text-xs font-semibold shadow transition-colors ${displayMode === 'interval' ? 'bg-accent text-white' : 'bg-gray-700 text-textprimary'}`}
                          onClick={() => setDisplayMode('interval')}
                        >Interval</button>
                        <button
                          type="button"
                          className={`px-2 py-1 rounded text-xs font-semibold shadow transition-colors ${displayMode === 'degree' ? 'bg-accent text-white' : 'bg-gray-700 text-textprimary'}`}
                          onClick={() => setDisplayMode('degree')}
                        >Degree</button>
                      </div>
                      <span className="text-xs text-textsecondary ml-2">Display intervals from this note</span>
                    </div>
                    {selectedNotes.size > 0 ? (
                      <button
                        className="px-3 py-1 bg-white text-gray-900 rounded shadow font-semibold text-xs hover:bg-gray-200 transition-colors"
                        onClick={handleClearSelection}
                      >
                        Clear Selection
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="relative w-full flex justify-center">
                  <div ref={fretboardGridRef} className="inline-block">
                    <FretboardGrid
                      board={board}
                      highlightedNotes={highlightedNotes}
                      preferFlat={currentPreferFlat}
                      hasScalesSelected={scales.length > 0}
                      blendOverlaps={blendOverlaps}
                      showFretMarkers={showFretMarkers}
                      onNoteHoverStart={handleHoverStart}
                      onNoteHoverEnd={handleHoverEnd}
                      onNoteClick={handleNoteClick}
                      selectedNotes={selectedNotes}
                      onNoteSelect={handleNoteSelect}
                      onNoteDragOver={handleNoteDragOver}
                      onNoteDragEnd={handleNoteDragEnd}
                      noteCenter={noteCenter}
                      displayMode={displayMode}
                      tritoneLabel={tritoneLabel}
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
              </div>
            </section>
            {/* Controls Panel (Scales/Chords/Overrides) */}
            <section className="w-full flex flex-col items-center mt-6">
              <div className="bg-[#23272F] rounded-xl shadow-lg p-4 w-full max-w-4xl flex flex-col min-w-max">
                <ScaleManager
                  scales={scales}
                  onScalesChange={setScales}
                  noteOverrides={noteOverrides}
                  onNoteOverridesChange={setNoteOverrides}
                  preferFlat={currentPreferFlat}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        numFrets={currentNumFrets}
        onNumFretsChange={setCurrentNumFrets}
        numStrings={numStrings}
        onNumStringsChange={setNumStrings}
        tuning={tuning}
        onTuningChange={setTuning}
        blendOverlaps={blendOverlaps}
        onBlendOverlapsChange={setBlendOverlaps}
        showFretMarkers={showFretMarkers}
        onShowFretMarkersChange={setShowFretMarkers}
        tritoneLabel={tritoneLabel}
        onTritoneLabelChange={setTritoneLabel}
      />
      <ImportDropzoneModal
        open={importDropzoneOpen}
        onClose={() => setImportDropzoneOpen(false)}
        onFileParsed={handleDropzoneFileParsed}
      />
      <SaveLoadConfirmModal
        open={saveLoadModalOpen}
        mode={saveLoadMode}
        scales={saveLoadMode === 'export' ? scales : importData?.scales || []}
        noteOverrides={saveLoadMode === 'export' ? noteOverrides : importData?.noteOverrides || {}}
        onClose={() => { setSaveLoadModalOpen(false); setImportData(null); }}
        onCancel={() => { setSaveLoadModalOpen(false); setImportData(null); }}
        onConfirm={saveLoadMode === 'export' ? handleExportConfirm : handleImportConfirm}
        importData={saveLoadMode === 'import' ? importData || undefined : undefined}
      />
      <CreditsModal open={creditsModalOpen} onClose={() => setCreditsModalOpen(false)} />
    </div>
  );
};

export default FretboardVisualizer;
