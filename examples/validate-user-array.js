#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { program } = require("@caporal/core")

program
  .argument("<city>", "Vote for your favorite City", {
    // just provide an array
    validator: ["Paris", "New-York", "Tokyo"],
  })
  .action(({ logger, args }) => {
    // the program will throw an error
    // if user provided city is not in ["Paris", "New-York", "Tokyo"]
    logger.info("Favorite city: %s", args.city)
  })

program.run()
