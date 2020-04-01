import type { CreateCommandParameters, Command } from "caporal"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("Sets an individual value in a kubeconfig file")
    .argument("<name>", "Property name")
    .argument("<value>", "Property value")
    .action(({ logger }) => {
      logger.info("Output of `kubectl config set` command")
    })
}
