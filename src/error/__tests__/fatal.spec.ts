import { fatalError } from "../fatal"
import { BaseError } from "../base"
import { logger } from "../../logger"

describe("fatalError()", () => {
  const loggerLogSpy = jest.spyOn(logger, "log")
  const loggerErrSpy = jest.spyOn(logger, "error")

  afterEach(() => {
    logger.level = "info"
  })

  it("should always call process.exit(1)", () => {
    const err = new BaseError("my error")
    fatalError(err)
    expect(process.exitCode).toEqual(1)
  })

  it("should always logger.error in normal situation", () => {
    const err = new BaseError("my error")
    fatalError(err)
    expect(loggerErrSpy).toHaveBeenCalledWith(err.message)
  })

  it("should always logger.log in debug mode, with more info", () => {
    const err = new BaseError("my error")
    logger.level = "debug"
    fatalError(err)
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("my error"),
        stack: err.stack,
        name: "BaseError",
      }),
    )
  })
})
