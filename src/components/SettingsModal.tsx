import React from 'react';

interface SettingsModalProps {
    open: boolean;
    onClose: () => void;
    numFrets: number;
    onNumFretsChange: (n: number) => void;
    numStrings: number;
    onNumStringsChange: (n: number) => void;
    tuning: string[];
    onTuningChange: (t: string[]) => void;
    blendOverlaps: boolean;
    onBlendOverlapsChange: (b: boolean) => void;
    showFretMarkers: boolean;
    onShowFretMarkersChange: (b: boolean) => void;
    tritoneLabel: string;
    onTritoneLabelChange: (s: string) => void;
}

const ACCENT_ON = 'bg-blue-500';
const ACCENT_OFF = 'bg-gray-600';

const STANDARD_TUNINGS: Record<number, string[]> = {
    4: ['E1', 'A1', 'D2', 'G2'],
    5: ['B0', 'E1', 'A1', 'D2', 'G2'],
    6: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    7: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    8: ['F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
};

const SettingsModal: React.FC<SettingsModalProps> = ({
    open, onClose, numFrets, onNumFretsChange, numStrings, onNumStringsChange, tuning, onTuningChange, blendOverlaps, onBlendOverlapsChange, showFretMarkers, onShowFretMarkersChange, tritoneLabel, onTritoneLabelChange
}) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#23272F] rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl" onClick={onClose}>&times;</button>
                <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Number of Frets</span>
                        <select value={numFrets} onChange={e => onNumFretsChange(Number(e.target.value))} className="bg-gray-700 text-white rounded px-2 py-1">
                            <option value={21}>21</option>
                            <option value={22}>22</option>
                            <option value={24}>24</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Number of Strings</span>
                        <select
                            value={numStrings}
                            onChange={e => {
                                const n = Number(e.target.value);
                                onNumStringsChange(n);
                                // Update tuning array to match new string count
                                const newTuning = STANDARD_TUNINGS[n] || STANDARD_TUNINGS[6];
                                onTuningChange(newTuning);
                            }}
                            className="bg-gray-700 text-white rounded px-2 py-1"
                        >
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm text-white">Tuning</span>
                        <div className="flex flex-wrap gap-2 justify-end">
                            {tuning.map((note, i) => (
                                <input
                                    key={i}
                                    value={note}
                                    onChange={e => {
                                        const newTuning = [...tuning];
                                        newTuning[i] = e.target.value;
                                        onTuningChange(newTuning);
                                    }}
                                    className="bg-gray-700 text-white rounded px-2 py-1 w-14 text-center"
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Overlapping Colors</span>
                        <div className="flex rounded-md shadow-sm">
                            <button
                                type="button"
                                className={`px-3 py-1 border border-gray-600 rounded-l text-xs font-semibold focus:outline-none transition-colors ${blendOverlaps ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                                onClick={() => onBlendOverlapsChange(true)}
                            >
                                Blend
                            </button>
                            <button
                                type="button"
                                className={`px-3 py-1 border-t border-b border-r border-gray-600 rounded-r text-xs font-semibold focus:outline-none transition-colors ${!blendOverlaps ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
                                onClick={() => onBlendOverlapsChange(false)}
                            >
                                Split
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Show Fret Markers</span>
                        <button
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${showFretMarkers ? ACCENT_ON : ACCENT_OFF}`}
                            onClick={() => onShowFretMarkersChange(!showFretMarkers)}
                            aria-label="Toggle fret markers"
                            type="button"
                        >
                            <span
                                className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200`}
                                style={{ transform: showFretMarkers ? 'translateX(16px)' : 'translateX(0)' }}
                            />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-white">Tritone Label</span>
                        <input
                            value={tritoneLabel}
                            onChange={e => onTritoneLabelChange(e.target.value)}
                            className="bg-gray-700 text-white rounded px-2 py-1 w-24 text-center"
                        />
                    </div>
                </div>
                {/* Keyboard Shortcuts Panel */}
                <div className="mt-6 bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-white mb-2">Keyboard Shortcuts</h3>
                    <ul className="space-y-1 text-xs text-gray-200">
                        <li><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+1</kbd> 6 strings</li>
                        <li><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+2</kbd> 7 strings</li>
                        <li><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+3</kbd> 8 strings</li>
                        <li><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+B</kbd> Toggle blend</li>
                        <li><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+F</kbd> Toggle fret markers</li>
                        <li><kbd className="px-1 py-0.5 bg-gray-700 rounded">Ctrl+S</kbd> Toggle sharps/flats</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal; 