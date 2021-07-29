import { act, renderHook } from '@testing-library/react-hooks'
import { count } from 'console'
import { useRef, useState } from 'react'
import { PropertyUtils, useProperty } from '../common/Property'

const propertyUtils = new PropertyUtils()
describe('Property', () => {
  it('should return appropiate type depending on input', () => {
    const pv1 = propertyUtils.loading()
    expect(pv1.isLoading).toBe(true)
    expect(pv1.value).toBe(undefined)
    expect(pv1.failure).toBe(undefined)

    const pv2 = propertyUtils.failure(new Error('Test error'))
    expect(pv2.isLoading).toBe(false)
    expect(pv2.value).toBe(undefined)
    expect(pv2.failure).toBeInstanceOf(Error)
    expect(pv2.failure.message).toBe('Test error')

    const pv3 = propertyUtils.value(10)
    expect(pv3.isLoading).toBe(false)
    expect(pv3.failure).toBe(undefined)
    expect(pv3.value).toBe(10)
  })
})
describe('PropertyUtils', () => {
  it('map should return appropiate values', () => {
    const fn = (input: number) => 'kukucs ' + input * 2

    const pv1 = propertyUtils.map(propertyUtils.loading(), fn, 'test')

    expect(pv1.isLoading).toBe(true)

    const pv2 = propertyUtils.map(
      propertyUtils.failure(new Error('Test error')),
      fn,
      'test'
    )
    expect(pv2.failure).toBeInstanceOf(Error)
    expect(pv2.failure.message).toBe('Test error')

    const pv3 = propertyUtils.map(propertyUtils.value(10), fn, 'test')
    expect(pv3.value).toBe('kukucs 20')
  })

  it('and should return appropiate value', () => {
    const pv_1_l = propertyUtils.loading<number, Error>()
    const pv_1_v = propertyUtils.value<number, Error>(10)
    const pv_1_f = propertyUtils.failure<number, Error>(new Error('Test 1'))

    const pv_2_l = propertyUtils.loading<number, Error>()
    const pv_2_v = propertyUtils.value<number, Error>(20)
    const pv_2_f = propertyUtils.failure<number, Error>(new Error('Test 2'))

    expect(propertyUtils.and(pv_1_l, pv_2_l).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_l, pv_2_v).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_l, pv_2_f).isLoading).toBe(true)

    expect(propertyUtils.and(pv_1_v, pv_2_l).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_v, pv_2_v).value).toStrictEqual([10, 20])
    expect(propertyUtils.and(pv_1_v, pv_2_f).failure.message).toBe('Test 2')

    expect(propertyUtils.and(pv_1_f, pv_2_l).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_f, pv_2_v).failure).not.toBe(undefined)
    expect(propertyUtils.and(pv_1_f, pv_2_f).failure).not.toBe(undefined)
    expect(propertyUtils.and(pv_1_f, pv_2_f).failure.message).toBe('Test 1')

    expect(propertyUtils.and(pv_1_l, pv_2_l).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_v, pv_2_l).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_f, pv_2_l).isLoading).toBe(true)

    expect(propertyUtils.and(pv_1_l, pv_2_v).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_v, pv_2_v).value).toStrictEqual([10, 20])
    expect(propertyUtils.and(pv_1_f, pv_2_v).failure).not.toBe(undefined)
    expect(propertyUtils.and(pv_1_f, pv_2_v).failure.message).toBe('Test 1')

    expect(propertyUtils.and(pv_1_l, pv_2_f).isLoading).toBe(true)
    expect(propertyUtils.and(pv_1_v, pv_2_f).failure.message).toBe('Test 2')
    expect(propertyUtils.and(pv_1_f, pv_2_f).failure.message).toBe('Test 1')
  })
})

describe('useProperty', () => {
  describe('.map', () => {
    it('should set value on mapped downstream when upstream is changed', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = useProperty<number, Error>(5, 'test')

        const [state2, state2Fn] = state1Fn.map(
          (item) => 'kukucs: ' + item * 2,
          'mapped'
        )

        const [state3, state3Fn] = useProperty<string, Error>(
          propertyUtils.map(state1, (item) => 'kukucs: ' + item * 2, 'mapped')
        )

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

      expect(result.current.state1.value).toBe(5)
      expect(result.current.state2.value).toBe('kukucs: 10')
      expect(result.current.state3.value).toBe('kukucs: 10')
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state1Fn.setLoading()
      })

      expect(result.current.state1.isLoading).toBe(true)
      expect(result.current.state2.isLoading).toBe(true)
      expect(result.current.state3.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state1Fn.setValue(20)
      })

      expect(result.current.state1.value).toBe(20)
      expect(result.current.state2.value).toBe('kukucs: 40')
      expect(result.current.state3.value).toBe('kukucs: 40')
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state1Fn.setFailure(new Error('test'))
      })

      expect(result.current.state1.failure).toBeInstanceOf(Error)
      expect(result.current.state1.failure.message).toBe('test')

      expect(result.current.state2.failure).toBeInstanceOf(Error)
      expect(result.current.state2.failure.message).toBe('test')

      expect(result.current.state3.failure).toBeInstanceOf(Error)
      expect(result.current.state3.failure.message).toBe('test')

      expect(result.current.counter).toBe(4)
    })

    it('should set value on mapped downstream with the downstream setters', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = useProperty<number, Error>(5, 'test')

        const [state2, state2Fn] = state1Fn.map(
          (item) => 'kukucs: ' + item * 2,
          'mapped'
        )

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
        const [state1, state1Fn] = useProperty<number, Error>(5, 'test')

        const [state2, state2Fn] = state1Fn.map(
          (item) => 'kukucs: ' + item * 2,
          'test'
        )

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

        const [state1, state1Fn] = useProperty<number, Error>(5, 'l-l')
        const [state2, state2Fn] = useProperty<number, Error>(10, 'l-r')

        const [state3, state3Fn] = state1Fn.and(state2, 'l-and')

        const [state4, state4Fn] = useProperty(
          propertyUtils.and(state1, state2, 'l-and-2'),
          'r-and-2'
        )

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          state3,
          state3Fn,
          state4,
          state4Fn,
          counter: counter.current,
        }
      })

      expect(result.current.state3.value).toStrictEqual([5, 10])
      expect(result.current.state4.value).toStrictEqual([5, 10])
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state1Fn.setLoading()
      })

      expect(result.current.state1.isLoading).toBe(true)
      expect(result.current.state2.isLoading).toBe(false)
      expect(result.current.state3.isLoading).toBe(true)
      expect(result.current.state4.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state1Fn.setValue(20)
      })

      expect(result.current.state3.value).toStrictEqual([20, 10])
      expect(result.current.state4.value).toStrictEqual([20, 10])
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state1Fn.setFailure(new Error('test'))
      })

      expect(result.current.state3.failure).toBeInstanceOf(Error)
      expect(result.current.state3.failure.message).toBe('test')

      expect(result.current.state4.failure).toBeInstanceOf(Error)
      expect(result.current.state4.failure.message).toBe('test')
      expect(result.current.counter).toBe(4)
    })

    it('should set value on mapped downstream when right side of the upstream is changed', () => {
      const { result } = renderHook(() => {
        const counter = useRef(0)
        counter.current = counter.current + 1

        const [state1, state1Fn] = useProperty<number, Error>(5, 'rl')
        const [state2, state2Fn] = useProperty<number, Error>(10, 'rr')

        const [state3, state3Fn] = state1Fn.and(state2, 'r-and')

        const [state4, state4Fn] = useProperty(
          propertyUtils.and(state1, state2, 'r-and-2'),
          'r-and-2'
        )

        return {
          state1,
          state1Fn,
          state2,
          state2Fn,
          state3,
          state3Fn,
          state4,
          state4Fn,
          counter: counter.current,
        }
      })

      expect(result.current.state3.value).toStrictEqual([5, 10])
      expect(result.current.state4.value).toStrictEqual([5, 10])
      expect(result.current.counter).toBe(1)

      act(() => {
        result.current.state2Fn.setLoading()
      })

      expect(result.current.state2.isLoading).toBe(true)
      expect(result.current.state1.isLoading).toBe(false)
      expect(result.current.state3.isLoading).toBe(true)
      expect(result.current.state4.isLoading).toBe(true)
      expect(result.current.counter).toBe(2)

      act(() => {
        result.current.state2Fn.setValue(20)
      })

      expect(result.current.state3.value).toStrictEqual([5, 20])
      expect(result.current.state4.value).toStrictEqual([5, 20])
      expect(result.current.counter).toBe(3)

      act(() => {
        result.current.state2Fn.setFailure(new Error('test'))
      })

      expect(result.current.state3.failure).toBeInstanceOf(Error)
      expect(result.current.state3.failure.message).toBe('test')

      expect(result.current.state4.failure).toBeInstanceOf(Error)
      expect(result.current.state4.failure.message).toBe('test')
      expect(result.current.counter).toBe(4)
    })
  })
})
