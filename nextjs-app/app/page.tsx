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
    <div className="max-w-7xl mx-auto px-4 md:px-8 md:py-16">
      <div className="flex flex-col-reverse md:flex-row items-center md:items-stretch gap-12 md:gap-40">

        {/* Text section */}
        <div className="w-full md:w-4/10 flex items-center">
          <div className="text-justify">
            <PortableText value={settings.about} />
          </div>
        </div>

        {/* Image section */}
        <div className="w-full md:w-6/10">
          <Image
            src={settings.coverImage.asset.url}
            alt={settings.coverImage.alt || 'Cover image'}
            width={1200}
            height={800}
            className="w-full h-auto object-cover shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
