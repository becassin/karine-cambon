'use client';

import { useEffect } from 'react';

type Props = {
  title: string;
  description?: string;
  id: string;
};

export default function SculptureCard({ title, description, id }: Props) {
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    const handleClick = async () => {
      const rect = el.getBoundingClientRect();

      const dimensions = {
        top: Number(rect.top.toFixed(2)),
        left: Number(rect.left.toFixed(2)),
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
      };

      try {
        const res = await fetch('/api/updateSculptureDimensions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...dimensions }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        console.log(`✅ Updated "${title}" dimensions:`, dimensions);
      } catch (err: any) {
        console.error('❌ Failed to update dimensions:', err.message);
      }
    };

    el.addEventListener('click', handleClick);
    return () => {
      el.removeEventListener('click', handleClick);
    };
  }, [id, title]);

  return (
    <div
      id={id}
      className="sculpture-card border p-4 rounded hover:shadow cursor-pointer"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}
