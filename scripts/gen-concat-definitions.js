#!/usr/bin/env node
const glob = require("glob")
const fs = require("fs")
const path = require("path")

const JSON_FILE = __dirname + "/../docs/.vuepress/public/assets/js/caporal.d.ts.json"

glob("**/*.d.ts", { cwd: __dirname + "/../dist", realpath: true }, (err, results) => {
  // console.dir(results)
  const data = results.map((file) => {
    console.log(
      "file:///node_modules/caporal/" + path.relative(__dirname + "../../dist", file),
    )
    return {
      file:
        "file:///node_modules/caporal/" + path.relative(__dirname + "../../dist", file),
      // file: "webpack://caporal/./src/" + path.relative(__dirname + "../../dist", file),
      contents: fs.readFileSync(file, "utf-8"),
    }
  })
  fs.writeFileSync(JSON_FILE, JSON.stringify(data))
  console.log("%s written.", JSON_FILE)
})
