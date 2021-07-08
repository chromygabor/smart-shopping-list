import { InventoryItemApi } from '@/api/useInventory'
import { useMyForm } from '@/components/hooks/useMyForm'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CancelIcon from '@material-ui/icons/Cancel'
import SaveIcon from '@material-ui/icons/Save'
import { Uom } from 'generated/graphql'
import useTranslation from 'next-translate/useTranslation'
import * as React from 'react'

export interface IEditProps {
  api: InventoryItemApi
  onCancel: () => void
  units: Uom[]
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

const Edit: React.FC<IEditProps> = ({
  api: { item, update },
  onCancel,
  units,
}: IEditProps) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const { handleSubmit, formFields, withField } = useMyForm({
    initialValues: item,
    onSubmit: (event, fields, callbacks) => {
      event.preventDefault()
      try {
        update({
          name: fields.name.value,
          qty: +fields.qty.value,
          unitId: fields.unitId.value,
        })
        onCancel()
      } catch (e) {}
    },
  })

  return (
    <Box className={classes.itemContainer}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {withField('name', (field) => (
              <FormControl className={classes.formControlFull}>
                <TextField
                  label="Name"
                  defaultValue={field.value}
                  onChange={(e) => field.setValueFromEvent(e)}
                  {...(field.isInvalid && {
                    error: true,
                    helperText: field.error,
                  })}
                />
              </FormControl>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            {withField('qty', (field) => (
              <FormControl className={classes.formControl}>
                <TextField
                  type="number"
                  label="Quantity"
                  defaultValue={formFields.qty.value}
                  onChange={formFields.qty.setValueFromEvent}
                  {...(field.isInvalid && {
                    error: true,
                    helperText: field.error,
                  })}
                />
              </FormControl>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            {withField('unitId', (field) => (
              <FormControl className={classes.formControlFull}>
                <InputLabel
                  shrink
                  id="demo-simple-select-placeholder-label-label"
                >
                  Unit
                </InputLabel>
                <Select
                  labelId="demo-simple-select-placeholder-label-label"
                  id="demo-simple-select-placeholder-label"
                  value={field.value}
                  displayEmpty
                  fullWidth
                >
                  {units.map((unit) => (
                    <MenuItem key={unit.id} value={unit.id}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Label + placeholder</FormHelperText>
              </FormControl>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CancelIcon />}
              fullWidth
              onClick={(e) => onCancel()}
            >
              Cancel
            </Button>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              fullWidth
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default Edit
