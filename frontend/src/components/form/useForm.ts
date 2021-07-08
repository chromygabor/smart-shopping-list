import { FormEvent, useEffect, useState } from 'react'
import mapObject, { ValueOf, MapTo, mapMapTo } from '../../utils/mapObject'
import { fromServerError } from '../../common/mapServerErrors'

export type Errors<T> = {
  form: string[]
  fields: MapTo<T, string[]>
}

type IsInvalid<T> = {
  form: boolean
  fields: MapTo<T, boolean>
}

export interface IFormProps<T> {
  initialValues: T
  handleSubmit: (
    event: FormEvent,
    values: T,
    callbacks: {
      setException: (errors) => void
      setFieldError: (fieldName: string, error: string) => void
      setFormError: (error: string) => void
    }
  ) => void
  defaultFieldVariant?: 'standard' | 'filled' | 'outlined'
  labelKeyPrefix?: string
  translate: (key: string) => string
}

export interface IForm<T> {
  props: IFormProps<T>
  handleChange: (name: string, value: any) => void
  handleSubmit: (e: FormEvent) => void
  values: T
  isInvalid: IsInvalid<T>
  helpers: Errors<T>
  errors: Errors<T>
  isSubmiting: boolean
  setValues: (values: T) => void
}

export function useForm<T extends object>(props: IFormProps<T>): IForm<T> {
  const { initialValues, handleSubmit } = props

  const [isSubmiting, setSubmiting] = useState(false)

  const [values, setValues] = useState(initialValues)

  const [errors, setErrors] = useState({
    form: [],
    fields: mapObject((key) => [], initialValues),
  } as Errors<T>)

  const [isInvalid, setInvalid] = useState({
    form: false,
    fields: mapObject((key) => false, initialValues),
  } as IsInvalid<T>)

  const [helpers, setHelpers] = useState({
    form: [],
    fields: mapObject((key) => [], initialValues),
  } as Errors<T>)

  useEffect(() => {
    setInvalid(() => ({
      form: errors.form.length > 0,
      fields: mapObject((value) => value && value.length > 0, errors.fields),
    }))

    setHelpers(() => ({
      form: errors.form.map((key) => props.translate(key)),
      fields: mapMapTo(
        (value, _) => (value ? value.map((key) => props.translate(key)) : []),
        errors.fields
      ),
    }))
  }, [errors])

  const _handleSubmit = (event: FormEvent) => {
    console.log('Setting isSubmitting')
    setSubmiting(true)
    handleSubmit(event, values, {
      setException: (errs) => setErrors(fromServerError(errors, errs)),
      setFieldError: (fieldName: string, error: string) => {
        setErrors((errors) => ({
          ...errors,
          fields: mapMapTo((value, key) => {
            if (key === fieldName) return [error]
            else value ? value : []
          }, errors.fields),
        }))
      },
      setFormError: (...formError: string[]) => {
        setErrors((errors) => ({
          ...errors,
          form: formError,
        }))
      },
    })
    console.log('Clearing isSubmitting')
    setSubmiting(false)
  }

  const handleChange = (name: string, value: any) => {
    console.log('HandleChange', name, value)
    setValues((values) => {
      const newObj = { ...values }
      if (newObj.hasOwnProperty(name)) {
        newObj[name] = value
      }
      return newObj
    })
  }

  return {
    props,
    handleChange,
    values,
    isInvalid,
    errors,
    helpers,
    handleSubmit: _handleSubmit,
    isSubmiting,
    setValues,
  }
}
