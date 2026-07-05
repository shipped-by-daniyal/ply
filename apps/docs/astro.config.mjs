// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

const BASE = "/ply";

// Root-relative links in MDX content (`/decisions/...`) do NOT get the Pages
// base automatically — only sidebar/nav links do. This rehype plugin prefixes
// BASE onto every content href/src that needs it, so authors keep writing
// root-relative links (the documented convention) and production stays whole.
// Verified by scripts/check-links.mjs in CI. No deps: hand-rolled hast walker.
function rehypeBaseLinks() {
  const fix = (v) =>
    typeof v === "string" && v.startsWith("/") && !v.startsWith("//") && v !== BASE && !v.startsWith(BASE + "/")
      ? BASE + v
      : v;
  const walk = (node) => {
    if (node.properties) {
      if (node.properties.href) node.properties.href = fix(node.properties.href);
      if (node.properties.src) node.properties.src = fix(node.properties.src);
    }
    for (const child of node.children ?? []) walk(child);
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  site: "https://shipped-by-daniyal.github.io",
  base: BASE,
  markdown: {
    rehypePlugins: [rehypeBaseLinks],
  },
  integrations: [
    starlight({
      title: "Ply",
      description:
        "Ply — the agentic design system consumable by AI, designers, and engineers.",
      logo: { src: "./src/assets/ply-monogram.svg", alt: "Ply" },
      favicon: "/favicon.svg",
      customCss: ["./src/styles/custom.css"],
      // Starlight defaults to twitter:card=summary_large_image but provides no
      // image — supply the Aurora cover (public/og.png, 1200×675) so link
      // previews actually render one.
      head: [
        {
          tag: "meta",
          attrs: { property: "og:image", content: "https://shipped-by-daniyal.github.io/ply/og.png" },
        },
        {
          tag: "meta",
          attrs: { name: "twitter:image", content: "https://shipped-by-daniyal.github.io/ply/og.png" },
        },
      ],
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
