import { ApolloError } from 'apollo-server-express'
import { ValidationError } from 'class-validator'
import { error } from 'console'

export class ApplicationError extends ApolloError {
  constructor(errors: { message: string; code: number; field?: string }[]) {
    super('APPLICATION_ERROR', 'CODE_100', {
      exception: { validationErrors: errors },
    })

    Object.setPrototypeOf(this, ApplicationError.prototype)
  }
}

export class ValidationErrors extends Error {
  // constructor(public validationErrors: ValidationError[]) {
  //   super()
  // }
  validationErrors: ValidationError[]
  constructor(
    _validationErrors: {
      property?: string
      constraints: Record<string, string>
      children?: ValidationError[]
    }[]
  ) {
    super()

    this.validationErrors = _validationErrors.map((error) => ({
      ...error,
      property: error.property ? error.property : '',
      children: error.children ? error.children : [],
    }))

    Object.setPrototypeOf(this, ApplicationError.prototype)
  }
}
