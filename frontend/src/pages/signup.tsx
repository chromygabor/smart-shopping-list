import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import useTranslation from "next-translate/useTranslation";
import React, { FormEvent, useState } from "react";
import Copyright from "../components/Copyright";
import TextField from "../components/form/TextField";
import { useForm } from "../components/form/useForm";
import { useRegisterMutation } from "../generated/graphql";

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
  const { t } = useTranslation("common");

  const [register, r] = useRegisterMutation({ errorPolicy: "all" });

  const form = useForm<{
    email: string;
    password: string;
    repassword: string;
  }>({
    initialValues: {
      email: "",
      password: "",
      repassword: "",
    },
    handleSubmit: async (e: FormEvent) => {
      e.preventDefault();
      console.log("HandleSubmit");

      // try {
      //   const res = await register({ variables: values });
      //   console.log("res", res);
      //   if (!res.data) {
      //     const mappedErrors = fromServerError(res.errors);
      //     setErrors(mappedErrors);
      //   }
      // } catch (error) {
      //   const errors = error.graphQLErrors;
      //   const mappedErrors = fromServerError(errors);

      //   // const mappedErrors = fromServerError(errors);
      //   // console.log(mappedErrors);
      //   setErrors(mappedErrors.fieldErrors);
      // }
    },
    defaultFieldVariant: "outlined",
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
        <form className={classes.form} noValidate onSubmit={form.handleSubmit}>
          {/* {errors.errors ? <Typography>{errors.errors}</Typography> : null} */}

          <TextField
            form={form}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          {/* <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            onChange={handleChange}
            value={values.password}
            error={errors.fieldErrors.password.length ? true : false}
            helperText={t(errors.fieldErrors.password)}
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
            onChange={handleChange}
            value={values.repassword}
            error={errors.fieldErrors.repassword ? true : false}
            helperText={t(errors.fieldErrors.repassword)}
          /> */}

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
