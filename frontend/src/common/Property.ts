import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { identity, isEqual } from 'underscore'
import niy from './niy'

class PropertyState<V, F> {
  constructor(
    public isLoading: boolean,
    public value?: V,
    public failure?: F
  ) {}
}

type PropertyFN<V, F> = {
  setValue: <V2 extends V>(value: V2) => void

  setLoading: () => void

  setFailure: <F2 extends F>(failure: F2) => void

  map<V2>(fn: (input: V) => V2): PropertyReturn<V2, F>
}

type PropertyReturn<V, F> = [
  property: PropertyState<V, F>,
  fn: PropertyFN<V, F>
]

export class PropertyUtils {
  map<V, F, V2>(
    property: Property<V, F>,
    fn: (value: V) => V2,
    name: string = ''
  ) {
    switch (property.type) {
      case 'ISLOADING':
        return this.loading<V2, F>(name)
      case 'FAILURE':
        return this.failure<V2, F>(property.state as F, name)
      case 'VALUE':
        return this.value<V2, F>(fn(property.state as V), name)
    }
  }

  mapState<V, F, V2>(
    property: PropertyState<V, F>,
    fn: (value: V) => V2,
    name: string = ''
  ): PropertyState<V2, F> {
    if (property.isLoading) {
      return this.loading<V2, F>(name)
    } else if (property.failure) {
      return this.failure<V2, F>(property.failure, name)
    } else {
      return this.value<V2, F>(fn(property.value as V), name)
    }
  }

  and<V, F, V2, F2 extends F>(
    property: Property<V, F>,
    property2: Property<V2, F2>,
    name: string = ''
  ): Property<[V, V2], F> {
    if (property.isLoading || property2.isLoading)
      return this.loading<[V, V2], F>()
    else if (property.failure)
      return this.failure<[V, V2], F>(property.failure, name)
    else if (property2.failure)
      return this.failure<[V, V2], F>(property2.failure, name)
    else return this.value<[V, V2], F>([property.value, property2.value], name)
  }

  loading<V, F>(name: string = '') {
    return new Property<V, F>(name, this, 'ISLOADING')
  }

  failure<V, F>(failure: F, name: string = '') {
    return new Property<V, F>(name, this, 'FAILURE', failure)
  }

  value<V, F>(value: V, name: string = '') {
    return new Property<V, F>(name, this, 'VALUE', value)
  }

  toState<V, F>(property: Property<V, F>) {
    return {
      isLoading: property.type === 'ISLOADING',
      failure: property.type === 'FAILURE' ? (property.state as F) : undefined,
      value: property.type === 'VALUE' ? (property.state as V) : undefined,
    }
  }
}

export class Property<V, F> {
  constructor(
    public name: string,
    public propertyUtils: PropertyUtils,
    public type: 'ISLOADING' | 'FAILURE' | 'VALUE',
    public state?: V | F
  ) {}

  toState() {
    return this.propertyUtils.toState(this)
  }

  map<V2>(fn: (value: V) => V2, name: string = '') {
    return this.propertyUtils.map(this, fn, name)
  }

  and<V2, F2 extends F>(
    property2: Property<V2, F2>,
    name: string = ''
  ): Property<[V, V2], F> {
    return this.propertyUtils.and(this, property2, name)
  }

  value: V | undefined = this.type === 'VALUE' ? (this.state as V) : undefined
  failure: F | undefined =
    this.type === 'FAILURE' ? (this.state as F) : undefined
  isLoading: boolean = this.type === 'ISLOADING'

  setValue<V2 extends V>(value: V2) {
    return this.propertyUtils.value<V, F>(value, this.name)
  }

  setLoading() {
    return this.propertyUtils.loading<V, F>(this.name)
  }

  setFailure<F2 extends F>(failure: F2) {
    return this.propertyUtils.failure<V, F>(failure, this.name)
  }
}

// export function usePropertyMap<V, F, V2>(
//   name: string = 'noname',
//   _property: V | Property<V, F>,
//   initFn: (prop: Property<V, F>) => Property<V2, F>
// ): [Property<V2, F>, PropertyMutator<V2, F>] {
//   const [property] = useProperty(name, _property)

//   return useProperty(name, initFn(property))
// }

function makeFn<V, F>() {}

export function useProperty<V, F>(
  name: string = 'noname',
  _property?: V | PropertyState<V, F>
): PropertyReturn<V, F> {
  const propertyUtils =
    _property && _property instanceof Property
      ? _property.propertyUtils
      : new PropertyUtils()

  const state = _property
    ? _property instanceof PropertyState
      ? _property
      : propertyUtils.value<V, F>(_property, name)
    : propertyUtils.loading<V, F>(name)

  const ref = useRef(state)

  const equal = isEqual(ref.current, state)

  if (!equal) {
    ref.current = state
  }

  const [property, setProperty] = useState<PropertyState<V, F>>(state)

  useEffect(() => {
    if (!isEqual(state, property)) {
      console.log(`[${name}] Setting property because `, property, state)
      setProperty(state)
    }
  }, [ref.current])

  const fn: PropertyFN<V, F> = {
    setValue: <V2 extends V>(value: V2) => {
      setProperty(propertyUtils.value<V2, F>(value))
    },

    setLoading: () => {
      setProperty(propertyUtils.loading<V, F>())
    },

    setFailure: <F2 extends F>(failure: F2) => {
      setProperty(propertyUtils.failure<V, F2>(failure))
    },

    map: <V2>(
      fn: (input: V) => V2,
      name: string = ''
    ): PropertyReturn<V2, F> => {
      const [mappedProperty, setMappedProperty] =
        useState<PropertyState<V2, F>>(state)

      useEffect(() => {
        console.log(
          `[${name}] Setting mapped property because upstream changed`,
          mappedProperty,
          state
        )
        setMappedProperty(propertyUtils.mapState(property, fn))
      }, [ref.current])

      throw niy()
    },
  }

  return [property, fn]
}
