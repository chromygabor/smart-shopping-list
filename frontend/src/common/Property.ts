import { useRef, useState } from 'react'
import { isEqual } from 'underscore'

export class Property<V> {
  static loading<V>(name: string = '') {
    return new Property<V>(true, undefined, undefined, name)
  }

  static failure<V>(failure: Error, name: string = '') {
    return new Property<V>(false, undefined, failure, name)
  }

  static value<V>(value: V, name: string = '') {
    return new Property<V>(false, value, undefined, name)
  }

  constructor(
    public isLoading: boolean,
    public value?: V,
    public failure?: Error,
    public name?: string
  ) {}

  toState() {
    return {
      isLoading: this.isLoading,
      value: this.value,
      failure: this.failure,
    }
  }

  map<V2>(fn: (input: V) => V2, name?: string): PropertyReturn<V2> {
    const getter = () => {
      if (this.isLoading) {
        return Property.loading<V2>(name)
      } else if (this.failure) {
        return Property.failure<V2>(this.failure, name)
      } else {
        return Property.value<V2>(fn(this.value as V), name)
      }
    }

    return makeFn(name, getter, [this])
  }

  and<V2>(property2: Property<V2>, name?: string): PropertyReturn<[V, V2]> {
    const getter = () => {
      if (this.isLoading || property2.isLoading)
        return Property.loading<[V, V2]>(name)
      else if (this.failure)
        return Property.failure<[V, V2]>(this.failure, name)
      else if (property2.failure)
        return Property.failure<[V, V2]>(property2.failure, name)
      else return Property.value<[V, V2]>([this.value, property2.value], name)
    }

    return makeFn(name, getter, [this, property2])
  }
}

class PropertyFN<V> {
  constructor(
    private setProperty: (property: Property<V>) => void,
    private name: string
  ) {}

  setValue<V2 extends V>(value: V2) {
    this.setProperty(new Property<V>(false, value, undefined, this.name))
  }

  setLoading() {
    this.setProperty(new Property<V>(true, undefined, undefined, this.name))
  }

  setFailure(failure: Error) {
    this.setProperty(new Property<V>(false, undefined, failure, this.name))
  }
}

type PropertyReturn<V> = [property: Property<V>, fn: PropertyFN<V>]

type VersionData<V> = {
  data: Property<V>
  version: number
}

type DependencyData<V> = VersionData<V> & {
  dependencies: Property<any>[]
}

function makeFn<V>(
  name: string = 'noname',
  _property: () => Property<V>,
  dependencies: Property<any>[]
): PropertyReturn<V> {
  const [state, setState] = useState<VersionData<V>>(() => ({
    data: _property(),
    version: 0,
  }))

  const dependencyRef = useRef<DependencyData<V>>({
    dependencies,
    version: 0,
    data: state.data,
  })

  const equal = isEqual(
    dependencyRef.current.dependencies.map((prop) => prop.toState()),
    dependencies.map((prop) => prop.toState())
  )
  if (!equal) {
    const version = Math.max(state.version, dependencyRef.current.version) + 1
    dependencyRef.current = { dependencies, version, data: _property() }
  }

  const property =
    dependencyRef.current.version > state.version
      ? dependencyRef.current.data
      : state.data

  const setProperty = (property: Property<V>) => {
    const version = Math.max(state.version, dependencyRef.current.version) + 1
    setState({ data: property, version })
  }

  const fn = new PropertyFN(setProperty, name)
  return [property, fn]
}

interface IUseProperty {
  <V>(_property?: V | Property<V>, name?: string): PropertyReturn<V>

  map<V, V2>(
    _property: V | Property<V>,
    fn: (input: V) => V2,
    name?: string
  ): PropertyReturn<V2>
}

class UseProperty {
  private constructor() {}

  public static create(): IUseProperty {
    return Object.assign(
      <V>(
        _property?: V | Property<V>,
        name: string = 'noname'
      ): PropertyReturn<V> => {
        const state =
          _property !== undefined
            ? _property instanceof Property
              ? _property
              : Property.value<V>(_property, name)
            : Property.loading<V>(name)

        return makeFn(name, () => state, [state])
      },
      {
        map: <V, V2>(
          _property: V | Property<V>,
          fn: (input: V) => V2,
          name: string = 'noname'
        ): PropertyReturn<V2> => {
          const state =
            _property !== undefined
              ? _property instanceof Property
                ? _property.map(fn)[0]
                : Property.value<V2>(fn(_property), name)
              : Property.loading<V2>(name)

          return makeFn(name, () => state, [state])
        },
      }
    )
  }
}

export const useProperty = UseProperty.create()
