import { ApolloServer, UserInputError } from 'apollo-server-express'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import low from 'lowdb'
import f from 'lowdb-session-store'
import FileSync from 'lowdb/adapters/FileSync'
import 'reflect-metadata'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './auth/user'
import { COOKIE_NAME, __prod__ } from './constants'
import ConsumptionResolver from './consumption/resolver'
import { requestScopeMiddlewareFn } from './RequestScopeMiddleware'
import { HelloResolver } from './resolvers/hello'
import { Database, MyContext, MySession, RequestStorage } from './types'

const sessionTTL = 14 * 24 * 60 * 60

const LowdbStore = f(session)

const adapter = new FileSync<Database>('data/db.json')
const db = low(adapter)

db.defaults({
  users: [],
  sessions: [],
  consumptions: [
    { id: '1', name: 'milk', qty: 10, unitId: '1' },
    { id: '2', name: 'bread', qty: 3, unitId: '3' },
    { id: '3', name: 'sugar', qty: 5, unitId: '2' },
  ],
  units: [
    { id: '1', name: 'liter' },
    { id: '2', name: 'piece' },
    { id: '3', name: 'gramm' },
  ],
}).write()

db.truncate()

const main = async () => {
  const app = express()

  app.use(requestScopeMiddlewareFn(new RequestStorage()))

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    })
  )
  app.use(
    session({
      name: COOKIE_NAME,
      cookie: {
        maxAge: sessionTTL,
        httpOnly: true,
        secure: __prod__,
      },
      secret: 'ysdfysd fasdfasdf aasdfasdf',
      resave: false,
      saveUninitialized: false,
      store: new LowdbStore(db.get('sessions'), { ttl: sessionTTL }),
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, ConsumptionResolver],
      validate: true,
    }),
    context: ({ req, res }) =>
      ({
        db,
        req,
        session: (req.session! as unknown) as MySession,
        res,
        requestStorage: (req as any).storage! as RequestStorage,
      } as MyContext),
    formatError: (err) => {
      if (
        err.extensions?.code === 'INTERNAL_SERVER_ERROR' &&
        err.extensions?.exception?.validationErrors
      ) {
        //Coming from class-validator
        const ex = err.extensions?.exception
        return new UserInputError('Bad User Input', {
          validationError: ex.validationError ? ex.validationError : [],
          validationErrors: ex.validationErrors ? ex.validationErrors : [],
          exception: {
            stacktrace: ex.stacktrace ? ex.stacktrace : undefined,
            validationError: ex.validationError ? ex.validationError : [],
            validationErrors: ex.validationErrors ? ex.validationErrors : [],
            path: err.path ? err.path : undefined,
          },
        })
      }
      return err
    },
  })

  apolloServer.applyMiddleware({ app, cors: false })
  app.listen(4000, () => {
    console.log('server started on localhost:4000')
  })
}
try {
  main()
} catch (error) {
  console.error(error)
}
