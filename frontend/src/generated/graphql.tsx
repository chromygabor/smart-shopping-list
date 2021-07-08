import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
  __typename?: 'Query';
  me?: Maybe<IUser>;
  users: Array<IUser>;
  units: Array<Uom>;
  consumptions: Array<InventoryItem>;
  hello: Scalars['String'];
};

export type IUser = {
  __typename?: 'IUser';
  _id: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
  createdAt: Scalars['Float'];
  updatedAt: Scalars['Float'];
};

export type Uom = {
  __typename?: 'UOM';
  id: Scalars['String'];
  name: Scalars['String'];
};

export type InventoryItem = {
  __typename?: 'InventoryItem';
  id: Scalars['String'];
  name: Scalars['String'];
  unitId: Scalars['String'];
  qty: Scalars['Float'];
  unit: Uom;
};

export type Mutation = {
  __typename?: 'Mutation';
  register: IUser;
  login: IUser;
  logout: Scalars['Boolean'];
};


export type MutationRegisterArgs = {
  userInput: SingUpInput;
};


export type MutationLoginArgs = {
  userInput: UserInput;
};

export type SingUpInput = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};

export type UserInput = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};

export type UserFragment = (
  { __typename?: 'IUser' }
  & Pick<IUser, '_id' | 'email'>
);

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = (
  { __typename?: 'Mutation' }
  & { login: (
    { __typename?: 'IUser' }
    & UserFragment
  ) }
);

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = (
  { __typename?: 'Mutation' }
  & Pick<Mutation, 'logout'>
);

export type RegisterMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = (
  { __typename?: 'Mutation' }
  & { register: (
    { __typename?: 'IUser' }
    & UserFragment
  ) }
);

export type ConsumptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ConsumptionsQuery = (
  { __typename?: 'Query' }
  & { consumptions: Array<(
    { __typename?: 'InventoryItem' }
    & Pick<InventoryItem, 'id' | 'name' | 'qty' | 'unitId'>
    & { unit: (
      { __typename?: 'UOM' }
      & Pick<Uom, 'id' | 'name'>
    ) }
  )> }
);

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = (
  { __typename?: 'Query' }
  & { me?: Maybe<(
    { __typename?: 'IUser' }
    & UserFragment
  )> }
);

export type UnitsQueryVariables = Exact<{ [key: string]: never; }>;


export type UnitsQuery = (
  { __typename?: 'Query' }
  & { units: Array<(
    { __typename?: 'UOM' }
    & Pick<Uom, 'id' | 'name'>
  )> }
);

export const UserFragmentDoc = gql`
    fragment user on IUser {
  _id
  email
}
    `;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(userInput: {email: $email, password: $password}) {
    ...user
  }
}
    ${UserFragmentDoc}`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, baseOptions);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, baseOptions);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($email: String!, $password: String!) {
  register(userInput: {email: $email, password: $password}) {
    ...user
  }
}
    ${UserFragmentDoc}`;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, baseOptions);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const ConsumptionsDocument = gql`
    query consumptions {
  consumptions {
    id
    name
    qty
    unit {
      id
      name
    }
    unitId
  }
}
    `;

/**
 * __useConsumptionsQuery__
 *
 * To run a query within a React component, call `useConsumptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useConsumptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useConsumptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useConsumptionsQuery(baseOptions?: Apollo.QueryHookOptions<ConsumptionsQuery, ConsumptionsQueryVariables>) {
        return Apollo.useQuery<ConsumptionsQuery, ConsumptionsQueryVariables>(ConsumptionsDocument, baseOptions);
      }
export function useConsumptionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ConsumptionsQuery, ConsumptionsQueryVariables>) {
          return Apollo.useLazyQuery<ConsumptionsQuery, ConsumptionsQueryVariables>(ConsumptionsDocument, baseOptions);
        }
export type ConsumptionsQueryHookResult = ReturnType<typeof useConsumptionsQuery>;
export type ConsumptionsLazyQueryHookResult = ReturnType<typeof useConsumptionsLazyQuery>;
export type ConsumptionsQueryResult = Apollo.QueryResult<ConsumptionsQuery, ConsumptionsQueryVariables>;
export const MeDocument = gql`
    query me {
  me {
    ...user
  }
}
    ${UserFragmentDoc}`;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, baseOptions);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const UnitsDocument = gql`
    query units {
  units {
    id
    name
  }
}
    `;

/**
 * __useUnitsQuery__
 *
 * To run a query within a React component, call `useUnitsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUnitsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUnitsQuery({
 *   variables: {
 *   },
 * });
 */
export function useUnitsQuery(baseOptions?: Apollo.QueryHookOptions<UnitsQuery, UnitsQueryVariables>) {
        return Apollo.useQuery<UnitsQuery, UnitsQueryVariables>(UnitsDocument, baseOptions);
      }
export function useUnitsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UnitsQuery, UnitsQueryVariables>) {
          return Apollo.useLazyQuery<UnitsQuery, UnitsQueryVariables>(UnitsDocument, baseOptions);
        }
export type UnitsQueryHookResult = ReturnType<typeof useUnitsQuery>;
export type UnitsLazyQueryHookResult = ReturnType<typeof useUnitsLazyQuery>;
export type UnitsQueryResult = Apollo.QueryResult<UnitsQuery, UnitsQueryVariables>;