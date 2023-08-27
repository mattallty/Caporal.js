import { getDefaultValueHint } from "../utils"
import { createArgument } from "../../argument"
import { CaporalValidator } from "../../validator/caporal"
import { expect, it, describe } from "vitest"

describe("help/utils", () => {
  it("getDefaultValueHint() should return the correct value hint", () => {
    const arg = createArgument("<arg>", "My arg", {
      validator: CaporalValidator.BOOLEAN,
      default: true,
    })
    expect(getDefaultValueHint(arg)).toBe("default: true")
  })
})
