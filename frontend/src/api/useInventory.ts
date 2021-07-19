import { DataStream } from 'common/DataStream'
import { makeDataStream } from 'common/react-data-result'
import { InventoryItem, Uom } from 'generated/graphql'
import { useState } from 'react'
import _ from 'underscore'

export type QueryResult = {}

export type UIInventoryItem = InventoryItem & {
  update: (record: Partial<InventoryItem>) => void
  done: () => void
  doneAll: () => void
  add: () => void
  remove: () => void
}

export type Inventory = {
  items: DataStream<UIInventoryItem[], QueryResult>
  emptyItem: UIInventoryItem
  units: DataStream<Uom[], QueryResult>
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
  const strItems = makeDataStream<UIInventoryItem[], {}>(() => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        strItems.failure(new Error('Just a test error'))
      } else {
        strItems.emit(
          mockItems.map((dataPoint) => makeUIInventoryItem(dataPoint))
        )
      }
    }, Math.random() * 3000)

    return {
      isLoading: true,
    }
  })

  const units = makeDataStream<Uom[], {}>(() => {
    setTimeout(() => {
      if (Math.random() < 0.2) {
        units.failure(new Error('Just a test error'))
      } else {
        units.emit(mockUnits)
      }
    }, Math.random() * 3000)
    return {
      isLoading: true,
    }
  })

  const makeUIInventoryItem = (
    inventoryItem: InventoryItem | undefined
  ): UIInventoryItem => {
    const strItemsState = strItems.state()

    const itemLoading = makeDataStream<{}, {}>(() => ({}))

    const strItem = makeDataStream<UIInventoryItem, {}>(() => ({
      isLoading: strItemsState.isLoading,
      data: strItemsState.data
        ? _.isError(strItemsState.data)
          ? strItemsState.data
          : strItemsState.data.find((item) => item.id === inventoryItem.id)
        : undefined,
    }))

    const update = async (
      record: Partial<InventoryItem>
    ): Promise<UIInventoryItem> => {
      return new Promise<UIInventoryItem>((resolve, reject) => {})
      // if (inventoryItem) {
      //   setTimeout(() => {}, Math.random() * 3000)
      //   // setDataResult(() =>
      //   //   dataResult.map((inventoryItems) =>
      //   //     inventoryItems.map((uiInventoryItem) => {
      //   //       if (uiInventoryItem.id === inventoryItem.id) {
      //   //         return {
      //   //           ...uiInventoryItem,
      //   //           ...record,
      //   //           unit: mockUnits.find((unit) => unit.id === record.unitId),
      //   //         }
      //   //       } else return uiInventoryItem
      //   //     })
      //   //   )
      //   // )
      // } else {
      //   //throw new Error('Test error')
      // }
    }

    const done = () => {
      // if (inventoryItem) {
      //   if (
      //     dataResult.data.some(
      //       (uiInventoryItem) =>
      //         uiInventoryItem.id === inventoryItem.id &&
      //         uiInventoryItem.qty === 0
      //     )
      //   ) {
      //     throw new Error('Quantity is already 0')
      //   }
      //   setDataResult(() =>
      //     dataResult.map((uiInventoryItems) =>
      //       uiInventoryItems.map((uiInventoryItem) => {
      //         if (uiInventoryItem.id === inventoryItem.id) {
      //           return {
      //             ...uiInventoryItem,
      //             qty: uiInventoryItem.qty - 1,
      //           }
      //         } else return uiInventoryItem
      //       })
      //     )
      //   )
      // }
    }

    const doneAll = () => {
      // if (inventoryItem) {
      //   setDataResult(() =>
      //     dataResult.map((uiInventoryItems) =>
      //       uiInventoryItems.map((uiInventoryItem) => {
      //         if (uiInventoryItem.id === inventoryItem.id) {
      //           return {
      //             ...uiInventoryItem,
      //             qty: 0,
      //           }
      //         } else return uiInventoryItem
      //       })
      //     )
      //   )
      // }
    }

    const add = () => {
      // if (inventoryItem) {
      //   setDataResult(() =>
      //     dataResult.map((uiInventoryItems) =>
      //       uiInventoryItems.map((uiInventoryItem) => {
      //         if (uiInventoryItem.id === inventoryItem.id) {
      //           return {
      //             ...uiInventoryItem,
      //             qty: uiInventoryItem.qty + 1,
      //           }
      //         } else return uiInventoryItem
      //       })
      //     )
      //   )
      // }
    }

    const remove = () => {
      // if (inventoryItem) {
      //   setDataResult(() =>
      //     dataResult.map((uiInventoryItems) =>
      //       uiInventoryItems.filter(
      //         (uiInventoryItem) => uiInventoryItem.id !== inventoryItem.id
      //       )
      //     )
      //   )
      // }
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
    emptyItem: makeUIInventoryItem(undefined),
  }
}
