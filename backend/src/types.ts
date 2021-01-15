import { Request, Response } from 'express'
import { LowdbSync } from 'lowdb'
import { IUser } from './schemas/User'

export type MyContext = {
  req: Request & { session: Express.Session }
  res: Response
  db: LowdbSync<Database>
  session: Express.Session
}

export interface Database {
  users: IUser[]
}
