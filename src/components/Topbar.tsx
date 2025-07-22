import React from 'react';

interface TopbarProps {
    preferFlat: boolean;
    onPreferFlatChange: (val: boolean) => void;
    octaveSelectionMode: boolean;
    onOctaveSelectionModeChange: (val: boolean) => void;
    onExport: () => void;
    onOpenSettings: () => void;
    /**
     * Called when user selects Export or Import from the Export/Import dropdown
     * @param type 'export' or 'import'
     */
    onExportImport: (type: 'export' | 'import') => void;
    onOpenCredits: () => void;
}

const ACCENT_ON = 'bg-blue-500'; // You can change this to your preferred accent
const ACCENT_OFF = 'bg-gray-600';

/**
 * Topbar Component
 * 
 * Header component containing the FretForge logo and main controls.
 * Responsive design that adapts to different screen sizes.
 * 
 * @component
 * @param {TopbarProps} props - Component props
 * @returns {JSX.Element} The topbar component
 */
const Topbar: React.FC<TopbarProps> = ({
    preferFlat,
    onPreferFlatChange,
    octaveSelectionMode,
    onOctaveSelectionModeChange,
    onExport,
    onOpenSettings,
    onExportImport,
    onOpenCredits,
}) => {
    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    return (
        <header className="w-full flex items-center justify-between px-2 sm:px-4 py-2 bg-[#23272F] shadow-md z-40">
            <div className="flex items-center gap-2 sm:gap-4">
                <span
                    className="text-xl sm:text-2xl font-bold tracking-wider text-white select-none"
                    style={{
                        fontFamily: 'Monoton, cursive',
                        textShadow: '0 0 8px rgba(255, 255, 200, 0.3), 0 0 16px rgba(255, 255, 150, 0.2), 0 0 24px rgba(255, 255, 100, 0.15)',
                        filter: 'drop-shadow(0 0 6px rgba(255, 255, 200, 0.2))'
                    }}
                >
                    FretForge
                </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                {/* Sharps/Flats Toggle */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs text-gray-300 hidden sm:inline">Sharps</span>
                    <button
                        className={`relative w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-200 focus:outline-none ${preferFlat ? ACCENT_OFF : ACCENT_ON}`}
                        onClick={() => onPreferFlatChange(!preferFlat)}
                        aria-label="Toggle sharps/flats"
                        type="button"
                    >
                        <span
                            className={`absolute left-0.5 sm:left-1 top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white shadow transition-transform duration-200`}
                            style={{ transform: preferFlat ? 'translateX(150%)' : 'translateX(0)' }}
                        />
                    </button>
                    <span className="text-xs text-gray-300 hidden sm:inline">Flats</span>
                </div>
                {/* Octave Selection Toggle */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs text-gray-300 hidden sm:inline">Octave</span>
                    <button
                        className={`relative w-8 sm:w-10 h-5 sm:h-6 rounded-full transition-colors duration-200 focus:outline-none ${octaveSelectionMode ? ACCENT_ON : ACCENT_OFF}`}
                        onClick={() => onOctaveSelectionModeChange(!octaveSelectionMode)}
                        aria-label="Toggle octave selection mode"
                        type="button"
                    >
                        <span
                            className={`absolute left-0.5 sm:left-1 top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white shadow transition-transform duration-200`}
                            style={{ transform: octaveSelectionMode ? 'translateX(16px)' : 'translateX(0)' }}
                        />
                    </button>
                </div>
                {/* Export PNG Button */}
                <button
                    className="px-2 sm:px-3 py-1 bg-blue-500 text-white rounded shadow text-xs font-semibold hover:bg-blue-600 transition-colors"
                    onClick={onExport}
                >
                    <span className="hidden sm:inline">Export PNG</span>
                    <span className="sm:hidden">Export</span>
                </button>
                {/* Export/Import Dropdown */}
                <div className="relative">
                    <button
                        className="px-2 sm:px-3 py-1 bg-gray-700 text-white rounded shadow text-xs font-semibold hover:bg-gray-600 transition-colors flex items-center gap-1"
                        onClick={() => setDropdownOpen(v => !v)}
                        aria-haspopup="true"
                        aria-expanded={dropdownOpen}
                        type="button"
                    >
                        Export/Import
                        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-[#23272F] border border-gray-700 rounded shadow-lg z-50">
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-500 rounded-t"
                                onClick={() => { setDropdownOpen(false); onExportImport('export'); }}
                            >
                                Export Data
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-500 rounded-b"
                                onClick={() => { setDropdownOpen(false); onExportImport('import'); }}
                            >
                                Import Data
                            </button>
                        </div>
                    )}
                </div>
                {/* Settings Button */}
                <button
                    className="p-1.5 sm:p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white focus:outline-none"
                    onClick={onOpenSettings}
                    aria-label="Open settings"
                >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                </button>
                {/* Credits Button */}
                <button
                    className="p-1.5 sm:p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white focus:outline-none"
                    onClick={onOpenCredits}
                    aria-label="Open credits"
                >
                    <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Topbar; 