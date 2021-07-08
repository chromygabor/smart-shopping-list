import * as React from "react";
import { TextFieldProps, TextField as MuiTextField } from "@material-ui/core";
import { IForm } from "./useForm";

export type ITextFieldProps = TextFieldProps & {
  form: IForm<any>;
  name: string;
  labelKey?: string;
  label?: string;
};

const TextField: React.FC<ITextFieldProps> = ({
  form,
  name,
  variant,
  labelKey,
  label,
  ...others
}: ITextFieldProps) => {
  const actualVariant = variant
    ? variant
    : form.props.defaultFieldVariant
    ? form.props.defaultFieldVariant
    : "standard";

  const actualLabel =
    label !== undefined
      ? label
      : labelKey
      ? form.props.translate(labelKey)
      : form.props.labelKeyPrefix
      ? form.props.translate(`${form.props.labelKeyPrefix}_${name}`)
      : name;

  return (
    <MuiTextField
      variant={actualVariant}
      id={name}
      label={actualLabel}
      name={name}
      onChange={(e) => form.handleChange(name, e.target.value)}
      value={form.values[name]}
      error={form.isInvalid.fields[name]}
      helperText={
        form.isInvalid.fields[name]
          ? form.helpers.fields[name].join(". ")
          : null
      }
      {...others}
    />
  );
};

export default TextField;
