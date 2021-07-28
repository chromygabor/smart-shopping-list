import { useState } from 'react'
import { DataStream, State as Container, dataStream } from './DataStream'
import _ from 'underscore'

export function makeDataStream<T, P>(
  i: () => {
    payload?: P
    isLoading?: boolean
    data?: T | Error
  }
) {
  const [container, setContainer] = useState<Container<T, P>>(() => {
    const input = i()
    return {
      isLoading: input.isLoading ? input.isLoading : false,
      payload: input.payload,
      data: input.data,
      version: 0,
    }
  })

  return dataStream(
    () => {
      return container
    },
    (_container: Container<T, P>) => {
      setContainer(_container)
    }
  )
}

export function useDataStream<T, P>(dataStream: DataStream<T, P>) {
  const currentState = dataStream.state()

  return [
    currentState.isLoading ? currentState.isLoading : false,
    _.isError(currentState.data) ? undefined : (currentState.data as T),
    _.isError(currentState.data) ? (currentState.data as Error) : undefined,
  ] as [isLoading: boolean, data: T | undefined, error: Error | undefined]
}
