import express from 'express'

type MyRequest<T> = {
  storage: T
}

export function requestScopeMiddlewareFn<T>(value: T) {
  const foo = (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ): void => {
    const myRequest = request as any
    myRequest.storage = value

    next()
  }

  return foo
}
