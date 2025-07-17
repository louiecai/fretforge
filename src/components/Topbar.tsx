import React from 'react';

interface TopbarProps {
    preferFlat: boolean;
    onPreferFlatChange: (val: boolean) => void;
    octaveSelectionMode: boolean;
    onOctaveSelectionModeChange: (val: boolean) => void;
    onExport: () => void;
    onOpenSettings: () => void;
}

const ACCENT_ON = 'bg-blue-500'; // You can change this to your preferred accent
const ACCENT_OFF = 'bg-gray-600';

const Topbar: React.FC<TopbarProps> = ({
    preferFlat,
    onPreferFlatChange,
    octaveSelectionMode,
    onOctaveSelectionModeChange,
    onExport,
    onOpenSettings,
}) => {
    return (
        <header className="w-full flex items-center justify-between px-4 py-2 bg-[#23272F] shadow-md z-40">
            <div className="flex items-center gap-4">
                <span className="text-2xl font-bold tracking-wider text-white select-none" style={{ fontFamily: 'Monoton, cursive' }}>FretForge</span>
            </div>
            <div className="flex items-center gap-6">
                {/* Sharps/Flats Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">Sharps</span>
                    <button
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${preferFlat ? ACCENT_OFF : ACCENT_ON}`}
                        onClick={() => onPreferFlatChange(!preferFlat)}
                        aria-label="Toggle sharps/flats"
                        type="button"
                    >
                        <span
                            className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200`}
                            style={{ transform: preferFlat ? 'translateX(24px)' : 'translateX(0)' }}
                        />
                    </button>
                    <span className="text-xs text-gray-300">Flats</span>
                </div>
                {/* Octave Selection Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">Octave Select</span>
                    <button
                        className={`relative w-10 h-6 rounded-full transition-colors duration-200 focus:outline-none ${octaveSelectionMode ? ACCENT_ON : ACCENT_OFF}`}
                        onClick={() => onOctaveSelectionModeChange(!octaveSelectionMode)}
                        aria-label="Toggle octave selection mode"
                        type="button"
                    >
                        <span
                            className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200`}
                            style={{ transform: octaveSelectionMode ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                    </button>
                </div>
                {/* Export Button */}
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded shadow text-xs font-semibold hover:bg-blue-600 transition-colors"
                    onClick={onExport}
                >
                    Export PNG
                </button>
                {/* Settings Button */}
                <button
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white focus:outline-none"
                    onClick={onOpenSettings}
                    aria-label="Open settings"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Topbar; 