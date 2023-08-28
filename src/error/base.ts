/**
 * @packageDocumentation
 * @internal
 */

import { ErrorMetadata } from "../types"

export type CommonError = Error | BaseError

export class BaseError extends Error {
  public meta: ErrorMetadata

  constructor(message: string, meta: ErrorMetadata = {}) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = this.constructor.name
    this.meta = meta
    Error.captureStackTrace(this, this.constructor)
  }
}
