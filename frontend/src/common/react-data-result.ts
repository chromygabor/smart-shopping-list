import { useState } from 'react'
import { DataResult, State as Container } from '../common/MyDataResult'
import { mutableDataResult } from './MyDataResult'

export function makeDataStream<T, P>(input: {
  payload?: P
  isLoading?: boolean
  data?: T
}) {
  const [container, setContainer] = useState<Container<T, P>>({
    isLoading: input.isLoading ? input.isLoading : false,
    payload: input.payload,
    data: input.data,
  })

  return mutableDataResult(
    () => {
      return container
    },
    (_container: Container<T, P>) => {
      setContainer(_container)
    }
  )
}

export function useDataStream<T, P>(dataStream: DataResult<T, P>) {
  return dataStream.state()
}
