import { makeDataResult, DataResult } from 'common/DataResult'
import { InventoryItem, Uom } from 'generated/graphql'
import { useState } from 'react'

export type QueryResult = {}

export type UIInventoryItem = InventoryItem & {
  update: (record: Partial<InventoryItem>) => void
  done: () => void
  doneAll: () => void
  add: () => void
  remove: () => void
}

export type Inventory = {
  items: DataResult<UIInventoryItem[], QueryResult>
  emptyItem: UIInventoryItem
  units: DataResult<Uom[], QueryResult>
}

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

export const useInventory = (): Inventory => {
  const [dataResult, setDataResult] = useState<
    DataResult<UIInventoryItem[], {}>
  >(() => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        setDataResult((items) => {
          return items.failure(new Error('Just a test error'))
        })
      } else {
        setDataResult((items) => {
          return items.completed(mockItems.map((dataPoint) => make(dataPoint)))
        })
      }
    }, Math.random() * 3000)

    return makeDataResult()
  })

  const [units, setUnits] = useState<DataResult<Uom[], {}>>(() => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        setUnits((units) => {
          return units.failure(new Error('Just a test error'))
        })
      } else {
        setUnits((units) => {
          return units.completed(mockUnits)
        })
      }
    }, Math.random() * 3000)

    return makeDataResult()
  })

  const make = (inventoryItem: InventoryItem | undefined): UIInventoryItem => {
    const update = (record: Partial<InventoryItem>): void => {
      if (inventoryItem) {
        setDataResult(() =>
          dataResult.map((inventoryItems) =>
            inventoryItems.map((uiInventoryItem) => {
              if (uiInventoryItem.id === inventoryItem.id) {
                return {
                  ...uiInventoryItem,
                  ...record,
                  unit: mockUnits.find((unit) => unit.id === record.unitId),
                }
              } else return uiInventoryItem
            })
          )
        )
      } else {
        //throw new Error('Test error')
      }
    }

    const done = () => {
      if (inventoryItem) {
        if (
          dataResult.data.some(
            (uiInventoryItem) =>
              uiInventoryItem.id === inventoryItem.id &&
              uiInventoryItem.qty === 0
          )
        ) {
          throw new Error('Quantity is already 0')
        }
        setDataResult(() =>
          dataResult.map((uiInventoryItems) =>
            uiInventoryItems.map((uiInventoryItem) => {
              if (uiInventoryItem.id === inventoryItem.id) {
                return {
                  ...uiInventoryItem,
                  qty: uiInventoryItem.qty - 1,
                }
              } else return uiInventoryItem
            })
          )
        )
      }
    }

    const doneAll = () => {
      if (inventoryItem) {
        setDataResult(() =>
          dataResult.map((uiInventoryItems) =>
            uiInventoryItems.map((uiInventoryItem) => {
              if (uiInventoryItem.id === inventoryItem.id) {
                return {
                  ...uiInventoryItem,
                  qty: 0,
                }
              } else return uiInventoryItem
            })
          )
        )
      }
    }

    const add = () => {
      if (inventoryItem) {
        setDataResult(() =>
          dataResult.map((uiInventoryItems) =>
            uiInventoryItems.map((uiInventoryItem) => {
              if (uiInventoryItem.id === inventoryItem.id) {
                return {
                  ...uiInventoryItem,
                  qty: uiInventoryItem.qty + 1,
                }
              } else return uiInventoryItem
            })
          )
        )
      }
    }

    const remove = () => {
      if (inventoryItem) {
        setDataResult(() =>
          dataResult.map((uiInventoryItems) =>
            uiInventoryItems.filter(
              (uiInventoryItem) => uiInventoryItem.id !== inventoryItem.id
            )
          )
        )
      }
    }

    return {
      ...(inventoryItem ? inventoryItem : emptyItem),
      update,
      add,
      done,
      doneAll,
      remove,
    }
  }

  return {
    units,
    items: dataResult,
    emptyItem: make(undefined),
  }
}
