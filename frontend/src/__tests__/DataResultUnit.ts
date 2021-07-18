import jest from 'jest'
import { identity } from 'lodash'
import {
  DataResult,
  mutableDataResult,
  State as Container,
} from '../common/MyDataResult'

type State = {
  text: string
  number: number
}

type Payload = {
  text: string
}

const initalizeDataResult = (
  initState: Container<State, Payload> = {
    isLoading: false,
    payload: { text: 'This the payload' },
  }
) => {
  var container = initState

  return mutableDataResult(
    () => {
      return container
    },
    (_container: Container<State, Payload>) => {
      container = _container
    }
  )
}

describe('DataResult', () => {
  it('should return isLoading if loading was called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    loading()

    const { isLoading, data } = dataResult.state()

    expect(isLoading).toBe(true)
    expect(data).toBe(undefined)
  })

  it('should return data if emit was called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    loading()

    const { isLoading, data } = dataResult.state()

    expect(isLoading).toBe(true)
    expect(data).toBe(undefined)
  })

  it("shouldn't call any onXXX if no mutate function called", () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    loadingOut = dataResult.onLoading(identity)
    successOut = dataResult.onSuccess(identity)
    failureOut = dataResult.onFailure(identity)

    expect(loadingOut).toBe(undefined)
    expect(successOut).toBe(undefined)
    expect(failureOut).toBe(undefined)
  })

  it('should call any onLoading if loading is called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    loading()

    loadingOut = dataResult.onLoading(identity)
    successOut = dataResult.onSuccess(identity)
    failureOut = dataResult.onFailure(identity)

    expect(loadingOut).toStrictEqual({ payload: { text: 'This the payload' } })
    expect(successOut).toBe(undefined)
    expect(failureOut).toBe(undefined)
  })

  it('should call any onSuccess if complete is called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    emit({
      text: 'emit',
      number: 10,
    })

    loadingOut = dataResult.onLoading(identity)
    successOut = dataResult.onSuccess(identity)
    failureOut = dataResult.onFailure(identity)

    expect(loadingOut).toBe(undefined)
    expect(successOut).toStrictEqual({
      payload: { text: 'This the payload' },
      data: {
        text: 'emit',
        number: 10,
      },
    })
    expect(failureOut).toBe(undefined)
  })

  it('should call any onError if error is called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    failure(new Error('Test error'))

    loadingOut = dataResult.onLoading(identity)
    successOut = dataResult.onSuccess(identity)
    failureOut = dataResult.onFailure(identity)

    expect(loadingOut).toBe(undefined)
    expect(successOut).toBe(undefined)

    expect(failureOut).not.toBe(undefined)
    expect(failureOut.error).not.toBe(undefined)
    expect(failureOut.error.message).toBe('Test error')
  })
})

describe('DataResult.map', () => {
  it("shouldn't call any onXXX if no mutate function called", () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    const mapped = dataResult.map((state) => ({
      text: state.text + ' mapped',
      number: state.number * 10,
    }))

    loadingOut = mapped.onLoading(identity)
    successOut = mapped.onSuccess(identity)
    failureOut = mapped.onFailure(identity)

    expect(loadingOut).toBe(undefined)
    expect(successOut).toBe(undefined)
    expect(failureOut).toBe(undefined)
  })

  it('should call any onLoading if loading is called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    const mapped = dataResult.map((state) => ({
      text: state.text + ' mapped',
      number: state.number * 10,
    }))

    loading()

    loadingOut = mapped.onLoading(identity)
    successOut = mapped.onSuccess(identity)
    failureOut = mapped.onFailure(identity)

    expect(loadingOut).toStrictEqual({ payload: { text: 'This the payload' } })
    expect(successOut).toBe(undefined)
    expect(failureOut).toBe(undefined)
  })

  it('should call any onSuccess if complete is called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    const mapped = dataResult.map((state) => ({
      text: state.text + ' mapped',
      number: state.number * 10,
    }))

    emit({
      text: 'emit',
      number: 10,
    })

    loadingOut = mapped.onLoading(identity)
    successOut = mapped.onSuccess(identity)
    failureOut = mapped.onFailure(identity)

    expect(loadingOut).toBe(undefined)
    expect(successOut).toStrictEqual({
      payload: { text: 'This the payload' },
      data: {
        text: 'emit mapped',
        number: 100,
      },
    })
    expect(failureOut).toBe(undefined)
  })

  it('should call any onError if error is called', () => {
    const { emit, loading, failure, dataResult } = initalizeDataResult()

    var loadingOut: { payload: Payload } | undefined = undefined
    var successOut: { payload: Payload; data: State } | undefined = undefined
    var failureOut: { payload: Payload; error: Error } | undefined = undefined

    const mapped = dataResult.map((state) => ({
      text: state.text + ' mapped',
      number: state.number * 10,
    }))

    failure(new Error('Test error'))

    loadingOut = mapped.onLoading(identity)
    successOut = mapped.onSuccess(identity)
    failureOut = mapped.onFailure(identity)

    expect(loadingOut).toBe(undefined)
    expect(successOut).toBe(undefined)

    expect(failureOut).not.toBe(undefined)
    expect(failureOut.error).not.toBe(undefined)
    expect(failureOut.error.message).toBe('Test error')
  })
})
