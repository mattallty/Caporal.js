#!/usr/bin/env node
const { program } = require("caporal")

program
  .argument("<postal-code>", "Postal code", { validator: program.STRING })
  .action(({ logger, args }) => {
    // will print something like: "Postal code: 75001 (type: string)"
    logger.info("Postal code: %s (type: %s)", args.postalCode, typeof args.postalCode)
  })

program.run()
