import { LazyQueryResult } from "@apollo/client";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import _ from "lodash";
import useTranslation from "next-translate/useTranslation";
import * as React from "react";
import { FormEvent, ReactNode, useState } from "react";
import {
  UnitsQuery,
  useConsumptionsQuery,
  useUnitsQuery,
} from "../../generated/graphql";
import { IForm, useForm } from "../form/useForm";
import Form from "./Form";

export interface IMyTableProps {}

interface Column {
  id: "name" | "unit" | "qty";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
  component?: (value: string) => ReactNode;
  accessKey?: string;
}

const columns: Column[] = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "unit", label: "Unit", minWidth: 100, accessKey: "unit.name" },
  { id: "qty", label: "Qty", minWidth: 100 },
];

export interface Data {
  id: string;
  name: string;
  unitId: string;
  unit: {
    id: string;
    name: string;
  };
  qty: number;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },

  table: {
    width: "100%",
  },
  header: {},
  row: {
    width: "100%",
    "&.MuiGrid-container": {
      display: "flex",
    },
  },
  cell: {},
  editor: {
    //marginBottom: theme.spacing(1),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export interface IRowProps {
  row: Data;
  columns: Column[];
  editingId: string | undefined;
  setEditingId: (id: string) => void;
  translate: (key: string) => string;
  form: IForm<Data>;
  unitsLazy: () => LazyQueryResult<UnitsQuery, any>;
  handleCancel: () => void;
  handleAccept: () => void;
}

const List: React.FC<IMyTableProps> = (props: IMyTableProps) => {
  const classes = useStyles();
  const consumptions = useConsumptionsQuery();

  const units = useUnitsQuery();

  const rows: Data[] = consumptions.data ? consumptions.data.consumptions : [];

  const { t } = useTranslation("common");

  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  const form = useForm({
    initialValues: {
      id: undefined,
      name: undefined,
      qty: undefined,
      unit: undefined,
    } as Data,
    handleSubmit: async (
      e: FormEvent,
      values,
      { setException, setFieldError, setFormError }
    ) => {
      e.preventDefault();
      console.log("Submit", values);
    },
    translate: (key) => key,
  });

  const clearForm = () => {
    form.setValues({
      id: undefined,
      name: undefined,
      qty: undefined,
      unitId: undefined,
      unit: undefined,
    });
  };

  const handleAdd = (e) => {
    setEditingId("");
    clearForm();
  };

  const handleCancel = () => {
    setEditingId(undefined);
    clearForm();
  };

  const handleAccept = () => {
    console.log("Accepted");
  };

  const handleClickRow = (row: Data) => {
    form.setValues(row);
    setEditingId(row.id);
  };

  return (
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <form noValidate onSubmit={form.handleSubmit}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => {
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{ minWidth: column.minWidth }}
                    >
                      {column.label}
                    </TableCell>
                  );
                })}
                <TableCell key="action" align="right" className="action">
                  {editingId !== "" && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddCircleIcon />}
                      onClick={handleAdd}
                    >
                      Add
                    </Button>
                  )}
                </TableCell>
              </TableRow>
              {editingId === "" && (
                <Form
                  form={form}
                  handleAccept={handleAccept}
                  handleCancel={handleCancel}
                  units={units}
                />
              )}
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                if (editingId === row.id) {
                  return (
                    <Form
                      units={units}
                      form={form}
                      handleAccept={handleAccept}
                      handleCancel={handleCancel}
                      key={row.id}
                    />
                  );
                } else {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                      {columns.map((column) => {
                        const accessKey = column.accessKey
                          ? column.accessKey
                          : column.id;

                        const value = _.get(row, accessKey);

                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                            onClick={() => handleClickRow(row)}
                          >
                            {value
                              ? value
                              : `MISSING_PROP_${column}.${accessKey}`}
                          </TableCell>
                        );
                      })}
                      <TableCell
                        key="action"
                        align="right"
                        className="action"
                        onClick={() => handleClickRow(row)}
                      ></TableCell>
                    </TableRow>
                  );
                }
              })}
            </TableBody>
          </Table>
        </form>
      </TableContainer>
    </Paper>
  );
};

export default List;
