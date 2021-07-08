import { InventoryItem, Uom } from 'generated/graphql'
import { useState } from 'react'

export type DataResult<TData, QueryResult> = {
  data: TData | undefined
  error?: Error
  loading: boolean
  queryResult?: QueryResult
}

type QueryResult = {}

export type InventoryApi = {
  items: DataResult<InventoryItem[], QueryResult>
  itemApi: (inventoryItem: InventoryItem) => InventoryItemApi
  units: Uom[]
}

export type InventoryItemApi = {
  item: InventoryItem
  update: (record: Partial<InventoryItem>) => void
  done: () => void
  doneAll: () => void
  add: () => void
  remove: () => void
}

const units: Uom[] = [
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

export const useInventory = (): InventoryApi => {
  const i: DataResult<InventoryItem[], {}> = {
    data: [
      {
        id: '1',
        name: 'milk',
        qty: 10,
        unitId: '1',
        unit: units[0],
      },
      {
        id: '2',
        name: 'bread',
        qty: 3,
        unitId: '3',
        unit: units[2],
      },
      {
        id: '3',
        name: 'sugar',
        qty: 5,
        unitId: '2',
        unit: units[1],
      },
    ],
    loading: false,
  }

  const [items, setItems] = useState(i)

  return {
    units,
    items,
    itemApi: (inventoryItem: InventoryItem) => {
      const update = (record: Partial<InventoryItem>): void => {
        setItems((items) => {
          return {
            ...items,
            data: items.data.map((item) => {
              if (item.id === inventoryItem.id) {
                return {
                  ...item,
                  ...record,
                }
              } else return item
            }),
          }
        })
      }

      const item = items.data.find((i) => i.id === inventoryItem.id)

      const done = () => {
        if (item.qty === 0) {
          throw new Error('Quantity is already 0')
        }
        setItems((items) => {
          return {
            ...items,
            data: items.data.map((item) => {
              if (item.id === inventoryItem.id) {
                return {
                  ...item,
                  qty: item.qty - 1,
                }
              } else return item
            }),
          }
        })
      }

      const doneAll = () => {
        setItems((items) => {
          return {
            ...items,
            data: items.data.map((item) => {
              if (item.id === inventoryItem.id) {
                return {
                  ...item,
                  qty: 0,
                }
              } else return item
            }),
          }
        })
      }

      const add = () => {
        setItems((items) => {
          return {
            ...items,
            data: items.data.map((item) => {
              if (item.id === inventoryItem.id) {
                return {
                  ...item,
                  qty: item.qty + 1,
                }
              } else return item
            }),
          }
        })
      }

      const remove = () => {
        setItems((items) => ({
          ...items,
          data: items.data.filter((item) => item.id !== inventoryItem.id),
        }))
      }

      return {
        item,
        update,
        add,
        done,
        doneAll,
        remove,
      }
    },
  }
}
