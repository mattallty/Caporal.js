/**
 * @packageDocumentation
 * @internal
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0
  }
  if (!a.length || !b.length) {
    return a.length || b.length
  }
  let cell = 0
  let lcell = 0
  let dcell = 0
  const row = [...Array(b.length + 1).keys()]
  for (let i = 0; i < a.length; i++) {
    dcell = i
    lcell = i + 1
    for (let j = 0; j < b.length; j++) {
      cell = a[i] === b[j] ? dcell : Math.min(...[dcell, row[j + 1], lcell]) + 1
      dcell = row[j + 1]
      row[j] = lcell
      lcell = cell
    }
    row[row.length - 1] = cell
  }
  return cell
}
