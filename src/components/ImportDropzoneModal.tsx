import React from 'react';
import { useDropzone } from 'react-dropzone';

/**
 * Props for ImportDropzoneModal component.
 */
export interface ImportDropzoneModalProps {
    open: boolean;
    onClose: () => void;
    /**
     * Called with parsed JSON data or error string
     */
    onFileParsed: (data: any, error?: string) => void;
}

/**
 * ImportDropzoneModal
 *
 * Modal for drag-and-drop JSON import using react-dropzone.
 *
 * @component
 * @param {ImportDropzoneModalProps} props
 * @returns {JSX.Element|null}
 */
const ImportDropzoneModal: React.FC<ImportDropzoneModalProps> = ({ open, onClose, onFileParsed }) => {
    const [error, setError] = React.useState<string | null>(null);

    const onDrop = React.useCallback((acceptedFiles: File[]) => {
        setError(null);
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string);
                onFileParsed(data);
            } catch (e) {
                setError('Invalid JSON file.');
                onFileParsed(null, 'Invalid JSON file.');
            }
        };
        reader.onerror = () => {
            setError('Failed to read file.');
            onFileParsed(null, 'Failed to read file.');
        };
        reader.readAsText(file);
    }, [onFileParsed]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/json': ['.json'] },
        multiple: false,
    });

    React.useEffect(() => {
        if (!open) setError(null);
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-[#23272F] rounded-xl shadow-2xl p-6 w-full max-w-md relative flex flex-col items-center">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl" onClick={onClose}>&times;</button>
                <h2 className="text-xl font-bold text-white mb-4">Import Data</h2>
                <div
                    {...getRootProps()}
                    className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-colors duration-200 cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-900/20' : 'border-gray-500 bg-gray-800/40'}`}
                    style={{ minHeight: 180 }}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-blue-400 text-lg font-semibold">Drop the JSON file here...</p>
                    ) : (
                        <>
                            <p className="text-white text-lg font-semibold mb-2">Drag & drop a JSON file here</p>
                            <p className="text-gray-400 text-sm">or click to select a file</p>
                            <p className="text-gray-500 text-xs mt-2">Only .json files are accepted</p>
                        </>
                    )}
                </div>
                {error && <div className="text-red-400 text-sm mt-4">{error}</div>}
            </div>
        </div>
    );
};

export default ImportDropzoneModal; 