import React, { useState } from 'react';

interface ColorPickerProps {
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ onColorChange }) => {
  const [color, setColor] = useState('#444447'); // Default color is neutral grey
  let debounceTimeout: NodeJS.Timeout | null = null;

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = event.target.value;
    setColor(newColor); // Update local state

    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      onColorChange(newColor); // Update parent state after debounce
    }, 330); // Increased debounce delay by 10%
  };

  return (
    <div className="flex flex-col items-center">
      <label className="text-white text-sm">
        Color:
        <input
          type="color"
          value={color}
          onChange={handleColorChange} // Debounced update
          className="ml-2 p-1 sm:p-2 rounded w-12 h-8"
        />
      </label>
    </div>
  );
};

export default ColorPicker;
