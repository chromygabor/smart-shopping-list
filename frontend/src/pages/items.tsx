import { useInventory } from '@/api/useInventory'
import ConsumptionItem from '@/components/consumption/item'
import Layout from '@/components/Layout'
import {
  Box,
  Card,
  CircularProgress,
  Grid,
  Typography,
} from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import ListIcon from '@material-ui/icons/List'
import { Alert, AlertTitle } from '@material-ui/lab'
import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React from 'react'

const useStyles = makeStyles((theme) => ({
  list: {},
  form: {
    width: '100%',
    marginBottom: theme.spacing(3),
  },
  bckg: {
    backgroundColor: '#ff0000',
  },
  paper: {
    padding: theme.spacing(3),
    margin: theme.spacing(2),
  },
  fab: {},
  root: {},
  pageHeader: {
    //padding: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageIcon: {
    display: 'inline-block',
    padding: theme.spacing(2),
    borderRadius: '12px',
  },
  pageTitle: {
    paddingLeft: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '& .MuiTypography-subtitle2': {
      opacity: '0.5',
    },
  },
  item: {
    paddingTop: theme.spacing(2),
  },

  futureContainer: {
    display: 'flex',
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(10),
    justifyContent: 'space-around',

    '& .MuiAlert-root': {
      width: '80%',
    },
  },
}))

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  return {
    props: {},
  }
}

export default function Index() {
  const classes = useStyles()

  const { t } = useTranslation() // default namespace (optional)

  const inventory = useInventory()

  console.log(inventory.units)

  return (
    <Layout
      title="Smart shopping list"
      subtitle="Page description"
      icon={<ListIcon fontSize="large" />}
    >
      <Box className={classes.pageHeader}>
        <div className={classes.pageHeader}>
          <Card className={classes.pageIcon}>
            <ListIcon fontSize="large" />
          </Card>
          <div className={classes.pageTitle}>
            <Typography variant="h6" component="div">
              Consumption
            </Typography>
            {/* <Typography variant="subtitle2" component="div">
              subtitle
            </Typography> */}
          </div>
        </div>
        <Fab color="secondary" aria-label="add" className={classes.fab}>
          <AddIcon />
        </Fab>
      </Box>

      <Box className={classes.futureContainer}>
        {inventory.items.loading ? (
          <CircularProgress />
        ) : inventory.items.error ? (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {inventory.items.error.message}
          </Alert>
        ) : (
          <Grid container>
            {inventory.items.data.map((item) => (
              <ConsumptionItem
                key={item.id}
                inventoryItemApi={inventory.itemApi(item)}
                inventoryApi={inventory}
              />
            ))}
          </Grid>
        )}
      </Box>
    </Layout>
  )
}
