const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin")
const path = require("path")
const filter = require("lodash/filter")

let apiSidebar = require("./api-sidebar-relative.json")

const showInterfaces = [
  "interfaces/caporal_types.action",
  "interfaces/caporal_types.actionparameters",
  "interfaces/caporal_types.createargumentopts",
  "interfaces/caporal_types.commandconfig",
  "interfaces/caporal_types.programconfig",
  "interfaces/caporal_types.createoptionopts",
  "interfaces/caporal_types.customizedhelp",
  "interfaces/caporal_types.customizedhelpopts",
  "interfaces/caporal_types.logger",
  "interfaces/caporal_types.createoptionprogramopts",
  "interfaces/caporal_types.createoptioncommandopts",
  "interfaces/caporal_types.parseroptions",
]

apiSidebar = filter(apiSidebar, (section) => section.title !== "Enums")
// filter entries in "modules"
apiSidebar = apiSidebar.map((section) => {
  if (section.title === "Modules") {
    section.children = filter(
      section.children,
      (c) =>
        c.startsWith("modules/") &&
        !c.startsWith("modules/parser") &&
        !c.startsWith("modules/caporal_types") &&
        !c.startsWith("modules/caporal_help") &&
        !c.startsWith("modules/caporal_command") &&
        !c.startsWith("modules/caporal_option") &&
        !c.startsWith("modules/caporal_autocomplete") &&
        !c.startsWith("modules/caporal_program"),
    )
  } else if (section.title === "Interfaces") {
    section.children.push({ title: "Type aliases", path: "modules/caporal_types" })
    section.children = filter(section.children, (c) => showInterfaces.includes(c))
  }
  // make it non collapsible
  section.collapsable = false
  return section
})

apiSidebar.push({
  title: "Type aliases",
  collapsable: false,
  children: [{ title: "All types", path: "modules/caporal_types" }],
})

module.exports = {
  title: "Caporal",
  description: "A full-featured framework for building command line applications (CLI)",
  smoothScroll: true,
  themeConfig: {
    logo: "/assets/img/caporal.svg",
    nav: [
      { text: "Guide", link: "/guide/" },
      { text: "API Reference", link: "/api/" },
      { text: "Playground", link: "/playground" },
    ],
    // Assumes GitHub. Can also be a full GitLab url.
    repo: "mattallty/Caporal.js",
    repoLabel: "GitHub Project",
    // if your docs are not at the root of the repo:
    docsDir: "docs",
    // defaults to false, set to true to enable
    editLinks: false,
    sidebar: {
      "/guide/": [
        "", // /guide/
        "program",
        "commands",
        "action",
        "validation",
        "help",
        "migration",
      ],
      "/api/": apiSidebar,
    },
  },
  head: [
    [
      "script",
      {
        src: `https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js`,
        "data-main": "/assets/js/main",
      },
    ],
    [
      "link",
      {
        href: `https://fonts.googleapis.com/css?family=Source+Code+Pro&display=swap`,
        rel: "stylesheet",
      },
    ],
  ],
  configureWebpack: {
    externals: {
      caporal: "caporal",
      LocalEchoController: "LocalEchoController",
    },
  },
  chainWebpack: (config) => {
    config.plugin("monaco-editor").use(MonacoWebpackPlugin, [
      {
        // Languages are loaded on demand at runtime
        languages: ["javascript", "typescript"],
        features: [
          "accessibilityHelp",
          "bracketMatching",
          "caretOperations",
          "codeAction",
          "codelens",
          "comment",
          "coreCommands",
          "cursorUndo",
          // "folding",
          "fontZoom",
          "hover",
          "inPlaceReplace",
          "inspectTokens",
          "linesOperations",
          "links",
          "multicursor",
          "parameterHints",
          "rename",
          "smartSelect",
          "suggest",
          "transpose",
          "wordHighlighter",
          "wordOperations",
          "wordPartOperations",
        ],
      },
    ])
  },
}
