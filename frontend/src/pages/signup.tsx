import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
} from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import Copyright from "../components/Copyright";
import TextField from "../components/form/TextField";
import { useForm } from "../components/form/useForm";
import { MeDocument, useRegisterMutation } from "../generated/graphql";
import { update } from "../utils/cacheUpdate";

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
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
}));

export interface ISignInProps {}

const SignIn: React.FC<ISignInProps> = (props: ISignInProps) => {
  const classes = useStyles();

  const { t } = useTranslation("common");

  const [isProgress, setProgress] = useState(false);

  const [register] = useRegisterMutation({
    update: update(MeDocument, (data) => {
      if (data.register) {
        return { me: data.register };
      } else {
        return {};
      }
    }),
  });
  const [dialogOpened, setDialogOpened] = useState(false);

  const router = useRouter();

  const handleClose = (_params) => {
    setDialogOpened(false);
    router.push("/");
  };

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      repassword: "",
    },
    handleSubmit: async (
      e: FormEvent,
      values,
      { setException, setFieldError, setFormError }
    ) => {
      setProgress(true);
      e.preventDefault();

      if (values.password !== values.repassword) {
        setFieldError("repassword", "isTheSameAs");
      } else {
        try {
          const res = await register({ variables: values });
          if (res.data) {
            setDialogOpened(true);
          } else {
            setProgress(false);
            if (res.errors) {
              setException(res.errors);
            } else {
              throw new Error("Unknown error");
            }
          }
        } catch (error) {
          setProgress(false);
          if (error.graphQLErrors.length > 0) {
            setException(error.graphQLErrors);
          } else {
            setFormError("UNKNOWN");
            console.error(error);
          }
        }
      }
    },
    defaultFieldVariant: "outlined",
    translate: (key: string) => {
      return t(key);
    },
    labelKeyPrefix: "inputfield",
  });

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />

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
                <Grid item>
                  <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                  </Avatar>
                </Grid>
                <Grid item>
                  <Typography component="h1" variant="h5">
                    Sign up
                  </Typography>
                </Grid>
                {form.isInvalid.form ? (
                  <Grid item>
                    <Typography color="error">
                      {form.helpers.form.join(". ")}
                    </Typography>
                  </Grid>
                ) : null}
                <Grid item>
                  <form
                    className={classes.form}
                    noValidate
                    onSubmit={form.handleSubmit}
                  >
                    <Grid container direction="column" spacing={2}>
                      <Grid item>
                        <TextField
                          form={form}
                          name="email"
                          margin="normal"
                          required
                          fullWidth
                          autoComplete="email"
                          autoFocus
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          form={form}
                          name="password"
                          type="password"
                          margin="normal"
                          required
                          fullWidth
                          autoComplete="current-password"
                        />
                      </Grid>
                      <Grid item>
                        <TextField
                          form={form}
                          name="repassword"
                          type="password"
                          variant="outlined"
                          margin="normal"
                          required
                          fullWidth
                          autoComplete="current-password"
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          color="primary"
                          className={classes.buttonBlock}
                        >
                          Sign Up
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
      <Dialog
        open={dialogOpened}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending
            anonymous location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Disagree
          </Button>
          <Button onClick={handleClose} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop className={classes.backdrop} open={isProgress}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default SignIn;
