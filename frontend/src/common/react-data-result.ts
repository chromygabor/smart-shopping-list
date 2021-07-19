import { useState } from 'react'
import { DataStream, State as Container, dataStream } from './DataStream'

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
  return dataStream.state()
}
