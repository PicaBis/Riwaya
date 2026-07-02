"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield, MessageSquare, KeyRound, Users, Trash2, Plus, Copy, CheckCircle2,
  ArrowRight, RefreshCw, Ticket, Eye, LogOut,
} from "lucide-react";
import { verifyDevCode } from "@/lib/auth";
import { useApp } from "@/context/AppContext";

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
interface Stats {
  comments: { total: number; recent: RecentComment[] };
  codes: { total: number; used: number; unused: number };
  readers: { total: number; sessions: number };
}

export default function AdminPage() {
  const { setAdmin } = useApp();
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

  // Restore session passcode
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
      setGateError("الرمز غير صحيح");
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
    if (!confirm(`حذف الرمز ${code}؟`)) return;
    await fetch("/api/admin/codes", {
      method: "DELETE", headers: headers(), body: JSON.stringify({ code }),
    });
    loadAll();
  };

  const deleteComment = async (id: string) => {
    if (!confirm("حذف هذا التعليق نهائياً؟")) return;
    await fetch(`/api/comments/${id}`, {
      method: "DELETE", headers: headers(), body: JSON.stringify({ admin: true }),
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

  /* ── Passcode gate ─────────────────────────────── */
  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4" dir="rtl">
        <form onSubmit={handleGate} className="w-full max-w-sm bg-white dark:bg-onyx-800 rounded-2xl shadow-xl p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-xl font-arabic font-bold text-gray-900 dark:text-gray-100 mb-1">لوحة تحكم المطور</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-arabic mb-5">أدخل رمز المطور للدخول</p>
          <input
            type="password"
            value={gateInput}
            onChange={(e) => { setGateInput(e.target.value); setGateError(""); }}
            placeholder="رمز المطور"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-parchment-50 dark:bg-white/5 text-gray-900 dark:text-gray-100 text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/50 mb-3"
            dir="ltr"
          />
          {gateError && <p className="text-xs text-red-500 mb-3">{gateError}</p>}
          <button type="submit" className="w-full py-3 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-xl font-arabic font-medium transition-all">
            دخول
          </button>
          <Link href="/" className="inline-flex items-center gap-1 mt-4 text-xs text-gray-400 hover:text-gold-500 font-arabic">
            <ArrowRight className="w-3.5 h-3.5" /> العودة للرئيسية
          </Link>
        </form>
      </div>
    );
  }

  /* ── Dashboard ─────────────────────────────────── */
  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-arabic font-bold text-gray-900 dark:text-gray-100">
          <Shield className="w-6 h-6 text-rose-500" /> لوحة تحكم المطور
        </h1>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 text-sm font-arabic text-gray-600 dark:text-gray-300 hover:bg-parchment-100 dark:hover:bg-white/5 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> تحديث
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 text-sm font-arabic text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> خروج
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard icon={<MessageSquare className="w-5 h-5" />} label="التعليقات" value={stats?.comments.total ?? "—"} />
        <StatCard icon={<Users className="w-5 h-5" />} label="القراء" value={stats?.readers.total ?? "—"} />
        <StatCard icon={<Ticket className="w-5 h-5" />} label="رموز متاحة" value={stats?.codes.unused ?? "—"} />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="رموز مستخدمة" value={stats?.codes.used ?? "—"} />
      </div>

      {/* Activation codes */}
      <section className="mb-10">
        <h2 className="flex items-center gap-2 text-lg font-arabic font-bold text-gray-900 dark:text-gray-100 mb-3">
          <KeyRound className="w-5 h-5 text-gold-500" /> رموز التفعيل (الاشتراكات)
        </h2>
        <div className="flex flex-wrap items-end gap-2 mb-4 p-4 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/10">
          <div>
            <label className="block text-xs text-gray-500 font-arabic mb-1">العدد</label>
            <input type="number" min={1} max={50} value={genCount} onChange={(e) => setGenCount(Math.min(50, Math.max(1, +e.target.value || 1)))}
              className="w-20 px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 text-sm" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs text-gray-500 font-arabic mb-1">وصف (اختياري)</label>
            <input type="text" value={genLabel} onChange={(e) => setGenLabel(e.target.value)} placeholder="مثال: دفعة يناير"
              className="w-full px-3 py-2 rounded-lg border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 text-sm font-arabic" />
          </div>
          <button onClick={generate} disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-lg font-arabic text-sm font-medium transition-all disabled:opacity-40">
            <Plus className="w-4 h-4" /> توليد رموز
          </button>
        </div>

        <div className="space-y-1.5">
          {codes.length === 0 ? (
            <p className="text-sm text-gray-400 font-arabic py-4 text-center">لا توجد رموز بعد — قم بتوليد رموز لإرسالها للمشتركين</p>
          ) : (
            codes.map((c) => (
              <div key={c.code} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm ${c.used ? "border-parchment-200 dark:border-white/8 opacity-60" : "border-gold-500/30 bg-gold-500/5"}`}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100 tracking-wider" dir="ltr">{c.code}</span>
                  {c.label && <span className="text-xs text-gray-400 font-arabic truncate hidden sm:inline">· {c.label}</span>}
                  {c.used && <span className="text-[10px] text-rose-500 font-arabic">مستخدم</span>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!c.used && (
                    <button onClick={() => copy(c.code)} title="نسخ" className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 transition-colors">
                      {copied === c.code ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button onClick={() => deleteCode(c.code)} title="حذف" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Comments moderation */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-arabic font-bold text-gray-900 dark:text-gray-100 mb-3">
          <MessageSquare className="w-5 h-5 text-gold-500" /> إدارة التعليقات
        </h2>
        <div className="space-y-2">
          {!stats || stats.comments.recent.length === 0 ? (
            <p className="text-sm text-gray-400 font-arabic py-4 text-center">لا توجد تعليقات</p>
          ) : (
            stats.comments.recent.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-parchment-200 dark:border-white/8 bg-white dark:bg-onyx-800/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 font-arabic">{c.username}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{c.novel_id}</span>
                    {c.likes && c.likes.length > 0 && (
                      <span className="text-[10px] text-rose-500 flex items-center gap-0.5"><Eye className="w-3 h-3" />{c.likes.length}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-arabic break-words">{c.content}</p>
                </div>
                <button onClick={() => deleteComment(c.id)} title="حذف التعليق" className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex-shrink-0">
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="p-4 rounded-2xl border border-parchment-200 dark:border-white/10 bg-white dark:bg-onyx-800/40">
      <div className="flex items-center gap-2 text-gold-500 mb-1.5">{icon}</div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 font-arabic">{label}</div>
    </div>
  );
}
