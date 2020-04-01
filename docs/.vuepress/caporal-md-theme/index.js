const MarkdownTheme = require("typedoc-plugin-markdown/dist/subthemes/vuepress/theme")

class CustomMarkdownTheme extends MarkdownTheme.default {
  constructor(renderer, basePath) {
    super(renderer, basePath)
  }
}

exports.default = CustomMarkdownTheme
