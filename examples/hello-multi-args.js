#!/usr/bin/env node
const { program } = require("@caporal/core")
program
  .argument("<name>", "Name to greet")
  .argument("<other-name>", "Another argument")
  .argument("[third-arg]", "This argument is optional")
  .action(({ logger, args }) =>
    // Notice that args are camel-cased, so <other-name> becomes otherName
    logger.info("Hello, %s and %s!", args.name, args.otherName),
  )

program.run()
