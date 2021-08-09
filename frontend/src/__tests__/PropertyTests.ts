import { act, renderHook } from '@testing-library/react-hooks'
import { useRef } from 'react'
import { Property } from '../common/Property'
import { parse } from 'stacktrace-parser'

// describe('Property', () => {
//   it('should return appropiate type depending on input', () => {
//     const pv1 = Property.loading()
//     expect(pv1.isLoading).toBe(true)
//     expect(pv1.value).toBe(undefined)
//     expect(pv1.failure).toBe(undefined)

//     const pv2 = Property.failure(new Error('Test error'))
//     expect(pv2.isLoading).toBe(false)
//     expect(pv2.value).toBe(undefined)
//     expect(pv2.failure).toBeInstanceOf(Error)
//     expect(pv2.failure.message).toBe('Test error')

//     const pv3 = Property.value(10)
//     expect(pv3.isLoading).toBe(false)
//     expect(pv3.failure).toBe(undefined)
//     expect(pv3.value).toBe(10)
//   })
// })
// describe('PropertyUtils', () => {
//   it('map should return appropiate values', () => {
//     const fn = (input: number) => 'kukucs ' + input * 2

//     const [pv1] = Property.loading().map(fn, 'test')

//     expect(pv1.isLoading).toBe(true)

//     const [pv2] = Property.failure(new Error('Test error')).map(fn, 'test')
//     expect(pv2.failure).toBeInstanceOf(Error)
//     expect(pv2.failure.message).toBe('Test error')

//     const [pv3] = Property.value(10).map(fn, 'test')
//     expect(pv3.value).toBe('kukucs 20')
//   })

//   it('and should return appropiate value', () => {
//     const pv_1_l = Property.loading<number>()
//     const pv_1_v = Property.value<number>(10)
//     const pv_1_f = Property.failure<number>(new Error('Test 1'))

//     const pv_2_l = Property.loading<number>()
//     const pv_2_v = Property.value<number>(20)
//     const pv_2_f = Property.failure<number>(new Error('Test 2'))

//     expect(pv_1_l.and(pv_2_l)[0].isLoading).toBe(true)
//     expect(pv_1_l.and(pv_2_v)[0].isLoading).toBe(true)
//     expect(pv_1_l.and(pv_2_f)[0].isLoading).toBe(true)

//     expect(pv_1_v.and(pv_2_l)[0].isLoading).toBe(true)
//     expect(pv_1_v.and(pv_2_v)[0].value).toStrictEqual([10, 20])
//     expect(pv_1_v.and(pv_2_f)[0].failure.message).toBe('Test 2')

//     expect(pv_1_f.and(pv_2_l)[0].isLoading).toBe(true)
//     expect(pv_1_f.and(pv_2_v)[0].failure).not.toBe(undefined)
//     expect(pv_1_f.and(pv_2_f)[0].failure).not.toBe(undefined)
//     expect(pv_1_f.and(pv_2_f)[0].failure.message).toBe('Test 1')

//     expect(pv_1_l.and(pv_2_l)[0].isLoading).toBe(true)
//     expect(pv_1_v.and(pv_2_l)[0].isLoading).toBe(true)
//     expect(pv_1_f.and(pv_2_l)[0].isLoading).toBe(true)

//     expect(pv_1_l.and(pv_2_v)[0].isLoading).toBe(true)
//     expect(pv_1_v.and(pv_2_v)[0].value).toStrictEqual([10, 20])
//     expect(pv_1_f.and(pv_2_v)[0].failure).not.toBe(undefined)
//     expect(pv_1_f.and(pv_2_v)[0].failure.message).toBe('Test 1')

//     expect(pv_1_l.and(pv_2_f)[0].isLoading).toBe(true)
//     expect(pv_1_v.and(pv_2_f)[0].failure.message).toBe('Test 2')
//     expect(pv_1_f.and(pv_2_f)[0].failure.message).toBe('Test 1')
//   })
// })

describe('useProperty', () => {
  describe('.map', () => {
    it('should set value on mapped downstream when upstream is changed', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = Property.of<number>(5).useProperty()

        const [state2, state2Fn] = state1
          .map((item) => 'kukucs: ' + item * 2)
          .useProperty()

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          counter: counter.current,
        }
      })

      expect(result.current.state1.value).toBe(5)
      expect(result.current.state2.value).toBe('kukucs: 10')
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state1Fn.setLoading()
      })

      expect(result.current.state1.isLoading).toBe(true)
      expect(result.current.state2.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state1Fn.setValue(20)
      })

      expect(result.current.state1.value).toBe(20)
      expect(result.current.state2.value).toBe('kukucs: 40')
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state1Fn.setFailure(new Error('test'))
      })

      expect(result.current.state1.failure).toBeInstanceOf(Error)
      expect(result.current.state1.failure.message).toBe('test')

      expect(result.current.state2.failure).toBeInstanceOf(Error)
      expect(result.current.state2.failure.message).toBe('test')

      expect(result.current.counter).toBe(4)
    })

    it('should set value on mapped downstream with the downstream setters', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = Property.of<number>(5).useProperty()

        const [state2, state2Fn] = state1
          .map((item) => 'kukucs: ' + item * 2)
          .useProperty()

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          counter: counter.current,
        }
      })

      expect(result.current.state1.value).toBe(5)
      expect(result.current.state2.value).toBe('kukucs: 10')
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state2Fn.setLoading()
      })

      expect(result.current.state1.isLoading).toBe(false)
      expect(result.current.state2.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state2Fn.setValue('kukucs: 30')
      })

      expect(result.current.state1.value).toBe(5)
      expect(result.current.state2.value).toBe('kukucs: 30')
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state2Fn.setFailure(new Error('test'))
      })

      expect(result.current.state1.failure).toBe(undefined)

      expect(result.current.state2.failure).toBeInstanceOf(Error)
      expect(result.current.state2.failure.message).toBe('test')
      expect(result.current.counter).toBe(4)
    })

    it('should set value on mapped downstream when upstream changes even after the downstream already changed from the upstream', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1
        const [state1, state1Fn] = Property.of<number>(5).useProperty()

        const [state2, state2Fn] = state1
          .map((item) => 'kukucs: ' + item * 2)
          .useProperty()

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          counter: counter.current,
        }
      })

      expect(result.current.state1.value).toBe(5)
      expect(result.current.state2.value).toBe('kukucs: 10')
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state2Fn.setValue('Kukucs: 10')
        result.current.state1Fn.setLoading()
      })

      expect(result.current.state1.isLoading).toBe(true)
      expect(result.current.state2.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state2Fn.setValue('Kukucs: 10')
        result.current.state1Fn.setValue(20)
      })

      expect(result.current.state1.value).toBe(20)
      expect(result.current.state2.value).toBe('kukucs: 40')
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state2Fn.setValue('Kukucs: 10')
        result.current.state1Fn.setFailure(new Error('test'))
      })

      expect(result.current.state2.failure).toBeInstanceOf(Error)
      expect(result.current.state2.failure.message).toBe('test')
      expect(result.current.counter).toBe(4)
    })
  })
  describe('.and', () => {
    it('should set value on mapped downstream when left side of the upstream is changed', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = Property.of<number>(5).useProperty()
        const [state2, state2Fn] = Property.of<number>(10).useProperty()

        const [state3, state3Fn] = state1.and(state2).useProperty()

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          state3,
          state3Fn,
          counter: counter.current,
        }
      })

      expect(result.current.state3.value).toStrictEqual([5, 10])
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state1Fn.setLoading()
      })

      expect(result.current.state1.isLoading).toBe(true)
      expect(result.current.state2.isLoading).toBe(false)
      expect(result.current.state3.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state1Fn.setValue(20)
      })

      expect(result.current.state3.value).toStrictEqual([20, 10])
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state1Fn.setFailure(new Error('test'))
      })

      expect(result.current.state3.failure).toBeInstanceOf(Error)
      expect(result.current.state3.failure.message).toBe('test')

      expect(result.current.counter).toBe(4)
    })

    it('should set value on mapped downstream when right side of the upstream is changed', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = Property.of<number>(5).useProperty()
        const [state2, state2Fn] = Property.of<number>(10).useProperty()

        const [state3, state3Fn] = state1.and(state2).useProperty()

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          state3,
          state3Fn,
          counter: counter.current,
        }
      })

      expect(result.current.state3.value).toStrictEqual([5, 10])
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state2Fn.setLoading()
      })

      expect(result.current.state2.isLoading).toBe(true)
      expect(result.current.state1.isLoading).toBe(false)
      expect(result.current.state3.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state2Fn.setValue(20)
      })

      expect(result.current.state3.value).toStrictEqual([5, 20])
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state2Fn.setFailure(new Error('test'))
      })

      expect(result.current.state3.failure).toBeInstanceOf(Error)
      expect(result.current.state3.failure.message).toBe('test')

      expect(result.current.counter).toBe(4)
    })
    it('should ', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = Property.of<number>(5).useProperty()

        const [state2, state2Fn] = state1.useProperty()

        const state3 = state2.map((item) => {
          return item * 2
        })

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          state3,
          counter: counter.current,
        }
      })

      console.log(result.current.state1.sources)

      expect(result.current.state1.value).toBe(5)
      expect(result.current.state2.value).toBe(5)
      expect(result.current.state3.value).toBe(10)
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state1Fn.setValue(10)
      })

      expect(result.current.state1.value).toBe(10)
      expect(result.current.state2.value).toBe(10)
      expect(result.current.state3.value).toBe(20)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state2Fn.setValue(20)
      })

      expect(result.current.state1.value).toBe(10)
      expect(result.current.state2.value).toBe(20)
      expect(result.current.state3.value).toBe(40)
      expect(result.current.counter).toBe(3)
    })
  })
})
