import { UserInputError } from 'apollo-server-express'
import argon2 from 'argon2'
import { IsEmail, MinLength } from 'class-validator'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql'
import { v4 as uuid } from 'uuid'
import { ValidationErrors } from '../common/ApplicationError'
import { COOKIE_NAME } from '../constants'
import { IUser } from '../schemas/User'
import { MyContext } from '../types'
import { Response } from '../utils'
import { IsTheSameAs } from './IsTheSameAs'
import Errors from './errors'
import errors from './errors'

@InputType()
class UserInput {
  @Field({ nullable: true })
  email: string
  @Field({ nullable: true })
  password: string
}

@InputType()
class SingUpInput {
  @Field({ nullable: true })
  @IsEmail()
  email: string

  @Field({ nullable: true })
  @MinLength(5)
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@Resolver()
export class UserResolver {
  @Query(() => IUser, { nullable: true })
  me(@Ctx() { db, session }: MyContext): IUser {
    const id = session?.userId
    if (!id) {
      return null
    }

    const user = db.get('users', []).find({ _id: id }).value() as IUser

    return user
  }

  @Query(() => [IUser])
  users(@Ctx() { db }: MyContext): Promise<IUser[]> {
    return new Promise<IUser[]>((resolve, reject) => {
      try {
        const res = db.get('users', []).value()
        resolve(res)
      } catch (error) {
        reject(error)
      }
    })
  }

  @Mutation(() => IUser)
  async register(
    @Arg('userInput') userInput: SingUpInput,
    @Ctx() { db, session }: MyContext
  ): Promise<IUser> {
    const p = new Promise<any>((r) => {
      setTimeout(() => {
        r(true)
      }, 1000)
    })

    await p

    const hashedPassword = await argon2.hash(userInput.password)

    const userDraft: IUser = {
      _id: uuid(),
      email: userInput.email,
      password: hashedPassword,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const User = db.get('users', [])
    const u = User.find({ email: userInput.email }).value()
    if (u) {
      throw Errors.InputError(
        'USERNAME_ALREADY_TAKEN',
        'User name is already taken'
      )
    }

    db.get('users', []).push(userDraft).write()

    session.userId = userDraft._id

    return userDraft
  }

  @Mutation(() => IUser)
  async login(
    @Arg('userInput') userInput: UserInput,
    @Ctx() { db, session }: MyContext
  ): Promise<IUser> {
    const p = new Promise<any>((r) => {
      setTimeout(() => {
        r(true)
      }, 1000)
    })

    await p

    const User = db.get('users', [])
    const user = User.find({ email: userInput.email }).value()
    if (!user) {
      throw errors.ApplicationError('BAD_CREDENTIALS', 'Bad credentials')
    }
    const valid = await argon2.verify(user.password, userInput.password)
    if (!valid) {
      throw errors.ApplicationError('BAD_CREDENTIALS', 'Bad credentials')
    }
    session.userId = user._id
    return user
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() { req, res }: MyContext): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME)
        if (err) resolve(false)
        else resolve(true)
      })
    })
  }
}
