import _ from 'underscore'
import {
  dataStream,
  MutableDataStream,
  State as Container,
} from '../common/DataStream'
import { Lens } from 'monocle-ts'

type State = {
  text: string
  number: number
}

type Payload = {
  text: string
}

function createMutableDataStream<T, P>(input?: {
  payload?: P
  isLoading?: boolean
  data?: T
}) {
  var container: Container<T, P> = {
    isLoading: input?.isLoading,
    payload: input?.payload,
    data: input?.data,
    version: 0,
  }

  return dataStream(
    () => {
      return container
    },
    (_container: Container<T, P>) => {
      container = _container
    }
  )
}

const initalizeDataResult = (input?: {
  payload?: Payload
  isLoading?: boolean
  data?: State
}) => {
  return createMutableDataStream({
    isLoading: input?.isLoading ? input.isLoading : false,
    payload: input?.payload ? input.payload : { text: 'This the payload' },
    data: input?.data,
  })
}

describe('DataResult ', () => {
  it('should work with complex use case', () => {
    const ds1 = createMutableDataStream<State[], {}>()

    var container: Container<State, {}> = {
      isLoading: false,
      version: 0,
    }

    const state = () => container
    const setState = (_container: Container<State, {}>) => {
      container = _container
    }

    const ds2 = ds1.map((input: State[]) => input[0]).toMutable(state, setState)

    ds1.loading()

    expect(ds2.state().isLoading).toBe(true)
    expect(ds2.state().data).toBe(undefined)

    ds1.emit([
      { text: 'item 1', number: 1 },
      { text: 'item 2', number: 2 },
      { text: 'item 3', number: 3 },
    ])

    expect(ds2.state().isLoading).toBe(false)
    expect(ds2.state().data).toStrictEqual({ text: 'item 1', number: 1 })

    ds2.loading()

    expect(ds2.state().isLoading).toBe(true)
    expect(ds2.state().data).toBe(undefined)

    ds2.emit({ text: 'item 1', number: 100 })

    expect(ds2.state().isLoading).toBe(false)
    expect(ds2.state().data).toStrictEqual({ text: 'item 1', number: 100 })

    ds1.loading()
    ds1.emit([
      { text: 'item 1', number: 10 },
      { text: 'item 2', number: 20 },
      { text: 'item 3', number: 30 },
    ])

    expect(ds2.state().isLoading).toBe(false)
    expect(ds2.state().data).toStrictEqual({ text: 'item 1', number: 10 })

    ds1.loading()
    ds1.failure(new Error('Test error'))

    expect(ds2.state().isLoading).toBe(false)
    expect(ds2.state().data).toBeInstanceOf(Error)
  })
})

describe('DataResult', () => {
  it('should return isLoading if loading was called', () => {
    const dataStream = initalizeDataResult()

    dataStream.loading()

    const { isLoading, data, payload } = dataStream.state()

    expect(isLoading).toBe(true)
    expect(payload).toStrictEqual({ text: 'This the payload' })
    expect(data).toBe(undefined)
  })

  it('should return isLoading and data undefined if loading was called', () => {
    const dataStream = initalizeDataResult({
      data: {
        text: 'emit',
        number: 10,
      },
      isLoading: false,
      payload: { text: 'This the payload' },
    })

    dataStream.loading()

    const { isLoading, data, payload } = dataStream.state()

    expect(isLoading).toBe(true)
    expect(payload).toStrictEqual({ text: 'This the payload' })
    expect(data).toBe(undefined)
  })

  it('should return data and isLoading=false if emit was called', () => {
    const dataStream = initalizeDataResult()

    dataStream.emit({
      text: 'emit',
      number: 10,
    })

    const { isLoading, data, payload } = dataStream.state()

    expect(isLoading).toBe(false)
    expect(payload).toStrictEqual({ text: 'This the payload' })
    expect(data).toStrictEqual({
      text: 'emit',
      number: 10,
    })
  })

  it('should return error in the data and isLoading=false if failure was called', () => {
    const dataStream = initalizeDataResult()

    dataStream.failure(new Error('Test error'))

    const { isLoading, data, payload } = dataStream.state()

    expect(isLoading).toBe(false)
    expect(payload).toStrictEqual({ text: 'This the payload' })
    expect(data).toBeInstanceOf(Error)
    expect((data as Error).message).toBe('Test error')
  })
})

describe('DataResult.map', () => {
  it('should return isLoading on mapped stream if loading was called', () => {
    const dataStream = initalizeDataResult()

    const mapped = dataStream.map((input) => ({
      text: input.text + ' mapped',
      number: input.number * 10,
    }))

    dataStream.loading()

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(true)
    expect(payload).toStrictEqual({ text: 'This the payload' })
    expect(data).toBe(undefined)
  })

  it('should return mapped data on mapped stream and isLoading=false if emit was called', () => {
    const dataStream = initalizeDataResult()

    const mapped = dataStream.map((input) => ({
      text: input.text + ' mapped',
      number: input.number * 10,
    }))

    dataStream.emit({
      text: 'emit',
      number: 10,
    })

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(false)
    expect(payload).toStrictEqual({ text: 'This the payload' })
    expect(data).toStrictEqual({
      text: 'emit mapped',
      number: 100,
    })
  })

  it('should return error in the mapped data and isLoading=false if failure was called', () => {
    const dataStream = initalizeDataResult()

    const mapped = dataStream.map((input) => ({
      text: input.text + ' mapped',
      number: input.number * 10,
    }))

    dataStream.failure(new Error('Test error'))

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(false)
    expect(payload).toStrictEqual({ text: 'This the payload' })
    expect(data).toBeInstanceOf(Error)
    expect((data as Error).message).toBe('Test error')
  })
})

describe('DataResult.and', () => {
  it('should return an appropiate uninitialized state on the downstream', () => {
    const dataStream1 = initalizeDataResult()
    const dataStream2 = initalizeDataResult({
      payload: { text: 'This the payload 2' },
    })

    const mapped = dataStream1.and(dataStream2)

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(false)
    expect(data).toBe(undefined)
    expect(payload).toStrictEqual([
      { text: 'This the payload' },
      { text: 'This the payload 2' },
    ])
  })

  it('should return an isloading on the underlying stream if the first stream is loading', () => {
    const dataStream1 = initalizeDataResult()
    const dataStream2 = initalizeDataResult({
      payload: { text: 'This the payload 2' },
    })

    const mapped = dataStream1.and(dataStream2)

    dataStream1.loading()

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(true)
    expect(data).toBe(undefined)
    expect(payload).toStrictEqual([
      { text: 'This the payload' },
      { text: 'This the payload 2' },
    ])
  })

  it('should return an isloading on the underlying stream if the second stream is loading', () => {
    const dataStream1 = initalizeDataResult()
    const dataStream2 = initalizeDataResult({
      data: { text: 'foo', number: 10 },
      payload: { text: 'This the payload 2' },
    })

    const mapped = dataStream1.and(dataStream2)

    dataStream2.loading()

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(true)
    expect(data).toBe(undefined)
    expect(payload).toStrictEqual([
      { text: 'This the payload' },
      { text: 'This the payload 2' },
    ])
  })

  it('should return a data on the underlying stream if both the streams are in emited state', () => {
    const dataStream1 = initalizeDataResult()
    const dataStream2 = initalizeDataResult({
      payload: { text: 'This the payload 2' },
    })

    const mapped = dataStream1.and(dataStream2)

    dataStream1.emit({ text: 'foo', number: 10 })
    dataStream2.emit({ text: 'bor', number: 20 })

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(false)
    expect(data).toStrictEqual([
      { text: 'foo', number: 10 },
      { text: 'bor', number: 20 },
    ])
    expect(payload).toStrictEqual([
      { text: 'This the payload' },
      { text: 'This the payload 2' },
    ])
  })

  it('should return a failure on the underlying stream if one of the streams are in failure state', () => {
    const dataStream1 = initalizeDataResult()
    const dataStream2 = initalizeDataResult({
      payload: { text: 'This the payload 2' },
    })

    const mapped = dataStream1.and(dataStream2)

    dataStream1.emit({ text: 'foo', number: 10 })
    dataStream2.failure(new Error('Test error'))

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(false)
    expect(data).toBeInstanceOf(Error)
    expect((data as Error).message).toBe('Test error')

    expect(payload).toStrictEqual([
      { text: 'This the payload' },
      { text: 'This the payload 2' },
    ])
  })

  it('should return a failure on the underlying stream if other of the streams are in failure state', () => {
    const dataStream1 = initalizeDataResult()
    const dataStream2 = initalizeDataResult({
      payload: { text: 'This the payload 2' },
    })

    const mapped = dataStream1.and(dataStream2)

    dataStream1.failure(new Error('Test error'))
    dataStream2.emit({ text: 'foo', number: 10 })

    const { isLoading, data, payload } = mapped.state()

    expect(isLoading).toBe(false)
    expect(data).toBeInstanceOf(Error)
    expect((data as Error).message).toBe('Test error')

    expect(payload).toStrictEqual([
      { text: 'This the payload' },
      { text: 'This the payload 2' },
    ])
  })
})
