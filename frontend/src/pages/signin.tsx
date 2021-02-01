import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import useTranslation from "next-translate/useTranslation";
import { useRouter } from "next/router";
import React, { FormEvent } from "react";
import Copyright from "../components/Copyright";
import TextField from "../components/form/TextField";
import { useForm } from "../components/form/useForm";
import Link from "../components/Link";
import { useLoginMutation } from "../generated/graphql";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
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
}));

export interface ISignInProps {}

const SignIn: React.FC<ISignInProps> = (props: ISignInProps) => {
  const classes = useStyles();

  const { t } = useTranslation("common");

  const [login] = useLoginMutation();
  //   {
  //   update: (cache, { data: { login } }) => {
  //     cache.modify({
  //       fields: {
  //         me: { __ref: "IUSER:" },
  //       },
  //     });
  //   },
  // }

  const router = useRouter();

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

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate onSubmit={form.handleSubmit}>
          {form.isInvalid.form ? (
            <Typography color="error">
              {form.helpers.form.join(". ")}
            </Typography>
          ) : null}
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
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign In
          </Button>
          <Grid container>
            {/* <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid> */}
            <Grid item>
              <Link href="/signup" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default SignIn;
