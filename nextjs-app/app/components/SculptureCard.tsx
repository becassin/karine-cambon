'use client';

import { useEffect, useRef, useState } from 'react';
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import { urlFor } from "@/lib/imageUrl";

type Props = {
  title: string;
  description?: PortableTextBlock[]; // 👈 Change this line
  id: string;
  top?: number;
  left?: number;
  left_percentage?: string;
  width?: number;
  width_percentage? : string;
  height?: number;
  image?: any;
  editable?: boolean;
  isMobile?: boolean;
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

function updateCanvasHeight() {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const cards = canvas.querySelectorAll('.sculpture-card');
  let maxBottom = 0;

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const bottom = rect.bottom - canvasRect.top;
    maxBottom = Math.max(maxBottom, bottom);
  });

  const PADDING_BOTTOM = 100;
  canvas.style.height = `${maxBottom + PADDING_BOTTOM}px`;
}

export default function SculptureCard({
  title,
  description,
  id,
  top,
  left,
  left_percentage,
  width,
  width_percentage,
  height,
  image,
  editable = false,
  isMobile = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!editable) return;
    const el = ref.current;
    const canvas = document.getElementById('canvas');
    if (!el || !canvas) return;

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
      const el = ref.current;
      const canvas = document.getElementById('canvas');
      if (!el || !canvas) return;

      const canvasRect = canvas.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const PADDING_BOTTOM = 100; // px

      if (isDragging.current) {
        const newLeft = clamp(
          e.clientX - canvasRect.left - offset.current.x,
          0,
          canvasRect.width - el.offsetWidth
        );

        const newTop = Math.max(
          0,
          e.clientY - canvasRect.top - offset.current.y
        );

        el.style.left = `${newLeft}px`;
        el.style.top = `${newTop}px`;

        // 🔽 Extend canvas if needed, with padding
        const cardBottom = newTop + el.offsetHeight + PADDING_BOTTOM;
        const canvasCurrentHeight = canvas.offsetHeight;

        if (cardBottom > canvasCurrentHeight) {
          canvas.style.height = `${cardBottom}px`;
        }
      }

      if (isResizing.current) {
        const newWidth = clamp(
          e.clientX - elRect.left,
          50,
          canvasRect.width - (elRect.left - canvasRect.left)
        );

        el.style.width = `${newWidth}px`;
      }
    };

    const onMouseUp = async () => {
      const el = ref.current;
      const canvas = document.getElementById('canvas');
      if (!el || !canvas) return;

      const rect = el.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      const top = rect.top - canvasRect.top;
      const left = rect.left - canvasRect.left;
      const left_percentage = left * 100 / canvasRect.width + "%";

      const width = rect.width;
      const width_percentage = width * 100 / canvasRect.width + "%";
      const height = rect.height;

      console.log("canvasRect");
      console.log(canvasRect);
      console.log("percentage");
      console.log(width_percentage + "%");
      console.log(left_percentage + "%");

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
            left_percentage: left_percentage,
            width: Number(width.toFixed(2)),
            width_percentage: width_percentage,
            height: Number(height.toFixed(2)),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        console.log(`✅ Updated "${title}"`);
        updateCanvasHeight();
      } catch (err: any) {
        console.error('❌ Failed to save:', err.message);
      }


      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    el?.addEventListener('mousedown', onMouseDown);

    return () => {
      el?.removeEventListener('mousedown', onMouseDown);
    };
  }, [id, title, editable]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  let positioningClasses = "absolute sculpture-card bg-red-100";
  if (!width_percentage) {
    width_percentage = "5%";
  }
  const widthMobile = "100%";
  if (isMobile) {
    console.log("woohoo");
    positioningClasses = "sculpture-card mb-4 bg-red-100";
  }

  return (
    <>
      <div
        ref={ref}
        id={id}
        className={positioningClasses}
        style={{
          top: top ?? 0,
          left: left_percentage ?? 0,
          width: isMobile ? widthMobile : width_percentage,
          height: 'auto',
        }}
      >

        <img
          src={image ? urlFor(image).url() : ''}
          draggable={false}
          tabIndex={-1}
          className="pointer-events-auto w-full h-auto select-none cursor-pointer"
          style={{ outline: 'none' }}
          onClick={() => !editable && setIsModalOpen(true)}
        />

        {editable && (
          <div
            className="resize-handle absolute bottom-1 right-1 w-4 h-4 bg-gray-400 cursor-se-resize"
            style={{ zIndex: 10 }}
          />
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex">
          {/* Image Section */}
          <div className="w-2/3 flex items-center justify-center">
            <img src={image} className="max-h-[90vh] max-w-full" />
          </div>

          {/* Info Section */}
          <div className="w-1/3 text-white p-10 relative flex flex-col justify-center">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white text-3xl hover:text-gray-400 focus:outline-none"
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            {description && (
              <div className="prose prose-invert prose-sm text-gray-100">
                <PortableText value={description} />
              </div>
            )}
          </div>
        </div>
      )}

    </>
  );
}
