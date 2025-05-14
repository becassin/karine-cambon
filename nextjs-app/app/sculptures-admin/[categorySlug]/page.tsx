'use client';

import { useEffect, useState } from 'react';
import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';
import SculptureCard from '@/app/components/SculptureCard';
import CanvasColorPicker from '@/app/components/CanvasColorPicker';
import { useParams } from 'next/navigation';

const query = groq`
{
  "sculptures": *[
    _type == "sculpture" &&
    defined(category->slug.current) &&
    category->slug.current == $slug
  ]{
    _id,
    title,
    description,
    top,
    left,
    width,
    height
  },
  "category": *[_type == "category" && slug.current == $slug][0]{
    _id,
    title,
    background_color
  }
}
`;

const CategoryPage = () => {
  const { categorySlug } = useParams(); // Access dynamic categorySlug from URL
  const [sculptures, setSculptures] = useState<any[]>([]); // State for sculptures
  const [category, setCategory] = useState<any>(null); // State for category
  const [loading, setLoading] = useState(true); // State to manage loading state

  // Fetch data when the component mounts or when the categorySlug changes
  useEffect(() => {
    const fetchData = async () => {
      if (!categorySlug) return; // Ensure we have a categorySlug
      setLoading(true); // Set loading to true while data is being fetched

      try {
        const { sculptures, category } = await sanity.fetch(query, { slug: categorySlug });
        setSculptures(sculptures); // Update sculptures state
        setCategory(category); // Update category state
      } catch (error) {
        console.error('Failed to fetch category data:', error);
      } finally {
        setLoading(false); // Set loading to false once data fetching is complete
      }
    };

    fetchData(); // Trigger the fetch function
  }, [categorySlug]); // Re-run this effect if categorySlug changes

  if (loading) {
    return <div>Loading...</div>; // Loading state
  }

  if (!category) {
    return <div>Category not found</div>; // Handle case where category is not available
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sculptures in “{categorySlug}”</h1>

      <CanvasColorPicker
        categoryId={category._id}
        initialColor={category.background_color?.hex}
      />

      <div id="canvas" className="relative w-full h-[1000px] border bg-gray-50 overflow-hidden">
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
                width={sculpture.width}
                height={sculpture.height}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
