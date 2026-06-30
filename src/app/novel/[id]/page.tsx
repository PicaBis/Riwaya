import { notFound } from "next/navigation";
import { getNovelById, novels } from "@/data/novels";
import { NovelReadingClient } from "./NovelReadingClient";

/* ── Static params for pre-rendering ──────────────────── */
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

/* ── Page ──────────────────────────────────────────────── */
export default function NovelPage({ params }: { params: { id: string } }) {
  const novel = getNovelById(params.id);
  if (!novel) notFound();

  return <NovelReadingClient novel={novel} />;
}
