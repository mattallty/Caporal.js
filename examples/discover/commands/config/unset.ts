import type { CreateCommandParameters, Command } from "@caporal/core"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("Sets an individual value in a kubeconfig file")
    .argument("<name>", "Property name")
    .action(({ logger }) => {
      logger.info("Output of `kubectl config unset` command")
    })
}
