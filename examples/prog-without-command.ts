#!/usr/bin/env ts-node
import { program, Validator } from "@caporal/core"

program
  .version("1.0.0")
  .description("Take a ride")
  .argument("<destination>", "What's your destination", {
    validator: ["New-York", "Portland", "Paris"],
  })
  .option("--tip", "Tip to give to the driver", { validator: Validator.NUMBER })

program.run()
