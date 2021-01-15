import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

export function IsTheSameAs(
  property: string,
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string): void {
    registerDecorator({
      name: 'isTheSameAs',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]
          return typeof relatedValue === 'string' && value === relatedValue // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    })
  }
}
