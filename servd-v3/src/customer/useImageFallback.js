import { useEffect, useState } from "react";

// FIX: relying on <img onError> alone isn't enough — a hotlinked photo
// service that hangs or gets silently blocked (slow network, ad-block,
// corporate proxy) never fires onError, it just never resolves. That
// left cards stuck with a gradient/overlay rendered over a blank image
// forever. A hard timeout forces the fallback to show either way.
const LOAD_TIMEOUT_MS = 4000;

export function useImageFallback(src) {
  const [status, setStatus] = useState(src ? "loading" : "empty");

  useEffect(() => {
    if (!src) { setStatus("empty"); return undefined; }
    setStatus("loading");
    const timer = setTimeout(() => {
      setStatus((current) => (current === "loaded" ? current : "error"));
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [src]);

  return {
    showFallback: status === "empty" || status === "error",
    onLoad: () => setStatus("loaded"),
    onError: () => setStatus("error"),
  };
}
