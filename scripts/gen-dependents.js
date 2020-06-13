#!/usr/bin/env node
const cheerio = require("cheerio")
const fetch = require("node-fetch")
const map = require("lodash/map")
const filter = require("lodash/filter")
const orderBy = require("lodash/orderBy")
const uniqBy = require("lodash/uniqBy")
const take = require("lodash/take")
const path = require("path")
const fs = require("fs")
const exec = require("child_process").exec

const BASE_URL = "https://www.npmjs.com"
let TOTAL_USING = 0

const DEPENDENTS_PATH = path.join(__dirname, "..", "docs", "DEPENDENTS.md")

function execShellCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error)
      }
      resolve(stdout ? stdout.trimRight() : stderr)
    })
  })
}

async function computeDependentPackages(url, deps) {
  url = url || BASE_URL + "/browse/depended/caporal"
  deps = deps || []
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)
  deps = deps.concat(
    $("main h3")
      .map(function () {
        return $(this).text()
      })
      .get(),
  )
  const nextPath = $('a:contains("Next")').attr("href")
  if (nextPath) {
    return await computeDependentPackages(BASE_URL + nextPath, deps)
  }
  return deps
}

async function getPackagesStats(package) {
  const response = await fetch(
    "https://api.npmjs.org/downloads/point/last-week/" + package,
  )
  const { downloads } = await response.json()
  return { package, downloads }
}

async function getPackageDescription(obj) {
  obj.description = await execShellCommand(`npm info ${obj.package} description`)
  if (!obj.description.endsWith(".") && !obj.description.endsWith("!")) {
    obj.description += "."
  }
  return obj
}

async function getDependentPackages(max) {
  max = max || 12
  const pkgs = await Promise.all((await computeDependentPackages()).map(getPackagesStats))
  TOTAL_USING = pkgs.length
  let packages = filter(pkgs, (p) => p.downloads >= 20)
  packages = uniqBy(packages, "package")
  packages = orderBy(packages, ["downloads"], ["desc"])
  packages = take(packages, max)
  packages = await Promise.all(packages.map(getPackageDescription))
  return packages
}

;(async function () {
  const dependents = await getDependentPackages()
  const mdList = map(dependents, (pkg) => {
    return `- [${pkg.package}](https://www.npmjs.com/package/${pkg.package}): ${pkg.description}`
  }).join("\n")

  const md = `More than **${TOTAL_USING}** packages are using Caporal for their CLI, among which:\n\n`
  fs.writeFileSync(DEPENDENTS_PATH, md + mdList)
  console.log("%s updated", DEPENDENTS_PATH)
})()
