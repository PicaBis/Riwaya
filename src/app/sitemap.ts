import type { MetadataRoute } from "next";
import { novels } from "@/data/novels";

const BASE = "https://rewayati.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE + "/", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: BASE + "/library", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: BASE + "/about", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: BASE + "/privacy", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: BASE + "/terms", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: BASE + "/refund", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const novelPages: MetadataRoute.Sitemap = novels.filter((n) => !n.mystery).map((n) => ({
    url: `${BASE}/novel/${n.id}`,
    lastModified: n.lastUpdated ? new Date(n.lastUpdated) : now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticPages, ...novelPages];
}
