import { getSuggestions, boldDiffString } from "../suggest"
import c from "chalk"

describe("Suggest", () => {
  describe("getSuggestions()", () => {
    it("should return proper suggestions", () => {
      const suggestions = getSuggestions("foo", ["foa", "foab", "foabc", "afoo", "bfoap"])
      expect(suggestions).toStrictEqual(["foa", "afoo", "foab"])
    })
  })
  describe("boldDiffString()", () => {
    it("should make the diff bold at the end of the word", () => {
      expect(boldDiffString("foo", "foob")).toEqual("foo" + c.bold.greenBright("b"))
    })
    it("should make the diff bold at the beginning of the word", () => {
      expect(boldDiffString("foo", "doo")).toBe(c.bold.greenBright("d") + "oo")
    })

    it("should make the diff bold at the middle of the word", () => {
      expect(boldDiffString("foo", "fao")).toBe("f" + c.bold.greenBright("a") + "o")
    })

    it("should make the diff bold anywhere in the word", () => {
      expect(boldDiffString("minimum", "maximum")).toBe(
        "m" + c.bold.greenBright("a") + c.bold.greenBright("x") + "imum",
      )
    })
  })
})
