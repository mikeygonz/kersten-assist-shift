"use client";

import { useState, useEffect } from "react";

/**
 * Debug component to test event handlers in v0.app
 * Add this to your layout to verify event handling is working
 */
export function DebugV0() {
  const [mounted, setMounted] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showDebug, setShowDebug] = useState(false);
  const [lastEvent, setLastEvent] = useState("");

  useEffect(() => {
    setMounted(true);

    // Check if running in v0.app or Vercel
    if (typeof window !== "undefined") {
      const isV0 =
        window.location.hostname.includes("v0.dev") ||
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("vercel.sh");

      if (isV0 || process.env.NODE_ENV === "development") {
        setShowDebug(true);
        console.log("[v0-debug] Debug mode enabled");
        console.log("[v0-debug] Hostname:", window.location.hostname);
        console.log("[v0-debug] User Agent:", navigator.userAgent);
      }
    }
  }, []);

  if (!showDebug || !mounted) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: 10,
        padding: "8px 12px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        borderRadius: 4,
        fontSize: 12,
        fontFamily: "monospace",
        zIndex: 99999,
        maxWidth: 300,
      }}
    >
      <div>v0.app Debug Panel</div>
      <div>Mounted: {mounted ? "✅" : "❌"}</div>
      <div>Clicks: {clickCount}</div>
      {lastEvent && <div style={{ fontSize: 10 }}>Last: {lastEvent}</div>}
      <button
        onClick={() => {
          const timestamp = new Date().toLocaleTimeString();
          console.log("[v0-debug] Test button clicked at", timestamp);
          setClickCount((c) => c + 1);
          setLastEvent(`Click at ${timestamp}`);
        }}
        style={{
          marginTop: 4,
          padding: "4px 8px",
          background: "#25C9D0",
          border: "none",
          borderRadius: 2,
          color: "white",
          cursor: "pointer",
        }}
      >
        Test Click Handler
      </button>
      <button
        onClick={() => setShowDebug(false)}
        style={{
          marginLeft: 4,
          marginTop: 4,
          padding: "4px 8px",
          background: "#666",
          border: "none",
          borderRadius: 2,
          color: "white",
          cursor: "pointer",
        }}
      >
        Hide
      </button>
    </div>
  );
}
