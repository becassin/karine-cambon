import { Suspense } from "react";
import Link from "next/link";

import { AllPosts } from "@/app/components/Posts";
import GetStartedCode from "@/app/components/GetStartedCode";
import { sanity } from '@/lib/sanity';
import PortableText from "@/app/components/PortableText";
import Image from 'next/image';

export default async function Page() {

  const settings = await sanity.fetch<{
    title: string
    about: any
    coverImage: {
      asset: {
        url: string
      }
      alt?: string
    }
  }>(`*[_id == "siteSettings"][0]{
    title,
    about,
    coverImage {
      alt,
      asset->{
        url
      }
    }
  }`)

  return (
    <div className="max-w-7xl mx-auto my-14 px-4 md:px-8">
      <div className="flex flex-col md:flex-row md:gap-12 items-center">
        {/* Text section */}
        <div className="w-full md:w-2/5 text-justify mb-8 md:mb-0">
          <PortableText value={settings.about} />
        </div>

        {/* Image section */}
        <div className="w-full md:w-3/5">
          <Image
            src={settings.coverImage.asset.url}
            alt={settings.coverImage.alt || 'Cover image'}
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
}
