import { Request, Response } from 'express'
import { LowdbSync } from 'lowdb'
import { IUser } from './schemas/User'
import { SessionDataPersistence } from 'lowdb-session-store'

export interface MySession {
  userId: string
}

export type MyContext = {
  req: Request & { session: Express.Session }
  res: Response
  db: LowdbSync<Database>
  session: MySession
}

export interface Database {
  users: IUser[]
  sessions: SessionDataPersistence[]
}
