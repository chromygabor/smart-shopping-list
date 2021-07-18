import { Dispatch, SetStateAction, useState } from 'react'
import _ from 'underscore'

// class PrevData<T> {
//   constructor(public data: T, public prevData?: PrevData<T>) {}

//   map<T2>(fn: (s: T) => T2): PrevData<T2> {
//     return new PrevData(
//       fn(this.data),
//       this.prevData ? this.prevData.map(fn) : undefined
//     )
//   }
// }

export type State<T, P> = {
  isLoading: boolean
  payload?: P
  data?: T | Error
}

type FoldFnCallbackRes<T, T1, T2, T3> = {
  onSuccess?: (data: T) => T1
  onLoading?: () => T2
  onFailure?: (failure: Error) => T3
}

export class DataResult<T, P> {
  constructor(public state: () => State<T, P>) {}

  public map<T2>(fn: (s: T) => T2): DataResult<T2, P> {
    return new DataResult(() => {
      const { isLoading, payload, data } = this.state()

      return {
        isLoading,
        payload,
        data: data ? (_.isError(data) ? data : fn(data)) : undefined,
      }
    })
  }

  public zip<T2, P2>(dr2: DataResult<T2, P2>): DataResult<[T, T2], [P, P2]> {
    // return new DataResult(() => {
    //   const currentState = this.state()
    //   return {
    //     isLoading: isLoading,
    //     payload: payload,
    //     error: error,
    //     data: data ? fn(data) : undefined,
    //   }
    // })
    throw new Error('Not implemented yet')
  }

  public fold<T2, T3, T4>(
    fn: (input: { payload: P }) => FoldFnCallbackRes<T, T2, T3, T4>
  ): T2 | T3 | T4 {
    const { payload, data, isLoading } = this.state()

    const r = fn({ payload })
    if (data && !_.isError(data)) return r.onSuccess(data)
    else if (isLoading) return r.onLoading()
    else if (data && _.isError(data)) return r.onFailure(data)
  }

  public onSuccess<T1>(
    fn: (data: { payload: P; data: T }) => T1
  ): T1 | undefined {
    const { payload, data } = this.state()

    return data && !_.isError(data) ? fn({ data, payload }) : undefined
  }

  public onLoading<T1>(fn: (data: { payload: P }) => T1): T1 | undefined {
    const { payload, isLoading } = this.state()
    return isLoading ? fn({ payload }) : undefined
  }

  public onFailure<T1>(
    fn: (data: { payload: P; error: Error }) => T1
  ): T1 | undefined {
    const { payload, data } = this.state()
    return data && _.isError(data)
      ? fn({
          error: data,
          payload,
        })
      : undefined
  }
}

export function mutableDataResult<T, P>(
  state: () => State<T, P>,
  setState: (state: State<T, P>) => void
) {
  const emit = (data: T) => {
    const { payload } = state()

    setState({
      isLoading: false,
      payload,
      data,
    })
  }

  const loading = () => {
    const { payload, data } = state()

    setState({
      isLoading: true,
      payload,
      data,
    })
  }

  const failure = (failure: Error) => {
    const { payload, isLoading } = state()

    setState({
      isLoading,
      payload,
      data: failure,
    })
  }

  return {
    dataResult: new DataResult<T, P>(state),
    emit,
    failure,
    loading,
  }
}

// export function useDataResult<T, Payload>(
//   payload: Payload,
//   loading?: boolean,
//   data?: T
//   error?: Error
// ) {
//   const [state, setState] = useState<DataResult<T, Payload>>(
//     new DataResult(loading, payload, data, prevData, error)
//   )

//   return mutableDataResult(() => state, setState)
// }
