import { getDefaultValueHint } from "../utils"
import { createArgument } from "../../argument"
import { CaporalValidator } from "../../validator/caporal"

describe("help/utils", () => {
  test("getDefaultValueHint() should return the correct value hint", () => {
    const arg = createArgument("<arg>", "My arg", {
      validator: CaporalValidator.BOOLEAN,
      default: true,
    })
    expect(getDefaultValueHint(arg)).toBe("default: true")
  })
})
