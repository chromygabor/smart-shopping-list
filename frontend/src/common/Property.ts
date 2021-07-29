import { Setter } from 'monocle-ts'
import { useEffect, useRef, useState } from 'react'
import { isEqual } from 'underscore'
import niy from './niy'

class Property<V, F> {
  constructor(
    public isLoading: boolean,
    public value?: V,
    public failure?: F,
    public name?: string
  ) {}
}

type PropertyFN<V, F> = {
  setValue: <V2 extends V>(value: V2) => void

  setLoading: () => void

  setFailure: <F2 extends F>(failure: F2) => void

  map<V2>(fn: (input: V) => V2, name?: string): PropertyReturn<V2, F>

  and<V2, F2 extends F>(
    property2: Property<V2, F2>,
    name?: string
  ): PropertyReturn<[V, V2], F>
}

type PropertyReturn<V, F> = [property: Property<V, F>, fn: PropertyFN<V, F>]

export class PropertyUtils {
  map<V, F, V2>(
    property: Property<V, F>,
    fn: (value: V) => V2,
    name: string = ''
  ): Property<V2, F> {
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
      return this.loading<[V, V2], F>(name)
    else if (property.failure)
      return this.failure<[V, V2], F>(property.failure, name)
    else if (property2.failure)
      return this.failure<[V, V2], F>(property2.failure, name)
    else return this.value<[V, V2], F>([property.value, property2.value], name)
  }

  loading<V, F>(name: string = '') {
    return new Property<V, F>(true, undefined, undefined, name)
  }

  failure<V, F>(failure: F, name: string = '') {
    return new Property<V, F>(false, undefined, failure, name)
  }

  value<V, F>(value: V, name: string = '') {
    return new Property<V, F>(false, value, undefined, name)
  }
}

type VersionData<V, F> = {
  data: Property<V, F>
  version: number
}

type DependencyData<V, F> = VersionData<V, F> & {
  dependencies: Property<any, any>[]
}

function makeFn<V, F>(
  name: string = 'noname',
  _property: () => Property<V, F>,
  propertyUtils: PropertyUtils,
  dependencies: Property<any, any>[]
): PropertyReturn<V, F> {
  const [state, setState] = useState<VersionData<V, F>>(() => ({
    data: _property(),
    version: 0,
  }))

  const dependencyRef = useRef<DependencyData<V, F>>({
    dependencies,
    version: 0,
    data: state.data,
  })

  const equal = isEqual(dependencyRef.current.dependencies, dependencies)
  if (!equal) {
    const version = Math.max(state.version, dependencyRef.current.version) + 1
    dependencyRef.current = { dependencies, version, data: _property() }
  }

  const property =
    dependencyRef.current.version > state.version
      ? dependencyRef.current.data
      : state.data

  const setProperty = (property: Property<V, F>) => {
    const version = Math.max(state.version, dependencyRef.current.version) + 1
    setState({ data: property, version })
  }

  const fn: PropertyFN<V, F> = {
    setValue: <V2 extends V>(value: V2) => {
      setProperty(propertyUtils.value<V2, F>(value, name))
    },

    setLoading: () => {
      setProperty(propertyUtils.loading<V, F>(name))
    },

    setFailure: <F2 extends F>(failure: F2) => {
      setProperty(propertyUtils.failure<V, F2>(failure, name))
    },

    map: <V2>(
      fn: (input: V) => V2,
      name: string = ''
    ): PropertyReturn<V2, F> => {
      // throw niy()
      return makeFn(
        name,
        () => propertyUtils.map(property, fn, name),
        propertyUtils,
        [property]
      )
    },
    and: <V2, F2 extends F>(property2: Property<V2, F2>, name?: string) => {
      // throw niy()
      return makeFn(
        name,
        () => propertyUtils.and(property, property2, name),
        propertyUtils,
        [property, property2]
      )
    },
  }
  return [property, fn]
}

export function useProperty<V, F>(
  _property?: V | Property<V, F>,
  name: string = 'noname'
): PropertyReturn<V, F> {
  const propertyUtils = new PropertyUtils()

  const state =
    _property !== undefined
      ? _property instanceof Property
        ? _property
        : propertyUtils.value<V, F>(_property, name)
      : propertyUtils.loading<V, F>(name)

  return makeFn(name, () => state, propertyUtils, [state])
}
