import { Field, ObjectType } from 'type-graphql'

@ObjectType()
export class IUser {
  @Field()
  _id: string

  @Field()
  username?: string

  @Field()
  email: string

  @Field()
  password: string

  @Field()
  createdAt: number

  @Field()
  updatedAt: number
}
