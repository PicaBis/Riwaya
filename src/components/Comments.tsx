"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, MessageSquare, Send, Trash2, Ban, Shield, Type, AlignLeft, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Comment } from "@/lib/comments-store";
import clsx from "clsx";

export function Comments({ novelId }: { novelId: string }) {
  const { guest, isAdmin, setAdmin, isDark } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState<"ar" | "sans">("ar");

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?novelId=${encodeURIComponent(novelId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(data);
    } catch {}
  }, [novelId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guest || !content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId, author: guest.name, content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        fetchComments();
      }
    } catch {}
    setLoading(false);
  };

  const deleteComment = async (commentId: string, author: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin: true }),
      });
      if (res.ok) {
        fetchComments();
        alert(`تم حظر المستخدم: ${author}`);
      }
    } catch {}
  };

  const toggleLike = async (commentId: string) => {
    if (!guest) return;
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    const liked = comment.likes.includes(guest.name);
    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, author: guest.name, liked }),
      });
      if (res.ok) fetchComments();
    } catch {}
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "الآن";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  const textClass = fontFamily === "ar" ? "font-arabic" : "font-sans";

  return (
    <div className="mt-8 border-t border-parchment-200 dark:border-white/8 pt-8" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h3 className="font-arabic text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gold-500" />
          التعليقات
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Type className="w-3.5 h-3.5" />
            <button onClick={() => setFontSize((s) => Math.max(12, s - 1))} className="px-1.5 py-0.5 rounded border border-parchment-300 dark:border-white/10 hover:bg-parchment-100 dark:hover:bg-white/5">-</button>
            <span className="w-6 text-center">{fontSize}</span>
            <button onClick={() => setFontSize((s) => Math.min(22, s + 1))} className="px-1.5 py-0.5 rounded border border-parchment-300 dark:border-white/10 hover:bg-parchment-100 dark:hover:bg-white/5">+</button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <AlignLeft className="w-3.5 h-3.5" />
            <button onClick={() => setLineHeight((h) => Math.max(1.4, +(h - 0.1).toFixed(1)))} className="px-1.5 py-0.5 rounded border border-parchment-300 dark:border-white/10 hover:bg-parchment-100 dark:hover:bg-white/5">-</button>
            <span className="w-6 text-center">{lineHeight.toFixed(1)}</span>
            <button onClick={() => setLineHeight((h) => Math.min(2.8, +(h + 0.1).toFixed(1)))} className="px-1.5 py-0.5 rounded border border-parchment-300 dark:border-white/10 hover:bg-parchment-100 dark:hover:bg-white/5">+</button>
          </div>
          <button
            onClick={() => setFontFamily((f) => (f === "ar" ? "sans" : "ar"))}
            title={fontFamily === "ar" ? "الخط العربي" : "الخط الحديث"}
            className="flex items-center gap-1 px-2 py-1 rounded border border-parchment-300 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{fontFamily === "ar" ? "أميري" : "نظم"}</span>
          </button>
          {isAdmin && (
            <span className="flex items-center gap-1 text-xs text-red-500 font-arabic">
              <Shield className="w-3.5 h-3.5" /> وضع المشرف
            </span>
          )}
        </div>
      </div>

      {guest ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="شارك رأيك في هذه الرواية..."
                className={clsx(
                  "w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 font-arabic placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all resize-none",
                  fontFamily === "sans" && "font-sans"
                )}
                style={{ fontSize, lineHeight }}
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="mt-1 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl font-arabic text-sm font-medium transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-parchment-50 dark:bg-white/5 border border-parchment-200 dark:border-white/8 text-center">
          <p className="font-arabic text-sm text-gray-500 dark:text-gray-400">
            سجّل دخول كضيف للمشاركة في التعليقات
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500 font-arabic py-8">
            لا توجد تعليقات بعد — كن أول من يشارك
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={clsx(
                "p-4 rounded-2xl border transition-colors",
                isDark
                  ? "bg-onyx-800/40 border-white/8 hover:border-white/12"
                  : "bg-white border-parchment-200 hover:border-parchment-300"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-gold-500">{c.author.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className={`text-sm font-bold text-gray-900 dark:text-gray-100 ${textClass}`}>{c.author}</span>
                  <span className={`text-xs text-gray-400 dark:text-gray-500 ${textClass}`}>{timeAgo(c.createdAt)}</span>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { if (confirm(`حذف التعليق وحظر المستخدم ${c.author}؟`)) deleteComment(c.id, c.author); }}
                      title="حذف + حظر"
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComment(c.id, c.author)}
                      title="حظر المستخدم"
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p
                className={`${textClass} text-gray-700 dark:text-gray-300 leading-relaxed mb-3`}
                style={{ fontSize, lineHeight, fontFamily: fontFamily === "ar" ? "var(--font-arabic, Amiri, serif)" : "system-ui, sans-serif" }}
              >
                {c.content}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLike(c.id)}
                  disabled={!guest}
                  className={clsx(
                    "flex items-center gap-1 text-xs transition-colors",
                    c.likes.includes(guest?.name || "")
                      ? "text-red-500"
                      : "text-gray-400 dark:text-gray-500 hover:text-red-500"
                  )}
                >
                  <Heart className={clsx("w-4 h-4", c.likes.includes(guest?.name || "") && "fill-red-500")} />
                  <span>{c.likes.length || ""}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
