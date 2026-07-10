"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield, MessageSquare, KeyRound, Users, Trash2, Plus, Copy, CheckCircle2,
  ArrowRight, RefreshCw, Ticket, Eye, LogOut, Star, UserCheck,
} from "lucide-react";
import { verifyDevCode } from "@/lib/auth";
import { getNovelById } from "@/data/novels";
import { useApp } from "@/context/AppContext";
import { t } from "@/lib/i18n";

interface AdminCode {
  code: string;
  label: string | null;
  used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}
interface RecentComment {
  id: string;
  novel_id: string;
  username: string;
  content: string;
  created_at: string;
  likes?: string[];
}
interface RatingRow {
  novel_id: string;
  stars: number;
  user_key: string;
  updated_at: string;
}
interface Stats {
  comments: { total: number; recent: RecentComment[] };
  codes: { total: number; used: number; unused: number };
  readers: { total: number; sessions: number };
  ratings?: {
    total: number;
    perNovel: { novelId: string; avg: number; count: number }[];
    recent: RatingRow[];
  };
  guests?: { total: number; recent: { name: string; created_at: string }[] };
}

export default function AdminPage() {
  const { setAdmin, lang } = useApp();
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [devCode, setDevCode] = useState("");
  const [authed, setAuthed] = useState(false);
  const [gateInput, setGateInput] = useState("");
  const [gateError, setGateError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [codes, setCodes] = useState<AdminCode[]>([]);
  const [loading, setLoading] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genLabel, setGenLabel] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("riwayati_devcode");
    if (saved) {
      verifyDevCode(saved).then((ok) => {
        if (ok) { setDevCode(saved); setAuthed(true); }
      });
    }
  }, []);

  const headers = useCallback(
    () => ({ "Content-Type": "application/json", "x-dev-code": devCode }),
    [devCode]
  );

  const loadAll = useCallback(async () => {
    if (!devCode) return;
    setLoading(true);
    try {
      const [s, c] = await Promise.all([
        fetch("/api/admin/stats", { headers: headers() }),
        fetch("/api/admin/codes", { headers: headers() }),
      ]);
      if (s.ok) setStats(await s.json());
      if (c.ok) setCodes(await c.json());
    } catch {}
    setLoading(false);
  }, [devCode, headers]);

  useEffect(() => { if (authed) loadAll(); }, [authed, loadAll]);

  const handleGate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyDevCode(gateInput.trim());
    if (ok) {
      setDevCode(gateInput.trim());
      sessionStorage.setItem("riwayati_devcode", gateInput.trim());
      setAdmin(true);
      setAuthed(true);
      setGateError("");
    } else {
      setGateError(t("admin.badCode", lang));
    }
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ count: genCount, label: genLabel }),
      });
      if (res.ok) { setGenLabel(""); loadAll(); }
    } catch {}
    setLoading(false);
  };

  const deleteCode = async (code: string) => {
    if (!confirm(t("admin.confirmDeleteCode", lang, { code }))) return;
    await fetch("/api/admin/codes", {
      method: "DELETE", headers: headers(), body: JSON.stringify({ code }),
    });
    loadAll();
  };

  const deleteComment = async (id: string) => {
    if (!confirm(t("admin.confirmDeleteComment", lang))) return;
    await fetch(`/api/comments/${id}`, {
      method: "DELETE", headers: headers(), body: JSON.stringify({ admin: true }),
    });
    loadAll();
  };

  const deleteGuest = async (name: string) => {
    if (!confirm(t("admin.confirmDeleteGuest", lang, { name }))) return;
    await fetch("/api/admin/guests", {
      method: "DELETE", headers: headers(), body: JSON.stringify({ nameKey: name }),
    });
    loadAll();
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(""), 1800);
  };

  const logout = () => {
    sessionStorage.removeItem("riwayati_devcode");
    setAuthed(false);
    setDevCode("");
  };

  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4" dir={dir}>
        <form onSubmit={handleGate} className="w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-xl p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className={`text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 ${fontClass}`}>{t("admin.title", lang)}</h1>
          <p className={`text-sm text-gray-500 dark:text-gray-400 mb-5 ${fontClass}`}>{t("admin.enterCode", lang)}</p>
          <input
            type="password"
            value={gateInput}
            onChange={(e) => { setGateInput(e.target.value); setGateError(""); }}
            placeholder={t("admin.placeholder", lang)}
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-parchment-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/50 mb-3"
            dir="ltr"
          />
          {gateError && <p className="text-xs text-red-500 mb-3">{gateError}</p>}
          <button type="submit" className={`w-full py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl font-medium transition-all ${fontClass}`}>
            {t("admin.login", lang)}
          </button>
          <Link href="/" className={`inline-flex items-center gap-1 mt-4 text-xs text-gray-400 hover:text-gold-500 ${fontClass}`}>
            <ArrowRight className={`w-3.5 h-3.5 ${dir === "ltr" ? "rotate-180" : ""}`} /> {t("admin.backHome", lang)}
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir={dir}>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className={`flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>
          <Shield className="w-6 h-6 text-rose-500" /> {t("admin.title", lang)}
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 text-sm text-gray-600 dark:text-gray-300 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors ${fontClass}`}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> {t("admin.refresh", lang)}
          </button>
          <button onClick={logout} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 text-sm text-gray-500 hover:text-red-500 transition-colors ${fontClass}`}>
            <LogOut className="w-4 h-4" /> {t("admin.logout", lang)}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <StatCard icon={<MessageSquare className="w-5 h-5" />} label={t("admin.comments", lang)} value={stats?.comments.total ?? "—"} lang={lang} />
        <StatCard icon={<Star className="w-5 h-5" />} label={t("admin.ratings", lang)} value={stats?.ratings?.total ?? "—"} lang={lang} />
        <StatCard icon={<Users className="w-5 h-5" />} label={t("admin.readers", lang)} value={stats?.readers.total ?? "—"} lang={lang} />
        <StatCard icon={<UserCheck className="w-5 h-5" />} label={t("admin.guests", lang)} value={stats?.guests?.total ?? "—"} lang={lang} />
        <StatCard icon={<Ticket className="w-5 h-5" />} label={t("admin.codesAvail", lang)} value={stats?.codes.unused ?? "—"} lang={lang} />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label={t("admin.codesUsed", lang)} value={stats?.codes.used ?? "—"} lang={lang} />
      </div>

      {/* Ratings by novel */}
      <section className="mb-10">
        <h2 className={`flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 ${fontClass}`}>
          <Star className="w-5 h-5 text-gold-500" /> {t("admin.ratingsSection", lang)}
        </h2>
        {!stats?.ratings || stats.ratings.perNovel.length === 0 ? (
          <p className={`text-sm text-gray-400 py-4 text-center ${fontClass}`}>{t("admin.noRatings", lang)}</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            {stats.ratings.perNovel.map((r) => {
              const novel = getNovelById(r.novelId);
              return (
                <div key={r.novelId} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-parchment-200 dark:border-white/8 bg-white dark:bg-onyx-800/40">
                  <div className="min-w-0">
                    <p className={`text-sm font-bold text-gray-900 dark:text-gray-100 truncate ${fontClass}`}>
                      {novel?.title || r.novelId}
                    </p>
                    <p className={`text-xs text-gray-400 ${fontClass}`}>{r.count} {t("admin.raters", lang)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-4 h-4 text-gold-500 fill-gold-500" />
                    <span className="text-lg font-bold text-gold-500">{r.avg}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Activation codes */}
      <section className="mb-10">
        <h2 className={`flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 ${fontClass}`}>
          <KeyRound className="w-5 h-5 text-gold-500" /> {t("admin.codesSection", lang)}
        </h2>
        <div className="flex flex-wrap items-end gap-2 mb-4 p-4 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10">
          <div>
            <label className={`block text-xs text-gray-500 mb-1 ${fontClass}`}>{t("admin.count", lang)}</label>
            <input type="number" min={1} max={50} value={genCount} onChange={(e) => setGenCount(Math.min(50, Math.max(1, +e.target.value || 1)))}
              className="w-20 px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 text-sm" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className={`block text-xs text-gray-500 mb-1 ${fontClass}`}>{t("admin.label", lang)}</label>
            <input type="text" value={genLabel} onChange={(e) => setGenLabel(e.target.value)} placeholder={t("admin.labelPlaceholder", lang)}
              className={`w-full px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 text-sm ${fontClass}`} />
          </div>
          <button onClick={generate} disabled={loading}
            className={`flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-40 ${fontClass}`}>
            <Plus className="w-4 h-4" /> {t("admin.generate", lang)}
          </button>
        </div>

        <div className="space-y-1.5">
          {codes.length === 0 ? (
            <p className={`text-sm text-gray-400 py-4 text-center ${fontClass}`}>{t("admin.noCodes", lang)}</p>
          ) : (
            codes.map((c) => (
              <div key={c.code} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm ${c.used ? "border-parchment-200 dark:border-white/8 opacity-60" : "border-gold-500/30 bg-gold-500/5"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider" dir="ltr">{c.code}</span>
                  {c.label && <span className={`text-xs text-gray-400 truncate hidden sm:inline ${fontClass}`}>· {c.label}</span>}
                  {c.used && <span className={`text-[10px] text-rose-500 ${fontClass}`}>{t("admin.used", lang)}</span>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!c.used && (
                    <button onClick={() => copy(c.code)} title={t("admin.copy", lang)} className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 transition-colors">
                      {copied === c.code ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => deleteCode(c.code)} title={t("admin.delete", lang)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Comments moderation */}
      <section className="mb-10">
        <h2 className={`flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 ${fontClass}`}>
          <MessageSquare className="w-5 h-5 text-gold-500" /> {t("admin.commentsSection", lang)}
        </h2>
        <div className="space-y-2">
          {!stats || stats.comments.recent.length === 0 ? (
            <p className={`text-sm text-gray-400 py-4 text-center ${fontClass}`}>{t("admin.noComments", lang)}</p>
          ) : (
            stats.comments.recent.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-parchment-200 dark:border-white/8 bg-white dark:bg-onyx-800/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>{c.username}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{c.novel_id}</span>
                    {c.likes && c.likes.length > 0 && (
                      <span className="text-[10px] text-rose-500 flex items-center gap-0.5"><Eye className="w-3 h-3" />{c.likes.length}</span>
                    )}
                  </div>
                  <p className={`text-sm text-gray-600 dark:text-gray-300 break-words ${fontClass}`}>{c.content}</p>
                </div>
                <button onClick={() => deleteComment(c.id)} title={t("admin.deleteComment", lang)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Registered guest names */}
      <section>
        <h2 className={`flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 ${fontClass}`}>
          <UserCheck className="w-5 h-5 text-gold-500" /> {t("admin.guestsSection", lang)}
        </h2>
        <div className="space-y-2">
          {!stats?.guests || stats.guests.recent.length === 0 ? (
            <p className={`text-sm text-gray-400 py-4 text-center ${fontClass}`}>{t("admin.noGuests", lang)}</p>
          ) : (
            stats.guests.recent.map((g) => (
              <div key={g.name} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-parchment-200 dark:border-white/8 bg-white dark:bg-onyx-800/40">
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${fontClass}`}>{g.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{new Date(g.created_at).toLocaleDateString("ar-DZ")}</p>
                </div>
                <button onClick={() => deleteGuest(g.name)} title={t("admin.deleteGuest", lang)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, lang }: { icon: React.ReactNode; label: string; value: number | string; lang: "ar" | "en" }) {
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  return (
    <div className="p-4 rounded-2xl border border-parchment-200 dark:border-white/10 bg-white dark:bg-onyx-800/40">
      <div className="flex items-center gap-2 text-gold-500 mb-1.5">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className={`text-xs text-gray-500 dark:text-gray-400 ${fontClass}`}>{label}</div>
    </div>
  );
}
