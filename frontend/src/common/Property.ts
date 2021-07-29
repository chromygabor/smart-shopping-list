import { useRef, useState } from 'react'
import { isEqual } from 'underscore'

export class Property<V, F> {
  static loading<V, F>(name: string = '') {
    return new Property<V, F>(true, undefined, undefined, name)
  }

  static failure<V, F>(failure: F, name: string = '') {
    return new Property<V, F>(false, undefined, failure, name)
  }

  static value<V, F>(value: V, name: string = '') {
    return new Property<V, F>(false, value, undefined, name)
  }

  constructor(
    public isLoading: boolean,
    public value?: V,
    public failure?: F,
    public name?: string
  ) {}

  toState() {
    return {
      isLoading: this.isLoading,
      value: this.value,
      failure: this.failure,
    }
  }

  map<V2>(fn: (input: V) => V2, name?: string): PropertyReturn<V2, F> {
    const getter = () => {
      if (this.isLoading) {
        return Property.loading<V2, F>(name)
      } else if (this.failure) {
        return Property.failure<V2, F>(this.failure, name)
      } else {
        return Property.value<V2, F>(fn(this.value as V), name)
      }
    }

    return makeFn(name, getter, [this])
  }

  and<V2, F2 extends F>(
    property2: Property<V2, F2>,
    name?: string
  ): PropertyReturn<[V, V2], F> {
    const getter = () => {
      if (this.isLoading || property2.isLoading)
        return Property.loading<[V, V2], F>(name)
      else if (this.failure)
        return Property.failure<[V, V2], F>(this.failure, name)
      else if (property2.failure)
        return Property.failure<[V, V2], F>(property2.failure, name)
      else
        return Property.value<[V, V2], F>([this.value, property2.value], name)
    }

    return makeFn(name, getter, [this, property2])
  }
}

class PropertyFN<V, F> {
  constructor(
    private setProperty: (property: Property<V, F>) => void,
    private name: string
  ) {}

  setValue<V2 extends V>(value: V2) {
    this.setProperty(new Property<V, F>(false, value, undefined, this.name))
  }

  setLoading() {
    this.setProperty(new Property<V, F>(true, undefined, undefined, this.name))
  }

  setFailure<F2 extends F>(failure: F2) {
    this.setProperty(new Property<V, F>(false, undefined, failure, this.name))
  }
}

type PropertyReturn<V, F> = [property: Property<V, F>, fn: PropertyFN<V, F>]

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

  const setProperty = (property: Property<V, F>) => {
    const version = Math.max(state.version, dependencyRef.current.version) + 1
    setState({ data: property, version })
  }

  const fn = new PropertyFN(setProperty, name)
  return [property, fn]
}

interface IUseProperty {
  <V, F>(_property?: V | Property<V, F>, name?: string): PropertyReturn<V, F>

  map<V, V2, F>(
    _property: V | Property<V, F>,
    fn: (input: V) => V2,
    name?: string
  ): PropertyReturn<V2, F>
}

class UseProperty {
  private constructor() {}

  public static create(): IUseProperty {
    return Object.assign(
      <V, F>(
        _property?: V | Property<V, F>,
        name?: string
      ): PropertyReturn<V, F> => {
        const state =
          _property !== undefined
            ? _property instanceof Property
              ? _property
              : Property.value<V, F>(_property, name)
            : Property.loading<V, F>(name)

        return makeFn(name, () => state, [state])
      },
      {
        map: <V, V2, F>(
          _property: V | Property<V, F>,
          fn: (input: V) => V2,
          name?: string
        ): PropertyReturn<V2, F> => {
          const state =
            _property !== undefined
              ? _property instanceof Property
                ? _property.map(fn)[0]
                : Property.value<V2, F>(fn(_property), name)
              : Property.loading<V2, F>(name)

          return makeFn(name, () => state, [state])
        },
      }
    )
  }
}

export const useProperty = UseProperty.create()
