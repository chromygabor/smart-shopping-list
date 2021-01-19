import * as React from "react";
import { TextFieldProps, TextField as MuiTextField } from "@material-ui/core";
import { IForm } from "./useForm";

export type ITextFieldProps = TextFieldProps & {
  form: IForm<any>;
  name: string;
};

const TextField: React.FC<ITextFieldProps> = ({
  form,
  name,
  variant,
  ...others
}: ITextFieldProps) => {
  const actualVariant = variant
    ? variant
    : form.defaultFieldVariant
    ? form.defaultFieldVariant
    : "standard";

  return (
    <MuiTextField
      variant={actualVariant}
      margin="normal"
      required
      fullWidth
      id="email"
      label="Email Address"
      name="email"
      autoComplete="email"
      autoFocus
      onChange={(e) => form.handleChange(name, e.target.value)}
      value={form.values[name]}
      error={form.isInvalid[name]}
      helperText={form.helpers.fields[name]}
    />
  );
};

export default TextField;
