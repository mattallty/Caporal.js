import { levenshtein } from "../levenshtein"

describe("levenshtein", () => {
  test.each([
    ["hello", "bye", 5],
    ["some", "sometimes", 5],
    ["john", "jane", 3],
    ["exemple", "example", 1],
    ["", "", 0],
    ["not-empty", "", 9],
    ["", "not-empty", 9],
  ])(".levenshtein('%s', '%s')", (a, b, expected) => {
    expect(levenshtein(a, b)).toBe(expected)
  })
})
