import React, { useState } from 'react';
import ColorPicker from './ColorPicker';
import ScaleSelector from './ScaleSelector';

interface ScaleManagerProps {
  onAddScale: (scale: string, root: string, color: string) => void;
}

const ScaleManager: React.FC<ScaleManagerProps> = ({ onAddScale }) => {
  const [scale, setScale] = useState('diatonicMinor');
  const [root, setRoot] = useState('C');
  const [color, setColor] = useState('#0000ff');

  const handleAddScale = () => {
    onAddScale(scale, root, color);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4">
      <div className="flex flex-col space-y-2 sm:space-y-4 w-full sm:w-auto">
        <ScaleSelector
          onScaleChange={(newScale, newRoot) => {
            setScale(newScale);
            setRoot(newRoot);
          }}
        />
        <ColorPicker onColorChange={setColor} />
      </div>
      <button
        onClick={handleAddScale}
        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm w-full sm:w-auto"
      >
        Add Scale
      </button>
    </div>
  );
};

export default ScaleManager;
