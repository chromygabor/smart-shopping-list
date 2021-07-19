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

export class DataStream<T, P> {
  constructor(public state: () => State<T, P>) {}

  public map<T2>(fn: (s: T) => T2): DataStream<T2, P> {
    return new DataStream(() => {
      const { isLoading, payload, data } = this.state()

      return {
        isLoading,
        payload,
        data: data ? (_.isError(data) ? data : fn(data)) : undefined,
      }
    })
  }

  public and<T2, P2>(dr2: DataStream<T2, P2>): DataStream<[T, T2], [P, P2]> {
    return new DataStream(() => {
      const {
        isLoading: isLoading1,
        payload: payload1,
        data: data1,
      } = this.state()
      const {
        isLoading: isLoading2,
        payload: payload2,
        data: data2,
      } = dr2.state()

      return {
        isLoading: isLoading1 || isLoading2,
        payload: [payload1, payload2],
        data:
          data1 && data2
            ? _.isError(data1)
              ? data1
              : _.isError(data2)
              ? data2
              : [data1, data2]
            : undefined,
      }
    })
  }
}

export class MutableDataStream<T, P> extends DataStream<T, P> {
  constructor(
    public state: () => State<T, P>,
    setState: (state: State<T, P>) => void,
    public emit: (data: T) => void = (data: T) => {
      const { payload } = state()

      setState({
        isLoading: false,
        payload,
        data,
      })
    },
    public loading: () => void = () => {
      const { payload } = state()

      setState({
        isLoading: true,
        payload,
        data: undefined,
      })
    },
    public failure: (failure: Error) => void = (failure: Error) => {
      const { payload, isLoading } = state()

      setState({
        isLoading,
        payload,
        data: failure,
      })
    }
  ) {
    super(state)
  }
}

export function dataStream<T, P>(
  state: () => State<T, P>,
  setState: (state: State<T, P>) => void
) {
  return new MutableDataStream(state, setState)
}
