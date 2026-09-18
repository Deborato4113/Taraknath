"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// A thin progress bar at the very top of the page, shown while navigating
// between pages — same idea as YouTube/GitHub's loading bar. Next.js App
// Router doesn't expose route-change-start/end events directly, so this
// works by:
//   1. Listening for clicks on any internal link (capture phase, so it
//      fires before Next's own click handler) and showing the bar
//      immediately — this is the "start" signal.
//   2. Watching the pathname + search params for the SUCCESSFUL change —
//      that's the "done" signal, since the URL only updates once the new
//      page has actually taken over.
// Mounted once in the root layout so it covers every page automatically.
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    function handleClick(e) {
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return; // in-page anchors don't navigate
      if (anchor.target === "_blank") return; // opens a new tab, no transition here
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // opening in new tab/window
      if (anchor.origin && anchor.origin !== window.location.origin) return; // external link

      // Don't show the bar for a link to the page we're already on.
      if (href === pathname || href === window.location.pathname + window.location.search) return;

      startProgress();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function startProgress() {
    clearTimers();
    setVisible(true);
    setProgress(15);

    // Ease toward (but never reach) 90% while the new page loads — the
    // actual completion happens in the effect below once the URL changes.
    timers.current.push(setTimeout(() => setProgress(40), 100));
    timers.current.push(setTimeout(() => setProgress(65), 350));
    timers.current.push(setTimeout(() => setProgress(80), 800));
  }

  // Fires whenever the route actually finishes changing — snaps the bar
  // to 100% then fades it out.
  useEffect(() => {
    if (!visible) return;
    clearTimers();
    setProgress(100);
    const hide = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 200);
    timers.current.push(hide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-red-600 transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "150ms" : "300ms",
        }}
      />
    </div>
  );
}
