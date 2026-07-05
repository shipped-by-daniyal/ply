// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://shipped-by-daniyal.github.io",
  base: "/ply",
  integrations: [
    starlight({
      title: "Ply",
      description:
        "Ply — the agentic design system consumable by AI, designers, and engineers.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/shipped-by-daniyal/ply",
        },
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Overview", link: "/" },
            { label: "Getting started", link: "/guides/getting-started/" },
            { label: "System map", link: "/map/" },
          ],
        },
        {
          label: "Guides",
          items: [{ autogenerate: { directory: "guides" } }],
        },
        {
          label: "Tokens",
          items: [{ autogenerate: { directory: "tokens" } }],
        },
        {
          label: "Components",
          items: [{ autogenerate: { directory: "components" } }],
        },
        {
          label: "Decisions",
          items: [{ autogenerate: { directory: "decisions" } }],
        },
        { label: "Changelog", link: "/changelog/" },
      ],
    }),
  ],
});
