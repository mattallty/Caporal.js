import type { CreateCommandParameters, Command } from "caporal"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("Show details of a specific resource or group of resources")
    .argument("<type>", "Type of object")
    .argument("<name-prefix>", "Name prefix")
    .action(({ logger }) => {
      logger.info("Output of `kubectl describe` command")
    })
}
