/**
 * @packageDocumentation
 * @internal
 */

import { BaseError } from "./base"

export class FlagSyntaxError extends BaseError {
  constructor(synopsis: string) {
    // console.log("---")
    // stackTrace.get().forEach(t =>
    //   console.log("%j", {
    //     getFileName: t.getFileName(),
    //     typeName: t.getTypeName(),
    //     methodName: t.getMethodName(),
    //     function: t.getFunctionName()
    //   })
    // )
    super(`Syntax error in flag synopsis: ${synopsis}`, { synopsis })
  }
}
