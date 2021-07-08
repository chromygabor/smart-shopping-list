import { Backdrop, CircularProgress, Link } from "@material-ui/core";
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
// import Link from "../components/Link";
import SignForm from "../components/SignForm";
import { MeDocument, useLoginMutation } from "../generated/graphql";
import { update } from "../utils/cacheUpdate";
import NextLink from "next/link"

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

  const [isProgress, setProgress] = useState(false);

  const router = useRouter();

  const { t } = useTranslation("common");

  const [login] = useLoginMutation({
    update: update(MeDocument, (data) => ({ me: data.login })),
  });

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    handleSubmit: async (
      e: FormEvent,
      values,
      { setException, setFieldError, setFormError }
    ) => {
      setProgress(true);
      e.preventDefault();

      try {
        const res = await login({ variables: values });
        if (res.data) {
          router.push("/");
        } else {
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
    },
    defaultFieldVariant: "outlined",
    translate: (key: string) => {
      return t(key);
    },
    labelKeyPrefix: "inputfield",
  });

  console.log("Form", JSON.stringify(form.isSubmiting));

  return (
    <>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <SignForm
          form={form}
          formName={"Sign in"}
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.buttonBlock}
          >
            Sign In
          </Button>
          <Link href="/signup" variant="body2" component={NextLink}>
            {"Don't have an account? Sign Up"}
          </Link>
        </SignForm>

        <Box mt={8}>
          <Copyright />
        </Box>
      </Container>
      <Backdrop className={classes.backdrop} open={isProgress}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
};

export default SignIn;
