#!/usr/bin/env node
const path = require("path")
const fs = require("fs")
const take = require("lodash/take")
const pick = require("lodash/pick")
const chunk = require("lodash/chunk")
const filter = require("lodash/filter")
const { Octokit } = require("@octokit/rest")
const mdTable = require("markdown-table")

const CONTRIBUTORS_PATH = path.join(__dirname, "..", "docs", "CONTRIBUTORS.md")

const OWNER = "mattallty",
  REPO = "Caporal.js",
  octokit = new Octokit({
    userAgent: `${OWNER}/${REPO}`,
    auth: process.env.GH_TOKEN,
  })

async function getContributors() {
  const contributors = await octokit.paginate("GET /repos/:owner/:repo/contributors", {
    owner: OWNER,
    repo: REPO,
  })
  const contributorsInfos = (
    await Promise.all(contributors.map((c) => octokit.request(c.url)))
  ).map(({ data: user }) =>
    pick(user, ["login", "html_url", "avatar_url", "name", "blog"]),
  )

  const contributorsObject = contributorsInfos.reduce((acc, c, index) => {
    acc[c.login] = Object.assign({}, contributors[index], c)
    return acc
  }, {})

  const main = filter(contributorsObject, (c) => c.contributions > 1)
  const other = filter(contributorsObject, (c) => c.contributions === 1)

  return { main, other }
}

async function buildContributorsTable(options) {
  options = { columns: 5, ...options }
  const { main, other } = await getContributors()
  const cells = main.map((info) => {
    return `<a href="${info.html_url}">${
      info.name || `@${info.login}`
    }<br><img class="contributor" border="0" src="${info.avatar_url}"></a>`
  })
  const rows = chunk(cells, options.columns)
  const table = mdTable(rows, { align: "c" })
  const contribs =
    table +
    "\n\n...but also " +
    take(other, 15)
      .map((info) => `<a href="${info.html_url}">${info.name || `@${info.login}`}</a>`)
      .join(", ") +
    '. See <a href="https://github.com/mattallty/Caporal.js/graphs/contributors">full list</a>.'
  return contribs
}

;(async function () {
  const md = await buildContributorsTable()
  fs.writeFileSync(CONTRIBUTORS_PATH, md)
  console.log("%s updated", CONTRIBUTORS_PATH)
})()
