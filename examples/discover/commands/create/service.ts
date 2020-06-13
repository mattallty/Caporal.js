import type { CreateCommandParameters, Command } from "@caporal/core"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("Create a service with the specified name.")
    .argument("<name>", "Service name")
    .action(({ logger }) => {
      logger.info("Output of `kubectl create service` command")
    })
}
