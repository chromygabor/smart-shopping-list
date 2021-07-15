import { Dispatch, SetStateAction, useState } from 'react'

class PrevData<T> {
  constructor(public data: T, public prevData?: PrevData<T>) {}

  map<T2>(fn: (s: T) => T2): PrevData<T2> {
    return new PrevData(
      fn(this.data),
      this.prevData ? this.prevData.map(fn) : undefined
    )
  }
}

type FoldFnCallbackRes<T, T1, T2, T3> = {
  onSuccess?: (data: T) => T1
  onLoading?: () => T2
  onFailure?: (failure: Error) => T3
}

type FoldFnCallbackReq<T, P> = {
  prevData: PrevData<T>
  payload: P
}

export type FoldFn<T, P, T1, T2, T3> = (
  input: FoldFnCallbackReq<T, P>
) => FoldFnCallbackRes<T, T1, T2, T3>

export class MappedDataResult<T, P> {
  constructor(
    public isLoading: boolean,
    public payload?: P,
    public data?: T,
    public prevData?: PrevData<T>,
    public error?: Error
  ) {}

  public map<T2>(fn: (s: T) => T2): MappedDataResult<T2, P> {
    return new MappedDataResult(
      this.isLoading,
      this.payload,
      this.data ? fn(this.data) : undefined,
      this.prevData ? this.prevData.map(fn) : undefined,
      this.error
    )
  }

  public fold<T2, T3, T4>(fn: FoldFn<T, P, T2, T3, T4>): T2 | T3 | T4 {
    const r = fn({ prevData: this.prevData, payload: this.payload })
    if (this.data) return r.onSuccess(this.data)
    else if (this.isLoading) return r.onLoading()
    else if (this.error) return r.onFailure(this.error)
  }

  public onSuccess<T1>(
    fn: (data: FoldFnCallbackReq<T, P> & { data: T }) => T1
  ): T1 | undefined {
    return this.data
      ? fn({ data: this.data, payload: this.payload, prevData: this.prevData })
      : undefined
  }

  public onLoading<T1>(
    fn: (data: FoldFnCallbackReq<T, P>) => T1
  ): T1 | undefined {
    return this.isLoading
      ? fn({ prevData: this.prevData, payload: this.payload })
      : undefined
  }

  public onFailure<T1>(
    fn: (data: FoldFnCallbackReq<T, P> & { error: Error }) => T1
  ): T1 | undefined {
    return this.error
      ? fn({
          error: this.error,
          payload: this.payload,
          prevData: this.prevData,
        })
      : undefined
  }
}

export function useDataResult<T, Payload>(
  payload: Payload,
  loading?: boolean,
  data?: T,
  prevData?: PrevData<T>,
  error?: Error
) {
  const [state, setState] = useState<MappedDataResult<T, Payload>>(
    new MappedDataResult(loading, payload, data, prevData, error)
  )

  const completed = (data: T) => {
    setState(
      new MappedDataResult(
        false,
        state.payload,
        data,
        state.data ? new PrevData(state.data, state.prevData) : state.prevData,
        undefined
      )
    )
  }

  const setLoading = () => {
    setState(
      new MappedDataResult(
        true,
        state.payload,
        undefined,
        state.data ? new PrevData(state.data, state.prevData) : state.prevData,
        undefined
      )
    )
  }

  const failure = (error: Error) => {
    setState(
      new MappedDataResult(
        false,
        state.payload,
        undefined,
        state.data ? new PrevData(state.data, state.prevData) : state.prevData,
        error
      )
    )
  }

  return {
    state,
    completed,
    failure,
    setLoading,
  }
}
