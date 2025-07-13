import React from 'react';

interface TooltipProps {
  x: number;
  y: number;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({x, y, text}) => (
  <div
    className="absolute z-50 bg-white text-black text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
    style={{position: 'fixed', left: x + 10, top: y - 40}}
  >
    {text}
  </div>
);

export default Tooltip;
