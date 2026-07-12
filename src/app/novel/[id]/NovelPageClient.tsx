"use client";

import { useState, useEffect } from "react";
import type { Novel } from "@/data/novels";
import { NovelReadingClient } from "./NovelReadingClient";
import { NovelErrorBoundary } from "@/components/NovelErrorBoundary";
import { SubscriptionModal } from "@/components/SubscriptionModal";

interface NovelPageClientProps {
  novel: Novel;
  startPage?: number;
}

export function NovelPageClient({ novel, startPage }: NovelPageClientProps) {
  const [showSubs, setShowSubs] = useState(false);

  useEffect(() => {
    const handler = () => setShowSubs(true);
    window.addEventListener("riwayati:show-subscription", handler);
    return () => window.removeEventListener("riwayati:show-subscription", handler);
  }, []);

  return (
    <>
      <NovelErrorBoundary novel={novel}>
        <NovelReadingClient
          novel={novel}
          startPage={startPage}
          showSubs={showSubs}
          onShowSubsChange={setShowSubs}
        />
      </NovelErrorBoundary>

      {/* Subscription modal lives above the error boundary so it can always open */}
      <SubscriptionModal
        open={showSubs}
        onClose={() => setShowSubs(false)}
      />
    </>
  );
}
