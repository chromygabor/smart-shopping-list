import { ClassType, Field, ObjectType } from 'type-graphql'

export function Response<R, E>(r: ClassType<R>, e: ClassType<E>) {
  @ObjectType()
  class Response {
    @Field(() => [e], { nullable: true })
    failures?: E[]

    @Field(() => r, { nullable: true })
    response?: R

    static failures(errors: E[]): Response {
      return {
        failures: errors,
      }
    }

    static failure(error: E): Response {
      return {
        failures: [error],
      }
    }

    static success(response: R): Response {
      return {
        response,
      }
    }
  }
  return Response
}
