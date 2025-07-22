import React, { useEffect, useState } from 'react';

/**
 * CreditsModal Component
 * Modal dialog displaying app credits and acknowledgments.
 * @param {object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {() => void} props.onClose - Handler to close the modal
 */
const CreditsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const [creditData, setCreditData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        setError(null);
        fetch(`${import.meta.env.BASE_URL}credits.json`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to load credits');
                return res.json();
            })
            .then(data => {
                setCreditData(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Could not load credits.');
                setLoading(false);
            });
    }, [open]);

    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#23272F] rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white"
                    onClick={onClose}
                    aria-label="Close credits"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-lg font-bold text-white mb-2">Credits</h2>
                {loading && <p className="text-gray-300 text-sm mb-4">Loading...</p>}
                {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                {creditData && (
                    <>
                        <p className="text-gray-300 text-sm mb-4">
                            {creditData.appName} v{creditData.version}<br />
                            Created by {creditData.author}<br />
                            GitHub: <a href={creditData.github} className="underline text-blue-400" target="_blank" rel="noopener noreferrer">{creditData.github.replace('https://', '')}</a><br />
                            {creditData.description}<br />
                        </p>
                        {creditData.acknowledgments && (
                            <p className="text-gray-400 text-xs">
                                {creditData.acknowledgments.map((ack: string, i: number) => (
                                    <span key={i}>{ack}<br /></span>
                                ))}
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CreditsModal; 