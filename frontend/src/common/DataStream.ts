import _ from 'underscore'

export type State<T, P> = {
  isLoading: boolean
  payload?: P
  data?: T | Error
  version: number
}

export class DataStream<T, P> {
  constructor(public state: () => State<T, P>) {}

  public map<T2>(fn: (s: T) => T2): DataStream<T2, P> {
    return new DataStream(() => {
      const { isLoading, payload, data, version } = this.state()

      return {
        isLoading,
        payload,
        data: data ? (_.isError(data) ? data : fn(data)) : undefined,
        version,
      }
    })
  }

  public and<T2, P2>(dr2: DataStream<T2, P2>): DataStream<[T, T2], [P, P2]> {
    return new DataStream(() => {
      const {
        isLoading: isLoading1,
        payload: payload1,
        data: data1,
        version: version1,
      } = this.state()
      const {
        isLoading: isLoading2,
        payload: payload2,
        data: data2,
        version: version2,
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
        version: Math.max(version1, version2),
      }
    })
  }

  public toMutable(
    state: () => State<T, P>,
    setState: (state: State<T, P>) => void
  ): MutableDataStream<T, P> {
    const ds1 = this

    const ds2: MutableDataStream<T, P> = dataStream(
      () => {
        const currentState = ds1.state()
        const container = state()

        const data =
          currentState.version > container.version
            ? currentState.data
            : container.isLoading
            ? undefined
            : container.data

        return {
          isLoading:
            currentState.version > container.version
              ? currentState.isLoading
              : container.isLoading || currentState.isLoading,
          data,
          version: Math.max(currentState.version, container.version),
        }
      },
      (_container: State<T, P>) => {
        const currentState = ds1.state()
        setState({
          ..._container,
          version: currentState.version,
        })
      }
    )
    return ds2
  }
}

export class MutableDataStream<T, P> extends DataStream<T, P> {
  constructor(
    public state: () => State<T, P>,
    setState: (state: State<T, P>) => void,
    public emit: (data: T) => void = (data: T) => {
      const { payload, version } = state()

      setState({
        isLoading: false,
        payload,
        data,
        version: version + 1,
      })
    },
    public loading: () => void = () => {
      const { payload, version } = state()

      setState({
        isLoading: true,
        payload,
        data: undefined,
        version: version + 1,
      })
    },
    public failure: (failure: Error) => void = (failure: Error) => {
      const { payload, version } = state()

      setState({
        isLoading: false,
        payload,
        data: failure,
        version: version + 1,
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
