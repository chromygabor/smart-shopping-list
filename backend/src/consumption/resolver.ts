import { MyContext } from 'src/types'
import { ObjectType, Resolver, Query, Field, Ctx, Root } from 'type-graphql'
import { IConsumption, IUOM } from '../types'

@ObjectType()
class UOM implements IUOM {
  @Field()
  id: string
  @Field()
  name: string
}

@ObjectType()
class Consumption implements IConsumption {
  @Field()
  id: string
  @Field()
  name: string
  @Field()
  unitId: string
  @Field()
  qty: number

  @Field(() => UOM, { nullable: true })
  unit(
    @Root() consumption: Consumption,
    @Ctx() { requestStorage }: MyContext
  ): UOM | undefined {
    return requestStorage.unitById(consumption.unitId)
  }
}

@Resolver()
class ConsumptionResolver {
  @Query(() => [Consumption])
  consumptions(@Ctx() { requestStorage, db }: MyContext): Consumption[] {
    const units = db.get('units').value()
    requestStorage.setUnits(units)

    const cons = db.get('consumptions').value()

    return cons
  }
}

export default ConsumptionResolver
