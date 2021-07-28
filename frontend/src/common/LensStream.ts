import { useEffect, useRef, useState } from 'react'
import _ from 'underscore'
import niy from './niy'

export type State<T> = {
  value?: T
  isLoading?: boolean
  failure?: Error
}

type UseStreamResult<T> = {
  setLoading: () => void
  setValue: (data: T | Error) => void
  stream: LensStream<T>
  isLoading: boolean
  value: T
}

export function useStream<T>(input?: {
  defaultValue?: T
  callback?: (stream: LensStream<T>) => void | (() => void) | undefined
}): UseStreamResult<T> {
  const [state, setState] = useState<State<T>>({
    isLoading: input?.defaultValue ? false : true,
    value: input?.defaultValue,
  })

  const newStream = new LensStream<T>(state, setState)

  useEffect(() => {}, [input])

  if (input?.callback) {
    useEffect(() => input.callback(newStream), [])
  }

  return {
    setLoading: newStream.setLoading,
    setValue: newStream.setValue,
    isLoading: newStream.isLoading,
    value: newStream.value,
    stream: newStream,
  }
}

export default class LensStream<T> {
  constructor(
    private state: State<T>,
    private setState: (state: State<T>) => void
  ) {}

  public isLoading = this.state.isLoading
  public failure = this.state.failure
  public value = this.state.value

  public setLoading: () => void = () => {
    this.setState({
      isLoading: true,
      failure: undefined,
      value: undefined,
    })
  }

  public setValue: (data: T | Error) => void = (data: T) => {
    if (_.isError(data)) {
      this.setState({
        isLoading: false,
        failure: data,
        value: undefined,
      })
    } else {
      this.setState({
        isLoading: false,
        failure: undefined,
        value: data,
      })
    }
  }

  map<T2>(fn: (input: T) => T2): LensStream<T2> {
    const { isLoading, failure: error, value: data } = this.state
    const ns: State<T2> = {
      isLoading,
      failure: error,
      value: data ? fn(data) : undefined,
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

  and<T2>(stream2: LensStream<T2>): LensStream<[T, T2]> {
    const state1 = this.state
    const state2 = stream2.state

    const data: [T, T2] =
      state1.isLoading || state2.isLoading
        ? undefined
        : state1.failure || state2.failure
        ? undefined
        : [state1.value, state2.value]

    const ns: State<[T, T2]> = {
      isLoading: state1.isLoading || state2.isLoading,
      failure:
        state1.isLoading || state2.isLoading
          ? undefined
          : state1.failure
          ? state1.failure
          : state2.failure,
      value: data,
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
    const { isLoading, failure, value } = this.state

    const prevData = useRef<T2>(initialValue)

    const ns: State<T2> = {
      isLoading,
      failure,
      value: value ? fn(prevData.current, value) : undefined,
    }

    const [t2State, setT2State] = useState<State<T2>>(ns)

    useEffect(() => {
      if (ns.value) {
        prevData.current = ns.value
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
