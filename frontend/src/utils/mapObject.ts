export type ValueOf<T> = T[keyof T];

export type MapTo<T, U> = {
  [P in keyof T]: U;
};

function mapObject<T, U>(
  mappingFn: (field: ValueOf<T>) => U,
  obj: T
): MapTo<T, U> {
  let newObj = {} as MapTo<T, U>;
  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      const oldValue = obj[i];
      newObj[i] = mappingFn(oldValue);
    }
  }
  return newObj;
}

export default mapObject;
