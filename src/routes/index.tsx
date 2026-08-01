import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voidbreak — Top-Down Arena Shooter" },
      {
        name: "description",
        content:
          "Voidbreak is a fast browser arena shooter: five weapons, boss waves, endless mode, local leaderboards and achievements.",
      },
      { property: "og:title", content: "Voidbreak — Top-Down Arena Shooter" },
      {
        property: "og:description",
        content:
          "Survive escalating waves, unlock weapons and skins, and chase your best run in this offline-capable browser shooter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Canvas + IndexedDB are browser-only: render the game after hydration.
  if (!mounted) return <div style={{ minHeight: "100vh", background: "#070a12" }} />;
  return <App />;
}
