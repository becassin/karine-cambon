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
    'imageDimensions': coverImage.asset->metadata.dimensions,
    "coverImage": coverImage
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

  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const bottom = rect.bottom - canvasRect.top;
    maxBottom = Math.max(maxBottom, bottom);
  });

  const PADDING_BOTTOM = 100;
  canvas.style.height = `${maxBottom + PADDING_BOTTOM}px`;
};

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [sculptures, setSculptures] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editable, setEditable] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1024);
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Check cookie auth client-side
  useEffect(() => {
    const checkAuth = () => {
      console.log('document.cookie:', document.cookie);

      const cookieValue = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_NAME}=`))
        ?.split('=')[1];

      console.log(cookieValue);
      console.log(PASSWORD);
      if (cookieValue === PASSWORD) {
        setEditable(true);
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

        // Wait for DOM render, then update canvas height
        setTimeout(() => {
          updateCanvasHeight();
        }, 50);

      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug]);

  if (loading) return <div>Loading...</div>;
  if (!category) return <div>Category not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sculptures in “{categorySlug}”</h1>

      <CanvasColorPicker
        categoryId={category._id}
        initialColor={category.background_color?.hex}
        editable={editable}
      />

      <Link
        href={`/sculptures/${categorySlug}`}
        className="block px-4 py-2 hover:bg-gray-100"
      >
        Voir
      </Link>

      <div id="canvas" className="relative container h-[1000px] border bg-gray-50 overflow-hidden">
        {sculptures.length === 0 ? (
          <p>No sculptures found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
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
                imageDimensions={sculpture.imageDimensions}
                editable={editable}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
