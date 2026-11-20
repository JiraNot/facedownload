import { useEffect, useRef } from "react";

const CLIENT = import.meta.env.VITE_ADSENSE_CLIENT || "";
const SLOTS = {
  TOOL: import.meta.env.VITE_ADSENSE_SLOT_TOOL || "",
  CONTENT: import.meta.env.VITE_ADSENSE_SLOT_CONTENT || "",
};

function isConfigured() {
  return /^ca-pub-\d+$/.test(CLIENT);
}

export function AdSenseSlot({ placement, label }) {
  const slot = SLOTS[placement];
  const pushed = useRef(false);

  useEffect(() => {
    if (!isConfigured() || !/^\d+$/.test(slot) || pushed.current) return;

    let script = document.querySelector("script[data-facebook-video-loader-adsense]");
    if (!script) {
      script = document.createElement("script");
      script.async = true;
      script.crossOrigin = "anonymous";
      script.dataset.facebookVideoLoaderAdsense = "true";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
      document.head.appendChild(script);
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // Ad blockers and unapproved publisher accounts can leave the ad slot empty.
    }
  }, [slot]);

  if (!isConfigured() || !/^\d+$/.test(slot)) return null;

  return (
    <aside className="ad-slot" aria-label={label}>
      <span className="ad-label">{label}</span>
      <ins
        className="adsbygoogle ad-unit"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
