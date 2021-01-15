import React from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "../components/Link";
import Box from "@material-ui/core/Box";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Copyright from "../components/Copyright";
import { useRegisterMutation } from "../generated/graphql";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useField } from "formik";
import { useFormik } from "formik";

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

const fromServerError = (errors: any): Record<string, any> => {
  const i: Record<string, any> = {};
  const errs = errors[0]?.extensions;
  if (errs && errs[0]) {
    const e = errs[0] as {
      errors: string[];
      fieldErrors: Record<string, string[]>;
    };
    console.log(e);
    return e;
    //console.log("fromServerError", actualErrors);
  }
  return {};
};

export interface ISignInProps {}

const SignIn: React.FC<ISignInProps> = (props: ISignInProps) => {
  const classes = useStyles();

  const [register, r] = useRegisterMutation({ errorPolicy: "all" });
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      repassword: "",
    },
    onSubmit: async (values, { setStatus, setErrors }) => {
      //alert(JSON.stringify(values, null, 2));
      try {
        const res = await register({ variables: values });
        console.log("res", res);
        if (!res.data) {
          const mappedErrors = fromServerError(res.errors);
          setErrors(mappedErrors.fieldErrors);
          setStatus(mappedErrors.errors);
        }
      } catch (error) {
        const errors = error.graphQLErrors;
        const mappedErrors = fromServerError(errors);

        // const mappedErrors = fromServerError(errors);
        // console.log(mappedErrors);
        setErrors(mappedErrors.fieldErrors);
        setStatus(mappedErrors.errors);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form
          className={classes.form}
          noValidate
          onSubmit={formik.handleSubmit}
        >
          {formik.status ? <Typography>{formik.status}</Typography> : null}

          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={formik.handleChange}
            value={formik.values.email}
            error={formik.errors.email ? true : false}
            helperText={formik.errors.email}
          />
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
            onChange={formik.handleChange}
            value={formik.values.password}
            error={formik.errors.password ? true : false}
            helperText={formik.errors.password}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="repassword"
            label="Re-type password"
            type="password"
            id="repassword"
            autoComplete="current-password"
            onChange={formik.handleChange}
            value={formik.values.repassword}
            error={formik.errors.repassword ? true : false}
            helperText={formik.errors.repassword}
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
            Sign Up
          </Button>
        </form>
      </div>
      <Box mt={8}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default SignIn;
