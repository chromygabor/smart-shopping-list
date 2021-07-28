import { useProperty, PropertyUtils } from '../common/Property'
import { renderHook, act } from '@testing-library/react-hooks'
import { useState } from 'react'

describe('Property', () => {
  const propertyUtils = new PropertyUtils()

  it('should return appropiate type depending on input', () => {
    expect(propertyUtils.loading().type).toBe('ISLOADING')

    const pv2 = propertyUtils.failure(new Error('Test error'))
    expect(pv2.type).toBe('FAILURE')
    expect(pv2.failure).toBeInstanceOf(Error)
    expect(pv2.failure.message).toBe('Test error')

    const pv3 = propertyUtils.value(10)
    expect(pv3.type).toBe('VALUE')
    expect(pv3.value).toBe(10)
  })

  it('map should return appropiate values', () => {
    const fn = (input: number) => 'kukucs ' + input * 2

    const pv1 = propertyUtils.loading().map(fn)

    expect(pv1.type).toBe('ISLOADING')

    const pv2 = propertyUtils.failure(new Error('Test error')).map(fn)
    expect(pv2.type).toBe('FAILURE')
    expect(pv2.failure).toBeInstanceOf(Error)
    expect(pv2.failure.message).toBe('Test error')

    const pv3 = propertyUtils.value(10).map(fn)
    expect(pv3.type).toBe('VALUE')
    expect(pv3.value).toBe('kukucs 20')
  })

  it('setter functions should return appropiate values', () => {
    const pv_l_l = propertyUtils.loading<number, Error>().setLoading()
    const pv_l_v = propertyUtils.loading<number, Error>().setValue(10)
    const pv_l_f = propertyUtils
      .loading<number, Error>()
      .setFailure(new Error('test error'))

    const pv_f_l = propertyUtils
      .failure<number, Error>(new Error('error'))
      .setLoading()
    const pv_f_v = propertyUtils
      .failure<number, Error>(new Error('error'))
      .setValue(10)
    const pv_f_f = propertyUtils
      .failure<number, Error>(new Error('error'))
      .setFailure(new Error('test error'))

    const pv_v_l = propertyUtils.value<number, Error>(5).setLoading()
    const pv_v_v = propertyUtils.value<number, Error>(5).setValue(10)
    const pv_v_f = propertyUtils
      .value<number, Error>(5)
      .setFailure(new Error('test error'))

    expect(pv_l_l.type).toBe('ISLOADING')
    expect(pv_l_v.type).toBe('VALUE')
    expect(pv_l_v.value).toBe(10)
    expect(pv_l_f.type).toBe('FAILURE')
    expect(pv_l_f.failure).toBeInstanceOf(Error)
    expect(pv_l_f.failure.message).toBe('test error')

    expect(pv_f_l.type).toBe('ISLOADING')
    expect(pv_f_v.type).toBe('VALUE')
    expect(pv_f_v.value).toBe(10)
    expect(pv_f_f.type).toBe('FAILURE')
    expect(pv_f_f.failure).toBeInstanceOf(Error)
    expect(pv_f_f.failure.message).toBe('test error')

    expect(pv_v_l.type).toBe('ISLOADING')
    expect(pv_v_v.type).toBe('VALUE')
    expect(pv_v_v.value).toBe(10)
    expect(pv_v_f.type).toBe('FAILURE')
    expect(pv_v_f.failure).toBeInstanceOf(Error)
    expect(pv_v_f.failure.message).toBe('test error')
  })

  it('and should return appropiate value', () => {
    const pv_1_l = propertyUtils.loading<number, Error>()
    const pv_1_v = propertyUtils.value<number, Error>(10)
    const pv_1_f = propertyUtils.failure<number, Error>(new Error('Test 1'))

    const pv_2_l = propertyUtils.loading<number, Error>()
    const pv_2_v = propertyUtils.value<number, Error>(20)
    const pv_2_f = propertyUtils.failure<number, Error>(new Error('Test 2'))

    expect(pv_1_l.and(pv_2_l).type).toBe('ISLOADING')
    expect(pv_1_l.and(pv_2_v).type).toBe('ISLOADING')
    expect(pv_1_l.and(pv_2_f).type).toBe('ISLOADING')

    expect(pv_1_v.and(pv_2_l).type).toBe('ISLOADING')
    expect(pv_1_v.and(pv_2_v).type).toBe('VALUE')
    expect(pv_1_v.and(pv_2_v).value).toStrictEqual([10, 20])
    expect(pv_1_v.and(pv_2_f).type).toBe('FAILURE')
    expect(pv_1_v.and(pv_2_f).failure.message).toBe('Test 2')

    expect(pv_1_f.and(pv_2_l).type).toBe('ISLOADING')
    expect(pv_1_f.and(pv_2_v).type).toBe('FAILURE')
    expect(pv_1_f.and(pv_2_f).type).toBe('FAILURE')
    expect(pv_1_f.and(pv_2_f).failure.message).toBe('Test 1')

    expect(pv_1_l.and(pv_2_l).type).toBe('ISLOADING')
    expect(pv_1_v.and(pv_2_l).type).toBe('ISLOADING')
    expect(pv_1_f.and(pv_2_l).type).toBe('ISLOADING')

    expect(pv_1_l.and(pv_2_v).type).toBe('ISLOADING')
    expect(pv_1_v.and(pv_2_v).value).toStrictEqual([10, 20])
    expect(pv_1_f.and(pv_2_v).type).toBe('FAILURE')
    expect(pv_1_f.and(pv_2_v).failure.message).toBe('Test 1')

    expect(pv_1_l.and(pv_2_f).type).toBe('ISLOADING')
    expect(pv_1_v.and(pv_2_f).failure.message).toBe('Test 2')
    expect(pv_1_f.and(pv_2_f).failure.message).toBe('Test 1')
  })
})

describe('useProperty', () => {
  it('should', () => {
    const { result } = renderHook(() => {
      const [state, setState] = useState(5)

      const [property1, propertyFn] = useProperty<number, Error>('test', state)

      return {
        state,
        setState,
        property1,
        propertyFn,
      }
    })

    act(() => {
      result.current.setState(2)
    })
  })
})
// describe('useProperty', () => {
//   it('should set value on mapped downstream when upstream is changed', () => {
//     const { result } = renderHook(() => {
//       const [state1, setState1] = useProperty<number, Error>('test', 5)

//       const [state2, setState2] = useProperty(
//         'test',
//         setState1.map((item) => 'kukucs: ' + item * 2)
//       )

//       return {
//         state1,
//         setState1,
//         state2,
//         setState2,
//       }
//     })

//     expect(result.current.state1.value).toBe(5)
//     expect(result.current.state2.value).toBe('kukucs: 10')

//     act(() => {
//       result.current.setState1.setLoading()
//     })

//     expect(result.current.state1.isLoading).toBe(true)
//     expect(result.current.state2.isLoading).toBe(true)

//     act(() => {
//       result.current.setState1.setValue(20)
//     })

//     expect(result.current.state1.value).toBe(20)
//     expect(result.current.state2.value).toBe('kukucs: 40')

//     act(() => {
//       result.current.setState1.setFailure(new Error('test'))
//     })

//     expect(result.current.state1.failure).toBeInstanceOf(Error)
//     expect(result.current.state1.failure.message).toBe('test')

//     expect(result.current.state2.failure).toBeInstanceOf(Error)
//     expect(result.current.state2.failure.message).toBe('test')
//   })

//   it('should set value on mapped downstream with the downstream setters', () => {
//     const { result } = renderHook(() => {
//       const [state1, setState1] = useProperty<number, Error>('test', 5)

//       const [state2, setState2] = useProperty(
//         'test',
//         state1.map((item) => 'kukucs: ' + item * 2)
//       )

//       return {
//         state1,
//         setState1,
//         state2,
//         setState2,
//       }
//     })

//     expect(result.current.state1.value).toBe(5)
//     expect(result.current.state2.value).toBe('kukucs: 10')

//     act(() => {
//       result.current.setState2.setLoading()
//     })

//     expect(result.current.state1.isLoading).toBe(false)
//     expect(result.current.state2.isLoading).toBe(true)

//     act(() => {
//       result.current.setState2.setValue('kukucs: 30')
//     })

//     expect(result.current.state1.value).toBe(5)
//     expect(result.current.state2.value).toBe('kukucs: 30')

//     act(() => {
//       result.current.setState2.setFailure(new Error('test'))
//     })

//     expect(result.current.state1.failure).toBe(undefined)

//     expect(result.current.state2.failure).toBeInstanceOf(Error)
//     expect(result.current.state2.failure.message).toBe('test')
//   })

//   it('should set value on mapped downstream when upstream changes even after the downstream already changed from the upstream', () => {
//     const { result } = renderHook(() => {
//       const [state1, setState1] = useProperty<number, Error>('test', 5)

//       const [state2, setState2] = useProperty(
//         'test',
//         state1.map((item) => 'kukucs: ' + item * 2)
//       )

//       return {
//         state1,
//         setState1,
//         state2,
//         setState2,
//       }
//     })

//     expect(result.current.state1.value).toBe(5)
//     expect(result.current.state2.value).toBe('kukucs: 10')

//     act(() => {
//       result.current.setState2.setValue('Kukucs: 10')
//       result.current.setState1.setLoading()
//     })

//     expect(result.current.state1.isLoading).toBe(true)
//     expect(result.current.state2.isLoading).toBe(true)

//     act(() => {
//       result.current.setState2.setValue('Kukucs: 10')
//       result.current.setState1.setValue(20)
//     })

//     expect(result.current.state1.value).toBe(20)
//     expect(result.current.state2.value).toBe('kukucs: 40')

//     act(() => {
//       result.current.setState2.setValue('Kukucs: 10')
//       result.current.setState1.setFailure(new Error('test'))
//     })

//     expect(result.current.state2.failure).toBeInstanceOf(Error)
//     expect(result.current.state2.failure.message).toBe('test')
//   })
// })
