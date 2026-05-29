import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error - plain JS component per spec
import Glowtics from "@/components/Glowtics.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Glowtics — Intelligent Skin, Hair & Nutrition Care" },
      { name: "description", content: "AI-powered skin, hair, and nutrition analysis with personalized recommendations." },
      { property: "og:title", content: "Glowtics" },
      { property: "og:description", content: "Intelligent skin, hair & nutrition care app." },
    ],
  }),
  component: Glowtics,
});
