#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { program } = require("@caporal/core")

program
  .argument("<postal-code>", "Postal code", { validator: program.STRING })
  .action(({ logger, args }) => {
    // will print something like: "Postal code: 75001 (type: string)"
    logger.info("Postal code: %s (type: %s)", args.postalCode, typeof args.postalCode)
  })

program.run()
