import { InventoryApi, InventoryItemApi } from '@/api/useInventory'
import { Avatar, Grid, Paper } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { InventoryItem } from 'generated/graphql'
import useTranslation from 'next-translate/useTranslation'
import * as React from 'react'
import { useState } from 'react'
import Display from './Display'
import Edit from './Edit'

export interface IConsumptionItemProps {
  inventoryItemApi: InventoryItemApi
  inventoryApi: InventoryApi
}

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(3),
    margin: theme.spacing(2),
    display: 'flex',
    alignItems: 'flex-start',
  },
  avatar: {
    height: theme.spacing(7),
    width: theme.spacing(7),
    fontSize: theme.typography.fontSize + 20,
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
}))

const ConsumptionItem: React.FC<IConsumptionItemProps> = ({
  inventoryItemApi,
  inventoryApi,
}: IConsumptionItemProps) => {
  const classes = useStyles()
  const [editing, setEditing] = useState(false)

  const { t } = useTranslation() // default namespace (optional)

  const units = inventoryApi.units

  return (
    <>
      <Grid item xs={12} md={6}>
        <Paper elevation={3} className={classes.paper}>
          <Avatar className={classes.avatar}>A</Avatar>
          {editing ? (
            <Edit
              api={inventoryItemApi}
              onCancel={() => setEditing(false)}
              units={units}
            />
          ) : (
            <Display
              item={inventoryItemApi.item}
              onEditClicked={() => setEditing(true)}
              onRemoveClicked={inventoryItemApi.remove}
              onDoneClicked={inventoryItemApi.done}
              onDoneAllClicked={inventoryItemApi.doneAll}
              onAddClicked={inventoryItemApi.add}
            />
          )}
        </Paper>
      </Grid>
    </>
  )
}

export default ConsumptionItem
