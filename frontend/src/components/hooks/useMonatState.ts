import React, { SetStateAction, useEffect, useState } from 'react'
import _ from 'underscore'

export function useMonadState<T>(
  initialState: T | (() => T)
): [T, React.Dispatch<SetStateAction<T>>, MonadState<T>] {
  const [state, setState] = useState(initialState)

  return [state, setState, new MonadState(() => state)]
}

export function createMonadState<T>(state: T): MonadState<T> {
  return new MonadState(() => state)
}

class MonadState<T> {
  constructor(public state: T | (() => T)) {}
  private getState(): T {
    if (_.isFunction(this.state)) {
      return this.state()
    } else {
      return this.state
    }
  }
  map<T2>(fn: (s: T) => T2): [T2, MonadState<T2>] {
    console.log('Usestate created')
    const [s2, setS2] = useState(() => {
      return fn(this.getState())
    })
    useEffect(() => {
      setS2(fn(this.getState()))
    }, [this.getState()])

    return [s2, new MonadState(() => s2)]
  }
}
