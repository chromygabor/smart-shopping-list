export default function chaosMonkey(
  _handlers: {
    onError?: () => void
    onSuccess?: () => void
  },
  _config?: {
    isAsync?: boolean
    asyncMultiplier?: number
    errorRatio?: number
    counter?: number
  }
) {
  const config = {
    isAsync: true,
    asyncMultiplier: 1000,
    asyncCounter: 0,
    errorRatio: 0.1,
    ..._config,
  }

  const handlers = {
    onError: () => {},
    onSuccess: () => {},
    ..._handlers,
  }

  function asyncTimer(counter: number) {
    setTimeout(() => {
      if (Math.random() < config.errorRatio) {
        handlers.onError()
      } else {
        handlers.onSuccess()
      }
      if (counter > 0) {
        asyncTimer(counter - 1)
      }
    }, Math.random() * config.asyncMultiplier)
  }

  if (config.isAsync) {
    asyncTimer(config.counter)
  } else {
    if (Math.random() < config.errorRatio) {
      handlers.onError()
    } else {
      handlers.onSuccess()
    }
  }
}
