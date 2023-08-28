import path from "path"
import fs from "fs"
import { defineUserConfig } from "vuepress"
import { typedocPlugin } from "vuepress-plugin-typedoc/next"
import { defaultTheme } from "vuepress"

const loadJSON = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url)))

const sidebarPath = path.resolve(__dirname, "../api/typedoc-sidebar.json")

let apiSidebar = fs.existsSync(sidebarPath) ? loadJSON(sidebarPath) : []

apiSidebar = apiSidebar.map((s) => {
  return {
    ...s,
    children: s.children.map((c) => ({
      ...c,
      collapsible: false,
    })),
  }
})

export default defineUserConfig({
  title: "Caporal",
  description: "A full-featured framework for building command line applications (CLI)",
  smoothScroll: true,
  theme: defaultTheme({
    logo: "/assets/img/caporal.svg",
    navbar: [
      { text: "Guide", link: "/guide/" },
      { text: "API Reference", link: "/api/" },
    ],
    colorMode: "light",
    colorModeSwitcher: false,
    repo: "mattallty/Caporal.js",
    repoLabel: "GitHub",
    docsBranch: "master",
    contributors: false,
    lastUpdated: false,
    docsDir: "docs",
    editLinks: false,
    sidebar: {
      "/guide/": ["program", "commands", "action", "validation", "help", "migration"],
      "/api/": apiSidebar,
    },
    sidebarDepth: 2,
  }),
  plugins: [
    typedocPlugin({
      // plugin options
      out: "api",
      sidebar: {
        autoConfiguration: true,
        fullNames: true,
        parentCategory: "API",
      },
      // typedoc options
      entryPoints: ["./src/index.ts"],
      tsconfig: "../tsconfig.json",
      cleanOutputDir: false,
      hideInPageTOC: false,
      excludePrivate: true,
      excludeExternals: true,
      excludeInternal: true,
      includeVersion: true,
      disableSources: false,
      hideGenerator: true,
    }),
  ],
  head: [
    [
      "link",
      {
        href: `https://fonts.googleapis.com/css?family=Source+Code+Pro&display=swap`,
        rel: "stylesheet",
      },
    ],
  ],
})
