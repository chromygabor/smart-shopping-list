import { useRef, useState } from 'react'
import { isEqual } from 'underscore'
import niy from './niy'

export class PropertyValue<V> {
  static loading<V>(name: string = '') {
    return new PropertyValue<V>(true, undefined, undefined, name)
  }

  static failure<V>(failure: Error, name: string = '') {
    return new PropertyValue<V>(false, undefined, failure, name)
  }

  static value<V>(value: V, name: string = '') {
    return new PropertyValue<V>(false, value, undefined, name)
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
        return PropertyValue.loading<V2>(name)
      } else if (this.failure) {
        return PropertyValue.failure<V2>(this.failure, name)
      } else {
        return PropertyValue.value<V2>(fn(this.value as V), name)
      }
    }

    return makeFn(name, getter, [this])
  }

  and<V2>(
    property2: PropertyValue<V2>,
    name?: string
  ): PropertyReturn<[V, V2]> {
    const getter = () => {
      if (this.isLoading || property2.isLoading)
        return PropertyValue.loading<[V, V2]>(name)
      else if (this.failure)
        return PropertyValue.failure<[V, V2]>(this.failure, name)
      else if (property2.failure)
        return PropertyValue.failure<[V, V2]>(property2.failure, name)
      else
        return PropertyValue.value<[V, V2]>([this.value, property2.value], name)
    }

    return makeFn(name, getter, [this, property2])
  }
}

class Property<V> {
  constructor(
    public propertyValue: PropertyValue<V>,
    protected setProperty: (property: PropertyValue<V>) => void
  ) {}

  private isLoading = this.propertyValue.isLoading
  private failure = this.propertyValue.failure
  private value = this.propertyValue.value

  map<V2>(fn: (input: V) => V2, name?: string): PropertyReturn<V2> {
    const getter = () => {
      if (this.isLoading) {
        return PropertyValue.loading<V2>(name)
      } else if (this.failure) {
        return PropertyValue.failure<V2>(this.failure, name)
      } else {
        return PropertyValue.value<V2>(fn(this.value as V), name)
      }
    }

    return makeFn(name, getter, [this])
  }

  and<V2>(
    property2: PropertyValue<V2>,
    name?: string
  ): PropertyReturn<[V, V2]> {
    const getter = () => {
      if (this.isLoading || property2.isLoading)
        return PropertyValue.loading<[V, V2]>(name)
      else if (this.failure)
        return PropertyValue.failure<[V, V2]>(this.failure, name)
      else if (property2.failure)
        return PropertyValue.failure<[V, V2]>(property2.failure, name)
      else
        return PropertyValue.value<[V, V2]>([this.value, property2.value], name)
    }

    return makeFn(name, getter, [this, property2])
  }

  asState = [
    this,
    {
      setValue: <V2 extends V>(value: V2) => {
        this.setProperty(
          new PropertyValue<V>(false, value, undefined, this.propertyValue.name)
        )
      },

      setLoading: () => {
        this.setProperty(
          new PropertyValue<V>(
            true,
            undefined,
            undefined,
            this.propertyValue.name
          )
        )
      },

      setFailure: (failure: Error) => {
        this.setProperty(
          new PropertyValue<V>(
            false,
            undefined,
            failure,
            this.propertyValue.name
          )
        )
      },
    },
  ]
}

class PropertyFN<V> {
  constructor(
    protected setProperty: (property: PropertyValue<V>) => void,
    protected name: string
  ) {}

  setValue<V2 extends V>(value: V2) {
    this.setProperty(new PropertyValue<V>(false, value, undefined, this.name))
  }

  setLoading() {
    this.setProperty(
      new PropertyValue<V>(true, undefined, undefined, this.name)
    )
  }

  setFailure(failure: Error) {
    this.setProperty(new PropertyValue<V>(false, undefined, failure, this.name))
  }
}

type PropertyReturn<V> = [property: PropertyValue<V>, fn: PropertyFN<V>]

type VersionData<V> = {
  data: PropertyValue<V>
  version: number
}

type DependencyData<V> = VersionData<V> & {
  dependencies: PropertyValue<any>[]
}

function makeFn<V>(
  name: string = 'noname',
  _property: () => PropertyValue<V>,
  dependencies: PropertyValue<any>[]
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

  const setProperty = (property: PropertyValue<V>) => {
    const version = Math.max(state.version, dependencyRef.current.version) + 1
    setState({ data: property, version })
  }

  const fn = new PropertyFN(setProperty, name)
  return [property, fn]
}

export function useProperty<V>(
  _property?: V | PropertyValue<V>,
  name?: string
): Property<V> {
  throw niy()
}

// interface IUseProperty {
//   <V>(_property?: V | PropertyValue<V>, name?: string): PropertyReturn<V>

//   map<V, V2>(
//     _property: V | PropertyValue<V>,
//     fn: (input: V) => V2,
//     name?: string
//   ): PropertyReturn<V2>
// }

// class UseProperty {
//   private constructor() {}

//   public static create(): IUseProperty {
//     return Object.assign(
//       <V>(
//         _property?: V | PropertyValue<V>,
//         name: string = 'noname'
//       ): PropertyReturn<V> => {
//         const state =
//           _property !== undefined
//             ? _property instanceof PropertyValue
//               ? _property
//               : PropertyValue.value<V>(_property, name)
//             : PropertyValue.loading<V>(name)

//         return makeFn(name, () => state, [state])
//       },
//       {
//         map: <V, V2>(
//           _property: V | PropertyValue<V>,
//           fn: (input: V) => V2,
//           name: string = 'noname'
//         ): PropertyReturn<V2> => {
//           const state =
//             _property !== undefined
//               ? _property instanceof PropertyValue
//                 ? _property.map(fn)[0]
//                 : PropertyValue.value<V2>(fn(_property), name)
//               : PropertyValue.loading<V2>(name)

//           return makeFn(name, () => state, [state])
//         },
//       }
//     )
//   }
// }

// export const useProperty = UseProperty.create()
