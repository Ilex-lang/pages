// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import gruvbox from "starlight-theme-gruvbox";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ilexGrammar = require("./ilex.tmLanguage.json");

// https://astro.build/config
export default defineConfig({
  site: "https://ilex-lang.github.io",
  base: "/pages",
  markdown: {
    shikiConfig: {
      langs: [
        {
          ...ilexGrammar,
          aliases: ["ilex", "ix"],
        },
      ],
    },
  },
  integrations: [
    starlight({
      plugins: [gruvbox()],
      title: "Ilex",
      social: [
        {
          icon: "codeberg",
          label: "Codeberg",
          href: "https://github.com/Ilex-lang/ilex",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Hello World", slug: "getting-started/hello-world" },
          ],
        },
        {
          label: "Guide",
          autogenerate: { directory: "guide" },
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
