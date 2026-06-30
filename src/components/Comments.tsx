"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Pin,
  Trash2,
  Shield,
  Ban,
  Send,
  LogIn,
  Clock,
  PinOff,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useToast } from "./Toast";

/* ─── Types ───────────────────────────────────────────── */
interface CommentData {
  id: string;
  novelId: string;
  chapterId?: number;
  author: string;
  content: string;
  likes: number;
  likedBy: string[];
  parentId?: string;
  createdAt: number;
  pinned?: boolean;
}

interface CommentsProps {
  novelId: string;
  chapterId?: number;
}

/* ─── Component ───────────────────────────────────────── */
export function Comments({ novelId, chapterId }: CommentsProps) {
  const { guest, isAdmin } = useApp();
  const { toast } = useToast();

  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  /* ── Fetch ─────────────────────────────────────────── */
  const fetchComments = useCallback(async () => {
    try {
      const params = new URLSearchParams({ novelId });
      if (chapterId) params.set("chapterId", String(chapterId));
      const res = await fetch(`/api/comments?${params}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [novelId, chapterId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  /* ── Like ───────────────────────────────────────────── */
  const handleLike = async (id: string) => {
    if (!guest) { setShowLoginPrompt(true); return; }
    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, guestId: guest.name }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments((prev) =>
          prev.map((c) => (c.id === id ? data.comment : c))
        );
      }
    } catch {
      toast("حدث خطأ", "error");
    }
  };

  /* ── Post ───────────────────────────────────────────── */
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest) { setShowLoginPrompt(true); return; }
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          novelId,
          chapterId,
          author: guest.name,
          content: newContent.trim(),
        }),
      });
      const data = await res.json();
      if (res.status === 403) {
        toast("تم حظرك من التعليق", "error");
      } else if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setNewContent("");
        toast("تم إضافة تعليقك", "success");
      }
    } catch {
      toast("فشل الإرسال", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Admin: Delete ──────────────────────────────────── */
  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/comments/${id}?admin=Blazixz`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
        toast("تم حذف التعليق", "info");
      }
    } catch {
      toast("فشل الحذف", "error");
    }
  };

  /* ── Admin: Ban user ────────────────────────────────── */
  const handleBan = async (id: string, author: string) => {
    if (!isAdmin) return;
    if (!confirm(`هل تريد حظر "${author}" وحذف جميع تعليقاته؟`)) return;
    try {
      const res = await fetch(`/api/comments/${id}?action=ban&admin=Blazixz`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) => prev.filter((c) => c.author !== author));
        toast(`تم حظر ${author} وحذف ${data.removedCount} تعليقات`, "info");
      }
    } catch {
      toast("فشل الحظر", "error");
    }
  };

  /* ── Admin: Pin/Unpin comment ───────────────────────── */
  const handlePin = async (id: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/comments/${id}?action=pin&admin=Blazixz`, {
        method: "PATCH",
      });
      if (res.ok) {
        const data = await res.json();
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, pinned: data.pinned } : c))
        );
        toast(data.pinned ? "تم تثبيت التعليق" : "تم إلغاء التثبيت", "info");
      }
    } catch {
      toast("فشل التثبيت", "error");
    }
  };

  /* ── Time formatting ────────────────────────────────── */
  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} س`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `منذ ${days} ي`;
    return new Date(ts).toLocaleDateString("ar-DZ");
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="border-t border-parchment-200 dark:border-white/8 mt-8 pt-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gold-500" />
          <h3 className="font-arabic text-lg font-bold text-gray-900 dark:text-gray-100">
            التعليقات
          </h3>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-arabic">
            ({comments.length})
          </span>
        </div>
        {isAdmin && (
          <span className="flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full admin-badge">
            <Shield className="w-3 h-3" />
            وضع المشرف
          </span>
        )}
      </div>

      {/* New comment form */}
      {guest ? (
        <form onSubmit={handlePost} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="اكتب تعليقك…"
              maxLength={500}
              className="flex-1 px-4 py-2.5 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-onyx-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 text-sm font-arabic focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all"
            />
            <button
              type="submit"
              disabled={submitting || !newContent.trim()}
              className="px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl transition-all duration-150 disabled:opacity-40"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowLoginPrompt(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 mb-6 rounded-xl border border-dashed border-parchment-300 dark:border-white/10 text-sm font-arabic text-gray-500 dark:text-gray-400 hover:text-gold-500 hover:border-gold-500/40 transition-all"
        >
          <LogIn className="w-4 h-4" />
          سجل الدخول كضيف للمشاركة
        </button>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-gray-600 font-arabic text-sm py-8">
          لا توجد تعليقات بعد. كن أول من يعلق!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`relative group rounded-2xl border transition-all duration-200 ${
                c.pinned
                  ? "bg-gold-500/5 border-gold-500/20"
                  : "bg-white dark:bg-onyx-800/50 border-parchment-200 dark:border-white/5 hover:border-parchment-300 dark:hover:border-white/10"
              } p-4`}
            >
              {/* Pinned badge */}
              {c.pinned && (
                <div className="absolute top-3 left-3">
                  <Pin className="w-3.5 h-3.5 text-gold-500/50" />
                </div>
              )}

              {/* Author + time */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gold-500/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-gold-600 dark:text-gold-400">
                      {c.author.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-arabic font-semibold text-gray-800 dark:text-gray-200">
                    {c.author}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeAgo(c.createdAt)}
                  </span>
                </div>

                {/* Admin controls */}
                {isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handlePin(c.id)}
                      title={c.pinned ? "إلغاء التثبيت" : "تثبيت التعليق"}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gold-500 hover:bg-gold-50 dark:hover:bg-gold-500/10 transition-colors"
                    >
                      {c.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="حذف التعليق"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleBan(c.id, c.author)}
                      title={`حظر ${c.author}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="font-arabic text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2 pe-9">
                {c.content}
              </p>

              {/* Like button */}
              <button
                onClick={() => handleLike(c.id)}
                className={`flex items-center gap-1 text-xs transition-all ${
                  guest && c.likedBy.includes(guest.name)
                    ? "text-red-500"
                    : "text-gray-400 dark:text-gray-500 hover:text-red-400"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 transition-all ${
                    guest && c.likedBy.includes(guest.name)
                      ? "fill-red-500"
                      : ""
                  }`}
                />
                <span>{c.likes}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Login prompt */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="bg-white dark:bg-onyx-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <LogIn className="w-10 h-10 text-gold-500 mx-auto mb-3" />
            <h3 className="font-arabic font-bold text-gray-900 dark:text-gray-100 mb-2">
              سجل الدخول للمشاركة
            </h3>
            <p className="font-arabic text-sm text-gray-500 dark:text-gray-400 mb-4">
              تحتاج إلى تسجيل الدخول كضيف للإعجاب والتعليق
            </p>
            <button
              onClick={() => {
                setShowLoginPrompt(false);
                // Trigger guest login modal by clicking the header button
                const headerBtn = document.querySelector('[data-guest-login]');
                if (headerBtn instanceof HTMLElement) headerBtn.click();
              }}
              className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-white rounded-xl font-arabic text-sm transition-all"
            >
              دخول كضيف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
