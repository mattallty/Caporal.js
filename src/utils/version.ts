/**
 * @packageDocumentation
 * @internal
 */
import path from "path"

export function detectVersion(): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require(path.join(__filename, "..", "..", "..", "package.json"))
    /* istanbul ignore else */
    if (pkg.version) {
      return pkg.version
    }
    // eslint-disable-next-line no-empty
  } catch (e) {}
}
