import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { AccountCircle } from "@material-ui/icons";
import MenuIcon from "@material-ui/icons/Menu";
import useTranslation from "next-translate/useTranslation";
import { useState } from "react";
import Copyright from "../components/Copyright";
import Link from "../components/Link";
import PageHeader from "../components/PageHeader";
import ProTip from "../components/ProTip";
import {
  MeDocument,
  useLogoutMutation,
  useMeQuery,
} from "../generated/graphql";
import { update } from "../utils/cacheUpdate";
import ListIcon from "@material-ui/icons/List";

export interface IPageLayoutProps {
  title: string;
  subtitle: string;
  icon: JSX.Element;
}

const useStyles = makeStyles((theme) => ({
  appBar: {
    transform: "translateZ(0)",
  },
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
}));

const PageLayout: React.FC<IPageLayoutProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  const { data: meData, loading: meLoading } = useMeQuery();

  const [logout] = useLogoutMutation({
    update: update(MeDocument, (data) => ({ me: null })),
  });

  const { t } = useTranslation(); // default namespace (optional)

  const classes = useStyles();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    setMenuAnchor(null);
  };

  return (
    <Container maxWidth="md">
      <AppBar position="static" color="primary" className={classes.appBar}>
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
          ) : meData && meData.me ? (
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
                anchorEl={menuAnchor}
                keepMounted
                open={Boolean(menuAnchor)}
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
      <PageHeader title={title} subtitle={subtitle} icon={icon} />
      <Box my={4}>
        {children}
        <Copyright />
      </Box>
    </Container>
  );
};

export default PageLayout;
