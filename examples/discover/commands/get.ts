import type { CreateCommandParameters, Command } from "@caporal/core"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("Display one or many resources")
    .option("-o, --output", "Output format", {
      validator: ["json", "yaml", "wide"],
      default: "yaml",
    })
    .action(({ logger }) => {
      logger.info("Output of `kubectl get` command")
    })
}
