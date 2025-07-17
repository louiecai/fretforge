/**
 * Settings.tsx
 *
 * Displays and manages the settings menu for the fretboard visualizer, including fret count, tuning, note display, and more.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * Props for Settings component.
 */
interface SettingsProps {
    numFrets: number;
    onNumFretsChange: (numFrets: number) => void;
    preferFlat: boolean;
    onPreferFlatChange: (preferFlat: boolean) => void;
    numStrings: number;
    onNumStringsChange: (numStrings: number) => void;
    tuning: string[];
    onTuningChange: (tuning: string[]) => void;
    blendOverlaps: boolean;
    onBlendOverlapsChange: (blend: boolean) => void;
    showFretMarkers: boolean;
    onShowFretMarkersChange: (show: boolean) => void;
    tritoneLabel: string;
    onTritoneLabelChange: (label: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
    numFrets,
    onNumFretsChange,
    preferFlat,
    onPreferFlatChange,
    numStrings,
    onNumStringsChange,
    tuning,
    onTuningChange,
    blendOverlaps,
    onBlendOverlapsChange,
    showFretMarkers,
    onShowFretMarkersChange,
    tritoneLabel,
    onTritoneLabelChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case '1':
                        event.preventDefault();
                        handleStandardTuning(6);
                        break;
                    case '2':
                        event.preventDefault();
                        handleStandardTuning(7);
                        break;
                    case '3':
                        event.preventDefault();
                        handleStandardTuning(8);
                        break;
                    case 'b':
                        event.preventDefault();
                        onBlendOverlapsChange(!blendOverlaps);
                        break;
                    case 'f':
                        event.preventDefault();
                        onShowFretMarkersChange(!showFretMarkers);
                        break;
                    case 's':
                        event.preventDefault();
                        onPreferFlatChange(!preferFlat);
                        break;
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [blendOverlaps, showFretMarkers, preferFlat, onBlendOverlapsChange, onShowFretMarkersChange, onPreferFlatChange]);

    const standardTunings = {
        6: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        7: ['B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
        8: ['F#1', 'B1', 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
    };

    const handleTuningChange = (index: number, value: string) => {
        const newTuning = [...tuning];
        newTuning[index] = value;
        onTuningChange(newTuning);
    };

    const handleStandardTuning = (strings: number) => {
        onNumStringsChange(strings);
        onTuningChange(standardTunings[strings as keyof typeof standardTunings] || standardTunings[6]);
    };

    const handleResetToDefaults = () => {
        onNumFretsChange(22);
        onPreferFlatChange(false);
        onNumStringsChange(6);
        onTuningChange(standardTunings[6]);
        onBlendOverlapsChange(false);
        onShowFretMarkersChange(true);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm flex items-center space-x-2 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
            </button>

            {isOpen && (
                <div className={`absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 p-4 max-w-[90vw] sm:max-w-none ${numStrings === 6 ? 'w-80' : numStrings === 7 ? 'w-96' : 'w-[28rem]'}`}>
                    <div className="space-y-6">
                        {/* Keyboard Shortcuts Info */}
                        <div className="bg-gray-700 rounded-lg p-3">
                            <h4 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Keyboard Shortcuts
                            </h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                                <div><kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">Ctrl+1</kbd> 6 strings</div>
                                <div><kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">Ctrl+2</kbd> 7 strings</div>
                                <div><kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">Ctrl+3</kbd> 8 strings</div>
                                <div><kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">Ctrl+B</kbd> Toggle blend</div>
                                <div><kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">Ctrl+F</kbd> Toggle fret markers</div>
                                <div><kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">Ctrl+S</kbd> Toggle sharps/flats</div>
                            </div>
                        </div>

                        {/* Fretboard Settings */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Fretboard
                            </h3>
                            <div className="space-y-3">
                                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-300 gap-2">
                                    <span>Number of Frets:</span>
                                    <select
                                        value={numFrets}
                                        onChange={(e) => onNumFretsChange(Number(e.target.value))}
                                        className="bg-gray-700 text-white rounded px-2 py-1 text-xs w-full sm:w-auto"
                                    >
                                        <option value={21}>21</option>
                                        <option value={22}>22</option>
                                        <option value={24}>24</option>
                                    </select>
                                </label>

                                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-300 gap-2">
                                    <span>Note Display:</span>
                                    <span className="inline-flex rounded-md shadow-sm w-full sm:w-auto">
                                        <button
                                            type="button"
                                            className={`px-3 py-1 border border-gray-700 rounded-l bg-gray-700 text-xs font-semibold focus:outline-none transition-colors flex-1 sm:flex-none ${!preferFlat ? 'bg-accent text-white' : 'bg-gray-700 text-textsecondary'}`}
                                            onClick={() => onPreferFlatChange(false)}
                                        >
                                            Sharps (♯)
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-3 py-1 border-t border-b border-gray-700 rounded-r bg-gray-700 text-xs font-semibold focus:outline-none transition-colors flex-1 sm:flex-none ${preferFlat ? 'bg-accent text-white' : 'bg-gray-700 text-textsecondary'}`}
                                            onClick={() => onPreferFlatChange(true)}
                                        >
                                            Flats (♭)
                                        </button>
                                    </span>
                                </label>

                                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-300 gap-2">
                                    <span>Overlapping scale colors:</span>
                                    <span className="inline-flex rounded-md shadow-sm w-full sm:w-auto">
                                        <button
                                            type="button"
                                            className={`px-3 py-1 border border-gray-700 rounded-l bg-gray-700 text-xs font-semibold focus:outline-none transition-colors flex-1 sm:flex-none ${blendOverlaps ? 'bg-accent text-white' : 'bg-gray-700 text-textsecondary'}`}
                                            onClick={() => onBlendOverlapsChange(true)}
                                        >
                                            Blend
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-3 py-1 border-t border-b border-gray-700 rounded-r bg-gray-700 text-xs font-semibold focus:outline-none transition-colors flex-1 sm:flex-none ${!blendOverlaps ? 'bg-accent text-white' : 'bg-gray-700 text-textsecondary'}`}
                                            onClick={() => onBlendOverlapsChange(false)}
                                        >
                                            Split
                                        </button>
                                    </span>
                                </label>

                                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-300 gap-2">
                                    <span>Tritone Degree Label:</span>
                                    <select
                                        value={tritoneLabel}
                                        onChange={e => onTritoneLabelChange(e.target.value)}
                                        className="bg-gray-700 text-white rounded px-2 py-1 text-xs w-full sm:w-auto"
                                    >
                                        <option value="♭5">♭5</option>
                                        <option value="♯4">♯4</option>
                                        <option value="♯4/♭5">♯4/♭5</option>
                                    </select>
                                </label>

                                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-300 gap-2">
                                    <span>Show Fret Markers:</span>
                                    <input
                                        type="checkbox"
                                        checked={showFretMarkers}
                                        onChange={(e) => onShowFretMarkersChange(e.target.checked)}
                                        className="w-4 h-4 text-accent bg-gray-700 border-gray-600 rounded focus:ring-accent focus:ring-2"
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Strings Settings */}
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                                </svg>
                                Strings
                            </h3>
                            <div className="space-y-3">
                                <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-300 gap-2">
                                    <span>Number of Strings:</span>
                                    <select
                                        value={numStrings}
                                        onChange={(e) => handleStandardTuning(Number(e.target.value))}
                                        className="bg-gray-700 text-white rounded px-2 py-1 text-xs w-full sm:w-auto"
                                    >
                                        <option value={6}>6</option>
                                        <option value={7}>7</option>
                                        <option value={8}>8</option>
                                    </select>
                                </label>

                                <div>
                                    <span className="text-xs text-gray-300 block mb-2">Tuning:</span>
                                    <div className={`grid gap-1 ${numStrings === 6 ? 'grid-cols-3 sm:grid-cols-6' : numStrings === 7 ? 'grid-cols-4 sm:grid-cols-7' : 'grid-cols-4 sm:grid-cols-8'}`}>
                                        {tuning.map((note, index) => (
                                            <select
                                                key={index}
                                                value={note}
                                                onChange={(e) => handleTuningChange(index, e.target.value)}
                                                className="bg-gray-700 text-white rounded px-1 py-1 text-xs text-center"
                                            >
                                                <option value="C2">C2</option>
                                                <option value="C#2">C#2</option>
                                                <option value="D2">D2</option>
                                                <option value="D#2">D#2</option>
                                                <option value="E2">E2</option>
                                                <option value="F2">F2</option>
                                                <option value="F#2">F#2</option>
                                                <option value="G2">G2</option>
                                                <option value="G#2">G#2</option>
                                                <option value="A2">A2</option>
                                                <option value="A#2">A#2</option>
                                                <option value="B2">B2</option>
                                                <option value="C3">C3</option>
                                                <option value="C#3">C#3</option>
                                                <option value="D3">D3</option>
                                                <option value="D#3">D#3</option>
                                                <option value="E3">E3</option>
                                                <option value="F3">F3</option>
                                                <option value="F#3">F#3</option>
                                                <option value="G3">G3</option>
                                                <option value="G#3">G#3</option>
                                                <option value="A3">A3</option>
                                                <option value="A#3">A#3</option>
                                                <option value="B3">B3</option>
                                                <option value="C4">C4</option>
                                                <option value="C#4">C#4</option>
                                                <option value="D4">D4</option>
                                                <option value="D#4">D#4</option>
                                                <option value="E4">E4</option>
                                                <option value="F4">F4</option>
                                                <option value="F#4">F#4</option>
                                                <option value="G4">G4</option>
                                                <option value="G#4">G#4</option>
                                                <option value="A4">A4</option>
                                                <option value="A#4">A#4</option>
                                                <option value="B4">B4</option>
                                            </select>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="pt-2 border-t border-gray-700">
                            <button
                                onClick={handleResetToDefaults}
                                className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-medium transition-colors"
                            >
                                Reset to Defaults
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings; 