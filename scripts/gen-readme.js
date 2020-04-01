#!/usr/bin/env node
const fs = require("fs")
const path = require("path")
const replace = require("lodash/replace")

const README_PATH = path.join(__dirname, "..", "docs", "README.md")

let readme = fs.readFileSync(README_PATH, "utf-8")
const regex = /(<!-- @include-start ([\w.]+) -->)([\s\S]*?)(?=<!-- @include-end)(<!-- @include-end -->)/gm

const newReadme = replace(readme, regex, function (r1, r2, r3) {
  const file = path.join(__dirname, "..", "docs", r3)
  try {
    const contents = fs.readFileSync(file, "utf-8")
    return r2 + "\n\n" + contents.trim() + "\n\n<!-- @include-end -->"
  } catch (e) {
    console.error("Error reading %s", file)
    return r1
  }
})

try {
  fs.writeFileSync(README_PATH + ".backup", readme) // backup
  fs.writeFileSync(README_PATH, newReadme)
  console.log("%s updated.", README_PATH)
  process.exit(0)
} catch (e) {
  console.error(e)
  process.exit(1)
}
