// export type DataResult<TData, QueryResult> = {
//   data: TData | undefined
//   error?: Error
//   loading: boolean
//   queryResult?: QueryResult
// }

class PrevData<T> {
  constructor(public data: T, public prevData?: PrevData<T>) {}

  map<T2>(fn: (s: T) => T2): PrevData<T2> {
    return new PrevData(
      fn(this.data),
      this.prevData ? this.prevData.map(fn) : undefined
    )
  }
}

export function makeDataResult<T, Payload>(
  payload?: Payload,
  loading?: boolean,
  data?: T,
  prevData?: PrevData<T>,
  error?: Error
) {
  return new DataResult(
    loading ? loading : false,
    payload,
    data,
    prevData,
    error
  )
}

type SuccessInput<T2> = {
  onSuccess: T2
}

type FailureInput<T2> = {
  onFailure: T2
}

type ProgressInput<T2> = {
  onProgress: T2
}

export class DataResult<T, Payload> {
  constructor(
    public loading: boolean,
    public payload?: Payload,
    public data?: T,
    public prevData?: PrevData<T>,
    public error?: Error
  ) {}

  map<T2>(fn: (s: T) => T2): DataResult<T2, Payload> {
    return new DataResult(
      this.loading,
      this.payload,
      this.data ? fn(this.data) : undefined,
      this.prevData ? this.prevData.map(fn) : undefined,
      this.error
    )
  }

  fold<T2, T3, T4>(
    arg: SuccessInput<T2> & FailureInput<T3> & ProgressInput<T4>
  ): T2 | T3 | T4 {
    if (this.inProgress) return arg.onProgress
    else if (this.error) return arg.onFailure
    else return arg.onSuccess
  }

  completed(data: T) {
    return new DataResult(
      false,
      this.payload,
      data,
      this.data ? new PrevData(this.data, this.prevData) : this.prevData,
      this.error
    )
  }

  inProgress() {
    return new DataResult(
      true,
      this.payload,
      undefined,
      new PrevData(this.data, this.prevData),
      this.error
    )
  }

  failure(err: Error) {
    return new DataResult(
      false,
      this.payload,
      undefined,
      new PrevData(this.data, this.prevData),
      err
    )
  }
}
