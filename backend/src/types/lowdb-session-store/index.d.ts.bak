declare module 'lowdb-session-store' {
  import * as express from 'express'
  import * as session from 'express-session'
  import { LoDashWrapper } from 'lodash'

  export interface SessionDataPersistence {
    _id: string
    session: Express.SessionData
    expires: number
  }

  export default function f(
    session: (options?: session.SessionOptions) => express.RequestHandler
  ): f.LowdbStore

  namespace f {
    interface LowdbStore {
      new (
        db: LoDashWrapper<SessionDataPersistence>,
        options?: Options
      ): session.Store
    }

    /**
     * LowdbStore Options
     */
    interface Options {
      /**
       * The expiration time for a session in seconds. A interval timer runs every ten minutes to purge expired sessions. The default value is 86400 (one day).
       */
      ttl?: number

      /**
       * Set to true to disable the ten-minute session purge timer (useful for testing).
       */

      disablePurge?: boolean
    }
  }
}
