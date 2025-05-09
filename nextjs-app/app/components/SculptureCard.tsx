'use client';

import { useEffect, useRef } from 'react';

type Props = {
  title: string;
  description?: string;
  id: string;
  top?: number;
  left?: number;
  width?: number;
  height?: number;
};

export default function SculptureCard({ title, description, id, top, left, width, height }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const offset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDragging = false;
    let isResizing = false;

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('resize-handle')) {
        isResizing = true;
      } else {
        isDragging = true;
        const rect = el.getBoundingClientRect();
        offset.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
        e.preventDefault();
      }

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!el) return;

      if (isDragging) {
        el.style.left = `${e.clientX - offset.current.x}px`;
        el.style.top = `${e.clientY - offset.current.y}px`;
      }

      if (isResizing) {
        const rect = el.getBoundingClientRect();
        el.style.width = `${e.clientX - rect.left}px`;
        el.style.height = `${e.clientY - rect.top}px`;
      }
    };

    const handleMouseUp = async () => {
      if (!el) return;

      const rect = el.getBoundingClientRect();

      isDragging = false;
      isResizing = false;

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
        console.log(`✅ Updated position & size for "${title}"`);
      } catch (err: any) {
        console.error('❌ Failed to update:', err.message);
      }

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    el.addEventListener('mousedown', handleMouseDown);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
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
        width: width ?? 200,
        height: height ?? 'auto',
        position: 'absolute',
        zIndex: 999,
      }}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-gray-600">{description}</p>}

      {/* Resize handle */}
      <div
        className="resize-handle absolute bottom-1 right-1 w-4 h-4 bg-gray-400 cursor-se-resize"
        style={{ zIndex: 10 }}
      />
    </div>
  );
}
