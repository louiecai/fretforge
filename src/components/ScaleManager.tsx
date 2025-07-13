import React, { useEffect, useRef, useState } from 'react';

const SCALE_TYPES = [
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
const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface Scale {
  scale: string;
  root: string;
  color: string;
}

interface ScaleManagerProps {
  scales: Scale[];
  onScalesChange: (scales: Scale[]) => void;
}

const defaultColor = '#0074D9';

const ScaleManager: React.FC<ScaleManagerProps> = ({ scales, onScalesChange }) => {
  // State for new scale
  const [newRoot, setNewRoot] = useState('A');
  const [newType, setNewType] = useState('pentatonicMinor');
  const [newColor, setNewColor] = useState(defaultColor);

  // Local color state for each scale row
  const [colorInputs, setColorInputs] = useState<string[]>(scales.map(s => s.color));
  const debounceTimeouts = useRef<(NodeJS.Timeout | null)[]>([]);

  // Sync colorInputs with scales if scales change (add/remove)
  useEffect(() => {
    setColorInputs(scales.map(s => s.color));
  }, [scales.length]);

  // Add new scale
  const isDuplicate = scales.some(s => s.root === newRoot && s.scale === newType);
  const handleAdd = () => {
    if (!newRoot || !newType || !newColor || isDuplicate) return;
    onScalesChange([...scales, { root: newRoot, scale: newType, color: newColor }]);
    setNewRoot('A');
    setNewType('pentatonicMinor');
    setNewColor(defaultColor);
  };

  // Update scale inline (root/type: immediate, color: debounced)
  const handleEdit = (idx: number, field: keyof Scale, value: string) => {
    if (field === 'color') {
      // Update local color input immediately
      setColorInputs(inputs => {
        const updated = [...inputs];
        updated[idx] = value;
        return updated;
      });
      // Debounce the update to parent
      if (debounceTimeouts.current[idx]) clearTimeout(debounceTimeouts.current[idx]!);
      debounceTimeouts.current[idx] = setTimeout(() => {
        const updated = scales.map((s, i) => i === idx ? { ...s, color: value } : s);
        onScalesChange(updated);
      }, 250);
    } else {
      const updated = scales.map((s, i) => i === idx ? { ...s, [field]: value } : s);
      onScalesChange(updated);
    }
  };

  // Remove scale
  const handleRemove = (idx: number) => {
    onScalesChange(scales.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Add Scale Row */}
      <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-panel rounded-lg mb-4 border border-gray-700 shadow">
        <select value={newRoot} onChange={e => setNewRoot(e.target.value)} className="bg-panel text-textprimary rounded px-2 py-1 text-xs border border-gray-700 focus:ring-2 focus:ring-accent w-full sm:w-auto">
          {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={newType} onChange={e => setNewType(e.target.value)} className="bg-panel text-textprimary rounded px-2 py-1 text-xs flex-1 border border-gray-700 focus:ring-2 focus:ring-accent">
          {SCALE_TYPES.map(s =>
            s.group === 'separator'
              ? <option key={s.value} value="" disabled>{s.label}</option>
              : <option key={s.value} value={s.value}>{s.label}</option>
          )}
        </select>
        <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-8 h-8 p-0 border-2 border-gray-700 rounded focus:ring-2 focus:ring-accent bg-panel" />
        <button onClick={handleAdd} className="px-3 py-1 bg-accent text-white rounded hover:bg-accentlight text-xs font-semibold shadow w-full sm:w-auto" disabled={isDuplicate}>Add</button>
      </div>

      {/* Scales List Header */}
      {scales.length > 0 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => onScalesChange([])}
            className="px-3 py-1 bg-gray-700 text-textsecondary rounded hover:bg-red-500 hover:text-white text-xs font-semibold shadow transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
      {/* Scales List */}
      <div className="space-y-2">
        {scales.map((s, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-panel rounded-lg shadow border border-gray-700">
            <span className="w-6 h-6 rounded-full border-2 border-white" style={{ background: s.color }} title={s.color} />
            <select value={s.root} onChange={e => handleEdit(idx, 'root', e.target.value)} className="bg-panel text-textprimary rounded px-2 py-1 text-xs border border-gray-700 focus:ring-2 focus:ring-accent w-full sm:w-auto">
              {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={s.scale} onChange={e => handleEdit(idx, 'scale', e.target.value)} className="bg-panel text-textprimary rounded px-2 py-1 text-xs flex-1 border border-gray-700 focus:ring-2 focus:ring-accent">
              {SCALE_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
            </select>
            <input type="color" value={colorInputs[idx] ?? s.color} onChange={e => handleEdit(idx, 'color', e.target.value)} className="w-8 h-8 p-0 border-2 border-gray-700 rounded focus:ring-2 focus:ring-accent bg-panel" />
            <button onClick={() => handleRemove(idx)} className="ml-auto text-gray-400 hover:text-red-500 p-1" title="Remove">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
        {scales.length === 0 && <div className="text-center text-xs text-textsecondary py-4">No scales added yet.</div>}
      </div>
    </div>
  );
};

export default ScaleManager;
