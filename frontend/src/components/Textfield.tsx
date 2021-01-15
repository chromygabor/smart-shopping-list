import * as React from "react";
import TextField from "@material-ui/core/TextField";
import { useField } from "formik";

export interface ITextfieldProps {
  fieldName: string;
}

const Textfield: React.FC<ITextfieldProps> = ({
  fieldName,
  ...others
}: ITextfieldProps) => {
  const [field, { error }] = useField(fieldName);

  return (
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="password"
      label="Password"
      type="password"
      id="password"
      autoComplete="current-password"
      {...others}
    />
  );
};

export default Textfield;
