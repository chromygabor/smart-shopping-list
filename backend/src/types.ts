import { Request, Response } from 'express'
import { LowdbSync } from 'lowdb'
import { IUser } from './schemas/User'
import { SessionDataPersistence } from 'lowdb-session-store'

export interface IConsumption {
  id: string
  name: string
  qty: number
  unitId: string
}

export interface IUOM {
  id: string
  name: string
}

export interface MySession {
  userId: string
}

export class RequestStorage {
  units: IUOM[] = []
  setUnits(units: IUOM[]): void {
    this.units = [...units]
  }

  unitById(id: string): IUOM | undefined {
    const unit = this.units.find((unit) => {
      return unit.id === id
    })

    if (unit) {
      return unit
    } else return undefined
  }
}

export type MyContext = {
  req: Request & { session: Express.Session }
  res: Response
  db: LowdbSync<Database>
  session: MySession
  requestStorage: RequestStorage
}

export interface Database {
  users: IUser[]
  sessions: SessionDataPersistence[]
  consumption: IConsumption[]
  units: IUOM[]
}
