/**
 * ScaleManager.tsx
 *
 * Manages the list of active scales/chords and note overrides for the fretboard visualizer.
 * Allows users to add, edit, color, hide, and remove scales/chords, as well as override note colors.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */

import type { DragEndEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import React, { useEffect, useRef, useState } from 'react';
import { Note } from '../lib/Note';

/**
 * Scale object representing a scale/chord on the fretboard.
 */
interface Scale {
  scale: string;
  root: string;
  color: string;
  hidden?: boolean;
}

/**
 * Props for ScaleManager component.
 */
interface ScaleManagerProps {
  /** List of active scales/chords */
  scales: Scale[];
  /** Callback to update the list of scales/chords */
  onScalesChange: (scales: Scale[]) => void;
  /** Map of note overrides (note name to color) */
  noteOverrides?: Record<string, string>;
  /** Callback to update note overrides */
  onNoteOverridesChange?: (overrides: Record<string, string>) => void;
  /** Whether to display notes as flats (♭) or sharps (♯) */
  preferFlat?: boolean;
}

const SCALE_TYPES = [
  { value: 'scalesSeparator', label: '────────── Scales ──────────', group: 'separator' },
  { value: 'diatonicMinor', label: 'Diatonic Minor', group: 'scale' },
  { value: 'diatonicMajor', label: 'Diatonic Major', group: 'scale' },
  { value: 'pentatonicMinor', label: 'Pentatonic Minor', group: 'scale' },
  { value: 'pentatonicMajor', label: 'Pentatonic Major', group: 'scale' },
  { value: 'bluesMinor', label: 'Blues Minor', group: 'scale' },
  { value: 'bluesMajor', label: 'Blues Major', group: 'scale' },
  { value: 'separator', label: '────────── Chords ──────────', group: 'separator' },
  { value: 'maj', label: 'Major Chord', group: 'chord' },
  { value: 'min', label: 'Minor Chord', group: 'chord' },
  { value: 'dim', label: 'Diminished Chord', group: 'chord' },
  { value: 'aug', label: 'Augmented Chord', group: 'chord' },
  { value: 'maj7', label: 'Major 7th Chord', group: 'chord' },
  { value: 'min7', label: 'Minor 7th Chord', group: 'chord' },
  { value: '7', label: 'Dominant 7th Chord', group: 'chord' },
  { value: 'dim7', label: 'Diminished 7th Chord', group: 'chord' },
  { value: 'm7b5', label: 'Half-diminished 7th (m7♭5)', group: 'chord' },
];

// Predefined color palette for consistent but varied colors
const colorPalette = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FF8A80', '#FFD54F', '#81C784', '#64B5F6', '#BA68C8', '#FFB74D',
  '#A1887F', '#90A4AE', '#FF7043', '#26A69A', '#42A5F5', '#AB47BC',
  '#FFA726', '#66BB6A', '#26C6DA', '#7E57C2', '#FFCC02', '#EC407A'
];

// Function to calculate Euclidean distance between two hex colors in RGB space
function colorDistance(hex1: string, hex2: string): number {
  function hexToRgb(hex: string) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return [r, g, b];
  }
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return Math.sqrt(
    Math.pow(r1 - r2, 2) +
    Math.pow(g1 - g2, 2) +
    Math.pow(b1 - b2, 2)
  );
}

/**
 * Get a random color from the palette that is not very close to any usedColors.
 * If all are too close, pick the most distinct as fallback.
 * @param usedColors - Array of hex color strings already in use
 * @returns A hex color string
 */
const getRandomColor = (usedColors: string[] = []) => {
  const DIST_THRESHOLD = 80; // Minimum distance to consider colors "not very close"
  // Filter palette for colors not very close to any used color
  const candidates = colorPalette.filter(candidate =>
    usedColors.every(used => colorDistance(candidate, used) > DIST_THRESHOLD)
  );
  if (candidates.length > 0) {
    // Pick randomly from sufficiently different candidates
    return candidates[Math.floor(Math.random() * candidates.length)];
  }
  // Fallback: pick the most distinct as before
  let bestColor = colorPalette[0];
  let bestDistance = -1;
  for (const candidate of colorPalette) {
    // Skip if already used
    if (usedColors.includes(candidate)) continue;
    let minDist = Infinity;
    for (const used of usedColors) {
      const dist = colorDistance(candidate, used);
      if (dist < minDist) minDist = dist;
    }
    if (minDist > bestDistance) {
      bestDistance = minDist;
      bestColor = candidate;
    }
  }
  if (bestDistance === -1) {
    // All colors are used, pick the one with the highest average distance
    let maxAvgDist = -1;
    for (const candidate of colorPalette) {
      let sumDist = 0;
      for (const used of usedColors) {
        sumDist += colorDistance(candidate, used);
      }
      const avgDist = sumDist / usedColors.length;
      if (avgDist > maxAvgDist) {
        maxAvgDist = avgDist;
        bestColor = candidate;
      }
    }
  }
  return bestColor;
};

/**
 * Convert a note name to use the specified notation (sharp or flat).
 * @param noteName - The note name to convert (e.g., 'A♯')
 * @param preferFlat - Whether to use flats (♭) instead of sharps (♯)
 * @returns The converted note name
 */
const convertNoteName = (noteName: string, preferFlat: boolean): string => {
  // Map note names to chromatic indices
  const noteToIndex: Record<string, number> = {
    'C': 0, 'B♯': 0,
    'C♯': 1, 'D♭': 1,
    'D': 2,
    'D♯': 3, 'E♭': 3,
    'E': 4, 'F♭': 4,
    'F': 5, 'E♯': 5,
    'F♯': 6, 'G♭': 6,
    'G': 7,
    'G♯': 8, 'A♭': 8,
    'A': 9,
    'A♯': 10, 'B♭': 10,
    'B': 11, 'C♭': 11
  };

  const index = noteToIndex[noteName];
  if (index === undefined) {
    return noteName; // Return original if not found
  }

  return Note.getNoteName(index, preferFlat);
};

/**
 * Get the notes for a scale or chord.
 * @param root - Root note name (e.g., 'C, )* @param scaleType - Scale or chord type (e.g., diatonicMajor', 'maj')
 * @param preferFlat - Whether to use flats (♭) instead of sharps (♯)
 * @returns Array of note names in the scale/chord
 */
const getScaleNotes = (root: string, scaleType: string, preferFlat: boolean): string[] => {
  // Map note names to chromatic indices
  const noteToIndex: Record<string, number> = {
    'C': 0, 'B♯': 0,
    'C♯': 1, 'D♭': 1,
    'D': 2,
    'D♯': 3, 'E♭': 3,
    'E': 4, 'F♭': 4,
    'F': 5, 'E♯': 5,
    'F♯': 6, 'G♭': 6,
    'G': 7,
    'G♯': 8, 'A♭': 8,
    'A': 9,
    'A♯': 10, 'B♭': 10,
    'B': 11, 'C♭': 11
  };

  // Scale/chord intervals
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

  const rootIndex = noteToIndex[root];
  if (rootIndex === undefined) {
    return [];
  }

  const intervals = scaleIntervals[scaleType];
  if (!intervals) {
    return [];
  }

  // Generate notes from intervals
  const noteNames = intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return Note.getNoteName(noteIndex, preferFlat);
  });

  // Remove duplicates
  return [...new Set(noteNames)];
};

// Sortable item component for each scale/chord
function SortableScaleRow({ id, children, disabled }: { id: string; children: React.ReactNode; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 50 : undefined,
    cursor: disabled ? undefined : 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

/**
 * ScaleManager component.
 *
 * Manages the list of active scales/chords and note overrides for the fretboard visualizer.
 * Allows users to add, edit, color, hide, and remove scales/chords, as well as override note colors.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */
const ScaleManager: React.FC<ScaleManagerProps> = ({
  scales,
  onScalesChange,
  noteOverrides = {},
  onNoteOverridesChange,
  preferFlat = false
}) => {
  // State for new scale
  const [newRoot, setNewRoot] = useState('A');
  const [newType, setNewType] = useState('pentatonicMinor');
  const [newColor, setNewColor] = useState(getRandomColor(scales.map(s => s.color)));

  // State for new note override
  const [newNoteOverride, setNewNoteOverride] = useState('A');
  const [newNoteColor, setNewNoteColor] = useState(getRandomColor(Object.values(noteOverrides)));

  // Local color state for each scale row
  const [colorInputs, setColorInputs] = useState<string[]>(scales.map(s => s.color));
  const debounceTimeouts = useRef<(NodeJS.Timeout | null)[]>([]);

  // Sync colorInputs with scales if scales change (add/remove or reorder)
  useEffect(() => {
    setColorInputs(scales.map(s => s.color));
  }, [scales]);

  // Update scale roots and newRoot when preferFlat changes
  useEffect(() => {
    // Only update if any scale root would change
    let changed = false;
    const updatedScales = scales.map(scale => {
      const converted = convertNoteName(scale.root, preferFlat);
      if (converted !== scale.root) changed = true;
      return { ...scale, root: converted };
    });
    if (changed) {
      onScalesChange(updatedScales);
    }
    // Also update newRoot if needed
    setNewRoot(prev => convertNoteName(prev, preferFlat));
  }, [preferFlat]);

  const ROOTS = Array.from({ length: 12 }, (_, i) => Note.getNoteName(i, preferFlat));

  // Add new scale
  const isDuplicate = scales.some(s => s.root === newRoot && s.scale === newType);
  const isValidScaleType = newType && newType !== 'separator' && newType !== 'scalesSeparator' && newType !== '';
  const handleAdd = () => {
    if (!newRoot) {
      console.warn('Cannot add: newRoot is empty');
      return;
    }
    if (!isValidScaleType) {
      console.warn('Cannot add: invalid scale type');
      return;
    }
    if (!newColor) {
      console.warn('Cannot add: newColor is empty');
      return;
    }
    if (isDuplicate) {
      console.warn('Cannot add: duplicate scale/root');
      return;
    }
    onScalesChange([...scales, { root: newRoot, scale: newType, color: newColor }]);
    setNewRoot('A');
    setNewType('pentatonicMinor');
    setNewColor(getRandomColor([...scales.map(s => s.color), newColor]));
  };

  // Update scale inline (root/type: immediate, color: debounced)
  const handleEdit = (idx: number, field: keyof Scale, value: string | boolean) => {
    if (field === 'scale' && typeof value === 'string' && (value === 'separator' || value === 'scalesSeparator' || value === '')) {
      return; // Don't allow separator or empty values
    }
    if (field === 'color') {
      // Update local color input immediately
      setColorInputs(inputs => {
        const updated = [...inputs];
        updated[idx] = value as string;
        return updated;
      });
      // Debounce the update to parent
      if (debounceTimeouts.current[idx]) {
        clearTimeout(debounceTimeouts.current[idx]!);
      }
      debounceTimeouts.current[idx] = setTimeout(() => {
        const updatedScales = [...scales];
        updatedScales[idx] = { ...updatedScales[idx], [field]: value as string };
        onScalesChange(updatedScales);
      }, 300);
    } else {
      // Immediate update for non-color fields
      const updatedScales = [...scales];
      updatedScales[idx] = { ...updatedScales[idx], [field]: value };
      onScalesChange(updatedScales);
    }
  };

  // Remove scale
  const handleRemove = (idx: number) => {
    const updatedScales = scales.filter((_, i) => i !== idx);
    onScalesChange(updatedScales);
  };

  // Add note override
  const handleAddNoteOverride = () => {
    if (!newNoteOverride || !newNoteColor) return;
    const updatedOverrides = { ...noteOverrides, [newNoteOverride]: newNoteColor };
    onNoteOverridesChange?.(updatedOverrides);
    setNewNoteOverride('A');
    setNewNoteColor(getRandomColor([...Object.values(noteOverrides), newNoteColor]));
  };

  // Remove note override
  const handleRemoveNoteOverride = (note: string) => {
    const updatedOverrides = { ...noteOverrides };
    delete updatedOverrides[note];
    onNoteOverridesChange?.(updatedOverrides);
  };

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Helper: get unique id for each scale (root+scale+color)
  function hashScale(s: Scale) {
    // Simple hash: root|scale|color
    return `${s.root}|${s.scale}|${s.color}`;
  }

  // dnd-kit drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = scales.findIndex((s, i) => hashScale(s) === active.id);
    const newIndex = scales.findIndex((s, i) => hashScale(s) === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newScales = arrayMove(scales, oldIndex, newIndex);
    onScalesChange(newScales);
  };

  return (
    <div className="space-y-4">
      {/* Quick Add Section */}
      <div className="bg-panel rounded-lg border border-gray-700 shadow p-4">
        <h3 className="text-sm font-semibold text-textprimary mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Add
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setNewRoot('A');
              setNewType('pentatonicMinor');
              setNewColor(getRandomColor([...scales.map(s => s.color), newColor]));
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-textsecondary rounded text-xs font-medium transition-colors"
          >
            A Pentatonic
          </button>
          <button
            onClick={() => {
              setNewRoot('E');
              setNewType('pentatonicMinor');
              setNewColor(getRandomColor([...scales.map(s => s.color), newColor]));
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-textsecondary rounded text-xs font-medium transition-colors"
          >
            E Pentatonic
          </button>
          <button
            onClick={() => {
              setNewRoot('C');
              setNewType('diatonicMajor');
              setNewColor(getRandomColor([...scales.map(s => s.color), newColor]));
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-textsecondary rounded text-xs font-medium transition-colors"
          >
            C Major
          </button>
          <button
            onClick={() => {
              setNewRoot('A');
              setNewType('bluesMinor');
              setNewColor(getRandomColor([...scales.map(s => s.color), newColor]));
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-textsecondary rounded text-xs font-medium transition-colors"
          >
            A Blues
          </button>
          <button
            onClick={() => {
              setNewRoot('G');
              setNewType('maj');
              setNewColor(getRandomColor([...scales.map(s => s.color), newColor]));
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-textsecondary rounded text-xs font-medium transition-colors"
          >
            G Major Chord
          </button>
          <button
            onClick={() => {
              setNewRoot('Am');
              setNewType('min');
              setNewColor(getRandomColor([...scales.map(s => s.color), newColor]));
            }}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-textsecondary rounded text-xs font-medium transition-colors"
          >
            A Minor Chord
          </button>
        </div>
      </div>

      {/* Scales List Section */}
      <div className="bg-panel rounded-lg border border-gray-700 shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-textprimary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Scales & Chords
            {scales.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-gray-700 text-textsecondary rounded text-xs">
                {scales.filter(s => !s.hidden).length} active
              </span>
            )}
          </h3>
          {scales.length > 0 && (
            <button
              onClick={() => {
                onScalesChange([]);
                setColorInputs([]);
              }}
              className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-xs font-semibold shadow transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Add New Scale/Chord Form */}
        <div className="mb-4 bg-gray-800 rounded-lg border border-gray-600 shadow p-4">
          <h4 className="text-xs font-semibold text-textprimary mb-3 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Scale/Chord
          </h4>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select value={newRoot} onChange={e => setNewRoot(e.target.value)} className="bg-panel text-textprimary rounded px-3 py-2 text-sm border border-gray-700 focus:ring-2 focus:ring-accent w-full sm:w-auto">
              {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={newType} onChange={e => setNewType(e.target.value)} className="bg-panel text-textprimary rounded px-3 py-2 text-sm flex-1 border border-gray-700 focus:ring-2 focus:ring-accent">
              {SCALE_TYPES.map(s =>
                s.group === 'separator'
                  ? <option key={s.value} value="" disabled>{s.label}</option>
                  : <option key={s.value} value={s.value}>{s.label}</option>
              )}
            </select>
            <div className="flex items-center gap-1">
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-10 h-10 p-0 border-2 border-gray-700 rounded focus:ring-2 focus:ring-accent bg-panel" />
              <button
                onClick={() => setNewColor(getRandomColor([...scales.map(s => s.color), newColor]))}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
                title="Randomize Color"
              >
                🎲
              </button>
            </div>
            <button onClick={handleAdd} className="px-4 py-2 bg-accent text-white rounded hover:bg-accentlight text-sm font-semibold shadow w-full sm:w-auto transition-colors" disabled={isDuplicate || !isValidScaleType}>
              Add
            </button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={scales.map(hashScale)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {scales.map((s, idx) => {
                const scaleNotes = getScaleNotes(s.root, s.scale, preferFlat);
                const stableId = hashScale(s);
                // Only allow drag if not hidden
                return (
                  <SortableScaleRow key={stableId} id={stableId} disabled={!!s.hidden}>
                    <div
                      className={`w-full flex flex-col sm:flex-row items-center gap-3 p-3 bg-gray-800 rounded-lg shadow border border-gray-600 ${s.hidden ? 'opacity-50' : ''} transition-opacity`}
                    >
                      {/* Drag handle (always visible, but only draggable if not hidden) */}
                      <button
                        type="button"
                        tabIndex={0}
                        aria-label="Drag to reorder"
                        className={`flex-shrink-0 text-gray-400 hover:text-gray-300 ${s.hidden ? '' : 'cursor-grab active:cursor-grabbing'}`}
                        style={{ background: 'none', border: 'none', outline: 'none' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                        </svg>
                      </button>
                      <span className="w-8 h-8 rounded-full border-2 border-white shadow flex-shrink-0" style={{ background: s.color }} title={s.color} />
                      <select value={s.root} onChange={e => handleEdit(idx, 'root', e.target.value)} className="bg-panel text-textprimary rounded px-3 py-2 text-sm border border-gray-700 focus:ring-2 focus:ring-accent w-full sm:w-auto min-w-0">
                        {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <select value={s.scale} onChange={e => handleEdit(idx, 'scale', e.target.value)} className="bg-panel text-textprimary rounded px-3 py-2 text-sm flex-1 border border-gray-700 focus:ring-2 focus:ring-accent min-w-0">
                        {SCALE_TYPES.map(st =>
                          st.group === 'separator'
                            ? <option key={st.value} value="" disabled>{st.label}</option>
                            : <option key={st.value} value={st.value}>{st.label}</option>
                        )}
                      </select>
                      <div className="flex items-center gap-1 min-w-0">
                        <input type="color" value={colorInputs[idx] ?? s.color} onChange={e => handleEdit(idx, 'color', e.target.value)} className="w-10 h-10 p-0 border-2 border-gray-700 rounded focus:ring-2 focus:ring-accent bg-panel flex-shrink-0" />
                        <button
                          onClick={() => handleEdit(idx, 'color', getRandomColor([...scales.map(s => s.color), colorInputs[idx] ?? s.color]))}
                          className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors flex-shrink-0"
                          title="Randomize Color"
                        >
                          🎲
                        </button>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        {/* Information icon with tooltip */}
                        <div className="relative group">
                          <button
                            className="p-2 text-gray-400 hover:text-blue-400 transition-colors flex-shrink-0"
                            title="View notes"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            <div className="font-semibold mb-1">Notes in {s.root} {SCALE_TYPES.find(st => st.value === s.scale)?.label}:</div>
                            <div className="flex flex-wrap gap-1">
                              {scaleNotes.map((note, noteIdx) => (
                                <span key={noteIdx} className="px-2 py-1 bg-gray-700 rounded text-xs">
                                  {note}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEdit(idx, 'hidden', !s.hidden)}
                          className={`p-2 rounded transition-colors ${s.hidden ? 'text-gray-400 hover:text-green-500' : 'text-green-500 hover:text-gray-400'} flex-shrink-0`}
                          title={s.hidden ? 'Show' : 'Hide'}
                        >
                          {s.hidden ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleRemove(idx)}
                          className="text-gray-400 hover:text-red-500 p-2 transition-colors flex-shrink-0"
                          title="Remove"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </div>
                  </SortableScaleRow>
                );
              })}
              {scales.length === 0 && (
                <div className="text-center text-sm text-textsecondary py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>No scales added yet.</p>
                  <p className="text-xs mt-1">Use Quick Add or Add New Scale to get started</p>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Note Overrides Section */}
      <div className="bg-panel rounded-lg border border-gray-700 shadow p-4">
        <h3 className="text-sm font-semibold text-textprimary mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
          </svg>
          Note Overrides
          {Object.keys(noteOverrides).length > 0 && (
            <span className="ml-2 px-2 py-1 bg-gray-700 text-textsecondary rounded text-xs">
              {Object.keys(noteOverrides).length} active
            </span>
          )}
        </h3>
        <p className="text-xs text-textsecondary mb-3">
          Assign specific colors to all instances of a note (overrides scale colors)
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <select value={newNoteOverride} onChange={e => setNewNoteOverride(e.target.value)} className="bg-panel text-textprimary rounded px-3 py-2 text-sm border border-gray-700 focus:ring-2 focus:ring-accent w-full sm:w-auto">
            {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <input type="color" value={newNoteColor} onChange={e => setNewNoteColor(e.target.value)} className="w-10 h-10 p-0 border-2 border-gray-700 rounded focus:ring-2 focus:ring-accent bg-panel" />
            <button
              onClick={() => setNewNoteColor(getRandomColor([...Object.values(noteOverrides), newNoteColor]))}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
              title="Randomize Color"
            >
              🎲
            </button>
          </div>
          <button onClick={handleAddNoteOverride} className="px-4 py-2 bg-accent text-white rounded hover:bg-accentlight text-sm font-semibold shadow w-full sm:w-auto transition-colors">
            Add Override
          </button>
        </div>
        <div className="space-y-2">
          {Object.entries(noteOverrides).map(([note, color]) => (
            <div key={note} className="flex items-center justify-between p-2 bg-gray-800 rounded">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full border border-white shadow" style={{ background: color }} />
                <span className="text-sm text-textprimary">{note}</span>
              </div>
              <button
                onClick={() => handleRemoveNoteOverride(note)}
                className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                title="Remove override"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScaleManager;
