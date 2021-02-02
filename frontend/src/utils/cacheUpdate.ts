import {
  ApolloCache,
  DocumentNode,
  FetchResult,
  MutationUpdaterFn,
  TypedDocumentNode,
} from "@apollo/client";

export function update<T, V extends DocumentNode | TypedDocumentNode, U>(
  v: V,
  fn: (data: T) => U
): MutationUpdaterFn<T> {
  const u = (cache: ApolloCache<T>, result: FetchResult<T>): void => {
    cache.writeQuery({
      data: fn(result.data),
      query: v,
    });
  };
  return u;
}
