import type { CreateCommandParameters, Command } from "caporal"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("Create a resource from a file or from stdin.")
    .option("-f <FILENAME>", "JSON and YAML file")
    .action(({ logger }) => {
      logger.info("Output of `kubectl create` command")
    })
}
