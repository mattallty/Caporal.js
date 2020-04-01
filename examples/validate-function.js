#!/usr/bin/env node
const { program } = require("caporal")

program
  .argument("<year>", "Year of birth", {
    validator: function (value) {
      if (value > new Date().getFullYear()) {
        throw Error("Year cannot be in the future!")
      }
      // cast to Number
      return +value
    },
  })
  .action(({ logger, args }) => {
    // will print something like: "year: 1985 (type: number)"
    logger.info("year: %d (type: %s)", args.year, typeof args.year)
  })

program.run()
