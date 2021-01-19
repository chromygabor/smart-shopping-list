import { FormEvent, useState } from "react";
import mapObject, { ValueOf, MapTo } from "../../utils/mapObject";

export interface IFormProps<T> {
  initialValues: T;
  handleSubmit: (event: FormEvent, values: T) => void;
  defaultFieldVariant?: "standard" | "filled" | "outlined";
}

export interface IForm<T> {
  defaultFieldVariant?: "standard" | "filled" | "outlined";
  handleChange: (name: string, value: ValueOf<T>) => void;
  handleSubmit: (e: FormEvent) => void;
  values: T;
  isInvalid: {
    form: boolean;
    fields: MapTo<T, boolean>;
  };
  helpers: {
    form: string[];
    fields: MapTo<T, string[]>;
  };
  errors: {
    form: string[];
    fields: MapTo<T, string[]>;
  };
}

export function useForm<T>({
  defaultFieldVariant,
  initialValues,
}: IFormProps<T>): IForm<T> {
  const [values, setValues] = useState(initialValues);

  const [isInvalid, setInvalid] = useState({
    form: false,
    fields: mapObject((key) => false, initialValues),
  });

  const [errors, setErrors] = useState({
    form: [],
    fields: mapObject((key) => [], initialValues),
  });

  const [helpers, setHelpers] = useState({
    form: [],
    fields: mapObject((key) => [], initialValues),
  });

  const _handleSubmit = (event: FormEvent) => {};

  const handleChange = (name: string, value: ValueOf<T>) => {
    setValues((values) => {
      const newObj = { ...values };
      if (newObj.hasOwnProperty(name)) {
        newObj[name] = value;
      }
      return newObj;
    });
  };

  return {
    defaultFieldVariant,
    handleChange,
    values,
    isInvalid,
    errors,
    helpers,
    handleSubmit: _handleSubmit,
  };
}
