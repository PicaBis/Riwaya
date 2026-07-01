import { notFound } from "next/navigation";
import { getNovelById, novels } from "@/data/novels";
import { NovelReadingClient } from "./NovelReadingClient";

export function generateStaticParams() {
  return novels.map((n) => ({ id: n.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const novel = getNovelById(params.id);
  if (!novel) return { title: "رواية غير موجودة" };
  return {
    title: `${novel.title} — روايتي`,
    description: novel.description,
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
  if (!novel) notFound();

  const startPage = searchParams.page ? parseInt(searchParams.page, 10) || 1 : undefined;

  return <NovelReadingClient novel={novel} startPage={startPage} />;
}
