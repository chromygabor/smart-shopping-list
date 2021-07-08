import * as React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Container from '@material-ui/core/Container'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { AccountCircle } from '@material-ui/icons'
import MenuIcon from '@material-ui/icons/Menu'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import Copyright from './Copyright'
import PageHeader from './PageHeader'
import { MeDocument, useLogoutMutation, useMeQuery } from '../generated/graphql'
import { update } from '../utils/cacheUpdate'
import ListIcon from '@material-ui/icons/List'
import Link from 'next/link'

export interface ILayoutProps {
  title: string
  subtitle: string
  icon: JSX.Element
}

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 0,
    [theme.breakpoints.down('xs')]: {
      fontSize: 12,
    },
  },
  appBar: {
    transform: 'translateZ(0)',
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
    border: '1px solid',
  },
  content: {
    padding: theme.spacing(3),
  },
}))

const Layout: React.FC<ILayoutProps> = ({
  title,
  subtitle,
  icon,
  children,
}) => {
  const { data: meData, loading: meLoading } = useMeQuery()

  const [logout] = useLogoutMutation({
    update: update(MeDocument, (data) => ({ me: null })),
  })

  const { t } = useTranslation() // default namespace (optional)

  const classes = useStyles()

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleClose = () => {
    setMenuAnchor(null)
  }

  const handleLogout = () => {
    logout()
    setMenuAnchor(null)
  }

  return (
    <Container maxWidth="md" className={classes.container}>
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
            {title}
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
              <Link href="/signin" passHref>
                <Button
                  variant="text"
                  color="inherit"
                  className={classes.actions}
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" passHref>
                <Button
                  variant="outlined"
                  color="inherit"
                  className={classes.actions}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box className={classes.content}>
        {children}
        <Copyright />
      </Box>
    </Container>
  )
}

export default Layout
