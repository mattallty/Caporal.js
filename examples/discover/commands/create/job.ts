import type { CreateCommandParameters, Command } from "@caporal/core"

export default function ({ createCommand }: CreateCommandParameters): Command {
  return createCommand("Create a job with the specified name.")
    .argument("<name>", "Job name")
    .action(({ logger }) => {
      logger.info("Output of `kubectl create job` command")
    })
}
