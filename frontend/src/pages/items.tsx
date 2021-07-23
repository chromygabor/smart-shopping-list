import { InventoryItemApi, useInventory } from '@/api/useInventory'
import Display from '@/components/consumption/item/Display'
import Edit from '@/components/consumption/item/Edit'
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
import LensStream from 'common/LensStream'
import { InventoryItem, Uom } from 'generated/graphql'
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

type UIInventoryItem = InventoryItemApi & {
  editing: boolean
}

export interface IItemProps {
  item: InventoryItem
  strItems: LensStream<InventoryItemApi[]>
  strUnits: LensStream<Uom[]>
}

const Item: React.FC<IItemProps> = ({
  item,
  strUnits,
  strItems,
}: IItemProps) => {
  const classes = useStyles()

  const strItem = strItems
    .map((items) => items.find((_item) => item.id === _item.id))
    .fold<UIInventoryItem>((prev, item) => {
      const uiInventoryItem: UIInventoryItem = {
        editing: false,
        ...(prev ? prev : item),
      }

      return uiInventoryItem
    })

  console.log('Item', item.id, JSON.parse(JSON.stringify(strItem.data)))

  const handleEdit = (editing: boolean) => {
    strItem.emit({
      ...strItem.data,
      editing,
    })
  }

  //api-ban nincs benne az editing mert az az UIInventoryItemben van
  const api = strItem.data?.useApi()

  return (
    <Grid item xs={12} md={6}>
      <Paper elevation={3} className={classes.paper}>
        {(strItem.isLoading || strUnits.isLoading) && <CircularProgress />}
        {(strItem.failure || strUnits.failure) && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {strItems.failure
              ? strItems.failure.message
              : strUnits.failure.message}
          </Alert>
        )}
        {api && (
          <>
            <Avatar className={classes.avatar}>A</Avatar>
            {api.editing ? (
              <Edit
                item={item}
                onSave={(record) => {}}
                onCancel={() => handleEdit(false)}
                units={strUnits.data}
              />
            ) : (
              <Display
                item={item}
                onEditClicked={() => handleEdit(true)}
                onRemoveClicked={() => {}}
                onDoneClicked={() => {}}
                onDoneAllClicked={() => {}}
                onAddClicked={() => {}}
              />
            )}
          </>
        )}
      </Paper>
    </Grid>
  )
}

export default function Index() {
  const classes = useStyles()

  const { t } = useTranslation() // default namespace (optional)

  const inventory = useInventory()

  const strItems = inventory.strItems
  const strUnits = inventory.strUnits

  console.log(
    'Index render',
    JSON.parse(JSON.stringify(strItems)),
    JSON.parse(JSON.stringify(strUnits))
  )

  const strItemsAndUnits = strItems.and(strUnits)

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
          onClick={() => {}}
        >
          <AddIcon />
        </Fab>
      </Box>

      <Box className={classes.futureContainer}>
        {strItemsAndUnits.isLoading && <CircularProgress />}
        {strItemsAndUnits.failure && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            {strItemsAndUnits.failure.message}
          </Alert>
        )}
        {strItems.and(strUnits).data && (
          <Grid container>
            {/* {edits.includes(emptyItem.id) && (
              <Grid item xs={12} md={6}>
                <Paper elevation={3} className={classes.paper}>
                  <Avatar className={classes.avatar}>A</Avatar>
                  <Edit
                    item={emptyItem}
                    onSave={emptyItem.update}
                    onCancel={() => handleEdit(emptyItem, false)}
                    units={units}
                  />
                </Paper>
              </Grid>
            )} */}
            {strItems.data.map((item) => (
              <Item
                key={item.id}
                item={item}
                strUnits={strUnits}
                strItems={strItems}
              />
            ))}
            <p>Items</p>
          </Grid>
        )}
      </Box>
    </Layout>
  )
}
