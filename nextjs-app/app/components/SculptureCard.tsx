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
  image?: string;
  editable?: boolean;
};

// Clamp helper to restrict values
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

export default function SculptureCard({
  title,
  description,
  id,
  top,
  left,
  width,
  height,
  image,
  editable = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);

  useEffect(() => {
    if (!editable) return;
    const el = ref.current;
    const canvas = document.getElementById('canvas');
    if (!el || !canvas) return;

    const canvasRect = canvas.getBoundingClientRect();

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      const elRect = el.getBoundingClientRect();

      if (target.classList.contains('resize-handle')) {
        isResizing.current = true;
      } else {
        isDragging.current = true;
        offset.current = {
          x: e.clientX - elRect.left,
          y: e.clientY - elRect.top,
        };
      }

      el.style.zIndex = '1000';

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!el || !canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      if (isDragging.current) {
        const newLeft = clamp(
          e.clientX - canvasRect.left - offset.current.x,
          0,
          canvasRect.width - el.offsetWidth
        );

        const newTop = clamp(
          e.clientY - canvasRect.top - offset.current.y,
          0,
          canvasRect.height - el.offsetHeight
        );

        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;
      }

      if (isResizing.current) {
        const newWidth = clamp(
          e.clientX - elRect.left,
          50,
          canvasRect.width - (elRect.left - canvasRect.left)
        );

        const newHeight = clamp(
          e.clientY - elRect.top,
          50,
          canvasRect.height - (elRect.top - canvasRect.top)
        );

        el.style.width = `${newWidth}px`;
        // el.style.height = `${newHeight}px`;
      }
    };

    const onMouseUp = async () => {
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      // Get position relative to canvas
      const top = rect.top - canvasRect.top;
      const left = rect.left - canvasRect.left;

      const width = rect.width;
      const height = rect.height;

      isDragging.current = false;
      isResizing.current = false;
      el.style.zIndex = '0';

      try {
        const res = await fetch('/api/updateSculptureDimensions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            top: Number(top.toFixed(2)),
            left: Number(left.toFixed(2)),
            width: Number(width.toFixed(2)),
            height: Number(height.toFixed(2)),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        console.log(`✅ Updated "${title}"`);
      } catch (err: any) {
        console.error('❌ Failed to save:', err.message);
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', onMouseDown);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
    };
  }, [id, title, editable]);

  return (
    <div
      ref={ref}
      id={id}
      className="absolute"
      style={{
        position: 'absolute',
        top: top ?? 0,
        left: left ?? 0,
        width: width ?? 200,
        height: 'auto',
      }}
    >
      {/* <h2 className="text-lg font-semibold">{title}</h2> */}
      {description && <p className="text-sm text-gray-600">{description}</p>}


      <img
        src={image}
        draggable={false}
        tabIndex={-1}
        className="pointer-events-none w-full h-auto select-none"
        style={{ outline: 'none' }}
      />

      {/* Resize handle */}
      {editable && (
        <div
          className="resize-handle absolute bottom-1 right-1 w-4 h-4 bg-gray-400 cursor-se-resize"
          style={{ zIndex: 10 }}
          />
      )}
    </div>
  );
}
