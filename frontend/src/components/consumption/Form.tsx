import { LazyQueryResult, QueryResult } from "@apollo/client";
import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  TableCell,
  TableRow,
} from "@material-ui/core";
import CancelOutlinedIcon from "@material-ui/icons/CancelOutlined";
import CheckCircleOutlineRoundedIcon from "@material-ui/icons/CheckCircleOutlineOutlined";
import React from "react";
import {
  UnitsQuery,
  useUnitsLazyQuery,
  useUnitsQuery,
} from "../../generated/graphql";
import TextField from "../form/TextField";
import { IForm } from "../form/useForm";
import { Data } from "./List";

export interface IFormProps {
  form: IForm<Data>;
  handleCancel: () => void;
  handleAccept: () => void;
  units: QueryResult<UnitsQuery>;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(0),
  },
  container: {
    justifyContent: "space-between",
  },
  formControl: {
    margin: theme.spacing(0),
    // minWidth: 120,
  },
  input: {
    margin: theme.spacing(0),
  },
}));

const Form: React.FC<IFormProps> = ({
  form,
  handleAccept,
  handleCancel,
  units,
}: IFormProps) => {
  const classes = useStyles();

  if (units.loading) {
    return (
      <TableRow>
        <TableCell key="row" colSpan={3}>
          Loading...
        </TableCell>
      </TableRow>
    );
  } else if (units.error) {
    return (
      <TableRow>
        <TableCell key="row" colSpan={3}>
          Error
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell key="name" style={{ minWidth: 170 }}>
        <FormControl className={classes.formControl}>
          <TextField
            label=""
            form={form}
            name="name"
            margin="normal"
            required
            variant="outlined"
            className={classes.formControl}
            size="small"
          />
        </FormControl>
      </TableCell>
      <TableCell key="unit" style={{ minWidth: 170 }}>
        <FormControl className={classes.formControl}>
          <InputLabel id="demo-simple-select-label">unit</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            name="unitId"
            value={form.values.unitId ? form.values.unitId : ""}
            onChange={(e) => {
              form.handleChange("unitId", e.target.value);
            }}
            fullWidth
            defaultValue={""}
          >
            {units.data.units.map((unit) => (
              <MenuItem key={unit.id} value={unit.id}>
                {unit.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell key="qty" style={{ minWidth: 170 }}>
        <FormControl className={classes.formControl}>
          <TextField
            form={form}
            name="qty"
            margin="normal"
            required
            size="small"
          />
        </FormControl>
      </TableCell>
      <TableCell key="action" align="right" className="action">
        <IconButton
          color="secondary"
          aria-label="add to shopping cart"
          onClick={handleCancel}
        >
          <CancelOutlinedIcon />
        </IconButton>

        <IconButton
          color="primary"
          aria-label="add to shopping cart"
          onClick={handleAccept}
        >
          <CheckCircleOutlineRoundedIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default Form;
