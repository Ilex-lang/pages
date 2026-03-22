// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import gruvbox from "starlight-theme-gruvbox";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const neoGrammar = require("./neo.tmLanguage.json");

// https://astro.build/config
export default defineConfig({
  site: "https://neolang.codeberg.page",
  markdown: {
    shikiConfig: {
      langs: [
        {
          ...neoGrammar,
          aliases: ["neo"],
        },
      ],
    },
  },
  integrations: [
    starlight({
      plugins: [gruvbox()],
      title: "Neo",
      social: [
        {
          icon: "codeberg",
          label: "Codeberg",
          href: "https://codeberg.org/neolang/neo",
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
