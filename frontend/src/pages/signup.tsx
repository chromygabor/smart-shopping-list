import {
  Backdrop,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import Copyright from "../components/Copyright";
import TextField from "../components/form/TextField";
import { useForm } from "../components/form/useForm";
import SignForm from "../components/SignForm";
import { MeDocument, useRegisterMutation } from "../generated/graphql";
import { update } from "../utils/cacheUpdate";

const useStyles = makeStyles((theme) => ({
  buttonBlock: {
    width: "100%",
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

        <SignForm
          form={form}
          formName={"Sign up"}
          avatar={<LockOutlinedIcon />}
        >
          <TextField
            form={form}
            name="email"
            margin="normal"
            required
            fullWidth
            autoComplete="email"
            autoFocus
          />
          <TextField
            form={form}
            name="password"
            type="password"
            margin="normal"
            required
            fullWidth
            autoComplete="current-password"
          />
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.buttonBlock}
          >
            Sign Up
          </Button>
        </SignForm>
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
        <DialogTitle id="alert-dialog-title">{"Sign up success"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You are sign up was successfull. You are logged in.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Ok
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
