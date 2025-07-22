import React, { useState } from 'react';

/**
 * Props for SaveLoadConfirmModal component.
 */
export interface SaveLoadConfirmModalProps {
    open: boolean;
    mode: 'export' | 'import';
    scales: { scale: string; root: string; color: string; hidden?: boolean }[];
    noteOverrides: Record<string, string>;
    onClose: () => void;
    onConfirm: (options: {
        selectedScales: number[];
        includeNoteOverrides: boolean;
        overrideOnImport?: boolean;
        importData?: {
            scales: { scale: string; root: string; color: string; hidden?: boolean }[];
            noteOverrides: Record<string, string>;
        };
    }) => void;
    onCancel?: () => void;
    /**
     * For import mode, the data to import (parsed from file)
     */
    importData?: {
        scales: { scale: string; root: string; color: string; hidden?: boolean }[];
        noteOverrides: Record<string, string>;
    };
}

/**
 * SaveLoadConfirmModal
 *
 * Modal for confirming export/import of scales and note overrides.
 * Allows user to select/deselect which scales and whether to include note overrides.
 * For import, allows user to choose what to load and whether to override existing data.
 *
 * @component
 * @param {SaveLoadConfirmModalProps} props
 * @returns {JSX.Element|null}
 */
const SaveLoadConfirmModal: React.FC<SaveLoadConfirmModalProps> = ({
    open,
    mode,
    scales,
    noteOverrides,
    onClose,
    onConfirm,
    onCancel,
    importData,
}) => {
    const [selectedScales, setSelectedScales] = useState<number[]>(
        mode === 'export'
            ? scales.map((_, i) => i)
            : importData?.scales
                ? importData.scales.map((_, i) => i)
                : []
    );
    const [includeNoteOverrides, setIncludeNoteOverrides] = useState(true);
    const [overrideOnImport, setOverrideOnImport] = useState(true);

    if (!open) return null;

    const scaleList = mode === 'export' ? scales : importData?.scales || [];
    const noteOverridesToShow = mode === 'export' ? noteOverrides : importData?.noteOverrides || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#23272F] rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl" onClick={onClose}>&times;</button>
                <h2 className="text-xl font-bold text-white mb-4">
                    {mode === 'export' ? 'Export Data' : 'Import Data'}
                </h2>
                <div className="space-y-4">
                    <div>
                        <span className="text-sm text-white font-semibold mb-2 block">
                            {mode === 'export' ? 'Select scales to export:' : 'Select scales to import:'}
                        </span>
                        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                            {scaleList.map((s, i) => (
                                <label key={i} className="flex items-center gap-2 text-white text-sm">
                                    <input
                                        type="checkbox"
                                        checked={selectedScales.includes(i)}
                                        onChange={() => {
                                            setSelectedScales(prev =>
                                                prev.includes(i)
                                                    ? prev.filter(idx => idx !== i)
                                                    : [...prev, i]
                                            );
                                        }}
                                    />
                                    <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: s.color }} />
                                    <span>{s.root} {s.scale}</span>
                                </label>
                            ))}
                            {scaleList.length === 0 && (
                                <span className="text-gray-400 text-xs">No scales available</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={includeNoteOverrides}
                            onChange={() => setIncludeNoteOverrides(v => !v)}
                            id="noteOverridesToggle"
                        />
                        <label htmlFor="noteOverridesToggle" className="text-white text-sm">
                            {mode === 'export' ? 'Include note overrides' : 'Import note overrides'}
                        </label>
                    </div>
                    {mode === 'import' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={overrideOnImport}
                                onChange={() => setOverrideOnImport(v => !v)}
                                id="overrideToggle"
                            />
                            <label htmlFor="overrideToggle" className="text-white text-sm">
                                Override current data
                            </label>
                        </div>
                    )}
                    {mode === 'export' && includeNoteOverrides && (
                        <div>
                            <span className="text-xs text-gray-300">Note overrides to export:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {Object.entries(noteOverridesToShow).map(([note, color]) => (
                                    <span key={note} className="px-2 py-1 rounded text-xs" style={{ background: color, color: '#23272F' }}>{note}</span>
                                ))}
                                {Object.keys(noteOverridesToShow).length === 0 && (
                                    <span className="text-gray-400 text-xs">None</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                        onClick={onCancel || onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-semibold"
                        onClick={() =>
                            onConfirm({
                                selectedScales,
                                includeNoteOverrides,
                                overrideOnImport: mode === 'import' ? overrideOnImport : undefined,
                                importData: mode === 'import' ? importData : undefined,
                            })
                        }
                    >
                        {mode === 'export' ? 'Export' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveLoadConfirmModal;
