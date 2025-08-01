/**
 * ScaleSelectorAdvanced.tsx
 *
 * Advanced scale selector with categorized search interface.
 * Provides organized browsing of scales, chords, and modes with search functionality.
 * All note names use unicode symbols for sharps (♯) and flats (♭).
 */

import React, { useMemo, useState } from 'react';
import { Note } from '../lib/Note';

/**
 * Scale/Chord category definition.
 */
interface ScaleCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    items: ScaleItem[];
}

/**
 * Individual scale/chord item.
 */
interface ScaleItem {
    value: string;
    label: string;
    description: string;
    category: string;
    tags: string[];
}

/**
 * Props for ScaleSelectorAdvanced component.
 */
interface ScaleSelectorAdvancedProps {
    /** Callback when the scale or root changes */
    onScaleChange: (scale: string, root: string) => void;
    /** Whether to display notes as flats (♭) or sharps (♯) */
    preferFlat?: boolean;
    /** Whether the modal is open */
    isOpen: boolean;
    /** Callback to close the modal */
    onClose: () => void;
}

/**
 * Helper: Get the index of a note name (using unicode, flats preferred).
 */
function getNoteIndex(note: string): number {
    // Accepts unicode note names (e.g. "C", "D♭", "E♭", etc.)
    // This logic should match Note.getNoteName's output.
    // We'll use a static mapping for 12 notes.
    const NOTE_NAMES: string[] = [
        "C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"
    ];
    const FLAT_EQUIV: Record<string, string> = {
        "C♯": "D♭",
        "D♯": "E♭",
        "F♯": "G♭",
        "G♯": "A♭",
        "A♯": "B♭"
    };
    for (let i = 0; i < NOTE_NAMES.length; i++) {
        if (NOTE_NAMES[i] === note) return i;
        if (FLAT_EQUIV[NOTE_NAMES[i]] === note) return i;
    }
    // Accept plain "Db", "Eb", etc.
    const ASCII_EQUIV: Record<string, number> = {
        "C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6, "Gb": 6,
        "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11
    };
    if (note in ASCII_EQUIV) return ASCII_EQUIV[note];
    if (note.endsWith("♭")) {
        const base = note[0];
        return getNoteIndex(base + "b");
    }
    if (note.endsWith("♯")) {
        const base = note[0];
        return getNoteIndex(base + "#");
    }
    return 0; // fallback to C
}

/**
 * Helper: Get scale/chord notes by root and type.
 * This is a placeholder; in a real app, use a comprehensive scale/chord engine.
 */
const SCALE_INTERVALS: Record<string, number[]> = {
    // Scales
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
    melodicMinor: [0, 2, 3, 5, 7, 9, 11],
    pentatonicMajor: [0, 2, 4, 7, 9],
    pentatonicMinor: [0, 3, 5, 7, 10],
    bluesMajor: [0, 2, 3, 4, 7, 9],
    bluesMinor: [0, 3, 5, 6, 7, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    altered: [0, 1, 3, 4, 6, 8, 10],
    lydianDominant: [0, 2, 4, 6, 7, 9, 10],
    wholeTone: [0, 2, 4, 6, 8, 10],
    diminished: [0, 2, 3, 5, 6, 8, 9, 11],
    hirajoshi: [0, 2, 3, 7, 8],
    phrygianDominant: [0, 1, 4, 5, 7, 8, 10],
    hungarianMinor: [0, 2, 3, 6, 7, 8, 11],
    persian: [0, 1, 4, 5, 6, 8, 11],
    octatonic: [0, 2, 3, 5, 6, 8, 9, 11],
    hexatonic: [0, 2, 4, 6, 8, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    tritone: [0, 6],
    // Chords
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    "7": [0, 4, 7, 10],
    dim7: [0, 3, 6, 9],
    m7b5: [0, 3, 6, 10],
    maj9: [0, 4, 7, 11, 14],
    min9: [0, 3, 7, 10, 14],
    "9": [0, 4, 7, 10, 14],
    maj6: [0, 4, 7, 9],
    min6: [0, 3, 7, 9],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
};

/**
 * Get the note names for a given root and scale/chord type.
 */
function getScaleNotes(root: string, scaleType: string, preferFlat: boolean): string[] {
    const rootIndex = getNoteIndex(root);
    const intervals = SCALE_INTERVALS[scaleType];
    if (!intervals) return [];
    return intervals.map(i => Note.getNoteName((rootIndex + i) % 12, preferFlat));
}

/**
 * Comprehensive scale and chord library with categories.
 * 
 * Tag accuracy notes:
 * - "happy" is used for major and bright-sounding chords/scales, but also for some suspended and open chords.
 * - "sad" is used for minor and dark-sounding chords/scales, but also for some diminished and modal items.
 * - Some chords/scales can be both "happy" and "sad" depending on context (e.g. sus2, sus4, mixolydian, etc).
 */
const SCALE_LIBRARY: ScaleCategory[] = [
    {
        id: 'scales',
        name: 'Scales',
        description: 'Traditional and modern scales',
        icon: '🎼',
        items: [
            { value: 'major', label: 'Major', description: 'Classic major scale (Ionian mode)', category: 'scales', tags: ['major', 'diatonic', 'classical', 'bright', 'happy'] },
            { value: 'minor', label: 'Minor', description: 'Natural minor scale (Aeolian mode)', category: 'scales', tags: ['minor', 'diatonic', 'classical', 'dark', 'sad'] },
            { value: 'harmonicMinor', label: 'Harmonic Minor', description: 'Minor scale with raised 7th', category: 'scales', tags: ['minor', 'harmonic', 'classical', 'dramatic', 'sad'] },
            { value: 'melodicMinor', label: 'Melodic Minor', description: 'Minor scale with raised 6th and 7th ascending', category: 'scales', tags: ['minor', 'melodic', 'classical', 'smooth', 'sad'] },
            { value: 'pentatonicMajor', label: 'Pentatonic Major', description: 'Five-note major scale', category: 'scales', tags: ['major', 'pentatonic', 'folk', 'simple', 'happy'] },
            { value: 'pentatonicMinor', label: 'Pentatonic Minor', description: 'Five-note minor scale', category: 'scales', tags: ['minor', 'pentatonic', 'folk', 'simple', 'sad'] },
            { value: 'bluesMajor', label: 'Blues Major', description: 'Major scale with blues notes', category: 'scales', tags: ['major', 'blues', 'jazz', 'soulful', 'happy'] },
            { value: 'bluesMinor', label: 'Blues Minor', description: 'Minor scale with blues notes', category: 'scales', tags: ['minor', 'blues', 'jazz', 'soulful', 'sad'] },
        ]
    },
    {
        id: 'chords',
        name: 'Chords',
        description: 'Triads and extended chords',
        icon: '🎸',
        items: [
            { value: 'maj', label: 'Major Chord', description: 'Major triad (1-3-5)', category: 'chords', tags: ['major', 'triad', 'bright', 'happy'] },
            { value: 'min', label: 'Minor Chord', description: 'Minor triad (1-♭3-5)', category: 'chords', tags: ['minor', 'triad', 'dark', 'sad'] },
            { value: 'dim', label: 'Diminished Chord', description: 'Diminished triad (1-♭3-♭5)', category: 'chords', tags: ['diminished', 'triad', 'tension', 'unstable', 'sad'] },
            { value: 'aug', label: 'Augmented Chord', description: 'Augmented triad (1-3-♯5)', category: 'chords', tags: ['augmented', 'triad', 'tension', 'unstable', 'bright'] },
            { value: 'maj7', label: 'Major 7th', description: 'Major seventh chord (1-3-5-7)', category: 'chords', tags: ['major', 'seventh', 'jazz', 'smooth', 'happy'] },
            { value: 'min7', label: 'Minor 7th', description: 'Minor seventh chord (1-♭3-5-♭7)', category: 'chords', tags: ['minor', 'seventh', 'jazz', 'mellow', 'sad'] },
            { value: '7', label: 'Dominant 7th', description: 'Dominant seventh chord (1-3-5-♭7)', category: 'chords', tags: ['dominant', 'seventh', 'blues', 'tension', 'soulful'] },
            { value: 'dim7', label: 'Diminished 7th', description: 'Diminished seventh chord (1-♭3-♭5-♭♭7)', category: 'chords', tags: ['diminished', 'seventh', 'tension', 'unstable', 'sad'] },
            { value: 'm7b5', label: 'Half-diminished 7th', description: 'Half-diminished seventh (m7♭5)', category: 'chords', tags: ['half-diminished', 'seventh', 'jazz', 'tension', 'sad'] },
            { value: 'maj9', label: 'Major 9th', description: 'Major ninth chord (1-3-5-7-9)', category: 'chords', tags: ['major', 'ninth', 'jazz', 'smooth', 'happy'] },
            { value: 'min9', label: 'Minor 9th', description: 'Minor ninth chord (1-♭3-5-♭7-9)', category: 'chords', tags: ['minor', 'ninth', 'jazz', 'mellow', 'sad'] },
            { value: '9', label: 'Dominant 9th', description: 'Dominant ninth chord (1-3-5-♭7-9)', category: 'chords', tags: ['dominant', 'ninth', 'jazz', 'soulful'] },
            { value: 'maj6', label: 'Major 6th', description: 'Major sixth chord (1-3-5-6)', category: 'chords', tags: ['major', 'sixth', 'jazz', 'smooth', 'happy'] },
            { value: 'min6', label: 'Minor 6th', description: 'Minor sixth chord (1-♭3-5-6)', category: 'chords', tags: ['minor', 'sixth', 'jazz', 'mellow', 'sad'] },
            { value: 'sus2', label: 'Suspended 2nd', description: 'Suspended second chord (1-2-5)', category: 'chords', tags: ['suspended', 'open', 'folk', 'simple', 'bright', 'happy'] },
            { value: 'sus4', label: 'Suspended 4th', description: 'Suspended fourth chord (1-4-5)', category: 'chords', tags: ['suspended', 'open', 'folk', 'simple', 'bright', 'happy'] },
        ]
    },
    {
        id: 'modes',
        name: 'Modes',
        description: 'Modal scales and variations',
        icon: '🎵',
        items: [
            { value: 'dorian', label: 'Dorian Mode', description: 'Minor scale with major 6th', category: 'modes', tags: ['minor', 'modal', 'jazz', 'smooth', 'mellow'] },
            { value: 'phrygian', label: 'Phrygian Mode', description: 'Minor scale with minor 2nd', category: 'modes', tags: ['minor', 'modal', 'flamenco', 'exotic', 'dark', 'sad'] },
            { value: 'lydian', label: 'Lydian Mode', description: 'Major scale with sharp 4th', category: 'modes', tags: ['major', 'modal', 'dreamy', 'floating', 'bright', 'happy'] },
            { value: 'mixolydian', label: 'Mixolydian Mode', description: 'Major scale with minor 7th', category: 'modes', tags: ['major', 'modal', 'blues', 'rock', 'bright', 'happy'] },
            { value: 'locrian', label: 'Locrian Mode', description: 'Diminished scale with minor 2nd', category: 'modes', tags: ['diminished', 'modal', 'tension', 'unstable', 'dark', 'sad'] },
        ]
    },
    {
        id: 'jazz',
        name: 'Jazz Scales',
        description: 'Advanced jazz and modern scales',
        icon: '🎷',
        items: [
            { value: 'altered', label: 'Altered Scale', description: 'Dominant scale with altered tones', category: 'jazz', tags: ['dominant', 'jazz', 'tension', 'modern', 'dark'] },
            { value: 'lydianDominant', label: 'Lydian Dominant', description: 'Dominant scale with sharp 4th', category: 'jazz', tags: ['dominant', 'jazz', 'bright', 'modern', 'happy'] },
            { value: 'wholeTone', label: 'Whole Tone', description: 'Six-note scale with whole steps', category: 'jazz', tags: ['symmetric', 'jazz', 'dreamy', 'modern', 'bright'] },
            { value: 'diminished', label: 'Diminished Scale', description: 'Eight-note symmetric scale', category: 'jazz', tags: ['symmetric', 'jazz', 'tension', 'modern', 'dark', 'sad'] },
        ]
    },
    {
        id: 'world',
        name: 'World Music',
        description: 'Traditional scales from around the world',
        icon: '🌍',
        items: [
            { value: 'hirajoshi', label: 'Hirajoshi', description: 'Japanese pentatonic scale', category: 'world', tags: ['pentatonic', 'japanese', 'exotic', 'traditional', 'sad'] },
            { value: 'phrygianDominant', label: 'Phrygian Dominant', description: 'Spanish/Flamenco scale', category: 'world', tags: ['spanish', 'flamenco', 'exotic', 'passionate', 'bright'] },
            { value: 'hungarianMinor', label: 'Hungarian Minor', description: 'Gypsy scale with augmented 4th', category: 'world', tags: ['gypsy', 'exotic', 'dramatic', 'traditional', 'sad'] },
            { value: 'persian', label: 'Persian Scale', description: 'Middle Eastern scale', category: 'world', tags: ['middle-eastern', 'exotic', 'mysterious', 'traditional', 'dark'] },
        ]
    },
    {
        id: 'modern',
        name: 'Modern Scales',
        description: 'Contemporary and experimental scales',
        icon: '⚡',
        items: [
            { value: 'octatonic', label: 'Octatonic', description: 'Eight-note diminished scale', category: 'modern', tags: ['symmetric', 'modern', 'tension', 'experimental', 'dark', 'sad'] },
            { value: 'hexatonic', label: 'Hexatonic', description: 'Six-note whole tone scale', category: 'modern', tags: ['symmetric', 'modern', 'dreamy', 'experimental', 'bright'] },
            { value: 'chromatic', label: 'Chromatic', description: 'All twelve notes', category: 'modern', tags: ['chromatic', 'modern', 'experimental', 'dense'] },
            { value: 'tritone', label: 'Tritone Scale', description: 'Scale built on tritone intervals', category: 'modern', tags: ['tritone', 'modern', 'tension', 'experimental', 'dark'] },
        ]
    }
];

/**
 * Advanced scale selector with categorized search interface.
 */
const ScaleSelectorAdvanced: React.FC<ScaleSelectorAdvancedProps> = ({
    onScaleChange,
    preferFlat = false,
    isOpen,
    onClose
}) => {
    const [selectedRoot, setSelectedRoot] = useState('C');
    const [selectedScale, setSelectedScale] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Generate root note options based on preferFlat
    const ROOTS = Array.from({ length: 12 }, (_, i) => Note.getNoteName(i, preferFlat));

    // Get all available tags
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        SCALE_LIBRARY.forEach(category => {
            category.items.forEach(item => {
                item.tags.forEach(tag => tags.add(tag));
            });
        });
        return Array.from(tags).sort();
    }, []);

    // Filter items based on search, category, and tags
    const filteredItems = useMemo(() => {
        let items: ScaleItem[] = [];

        // Collect items from selected category or all categories
        if (selectedCategory === 'all') {
            SCALE_LIBRARY.forEach(category => {
                items.push(...category.items);
            });
        } else {
            const category = SCALE_LIBRARY.find(cat => cat.id === selectedCategory);
            if (category) {
                items = category.items;
            }
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            items = items.filter(item =>
                item.label.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Filter by selected tags
        if (selectedTags.length > 0) {
            items = items.filter(item =>
                selectedTags.every(tag => item.tags.includes(tag))
            );
        }

        return items;
    }, [searchQuery, selectedCategory, selectedTags]);

    /**
     * Handles scale selection and triggers the callback.
     */
    const handleScaleSelect = (scaleValue: string) => {
        setSelectedScale(scaleValue);
        onScaleChange(scaleValue, selectedRoot);
    };

    /**
     * Handles root note selection and triggers the callback.
     */
    const handleRootSelect = (rootValue: string) => {
        setSelectedRoot(rootValue);
        if (selectedScale) {
            onScaleChange(selectedScale, rootValue);
        }
    };

    /**
     * Toggles a tag filter.
     */
    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        );
    };

    /**
     * Clears all filters.
     */
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedTags([]);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50"
            style={{ pointerEvents: 'auto' }}
        >
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 50,
                }}
            />
            {/* Modal Content */}
            <div
                className="fixed inset-0 flex items-center justify-center p-4"
                style={{
                    zIndex: 51,
                    pointerEvents: 'none',
                }}
            >
                <div
                    className="bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                    style={{ pointerEvents: 'auto' }}
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 border-b border-gray-700 gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Scale & Chord Library</h2>
                            <p className="text-gray-400 text-sm">Browse and search scales, chords, and modes</p>
                        </div>
                        {/* Root Note Selection - moved to header for visibility */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1 md:mb-0 md:mr-2">Root Note</label>
                            <select
                                value={selectedRoot}
                                onChange={(e) => handleRootSelect(e.target.value)}
                                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent"
                            >
                                {ROOTS.map(note => (
                                    <option key={note} value={note}>{note}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors absolute top-4 right-4 md:static md:ml-4"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex flex-1 h-[calc(90vh-120px)] min-h-0">
                        {/* Sidebar - Categories and Filters */}
                        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search scales, chords, modes..."
                                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 focus:ring-accent focus:border-transparent"
                                />
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedCategory === 'all'
                                            ? 'bg-accent text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                            }`}
                                    >
                                        🎵 All Items
                                    </button>
                                    {SCALE_LIBRARY.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${selectedCategory === category.id
                                                ? 'bg-accent text-white'
                                                : 'text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            {category.icon} {category.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-300">Tags</label>
                                    {selectedTags.length > 0 && (
                                        <button
                                            onClick={() => setSelectedTags([])}
                                            className="text-xs text-accent hover:text-accentlight"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {allTags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => toggleTag(tag)}
                                            className={`px-2 py-1 rounded text-xs transition-colors ${selectedTags.includes(tag)
                                                ? 'bg-accent text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {(searchQuery || selectedCategory !== 'all' || selectedTags.length > 0) && (
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-3 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors text-sm"
                                >
                                    Clear All Filters
                                </button>
                            )}
                        </div>

                        {/* Main Content - Scale/Chord Grid */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredItems.map(item => {
                                    // Show notes for scales and chords
                                    const notes = getScaleNotes(selectedRoot, item.value, preferFlat);
                                    return (
                                        <button
                                            key={item.value}
                                            onClick={() => handleScaleSelect(item.value)}
                                            className={`p-3 rounded-lg border-2 transition-all hover:shadow-lg w-full text-left ${selectedScale === item.value
                                                ? 'border-accent bg-accent bg-opacity-10'
                                                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                                }`}
                                            style={{ fontSize: '1rem' }}
                                        >
                                            <div>
                                                <h3 className="font-semibold text-white mb-1">{item.label}</h3>
                                                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                                                {notes.length > 0 && (
                                                    <div className="mb-2">
                                                        <div className="bg-gray-900 border border-accent rounded px-2 py-1 flex flex-wrap gap-2 justify-center items-center">
                                                            <span className="text-xs font-semibold text-accent mr-2">Notes:</span>
                                                            {notes.map((n, idx) => (
                                                                <span
                                                                    key={n + idx}
                                                                    className="inline-block px-2 py-1 rounded bg-accent text-white font-mono text-xs"
                                                                >
                                                                    {n}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags.map(tag => (
                                                        <span
                                                            key={tag}
                                                            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredItems.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 text-lg mb-2">No items found</div>
                                    <div className="text-gray-500 text-sm">Try adjusting your search or filters</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-700 bg-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-400">
                                {filteredItems.length} items found
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-accent text-white rounded hover:bg-accentlight transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScaleSelectorAdvanced; 