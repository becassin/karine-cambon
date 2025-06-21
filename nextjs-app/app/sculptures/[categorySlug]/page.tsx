'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';
import SculptureCard from '@/app/components/SculptureCard';
import CanvasColorPicker from '@/app/components/CanvasColorPicker';
import { useParams } from 'next/navigation';
import Link from "next/link";

const query = groq`
{
  "sculptures": *[
    _type == "sculpture" &&
    defined(category->slug.current) &&
    category->slug.current == $slug
  ]{
    _id,
    title,
    description[],
    top,
    left,
    left_percentage,
    width,
    width_percentage,
    height,
    "coverImage": coverImage,
    extraImages
  },
  "category": *[_type == "category" && slug.current == $slug][0]{
    _id,
    title,
    background_color
  }
}
`;

const COOKIE_NAME = process.env.NEXT_PUBLIC_COOKIE_NAME || 'sculpture_auth';
const PASSWORD = process.env.NEXT_PUBLIC_SIMPLE_PASSWORD || 'mySecret123';

const waitForImages = () => {
  const images = document.querySelectorAll<HTMLImageElement>('#canvas img');
  const promises = Array.from(images).map(img =>
    new Promise<void>((resolve) => {
      if (img.complete) resolve();
      else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    })
  );
  return Promise.all(promises);
};

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [sculptures, setSculptures] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const editable = false;
  const [loggedIn, setLoggedIn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const updateCanvasHeight = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cards = canvas.querySelectorAll('.absolute');
    let maxBottom = 0;
    const canvasRect = canvas.getBoundingClientRect();

    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const bottom = rect.bottom - canvasRect.top;
      maxBottom = Math.max(maxBottom, bottom);
    });

    const header = document.getElementById('header');
    const headerHeight = header?.offsetHeight || 0;

    const PADDING_BOTTOM = 100;
    const contentHeight = maxBottom + PADDING_BOTTOM;
    const viewportHeight = window.innerHeight - headerHeight;
    const finalHeight = Math.max(contentHeight, viewportHeight);

    canvas.style.minHeight = `${finalHeight}px`;
  };

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1];

    if (cookieValue === PASSWORD) {
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return;
      setLoading(true);

      try {
        const { sculptures, category } = await sanity.fetch(query, { slug: categorySlug });
        setSculptures(sculptures);
        setCategory(category);
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  // Run after DOM + images have loaded
  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    waitForImages().then(() => {
      requestAnimationFrame(() => {
        updateCanvasHeight();
      });
    });

    // Optional fallback retry in case images load too late
    const fallback = setTimeout(() => {
      updateCanvasHeight();
    }, 1500);

    return () => clearTimeout(fallback);
  }, [sculptures]);

  // Listen to window resize
  useEffect(() => {
    const handleResize = () => updateCanvasHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  const sculpturesClasses = isMobile
    ? "columns-1 sm:columns-2 gap-4 p-4"
    : "container relative h-[2000px]";

  const canvasClasses = isMobile
    ? "relative w-full h-[1000px] border bg-gray-50"
    : "relative w-full h-[1000px] border bg-gray-50 overflow-hidden";

  return (
    <div className="">
      <CanvasColorPicker
        categoryId={category._id}
        initialColor={category.background_color?.hex}
        editable={editable}
      />
      {loggedIn && (
        <Link
          href={`/sculptures-admin/${categorySlug}`}
          className="block px-4 py-2 hover:bg-gray-100"
        >
          Éditer
        </Link>
      )}

      <div id="canvas" ref={canvasRef} className={canvasClasses}>
        {sculptures.length === 0 ? (
          <p>No sculptures found.</p>
        ) : (
          <div className={sculpturesClasses}>
            {sculptures.map((sculpture) => (
              <SculptureCard
                key={sculpture._id}
                id={sculpture._id}
                title={sculpture.title}
                description={sculpture.description}
                top={sculpture.top}
                left={sculpture.left}
                left_percentage={sculpture.left_percentage}
                width={sculpture.width}
                width_percentage={sculpture.width_percentage}
                height={sculpture.height}
                image={sculpture.coverImage}
                editable={editable}
                isMobile={isMobile}
                extraImages={sculpture.extraImages}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
