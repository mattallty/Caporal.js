/**
 * @packageDocumentation
 * @internal
 */
import path from "path"

export function detectVersion(): string | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path.join(__filename, "..", "..", "..", "package.json")).version
    // eslint-disable-next-line no-empty
  } catch (e) {}
}
