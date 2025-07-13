import React, { useEffect, useRef, useState } from 'react';

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

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm flex items-center space-x-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
            </button>

            {isOpen && (
                <div className={`absolute top-full right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 p-4 max-w-[90vw] sm:max-w-none ${numStrings === 6 ? 'w-80' : numStrings === 7 ? 'w-96' : 'w-[28rem]'}`}>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2">Fretboard</h3>
                            <div className="space-y-2">
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
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-white mb-2">Strings</h3>
                            <div className="space-y-2">
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings; 