import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import App from "../App";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pampanaa — Arcade Formation Shooter" },
      {
        name: "description",
        content:
          "Pampanaa is a browser arcade shooter: named player profiles, 14 ocean, land, city and space arenas, level replay, five weapons and boss waves.",
      },
      { property: "og:title", content: "Pampanaa — Arcade Formation Shooter" },
      {
        property: "og:description",
        content:
          "Clear choreographed enemy squads across ocean, land, city and space arenas. Profiles, level select and progress saved offline.",
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
