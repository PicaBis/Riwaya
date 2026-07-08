"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Heart, MessageSquare, Send, Trash2, Ban, Shield, Type, AlignLeft, FileText, EyeOff } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { getSupabase } from "@/lib/supabase";
import { OnlineGuests } from "./OnlineGuests";
import type { Comment } from "@/lib/comments-types";
import { t } from "@/lib/i18n";
import clsx from "clsx";

const COMMENTS_PER_PAGE = 20;
const TOKENS_KEY = "riwayati_comment_tokens";

/* ── Owner-token helpers: let a guest delete only their own comment ──────── */
function loadTokens(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || "{}");
  } catch {
    return {};
  }
}
function persistTokens(map: Record<string, string>) {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(map));
  } catch {}
}
function genToken(): string {
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  } catch {}
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function Comments({ novelId }: { novelId: string }) {
  const { guest, isAdmin, isDark, lang } = useApp();
  const dir = lang === "ar" ? "rtl" : "ltr";
  const fontClass = lang === "ar" ? "font-arabic" : "font-sans";
  const [comments, setComments] = useState<Comment[]>([]);
  const [displayCount, setDisplayCount] = useState(COMMENTS_PER_PAGE);
  const [content, setContent] = useState("");
  const [guestName, setGuestName] = useState(t("comments.guest", lang));
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [fontSize, setFontSize] = useState(15);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [fontFamily, setFontFamily] = useState<"ar" | "sans">("ar");
  const [myTokens, setMyTokens] = useState<Record<string, string>>({});
  const [showToolbar, setShowToolbar] = useState(true);
  const hideTimerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nameTouchedRef = useRef(false);
  const pendingCommentIds = useRef<Set<string>>(new Set());

  // Keep the default "Guest" name in sync with the active language until the
  // reader types their own name (avoids an Arabic default lingering in an
  // otherwise fully-English UI, or vice versa).
  useEffect(() => {
    if (!nameTouchedRef.current) setGuestName(t("comments.guest", lang));
  }, [lang]);

  const resetToolbarTimer = useCallback(() => {
    setShowToolbar(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setShowToolbar(false), 4000);
  }, []);

  useEffect(() => {
    resetToolbarTimer();
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [resetToolbarTimer]);

  // Load the map of comment-id → private owner token from this browser.
  useEffect(() => {
    setMyTokens(loadTokens());
  }, []);

  const fetchComments = useCallback(async () => {
    try {
      setFetchError("");
      const res = await fetch(`/api/comments?novelId=${encodeURIComponent(novelId)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.error || t("comments.loadFailed", lang));
        return;
      }
      const data = await res.json();
      setComments(data);
    } catch {
      setFetchError(t("comments.connectFailed", lang));
    }
  }, [novelId, lang]);

  useEffect(() => {
    fetchComments();
    setDisplayCount(COMMENTS_PER_PAGE);
  }, [fetchComments]);

  // Supabase real-time subscription
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`comments-${novelId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `novel_id=eq.${novelId}`,
      }, (payload) => {
        const newComment = payload.new as any;
        if (newComment && newComment.id) {
          // Skip if we already added this comment optimistically.
          if (pendingCommentIds.current.has(newComment.id)) {
            pendingCommentIds.current.delete(newComment.id);
            return;
          }
          setComments((prev) => [
            {
              id: newComment.id,
              novelId: newComment.novel_id,
              author: newComment.username,
              content: newComment.content,
              createdAt: new Date(newComment.created_at).getTime(),
              likes: newComment.likes || [],
              replies: [],
            },
            ...prev,
          ]);
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "comments",
        filter: `novel_id=eq.${novelId}`,
      }, (payload) => {
        const updated = payload.new as any;
        if (updated) {
          setComments((prev) =>
            prev.map((c) => {
              if (c.id !== updated.id) return c;
              const next: any = { ...c, likes: updated.likes ?? c.likes };
              if (updated.content !== undefined && updated.content !== null) next.content = updated.content;
              if (updated.username !== undefined && updated.username !== null) next.author = updated.username;
              return next;
            })
          );
        }
      })
      .on("postgres_changes", {
        event: "DELETE",
        schema: "public",
        table: "comments",
        filter: `novel_id=eq.${novelId}`,
      }, (payload) => {
        const deleted = payload.old as any;
        if (deleted?.id) {
          setComments((prev) => prev.filter((c) => c.id !== deleted.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [novelId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const author = guest?.name || guestName.trim() || t("comments.guest", lang);
    const ownerToken = genToken();
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelId, author, content: content.trim(), ownerToken }),
      });
      if (res.ok) {
        const data = await res.json().catch(() => null);
        setContent("");
        if (data?.id) {
          const normalized: any = {
            id: data.id,
            novelId: data.novel_id || data.novelId || novelId,
            author: data.username || data.author || author,
            content: data.content,
            createdAt: data.created_at ? new Date(data.created_at).getTime() : data.createdAt || Date.now(),
            likes: data.likes || [],
            replies: [],
          };
          // Track this ID so the realtime INSERT handler skips it.
          pendingCommentIds.current.add(normalized.id);
          setComments((prev) => {
            // Dedup: if already present (from a fast realtime event), don't add again.
            if (prev.some((c) => c.id === normalized.id)) return prev;
            return [normalized, ...prev];
          });
          if (data.id) {
            setMyTokens((prev) => {
              const next = { ...prev, [data.id]: ownerToken };
              persistTokens(next);
              return next;
            });
          }
        }
      } else {
        let errorMsg = t("comments.sendFailed", lang);
        try {
          const err = await res.json();
          if (err.error) errorMsg = err.error;
        } catch {}
        setSubmitError(errorMsg);
      }
    } catch {
      setSubmitError(t("comments.connectFailed", lang));
    }
    setLoading(false);
  };

  const deleteComment = async (commentId: string, author: string) => {
    if (!isAdmin) return;
    const devCode = typeof window !== "undefined" ? sessionStorage.getItem("riwayati_devcode") || "" : "";
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-dev-code": devCode },
        body: JSON.stringify({ admin: true }),
      });
      if (res.ok) {
        fetchComments();
        alert(t("comments.deletedAlert", lang, { name: author }));
      } else {
        alert(t("comments.deleteFailed", lang));
      }
    } catch {}
  };

  const deleteOwnComment = async (commentId: string) => {
    const token = myTokens[commentId];
    if (!token) return;
    if (!confirm(t("comments.confirmDeleteOwn", lang))) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-owner-token": token },
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        setMyTokens((prev) => {
          const next = { ...prev };
          delete next[commentId];
          persistTokens(next);
          return next;
        });
      } else {
        alert(t("comments.deleteFailed", lang));
      }
    } catch {}
  };

  const toggleLike = async (commentId: string) => {
    const author = guest?.name || guestName.trim() || t("comments.guest", lang);
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;
    const liked = comment.likes.includes(author);
    const nextLikes = liked
      ? comment.likes.filter((n: string) => n !== author)
      : [...comment.likes, author];

    // Optimistic update
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: nextLikes } : c))
    );
    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, author, liked }),
      });
      if (!res.ok) {
        // Rollback on failure
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, likes: comment.likes } : c))
        );
      }
    } catch {
      // Rollback on network error
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, likes: comment.likes } : c))
      );
    }
  };

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("comments.now", lang);
    if (mins < 60) return t("comments.minutesAgo", lang, { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("comments.hoursAgo", lang, { n: hours });
    return t("comments.daysAgo", lang, { n: Math.floor(hours / 24) });
  };

  const textClass = fontFamily === "ar" ? "font-arabic" : "font-sans";

  return (
    <div
      ref={containerRef}
      className="mt-8 border-t border-parchment-200 dark:border-white/8 pt-8"
      dir={dir}
      onMouseMove={resetToolbarTimer}
      onTouchStart={resetToolbarTimer}
    >
      <div className={clsx("flex items-center justify-between flex-wrap gap-3 mb-6 transition-all duration-300", showToolbar ? "opacity-100 max-h-40" : "opacity-0 max-h-0 overflow-hidden")}>
        <h3 className={`text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 flex-wrap ${fontClass}`}>
          <MessageSquare className="w-5 h-5 text-gold-500" />
          {t("comments.title", lang)}
          <OnlineGuests className="ms-1" />
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
            title={fontFamily === "ar" ? t("comments.arabicFont", lang) : t("comments.modernFont", lang)}
            className="flex items-center gap-1 px-2 py-1 rounded border border-parchment-300 dark:border-white/10 text-xs text-gray-500 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{fontFamily === "ar" ? t("font.family.amiri", lang) : t("comments.modern", lang)}</span>
          </button>
          {isAdmin && (
            <span className={`flex items-center gap-1 text-xs text-red-500 ${fontClass}`}>
              <Shield className="w-3.5 h-3.5" /> {t("comments.adminMode", lang)}
            </span>
          )}
        </div>
      </div>

      {/* Floating toolbar toggle when hidden */}
      {!showToolbar && (
        <button
          onMouseEnter={resetToolbarTimer}
          onTouchStart={resetToolbarTimer}
          className="mb-4 px-3 py-1.5 rounded-full border border-parchment-300 dark:border-white/10 bg-white dark:bg-onyx-800 text-xs text-gray-500 dark:text-gray-400 hover:bg-parchment-100 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-1.5"
        >
          <EyeOff className="w-3.5 h-3.5" />
          {t("comments.tools", lang)}
        </button>
      )}

      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <div className="flex items-start gap-2">
          <input
            type="text"
            value={guestName}
            onChange={(e) => { nameTouchedRef.current = true; setGuestName(e.target.value); }}
            placeholder={t("contact.name", lang)}
            maxLength={50}
            className={`px-3 py-2 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all w-32 sm:w-40 ${fontClass}`}
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t("comments.contentPlaceholder", lang)}
              className={clsx(
                "w-full px-4 py-3 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gold-500/40 transition-all resize-none",
                fontFamily === "sans" ? "font-sans" : "font-arabic"
              )}
              style={{ fontSize, lineHeight }}
              rows={3}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="mt-1 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 active:scale-95 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {submitError && (
          <p className={`text-xs text-red-500 px-1 ${fontClass}`}>{submitError}</p>
        )}
      </form>

      <div className="space-y-4">
        {fetchError && (
          <div className="flex items-center justify-between p-4 rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
            <p className={`text-sm text-red-600 dark:text-red-400 ${fontClass}`}>{fetchError}</p>
            <button onClick={fetchComments} className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">{t("comments.retry", lang)}</button>
          </div>
        )}
        {comments.length === 0 && !fetchError ? (
          <p className={`text-center text-sm text-gray-400 dark:text-gray-500 py-8 ${fontClass}`}>
            {t("comments.empty", lang)}
          </p>
        ) : (
          comments.slice(0, displayCount).map((c) => (
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
                {isAdmin ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { if (confirm(t("comments.confirmDelete", lang, { name: c.author }))) deleteComment(c.id, c.author); }}
                      title={t("comments.deleteAndBan", lang)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComment(c.id, c.author)}
                      title={t("comments.banUser", lang)}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                ) : myTokens[c.id] ? (
                  <button
                    onClick={() => deleteOwnComment(c.id)}
                    title={t("comments.deleteOwn", lang)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className={fontClass}>{t("comments.deleteOwn", lang)}</span>
                  </button>
                ) : null}
              </div>
              <p
                className={`${textClass} text-gray-700 dark:text-gray-300 leading-relaxed mb-3`}
                style={{ fontSize, lineHeight, fontFamily: fontFamily === "ar" ? "'Amiri', 'Noto Serif Arabic', serif" : "system-ui, sans-serif" }}
              >
                {c.content}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleLike(c.id)}
                  className={clsx(
                    "flex items-center gap-1 text-xs transition-colors",
                    (c.likes.includes(guest?.name || guestName.trim() || t("comments.guest", lang)))
                      ? "text-red-500"
                      : "text-gray-400 dark:text-gray-500 hover:text-red-500"
                  )}
                >
                  <Heart className={clsx("w-4 h-4", (c.likes.includes(guest?.name || guestName.trim() || t("comments.guest", lang))) && "fill-red-500")} />
                  <span>{c.likes.length || ""}</span>
                </button>
              </div>
            </div>
          ))
        )}
        {displayCount < comments.length && (
          <div className="text-center pt-4">
            <button
              onClick={() => setDisplayCount((p) => Math.min(p + COMMENTS_PER_PAGE, comments.length))}
              className={`px-6 py-2.5 rounded-xl border border-parchment-300 dark:border-white/10 bg-white dark:bg-onyx-800 text-sm text-gray-600 dark:text-gray-400 hover:border-gold-500/40 hover:text-gold-500 transition-all ${fontClass}`}
            >
              {t("comments.showMore", lang)} ({comments.length - displayCount})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
