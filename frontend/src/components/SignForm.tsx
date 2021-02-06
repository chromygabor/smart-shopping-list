import { Avatar, Grid, makeStyles, Paper, Typography } from "@material-ui/core";
import * as React from "react";
import { ReactNode } from "react";
import { IForm } from "./form/useForm";

export type ISignFormProps = {
  form: IForm<any>;
  formName: string;
  avatar: ReactNode;
};

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  loginForm: {
    justifyContent: "center",
    minHeight: "90vh",
  },
  buttonBlock: {
    width: "100%",
  },
  loginBackground: {
    justifyContent: "center",
    minHeight: "30vh",
    padding: "50px",
  },

  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
}));

const SignForm: React.FC<ISignFormProps> = ({
  form,
  children,
  avatar,
  formName,
}) => {
  const classes = useStyles();

  return (
    <>
      <Grid container spacing={0} justify="center" direction="row">
        <Grid item>
          <Grid
            container
            direction="column"
            justify="center"
            spacing={2}
            className={classes.loginForm}
          >
            <Paper
              variant="elevation"
              elevation={2}
              className={classes.loginBackground}
            >
              {avatar && (
                <Grid item>
                  <Avatar className={classes.avatar}>{avatar}</Avatar>
                </Grid>
              )}
              <Grid item>
                <Typography component="h1" variant="h5">
                  {formName}
                </Typography>
              </Grid>
              {form.isInvalid.form ? (
                <Grid item>
                  <Typography color="error">
                    {form.helpers.form.join(". ")}
                  </Typography>
                </Grid>
              ) : null}
              <form
                className={classes.form}
                noValidate
                onSubmit={form.handleSubmit}
              >
                <Grid container direction="column" spacing={2}>
                  {React.Children.map(children, (child) => (
                    <Grid item>{child}</Grid>
                  ))}
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default SignForm;
