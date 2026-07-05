// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// site/base are set when GitHub Pages deploy lands (Phase 1, step 5).
export default defineConfig({
  integrations: [
    starlight({
      title: "Ply",
      description:
        "Agentic Design System — consumable by AI, designers, and engineers.",
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
            { label: "System map", link: "/map/" },
          ],
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
