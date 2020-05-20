#!/usr/bin/env node
const { program } = require("@caporal/core")

program
  // here we combine the 2 validators, to get back an array of strings
  .argument("<years>", "Favorite years(s)", { validator: program.ARRAY | program.STRING })
  .action(({ logger, args }) => {
    // if "2032,2056" is provided, will print: "years: ["2032","2056"] (is array: true)"
    // if "2032" is provided, will print: "years: ["2032"] (is array: true)"
    // if "yes" is provided, will print: "years: ["yes"] (is array: true)"
    logger.info("years: %j (is array: %s)", args.years, Array.isArray(args.years))
  })

program.run()
