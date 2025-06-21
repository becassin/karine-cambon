'use client';

import { useEffect, useState } from 'react';
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

const updateCanvasHeight = () => {

  const canvas = document.getElementById('canvas');
  if (!canvas) return;

  const cards = canvas.querySelectorAll('.absolute'); // Target sculpture cards
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


const waitForImages = () => {
  const images = document.querySelectorAll<HTMLImageElement>('#canvas img');
  const promises = Array.from(images).map(img => {
    return new Promise<void>((resolve) => {
      if (img.complete) {
        resolve();
      } else {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Prevent blocking on broken images
      }
    });
  });

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

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_NAME}=`))
        ?.split('=')[1];

      if (cookieValue === PASSWORD) {
        setLoggedIn(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return;
      setLoading(true);

      try {
        const { sculptures, category } = await sanity.fetch(query, { slug: categorySlug });
        setSculptures(sculptures);
        setCategory(category);

        // Wait for DOM update and image load
        setTimeout(() => {
          waitForImages().then(() => {
            updateCanvasHeight();
          });
        }, 0);

      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  // ✅ Window resize listener (ALWAYS registers)
  useEffect(() => {
    const handleWindowResize = () => {
      console.log('Window resize');
      updateCanvasHeight();
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  // ✅ ResizeObserver just for canvas size/content changes
  useEffect(() => {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;

    const observer = new ResizeObserver(() => {
      updateCanvasHeight();
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  let sculpturesClasses = "container relative h-[2000px]";
  let canvasClasses = "relative w-full h-[1000px] border bg-gray-50 overflow-hidden";
  if (isMobile) {
    sculpturesClasses = "columns-1 sm:columns-2 gap-4 p-4";
    canvasClasses = "relative w-full h-[1000px] border bg-gray-50";
  }

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

      <div id="canvas" className={canvasClasses}>
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
