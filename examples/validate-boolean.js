#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { program } = require("@caporal/core")

program
  .argument("<answer>", "Your answer", { validator: program.BOOLEAN })
  .action(({ logger, args }) => {
    // will print something like: "Answer: true (type: boolean)"
    // even if "1" is provided as argument
    logger.info("Answer: %s (type: %s)", args.answer, typeof args.answer)
  })

program.run()
