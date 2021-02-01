import { UserInputError } from 'apollo-server-express'

export default {
  FieldError: (
    property: string,
    constraint: string,
    message: string
  ): UserInputError => {
    return new UserInputError('Bad User Input', {
      validationError: [],
      validationErrors: [
        {
          property,
          constraints: {
            [constraint]: message,
          },
        },
      ],
    })
  },
  InputError: (constraint: string, message: string): UserInputError => {
    return new UserInputError('Bad User Input', {
      inputErrors: [
        {
          constraint,
          message,
        },
      ],
      validationErrors: [],
    })
  },

  InputErrors: (
    inputErrors: {
      constraint: string
      message: string
    }[]
  ): UserInputError => {
    return new UserInputError('Bad User Input', {
      inputErrors,
      validationErrors: [],
    })
  },

  ApplicationError: (constraint: string, message: string): UserInputError => {
    return new UserInputError('Application error', {
      inputErrors: [
        {
          constraint,
          message,
        },
      ],
      validationErrors: [],
    })
  },
}
