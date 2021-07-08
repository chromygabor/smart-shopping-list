import GrowBox from '@/components/GrowBox'
import { Box, ButtonGroup, IconButton, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import AddIcon from '@material-ui/icons/Add'
import DeleteIcon from '@material-ui/icons/Delete'
import DoneIcon from '@material-ui/icons/Done'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import EditIcon from '@material-ui/icons/Edit'
import { InventoryItem } from 'generated/graphql'
import * as React from 'react'

export interface IDisplayProps {
  item: InventoryItem
  onEditClicked: () => void
  onRemoveClicked: () => void
  onAddClicked: () => void
  onDoneClicked: () => void
  onDoneAllClicked: () => void
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

const Display: React.FC<IDisplayProps> = ({
  item,
  onEditClicked,
  onRemoveClicked,
  onAddClicked,
  onDoneClicked,
  onDoneAllClicked,
}: IDisplayProps) => {
  const classes = useStyles()

  return (
    <Box className={classes.itemContainer}>
      <Typography variant="h6">{item.name}</Typography>

      <Typography variant="subtitle1" color="secondary">
        {item.qty} {item.unit.name}
      </Typography>
      <Box className={classes.buttons}>
        <ButtonGroup
          size="small"
          color="primary"
          variant="outlined"
          aria-label="outlined primary button group"
        >
          <IconButton color="primary" onClick={onDoneClicked}>
            <DoneIcon />
          </IconButton>
          <IconButton color="primary" onClick={onDoneAllClicked}>
            <DoneAllIcon />
          </IconButton>
          <IconButton color="primary" onClick={onAddClicked}>
            <AddIcon />
          </IconButton>
        </ButtonGroup>
        <GrowBox />
        <ButtonGroup
          size="small"
          color="primary"
          variant="outlined"
          aria-label="outlined primary button group"
        >
          <IconButton color="secondary" onClick={onEditClicked}>
            <EditIcon />
          </IconButton>
          <IconButton color="secondary" onClick={onRemoveClicked}>
            <DeleteIcon />
          </IconButton>
        </ButtonGroup>
      </Box>
    </Box>
  )
}

export default Display
