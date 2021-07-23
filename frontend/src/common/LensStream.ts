import { Lens } from 'monocle-ts'
import { useEffect, useRef, useState } from 'react'
import _ from 'underscore'
import niy from './niy'

export type State<T> = {
  data?: T
  isLoading?: boolean
  failure?: Error
}

export function useStream<T>(input?: {
  defaultValue?: T
  callback?: (callbacks: {
    loading: () => void
    emit: (input: T | Error) => void
  }) => void | (() => void) | undefined
}): LensStream<T> {
  const [state, setState] = useState<State<T>>({
    isLoading: input?.defaultValue ? false : true,
    data: input?.defaultValue,
  })

  const newStream = new LensStream<T>(state, setState)

  if (input?.callback) {
    useEffect(
      () =>
        input.callback({
          loading: newStream.loading,
          emit: newStream.emit,
        }),
      []
    )
  }

  return newStream
}

export default class LensStream<T> {
  constructor(
    private state: State<T>,
    private setState: (state: State<T>) => void
  ) {}

  public isLoading = this.state.isLoading
  public failure = this.state.failure
  public data = this.state.data

  public loading: () => void = () => {
    this.setState({
      isLoading: true,
      failure: undefined,
      data: undefined,
    })
  }

  public emit: (data: T | Error) => void = (data: T) => {
    if (_.isError(data)) {
      this.setState({
        isLoading: false,
        failure: data,
        data: undefined,
      })
    } else {
      this.setState({
        isLoading: false,
        failure: undefined,
        data,
      })
    }
  }

  map<T2>(fn: (input: T) => T2): LensStream<T2> {
    const { isLoading, failure: error, data } = this.state
    const ns: State<T2> = {
      isLoading,
      failure: error,
      data: data ? fn(data) : undefined,
    }

    const [t2State, setT2State] = useState<State<T2>>(ns)

    useEffect(() => {
      if (!_.isEqual(ns, t2State)) {
        // console.log(
        //   'Useeffect setState',
        //   JSON.stringify(ns),
        //   JSON.stringify(t2State)
        // )
        setT2State(ns)
      }
    }, [JSON.stringify(this.state)])

    return new LensStream<T2>(t2State, (_state: State<T2>) => {
      // console.log('Stream setState')
      setT2State(_state)
    })
  }

  mapB<T2>(lens: Lens<T, T2>): LensStream<T2> {
    const { isLoading, failure: error, data } = this.state
    const ns: State<T2> = {
      isLoading,
      failure: error,
      data: data ? lens.get(data) : undefined,
    }
    const [t2State, setT2State] = useState<State<T2>>(ns)

    useEffect(() => {
      if (!_.isEqual(ns, t2State)) {
        // console.log(
        //   'Useeffect setState',
        //   JSON.stringify(ns),
        //   JSON.stringify(t2State)
        // )
        setT2State(ns)
      }
    }, [JSON.stringify(this.state)])

    return new LensStream<T2>(t2State, (_state: State<T2>) => {
      const data = lens.set(_state.data)(this.state.data)

      if (_state.data) {
        this.setState({
          ...this.state,
          data,
        })
      } else {
        setT2State(_state)
      }
    })
  }

  and<T2>(stream2: LensStream<T2>): LensStream<[T, T2]> {
    const state1 = this.state
    const state2 = stream2.state

    const data: [T, T2] =
      state1.isLoading || state2.isLoading
        ? undefined
        : state1.failure || state2.failure
        ? undefined
        : [state1.data, state2.data]

    const ns: State<[T, T2]> = {
      isLoading: state1.isLoading || state2.isLoading,
      failure:
        state1.isLoading || state2.isLoading
          ? undefined
          : state1.failure
          ? state1.failure
          : state2.failure,
      data,
    }

    const [t2State, setT2State] = useState<State<[T, T2]>>(ns)

    useEffect(() => {
      if (!_.isEqual(ns, t2State)) {
        setT2State(ns)
      }
    }, [JSON.stringify([state1, state2])])

    return new LensStream<[T, T2]>(t2State, (_state: State<[T, T2]>) => {
      setT2State(_state)
    })
  }

  fold<T2>(
    fn: (prev: T2 | undefined, item: T) => T2,
    initialValue?: T2
  ): LensStream<T2> {
    const { isLoading, failure, data } = this.state

    const prevData = useRef<T2>(initialValue)

    const ns = {
      isLoading,
      failure,
      data: data ? fn(prevData.current, data) : undefined,
    }

    const [t2State, setT2State] = useState<State<T2>>(ns)

    useEffect(() => {
      if (ns.data) {
        prevData.current = ns.data
      }

      if (!_.isEqual(ns, t2State)) {
        setT2State(ns)
      }
    }, [JSON.stringify(this.state)])

    return new LensStream<T2>(t2State, (_state: State<T2>) => {
      setT2State(_state)
    })
  }
}
