import argon2 from 'argon2'
import { ApplicationError, ValidationErrors } from '../common/ApplicationError'
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
import { COOKIE_NAME } from '../constants'
import { IUser } from '../schemas/User'
import { MyContext } from '../types'
import { Response } from '../utils'
import { UsernameAlreadyTaken } from './errors'
import { Length, MinLength, IsEmail } from 'class-validator'
import { IsTheSameAs } from './IsTheSameAs'
import {
  ApolloError,
  UserInputError,
  ValidationError,
} from 'apollo-server-express'

@InputType()
class UserInput {
  @Field({ nullable: true })
  username: string
  @Field({ nullable: true })
  password: string
}

@InputType()
class SingUpInput {
  @Field({ nullable: true })
  @IsEmail()
  email: string

  @Field({ nullable: true })
  @IsTheSameAs('repassword', { message: 'PASSWORD_MISMATCH' })
  @MinLength(5, { message: 'PASSWORD_IS_SHORT' })
  password: string

  @Field({ nullable: true })
  repassword: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse extends Response(IUser, FieldError) {}

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
    @Ctx() { db }: MyContext
  ): Promise<IUser> {
    const hashedPassword = await argon2.hash(userInput.password)

    throw new UserInputError('Bad Input foo', [
      {
        errors: ['USERNAME_ALREADY_TAKEN'],
        fieldErrors: {
          email: ['isEmail'],
          password: ['minLength'],
          repassword: ['different'],
        },
      },
    ])

    const userDraft: IUser = {
      _id: uuid(),
      email: userInput.email,
      password: hashedPassword,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    try {
      const User = db.get('users', [])
      const u = User.find({ username: userInput.email }).value()
      if (u) {
        throw new ValidationErrors([
          {
            constraints: {
              'username-already-taken': 'USERNAME_ALREADY_TAKEN',
            },
          },
        ])
      }

      db.get('users', []).push(userDraft).write()

      return userDraft
    } catch (err) {
      if (err.message.toLowerCase().includes('duplicate key')) {
        throw new ValidationErrors([
          {
            constraints: {
              'username-already-taken': 'USERNAME_ALREADY_TAKEN',
            },
          },
        ])
      } else {
        throw new ValidationErrors([
          {
            constraints: {
              unknown: 'Something went wrong',
            },
          },
        ])
      }
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('userInput') userInput: UserInput,
    @Ctx() { db, session }: MyContext
  ): Promise<UserResponse> {
    const User = db.get('users', [])
    const user = User.find({ username: userInput.username }).value()
    if (!user) {
      return UserResponse.failure({
        field: 'username',
        message: "username doesn't exists",
      })
    }
    const valid = await argon2.verify(user.password, userInput.password)
    if (!valid) {
      return UserResponse.failure({
        field: 'password',
        message: 'password is incorrectf',
      })
    }
    session.userId = user._id
    return UserResponse.success(user)
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
