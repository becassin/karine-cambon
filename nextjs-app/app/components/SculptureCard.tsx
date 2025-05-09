'use client';

import { useEffect, useRef } from 'react';

type Props = {
  title: string;
  description?: string;
  id: string;
  top?: number;
  left?: number;
};


export default function SculptureCard({ title, description, id, top, left }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDragging = false;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      el.style.position = 'absolute';
      el.style.zIndex = '999';
      el.style.pointerEvents = 'none'; // prevent nested clicks

      const rect = el.getBoundingClientRect();
      offset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      el.style.left = `${e.clientX - offset.current.x}px`;
      el.style.top = `${e.clientY - offset.current.y}px`;
    };

    const onMouseUp = async () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.pointerEvents = 'auto';

      const rect = el.getBoundingClientRect();

      try {
        const res = await fetch('/api/updateSculptureDimensions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            top: Number(rect.top.toFixed(2)),
            left: Number(rect.left.toFixed(2)),
            width: Number(rect.width.toFixed(2)),
            height: Number(rect.height.toFixed(2)),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        console.log(`✅ Saved new position for "${title}"`);
      } catch (err: any) {
        console.error('❌ Failed to save position:', err.message);
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', onMouseDown);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
    };
  }, [id, title]);

  return (
    <div
      ref={ref}
      id={id}
      className="sculpture-card absolute border bg-white p-4 rounded shadow cursor-move"
      style={{
        top: top ?? 0,
        left: left ?? 0,
        position: 'absolute',
      }}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  );
}
