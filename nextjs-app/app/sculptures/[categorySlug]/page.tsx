import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';
import SculptureCard from '@/app/components/SculptureCard';

const query = groq`
  *[
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
  }
`;// or correct path

export default async function CategoryPage({ params }: { params: { categorySlug: string } }) {
  const sculptures = await sanity.fetch(query, { slug: params.categorySlug });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Sculptures in “{params.categorySlug}”
      </h1>

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
}
