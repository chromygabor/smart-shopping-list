import { useRef, useState } from 'react'
import { isEqual } from 'underscore'
import niy from './niy'
import { parse, StackFrame } from 'stacktrace-parser'
import _ from 'underscore'

type SourceFrame = {
  filename: string
  lineNumber: number
  methodName: string
}

class PropertyValue<V> {
  static loading<V>() {
    return new PropertyValue<V>(true, undefined, undefined)
  }

  static failure<V>(failure: Error) {
    return new PropertyValue<V>(false, undefined, failure)
  }

  static value<V>(value: V) {
    return new PropertyValue<V>(false, value, undefined)
  }

  constructor(
    public isLoading: boolean = true,
    public value?: V,
    public failure?: Error
  ) {}

  toState() {
    return {
      isLoading: this.isLoading,
      value: this.value,
      failure: this.failure,
    }
  }

  public setLoading(): PropertyValue<V> {
    return new PropertyValue(true)
  }

  public setValue(value: V): PropertyValue<V> {
    return new PropertyValue(false, value, undefined)
  }

  public setFailure(failure: Error): PropertyValue<V> {
    return new PropertyValue(false, undefined, failure)
  }
}

export class Property<V> {
  constructor(
    public propertyValue: PropertyValue<V>,
    public sources: SourceFrame[]
  ) {}

  public isLoading = this.propertyValue.isLoading
  public failure = this.propertyValue.failure
  public value = this.propertyValue.value

  map<V2>(fn: (input: V) => V2): Property<V2> {
    const err = parse(new Error().stack)
    const sources: SourceFrame[] = [
      {
        filename: err[1].file,
        methodName: err[0].methodName,
        lineNumber: err[1].lineNumber,
      },
      ...this.sources,
    ]

    const getter = () => {
      if (this.isLoading) {
        return PropertyValue.loading<V2>()
      } else if (this.failure) {
        return PropertyValue.failure<V2>(this.failure)
      } else {
        return PropertyValue.value<V2>(fn(this.value as V))
      }
    }

    return new Property(getter(), sources)
  }

  and<V2>(property2: Property<V2>): Property<[V, V2]> {
    const err = parse(new Error().stack)
    const sources: SourceFrame[] = [
      {
        filename: err[1].file,
        methodName: err[0].methodName,
        lineNumber: err[1].lineNumber,
      },
      ...this.sources,
    ]

    const getter = () => {
      if (this.isLoading || property2.isLoading)
        return PropertyValue.loading<[V, V2]>()
      else if (this.failure) return PropertyValue.failure<[V, V2]>(this.failure)
      else if (property2.failure)
        return PropertyValue.failure<[V, V2]>(property2.failure)
      else return PropertyValue.value<[V, V2]>([this.value, property2.value])
    }

    return new Property(getter(), sources)
  }

  useProperty = (): PropertyReturn<V> => {
    const err = parse(new Error().stack)
    const sources: SourceFrame[] = [
      {
        filename: err[1].file,
        methodName: err[0].methodName,
        lineNumber: err[1].lineNumber,
      },
      ...this.sources,
    ]

    return makeFn(sources, () => this.propertyValue, [this.propertyValue])
  }

  static of<V>(value?: V | Error): Property<V> {
    const err = parse(new Error().stack)
    const sources: SourceFrame[] = [
      {
        filename: err[1].file,
        methodName: err[0].methodName,
        lineNumber: err[1].lineNumber,
      },
    ]

    const prop = _.isUndefined(value)
      ? PropertyValue.loading<V>()
      : _.isError(value)
      ? PropertyValue.failure<V>(value)
      : PropertyValue.value<V>(value)

    return new Property<V>(prop, sources)
  }
}

class PropertyFN<V> {
  constructor(protected setProperty: (property: PropertyValue<V>) => void) {}

  setValue<V2 extends V>(value: V2) {
    this.setProperty(new PropertyValue<V>(false, value, undefined))
  }

  setLoading() {
    this.setProperty(new PropertyValue<V>(true, undefined, undefined))
  }

  setFailure(failure: Error) {
    this.setProperty(new PropertyValue<V>(false, undefined, failure))
  }
}

type PropertyReturn<V> = [property: Property<V>, fn: PropertyFN<V>]

type VersionData<V> = {
  data: PropertyValue<V>
  version: number
}

type DependencyData<V> = VersionData<V> & {
  dependencies: PropertyValue<any>[]
}

function makeFn<V>(
  sources: SourceFrame[],
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
    dependencyRef.current = {
      dependencies,
      version,
      data: _property(),
    }
  }

  const property =
    dependencyRef.current.version > state.version
      ? new Property(dependencyRef.current.data, sources)
      : new Property(state.data, sources)

  const setProperty = (property: PropertyValue<V>) => {
    const version = Math.max(state.version, dependencyRef.current.version) + 1
    setState({ data: property, version })
  }

  const fn = new PropertyFN(setProperty)
  return [property, fn]
}

// export function useProperty<V>(value?: V): PropertyReturn<V> {
//   const sources = [parse(new Error().stack)[0]]

//   const prop = PropertyValue.value(value)

//   return makeFn(sources, () => prop, [prop])
// }

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
