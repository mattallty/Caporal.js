#!/usr/bin/env node
const { program } = require("caporal")

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
