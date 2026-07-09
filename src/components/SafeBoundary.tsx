"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Optional label for error reports. */
  name?: string;
  /** If true, silently renders null on error (for optional/decorative widgets). */
  silent?: boolean;
}

interface State {
  hasError: boolean;
}

/**
 * A defensive React error boundary that catches any render-time or lifecycle
 * throw inside its subtree and falls back to a safe placeholder instead of
 * letting the error bubble all the way to the route-level `error.tsx` and
 * take down the entire page. Use this around non-essential or third-party
 * widgets (Comments, OnlineGuests, PDFCover, etc.) so a single broken
 * component never blocks the rest of the experience.
 */
export class SafeBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    try {
      // Best-effort telemetry; never let reporting itself crash the boundary.
      import("@/lib/error-report")
        .then((m) =>
          m.reportError(error, {
            boundary: this.props.name || "SafeBoundary",
            stack: info.componentStack,
          })
        )
        .catch(() => {});
    } catch {}
    // eslint-disable-next-line no-console
    console.warn(
      `[SafeBoundary:${this.props.name || "anonymous"}] caught:`,
      error?.message || error
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.silent) return null;
      if (this.props.fallback) return this.props.fallback;
      return null;
    }
    return this.props.children;
  }
}
