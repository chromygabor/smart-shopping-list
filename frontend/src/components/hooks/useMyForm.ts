import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from 'react'
import mapObject, { ValueOf, MapTo, mapMapTo } from '../../utils/mapObject'
import { fromServerError } from '../../common/mapServerErrors'

type KeysOfUnion<T> = T extends T ? keyof T : never

// type FieldsRead<T> = {
//   setValue: Dispatch<SetStateAction<string>>
//   setValueFromEvent: (
//     e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
//   ) => void
//   value: string
//   error: string[]
//   isInvalid: boolean
// }

// type FieldsReadWrite<T> = FieldsRead<T> & {
//   setError: Dispatch<SetStateAction<string[]>>
//   setInvalid: Dispatch<SetStateAction<boolean>>
// }

type FS = {
  value: string
  error: string
}

type FSR = {
  setValue: (value: string) => void
  setValueFromEvent: (e: FormEvent) => void
  value: string
  error: string
  isInvalid: boolean
}
type FSRW = FSR & {
  setError: (error: string) => void
}

export interface IFormProps<T> {
  initialValues: T
  onSubmit: (
    event: FormEvent,
    fields: MapTo<T, FSRW>,
    callbacks: {
      setException: (errors) => void
      setFieldError: (fieldName: KeysOfUnion<T>, error: string) => void
      setFormError: (error: string) => void
    }
  ) => void
}

export interface IForm<T> {
  formFields: MapTo<T, FSR>
  formError: string
  handleSubmit: (e: FormEvent) => void
  isSubmiting: boolean
  withField: (
    name: KeysOfUnion<T>,
    f: (field: FSR) => JSX.Element
  ) => JSX.Element
}

export function useMyForm<T>(props: IFormProps<T>): IForm<T> {
  const { initialValues, onSubmit } = props

  const [isSubmiting, setSubmiting] = useState(false)

  const initialFieldsValue: { [key: string]: FS } = Object.keys(
    initialValues
  ).reduce<{}>((prev, key) => {
    return {
      ...prev,
      [key]: {
        value: initialValues[key],
        error: '',
      } as FS,
    }
  }, {})

  const [fieldsValue, setFieldsValue] = useState(initialFieldsValue)

  const fields = mapObject((initialValue, key) => {
    const setValue = (value: string) => {
      setFieldsValue((fieldObjects) => {
        return {
          ...fieldObjects,
          [key]: {
            ...fieldObjects[key],
            value,
          },
        }
      })
    }
    const setError = (error: string) => {
      setFieldsValue((fieldObjects) => {
        return {
          ...fieldObjects,
          [key]: {
            ...fieldObjects[key],
            error,
          },
        }
      })
    }

    const setValueFromEvent = (
      e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => {
      setValue(e.target.value)
    }

    const value = fieldsValue[key].value
    const error = fieldsValue[key].error
    return {
      value,
      error,
      setValue,
      setError,
      setValueFromEvent,
      isInvalid: true,
    } as FSRW
  }, initialValues)

  const [formError, setFormError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    console.log('Setting isSubmitting')
    setSubmiting(true)
    onSubmit(event, fields, {
      setException: (errs) => {
        //TODO
      },
      setFieldError: (fieldName: KeysOfUnion<T>, error: string) => {
        fields[fieldName].setError(error)
      },
      setFormError,
    })
    console.log('Clearing isSubmitting')
    setSubmiting(false)
  }

  const formFields = mapObject(
    ({ value, setValue, error, isInvalid, setValueFromEvent }) => ({
      value,
      setValue,
      error,
      isInvalid,
      setValueFromEvent,
    }),
    fields
  )

  const withField = (
    name: KeysOfUnion<T>,
    f: (field: FSR) => JSX.Element
  ): JSX.Element => {
    return f(fields[name])
  }

  return {
    formFields,
    withField,
    formError,
    handleSubmit,
    isSubmiting,
  }
}
