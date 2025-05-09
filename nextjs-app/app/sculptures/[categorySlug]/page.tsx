import { sanity } from '@/lib/sanity';
import { groq } from 'next-sanity';

type Sculpture = {
  _id: string;
  title: string;
  description?: string;
};

const query = groq`
  *[
    _type == "sculpture" &&
    defined(category->slug.current) &&
    category->slug.current == $slug
  ]{
    _id,
    title,
    description
  }
`;

export default async function CategoryPage({
  params,
}: {
  params: { categorySlug: string };
}) {
  const sculptures: Sculpture[] = await sanity.fetch(query, {
    slug: params.categorySlug,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Sculptures in “{params.categorySlug}”
      </h1>

      {sculptures.length === 0 ? (
        <p>No sculptures found for this category.</p>
      ) : (
        <ul className="space-y-4">
          {sculptures.map((sculpture) => (
            <li key={sculpture._id} className="border p-4 rounded">
              <h2 className="text-lg font-semibold">{sculpture.title}</h2>
              {sculpture.description && (
                <p className="text-sm text-gray-600">{sculpture.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
