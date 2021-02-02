import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import useTranslation from "next-translate/useTranslation";
import Copyright from "../components/Copyright";
import Link from "../components/Link";
import ProTip from "../components/ProTip";
import {
  LogoutDocument,
  MeDocument,
  useLogoutMutation,
  useMeQuery,
} from "../generated/graphql";
import { AccountCircle } from "@material-ui/icons";
import { useState } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { update } from "../utils/cacheUpdate";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    actions: {
      marginLeft: 10,
      marginRight: 10,
      underLineNone: true,
    },
    title: {
      flexGrow: 1,
    },
    signin: {
      border: "1px solid",
    },
  })
);

export default function Index() {
  const { data, loading: meLoading } = useMeQuery();

  const [logout] = useLogoutMutation({
    update: update(MeDocument, (data) => ({ me: null })),
  });

  const { t, lang } = useTranslation(); // default namespace (optional)

  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setAnchorEl(null);
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static" color="primary">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            News
          </Typography>
          {meLoading ? (
            <CircularProgress />
          ) : data && data.me ? (
            <>
              <Button
                variant="text"
                color="inherit"
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
              >
                <AccountCircle />
              </Button>
              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                // passhref
                className={classes.actions}
                color="inherit"
                underline="none"
              >
                <Button variant="text" color="inherit">
                  Sign In
                </Button>
              </Link>

              <Link
                href="/signup"
                // passhref
                className={classes.actions}
                color="inherit"
                underline="none"
              >
                <Button variant="outlined" color="inherit">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("common:greeting")}
        </Typography>
        <Link href="/about" color="secondary">
          Go to the about page
        </Link>
        <ProTip />
        <Copyright />
      </Box>
    </Container>
  );
}
