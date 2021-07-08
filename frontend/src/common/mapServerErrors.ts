import { mapMapTo, MapTo } from '../utils/mapObject'
import { Errors } from '../components/form/useForm'

function fieldsFrom<T>(
  fields: MapTo<T, string[]>,
  exceptions: any
): MapTo<T, string[]> {
  const validationErrors = exceptions[0]?.extensions?.exception
    .validationErrors as {
    property: string
    constraints: {
      [key: string]: string
    }
  }[]

  const fieldErrors = validationErrors.reduce<Record<string, string[]>>(
    (prev, item) => {
      return item.property && Object.keys(item.constraints).length > 0
        ? {
            ...prev,
            [item.property]: Object.keys(item.constraints),
          }
        : prev
    },
    {}
  )

  return mapMapTo(
    (_value, key) =>
      fieldErrors.hasOwnProperty(key) ? fieldErrors[key] : ([] as string[]),
    fields
  )
}

export function fromServerError<T>(
  errors: Errors<T>,
  exceptions: any
): Errors<T> {
  const fields =
    exceptions[0]?.extensions?.exception.validationErrors &&
    Array.isArray(exceptions[0]?.extensions?.exception.validationErrors)
      ? fieldsFrom(errors.fields, exceptions)
      : errors.fields

  const form =
    exceptions[0]?.extensions?.exception.inputErrors &&
    Array.isArray(exceptions[0]?.extensions?.exception.inputErrors)
      ? exceptions[0]?.extensions?.exception.inputErrors.map(
          (item) => item.constraint
        )
      : ([] as string[])

  return {
    form,
    fields,
  }
}
