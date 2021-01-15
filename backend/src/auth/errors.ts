export class UsernameAlreadyTaken extends Error {
  fields: ['kukucs']
  constructor() {
    super('Username is already taken')

    Object.setPrototypeOf(this, UsernameAlreadyTaken.prototype)
  }
}
