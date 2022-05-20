#!/usr/bin/env node
/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { program } = require("@caporal/core")

program
  .description("Get username from ID")
  .argument("<id>", "User ID", {
    validator: function (id) {
      return fetch(`/api/user/${id}`).then(() => {
        return id
      })
    },
  })
  .action(({ logger, args }) => {
    logger.info("User ID: %s", args.id)
  })

program.run()
