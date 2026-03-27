"use client";

import { useCallback, useRef } from "react";
import Hls from "hls.js";

interface HlsVideoPlayerProps {
  url: string;
  className?: string;
}

export function HlsVideoPlayer({ url, className }: HlsVideoPlayerProps) {
  const hlsRef = useRef<Hls | null>(null);

  // Callback ref: chạy đúng lúc DOM element mount — tránh race condition với portal
  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      // Cleanup instance cũ
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (!node || !url) return;

      if (Hls.isSupported()) {
        const hls = new Hls({ xhrSetup: (xhr) => { xhr.withCredentials = true; } });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(node);
        hls.on(Hls.Events.ERROR, (_e, data) => console.error("HLS error:", data));
      } else if (node.canPlayType("application/vnd.apple.mpegurl")) {
        // Safari native HLS
        node.src = url;
      }
    },
    [url], // url thay đổi → callback chạy lại → HLS reinit
  );

  return (
    <video
      ref={videoRef}
      controls
      className={className}
    />
  );
}