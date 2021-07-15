import { QueryResult, UIInventoryItem, useInventory } from '@/api/useInventory'
import Display from '@/components/consumption/item/Display'
import Edit from '@/components/consumption/item/Edit'
import {
  createMonadState,
  useMonadState,
} from '@/components/hooks/useMonatState'
import Layout from '@/components/Layout'
import {
  Avatar,
  Box,
  Card,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@material-ui/core'
import Fab from '@material-ui/core/Fab'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import ListIcon from '@material-ui/icons/List'
import { Alert, AlertTitle } from '@material-ui/lab'
import { InventoryItem } from 'generated/graphql'
import { GetServerSideProps } from 'next'
import useTranslation from 'next-translate/useTranslation'
import React, { useState } from 'react'

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
    display: 'flex',
    alignItems: 'flex-start',
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

  itemContainer: {
    paddingLeft: theme.spacing(2),
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  buttons: {
    display: 'flex',
    width: '100%',
    marginTop: theme.spacing(2),
  },
  formControlFull: {
    minWidth: '100%',
  },
  formControl: {
    minWidth: '50%',
    width: '50%',
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
  avatar: {
    height: theme.spacing(7),
    width: theme.spacing(7),
    fontSize: theme.typography.fontSize + 20,
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

  const [edits, setEdits] = useState<string[]>([])

  const inventory = useInventory()

  const emptyItem = inventory.emptyItem

  const items = inventory.items

  const units = inventory.units

  const handleEdit = (item: UIInventoryItem, isEdit: boolean) => {
    if (isEdit) {
      setEdits((edits) => [...edits, item.id])
    } else {
      setEdits((edits) => edits.filter((id) => id !== item.id))
    }
  }

  const handleSave = (
    item: UIInventoryItem,
    record: Partial<InventoryItem>
  ): void => {
    try {
      item.update(record)
      handleEdit(item, false)
    } catch (e) {
      throw e
    }
  }

  console.log(
    items.fold({
      onSuccess: 'success',
      onFailure: 'failure',
      onProgress: 'progress',
    })
  )

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
        <Fab
          color="secondary"
          aria-label="add"
          className={classes.fab}
          onClick={() => handleEdit(emptyItem, true)}
        >
          <AddIcon />
        </Fab>
      </Box>

      <Box className={classes.futureContainer}>
        {items.loading ? (
          <CircularProgress />
        ) : items.error ? (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {inventory.items.error.message}
          </Alert>
        ) : (
          <Grid container>
            {edits.includes(emptyItem.id) && (
              <Grid item xs={12} md={6}>
                <Paper elevation={3} className={classes.paper}>
                  <Avatar className={classes.avatar}>A</Avatar>
                  <Edit
                    item={emptyItem}
                    onSave={emptyItem.update}
                    onCancel={() => handleEdit(emptyItem, false)}
                    units={units.data}
                  />
                </Paper>
              </Grid>
            )}
            {/* {items.data.map((item) => (
              <Grid item xs={12} md={6}>
                <Paper elevation={3} className={classes.paper}>
                  <Avatar className={classes.avatar}>A</Avatar>
                  {edits.includes(item.id) ? (
                    <Edit
                      item={item}
                      onSave={(record) => handleSave(item, record)}
                      onCancel={() => handleEdit(item, false)}
                      units={units.data}
                    />
                  ) : (
                    <Display
                      item={item}
                      onEditClicked={() => handleEdit(item, true)}
                      onRemoveClicked={item.remove}
                      onDoneClicked={item.done}
                      onDoneAllClicked={item.doneAll}
                      onAddClicked={item.add}
                    />
                  )}
                </Paper>
              </Grid>
            ))} */}
          </Grid>
        )}
      </Box>
    </Layout>
  )
}
