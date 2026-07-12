import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNovelById, novels } from "@/data/novels";
import { NovelPageClient } from "./NovelPageClient";

const BASE = "https://rewayati.vercel.app";

export function generateStaticParams() {
  return novels.filter((n) => !n.mystery).map((n) => ({ id: n.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const novel = getNovelById(params.id);
  if (!novel) return { title: "رواية غير موجودة" };

  const title = `${novel.title} — روايتي`;
  const url = `${BASE}/novel/${novel.id}`;
  const description = novel.description.slice(0, 200);

  return {
    title,
    description,
    alternates: { canonical: `/novel/${novel.id}` },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "روايتي",
      locale: "ar_DZ",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    keywords: [novel.title, novel.genre, novel.author, "رواية", "قراءة", ...(novel.tags || [])],
  };
}

export default function NovelPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const novel = getNovelById(params.id);
  if (!novel || novel.mystery) notFound();

  const startPage = searchParams.page ? parseInt(searchParams.page, 10) || 1 : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    author: { "@type": "Person", name: novel.author },
    inLanguage: novel.language,
    genre: novel.genre,
    datePublished: String(novel.year),
    description: novel.description,
    url: `${BASE}/novel/${novel.id}`,
    publisher: { "@type": "Organization", name: "روايتي" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NovelPageClient novel={novel} startPage={startPage} />
    </>
  );
}
