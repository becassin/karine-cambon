'use client';

import { useState, useEffect } from 'react';

type Props = {
  categoryId: string;
  initialColor?: string;
  editable?: boolean;
};

export default function CanvasColorPicker({ categoryId, initialColor,editable = false }: Props) {
  const [color, setColor] = useState(initialColor || '#ffffff');

  useEffect(() => {
    const canvas = document.getElementById('canvas');
    if (canvas) {
      canvas.style.backgroundColor = color;
    }
  }, [color, editable]);

  if (!editable) return;

  console.log(32);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);

    try {
      console.log('Sending color update:', {
        id: categoryId,
        background_color: {
          _type: 'color',
          hex: newColor,
          alpha: 1,
        },
      });

      const res = await fetch('/api/updateCategoryColor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: categoryId,
          background_color: {
            _type: 'color',
            hex: newColor,
            alpha: 1,
          },
        }),
      });

      // Check if the response is ok
      if (!res.ok) {
        // Log the response text to see what went wrong
        const errorText = await res.text();
        console.error('Error response from API:', errorText);
        throw new Error(errorText);
      }

      console.log(`✅ Category background updated to ${newColor}`);
    } catch (err) {
      // Log the error more clearly
      console.error('❌ Error updating category background color:', err);
    }
  };

  return (
    <div>
    { editable && (
        <div className="p-4">
          <label className="mr-2 font-medium">Canvas Background:</label>
          <input
            type="color"
            value={color}
            onChange={handleChange}
            className="w-8 h-8 cursor-pointer border rounded"
          />
        </div>
    )}
    </div>


  );
}
