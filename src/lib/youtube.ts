// Loads the official YouTube IFrame Player API exactly once and resolves
// with the global `YT` namespace once it's ready. Using the real API
// (instead of hand-rolled postMessage calls against a raw <iframe src=...>)
// is what actually makes onReady/onStateChange/playVideo reliable — the
// player only guarantees it responds to a channel that was established
// through this handshake.

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    __youtubeApiPromise?: Promise<any>;
  }
}

export function loadYouTubeIframeAPI(): Promise<any> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (window.__youtubeApiPromise) return window.__youtubeApiPromise;

  window.__youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    }
  });
  return window.__youtubeApiPromise;
}
