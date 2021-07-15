import { Field, Mutation, ObjectType, Query, Resolver } from 'type-graphql'
import { IConsumption, IUOM } from '../types'

@ObjectType()
class UOM implements IUOM {
  @Field()
  id: string
  @Field()
  name: string
}

@ObjectType()
class InventoryItem implements IConsumption {
  @Field({ nullable: true })
  id: string
  @Field()
  name: string
  @Field()
  unitId: string
  @Field()
  qty: number

  @Field()
  unit?: UOM
}

const consumptions: InventoryItem[] = [
  {
    id: '1',
    name: 'milk',
    qty: 10,
    unitId: '1',
  },
  {
    id: '2',
    name: 'bread',
    qty: 3,
    unitId: '3',
  },
  {
    id: '3',
    name: 'sugar',
    qty: 5,
    unitId: '2',
  },
]
const units: UOM[] = [
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

function unitById(units: IUOM[], id: string): IUOM | undefined {
  const unit = units.find((unit) => {
    return unit.id === id
  })

  if (unit) {
    return unit
  } else return undefined
}

@Resolver()
class InventoryResolver {
  @Query(() => [UOM])
  units(): UOM[] {
    return units
  }

  @Query(() => [InventoryItem])
  inventory(): InventoryItem[] {
    const cons = consumptions

    return cons.map((c: IConsumption) => {
      const unit = unitById(units, c.unitId)

      return {
        ...c,
        ...(unit && { unit }),
      } as InventoryItem
    })
  }
}

export default InventoryResolver
