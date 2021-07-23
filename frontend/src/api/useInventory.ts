import chaosMonkey from 'common/chaosMonkey'
import LensStream, { useStream } from 'common/LensStream'
import niy from 'common/niy'
import { InventoryItem, Uom } from 'generated/graphql'
import { Lens } from 'monocle-ts'

export type QueryResult = {}

export type InventoryItemApi = InventoryItem & {
  useApi: () => {
    // update: (record: Partial<InventoryItem>) => void
    done: () => void
    // doneAll: () => void
    // add: () => void
    // remove: () => void
  }
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

export function useInventory(): {
  strItems: LensStream<InventoryItemApi[]>
  strUnits: LensStream<Uom[]>
} {
  const strServerItems = useStream<InventoryItem[]>({
    callback: ({ emit }) => {
      chaosMonkey(
        {
          onError: () => emit(new Error('Error occured in strItems')),
          onSuccess: () => emit(mockItems),
        },
        {
          errorRatio: 0,
        }
      )
    },
  })

  const strItems: LensStream<InventoryItemApi[]> = strServerItems.map(
    (serverItems) =>
      serverItems.map((serverItem) => {
        return {
          ...serverItem,
          useApi: () => {
            const lens = new Lens<InventoryItem[], InventoryItem>(
              (inventoryItems) =>
                inventoryItems.find((item) => item.id === serverItem.id),
              (inventoryItem) => (inventoryItems) =>
                inventoryItems.map((item) =>
                  item.id === inventoryItem.id ? inventoryItem : item
                )
            )

            const strServerItem = strServerItems.mapB(lens)

            return {
              done: () => {
                if (serverItem.qty === 0) {
                  throw new Error('Quality is already 0')
                }
                strServerItem.emit({
                  ...serverItem,
                  qty: serverItem.qty - 1,
                })
              },
            }
          },
        }
      })
  )

  const strUnits = useStream<Uom[]>({
    callback: ({ emit }) => {
      chaosMonkey(
        {
          onError: () => emit(new Error('Error occured in strUnits')),
          onSuccess: () => emit(mockUnits),
        },
        {
          errorRatio: 0,
        }
      )
    },
  })

  return {
    strItems,
    strUnits,
  }
}
