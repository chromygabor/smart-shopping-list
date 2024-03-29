import chaosMonkey from 'common/chaosMonkey'
import niy from 'common/niy'
import { Property } from 'common/Property'
import { InventoryItem, Uom } from 'generated/graphql'
import { useEffect } from 'react'

export type QueryResult = {}

export type InventoryItemApi = InventoryItem & {
  // update: (record: Partial<InventoryItem>) => void
  done: () => void
  // doneAll: () => void
  // add: () => void
  // remove: () => void
}

export type Inventory = {}

const mockUnits: Uom[] = [
  {
    id: '1',
    name: 'liter',
  },
  {
    id: '2',
    name: 'piece',
  },
  {
    id: '3',
    name: 'gramm',
  },
]

const mockItems = [
  {
    id: '1',
    name: 'milk',
    qty: 10,
    unitId: '1',
    unit: mockUnits[0],
  },
  {
    id: '2',
    name: 'bread',
    qty: 3,
    unitId: '3',
    unit: mockUnits[2],
  },
  {
    id: '3',
    name: 'sugar',
    qty: 5,
    unitId: '2',
    unit: mockUnits[1],
  },
]

const emptyItem = {
  id: '',
  name: '',
  qty: 0,
  unitId: '',
  unit: {
    id: '',
    name: '',
  },
}

export function useInventory() {
  const [items, itemsFn] = Property.of<InventoryItem[]>().useProperty()

  const [units, unitsFn] = Property.of<Uom[]>().useProperty()

  useEffect(() => {
    chaosMonkey({
      onError: () => {
        console.log('Error in items')
        itemsFn.setFailure(new Error('Error from items'))
      },
      onSuccess: () => {
        console.log('Success in items')
        itemsFn.setValue(mockItems)
      },
    })
    chaosMonkey({
      onError: () => {
        console.log('Error in uoms')
        unitsFn.setFailure(new Error('Error from uoms'))
      },
      onSuccess: () => {
        console.log('Success in uoms')
        unitsFn.setValue(mockUnits)
      },
    })
  }, [])

  const inventoryItems = items.map((items) => {
    console.log('----Mapping is running')
    return items.map<InventoryItemApi>((item) => ({
      ...item,
      done: () => {
        if (item.qty === 0) {
          throw new Error('Qty is already 0')
        }
        const newItem = {
          ...item,
          qty: item.qty - 1,
        }
        itemsFn.setValue(
          items.map((inventoryItem) =>
            inventoryItem.id === item.id ? newItem : inventoryItem
          )
        )
      },
    }))
  })

  const emptyApi: InventoryItemApi = {
    ...emptyItem,
    done: () => {
      throw new Error('Item is not saved yet')
    },
  }

  return { items: inventoryItems, units, emptyItem: emptyApi }
}
