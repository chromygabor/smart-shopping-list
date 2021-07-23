import { Lens, Getter } from 'monocle-ts'
import { useStream } from '../common/LensStream'
import { renderHook, act } from '@testing-library/react-hooks'

describe('Stream', () => {
  interface Street {
    num: number
    name: string
  }
  interface Address {
    city: string
    street: Street
  }
  interface Company {
    name: string
    address: Address
  }
  interface Employee {
    name: string
    company: Company
  }

  const defaultValue: Employee = {
    name: 'Chromy Gabor',
    company: {
      name: 'MSCI',
      address: {
        city: 'Budapest',
        street: {
          name: 'Kassák Lajos',
          num: 19,
        },
      },
    },
  }

  it('should initialize isLoading if defaultValue is undefined', () => {
    const { result } = renderHook(() => {
      const strEmployee = useStream<Employee>()

      const strName = strEmployee.map((employee: Employee) => employee.name)
      return { strEmployee, strName }
    })

    expect(result.current.strEmployee.isLoading).toBe(true)
    expect(result.current.strEmployee.data).toBe(undefined)
    expect(result.current.strEmployee.failure).toBe(undefined)

    expect(result.current.strName.isLoading).toBe(true)
    expect(result.current.strName.data).toBe(undefined)
    expect(result.current.strName.failure).toBe(undefined)
  })

  it('should initialize asynchronuosly', async () => {
    const { result, waitForValueToChange } = renderHook(() => {
      const strEmployee = useStream<Employee>({
        defaultValue,
        callback: ({ emit }) => {
          emit({
            name: 'Gabor Chromy',
            company: {
              name: 'MSCI',
              address: {
                city: 'Budapest',
                street: {
                  name: 'Kassák Lajos',
                  num: 19,
                },
              },
            },
          })
        },
      })

      const strName = strEmployee.map((employee: Employee) => employee.name)
      return { strEmployee, strName }
    })

    expect(result.current.strName.isLoading).toBe(false)
    expect(result.current.strName.data).toBe('Gabor Chromy')
    expect(result.current.strName.failure).toBe(undefined)
  })
  describe('.mapB', () => {
    it('should update upstream ', async () => {
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.mapB(Lens.fromProp<Employee>()('name'))
        return { strEmployee, strName }
      })

      act(() => {
        result.current.strName.loading()
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strName.isLoading).toBe(true)
      expect(result.current.strName.data).toBe(undefined)
      expect(result.current.strName.failure).toBe(undefined)
    })

    it('should update upstream ', async () => {
      const lens = Lens.fromProp<Employee>()('name')
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.mapB(lens)
        return { strEmployee, strName }
      })

      act(() => {
        result.current.strName.emit('Gabor Chromy')
      })

      const expectedValue = lens.set('Gabor Chromy')(defaultValue)

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(expectedValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strName.isLoading).toBe(false)
      expect(result.current.strName.data).toBe('Gabor Chromy')
      expect(result.current.strName.failure).toBe(undefined)
    })
    it('should update upstream', async () => {
      const lens = Lens.fromProp<Employee>()('name')
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.mapB(lens)
        return { strEmployee, strName }
      })

      act(() => {
        result.current.strName.emit(new Error('Failure test'))
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strName.isLoading).toBe(false)
      expect(result.current.strName.data).toBe(undefined)
      expect(result.current.strName.failure).toBeInstanceOf(Error)
      expect(result.current.strName.failure.message).toBe('Failure test')
    })
  })

  describe('.map', () => {
    it('should not update upstream on loading', async () => {
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.map((employee: Employee) => employee.name)
        const strNameB = strEmployee.mapB(Lens.fromProp<Employee>()('name'))
        return { strEmployee, strName, strNameB }
      })

      act(() => {
        result.current.strName.loading()
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strName.isLoading).toBe(true)
      expect(result.current.strName.data).toBe(undefined)
      expect(result.current.strName.failure).toBe(undefined)
    })

    it('should not update upstream on emit', async () => {
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.map((employee: Employee) => employee.name)
        const strNameB = strEmployee.mapB(Lens.fromProp<Employee>()('name'))
        return { strEmployee, strName, strNameB }
      })

      act(() => {
        result.current.strName.emit('Gabor Chromy')
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strName.isLoading).toBe(false)
      expect(result.current.strName.data).toBe('Gabor Chromy')
      expect(result.current.strName.failure).toBe(undefined)
    })

    it('should not update upstream on failure', async () => {
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.map((employee: Employee) => employee.name)
        const strNameB = strEmployee.mapB(Lens.fromProp<Employee>()('name'))
        return { strEmployee, strName, strNameB }
      })

      act(() => {
        result.current.strName.emit(new Error('Failure test'))
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strName.isLoading).toBe(false)
      expect(result.current.strName.data).toBe(undefined)
      expect(result.current.strName.failure).toBeInstanceOf(Error)
      expect(result.current.strName.failure.message).toBe('Failure test')
    })

    it('should update downstream ', async () => {
      const lens = Lens.fromProp<Employee>()('name')
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.map(lens.asGetter().get)
        return { strEmployee, strName }
      })

      act(() => {
        result.current.strEmployee.loading()
      })

      expect(result.current.strName.isLoading).toBe(true)
      expect(result.current.strName.data).toBe(undefined)
      expect(result.current.strName.failure).toBe(undefined)

      const expectedValue = lens.set('Gabor Chromy')(defaultValue)

      act(() => {
        result.current.strEmployee.emit(expectedValue)
      })

      expect(result.current.strName.isLoading).toBe(false)
      expect(result.current.strName.data).toBe('Gabor Chromy')
      expect(result.current.strName.failure).toBe(undefined)

      act(() => {
        result.current.strName.emit(new Error('Failure test'))
      })

      expect(result.current.strName.isLoading).toBe(false)
      expect(result.current.strName.data).toBe(undefined)
      expect(result.current.strName.failure).toBeInstanceOf(Error)
      expect(result.current.strName.failure.message).toBe('Failure test')
    })

    it('should update downstream if upstream changes', async () => {
      const lens = Lens.fromProp<Employee>()('name')
      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const strName = strEmployee.map(lens.asGetter().get)
        return { strEmployee, strName }
      })

      act(() => {
        result.current.strName.loading()
      })

      expect(result.current.strName.isLoading).toBe(true)
      expect(result.current.strName.data).toBe(undefined)
      expect(result.current.strName.failure).toBe(undefined)

      const expectedValue = lens.set('Gabor Chromy')(defaultValue)

      act(() => {
        result.current.strEmployee.emit(expectedValue)
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(expectedValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strName.isLoading).toBe(false)
      expect(result.current.strName.data).toBe('Gabor Chromy')
      expect(result.current.strName.failure).toBe(undefined)
    })
  })

  describe('work with more complex cases', () => {
    const defaultValue: Street[] = [
      {
        name: 'Kassák Lajos',
        num: 19,
      },
      {
        name: 'Szíjgyártó',
        num: 10,
      },
      {
        name: 'Pozsonyi',
        num: 6,
      },
    ]

    const get: (streets: Street[]) => Street = (streets: Street[]) => {
      return streets[0]
    }

    const set: (street: Street) => (streets: Street[]) => Street[] =
      (street: Street) => (streets: Street[]) => {
        return [street, ...streets.slice(1)]
      }

    const lens = new Lens<Street[], Street>(get, set)

    it('should work with find one in a list', async () => {
      const { result } = renderHook(() => {
        const strStreets = useStream({ defaultValue })

        const strStreet = strStreets.mapB(lens)
        return {
          strStreets,
          strStreet,
        }
      })

      expect(result.current.strStreet.isLoading).toBe(false)
      expect(result.current.strStreet.data).toStrictEqual({
        name: 'Kassák Lajos',
        num: 19,
      })
      expect(result.current.strStreet.failure).toBe(undefined)

      act(() => {
        result.current.strStreet.loading()
      })

      expect(result.current.strStreet.isLoading).toBe(true)
      expect(result.current.strStreet.data).toBe(undefined)
      expect(result.current.strStreet.failure).toBe(undefined)

      act(() => {
        result.current.strStreet.emit({
          name: 'Kassai',
          num: 13,
        })
      })

      const expectedValue = lens.set({
        name: 'Kassai',
        num: 13,
      })(defaultValue)

      expect(result.current.strStreets.isLoading).toBe(false)
      expect(result.current.strStreets.data).toStrictEqual(expectedValue)
      expect(result.current.strStreets.failure).toBe(undefined)

      expect(result.current.strStreet.isLoading).toBe(false)
      expect(result.current.strStreet.data).toStrictEqual({
        name: 'Kassai',
        num: 13,
      })
      expect(result.current.strStreet.failure).toBe(undefined)
    })
  })
  describe('.and should combine two streams into one and', () => {
    it('should be isLoading if any of the stream is loading', () => {
      const lens = Lens.fromProp<Employee>()('name')

      const modifiedDefaultValue = lens.set('Gabor Chromy')(defaultValue)

      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })
        const strEmployee2 = useStream<Employee>({
          defaultValue: modifiedDefaultValue,
        })

        const andStream = strEmployee.and(strEmployee2)

        return { strEmployee, strEmployee2, andStream }
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strEmployee2.isLoading).toBe(false)
      expect(result.current.strEmployee2.data).toStrictEqual(
        modifiedDefaultValue
      )
      expect(result.current.strEmployee2.failure).toBe(undefined)

      expect(result.current.andStream.isLoading).toBe(false)
      expect(result.current.andStream.data).toStrictEqual([
        defaultValue,
        modifiedDefaultValue,
      ])
      expect(result.current.andStream.failure).toBe(undefined)

      act(() => {
        result.current.strEmployee.loading()
      })

      expect(result.current.strEmployee.isLoading).toBe(true)
      expect(result.current.strEmployee.data).toBe(undefined)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strEmployee2.isLoading).toBe(false)
      expect(result.current.strEmployee2.data).toStrictEqual(
        modifiedDefaultValue
      )
      expect(result.current.strEmployee2.failure).toBe(undefined)

      expect(result.current.andStream.isLoading).toBe(true)
      expect(result.current.andStream.data).toBe(undefined)
      expect(result.current.andStream.failure).toBe(undefined)

      act(() => {
        result.current.strEmployee.emit(defaultValue)
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strEmployee2.isLoading).toBe(false)
      expect(result.current.strEmployee2.data).toStrictEqual(
        modifiedDefaultValue
      )
      expect(result.current.strEmployee2.failure).toBe(undefined)

      expect(result.current.andStream.isLoading).toBe(false)
      expect(result.current.andStream.data).toStrictEqual([
        defaultValue,
        modifiedDefaultValue,
      ])
      expect(result.current.andStream.failure).toBe(undefined)

      act(() => {
        result.current.strEmployee2.loading()
      })

      expect(result.current.strEmployee.isLoading).toBe(false)
      expect(result.current.strEmployee.data).toStrictEqual(defaultValue)
      expect(result.current.strEmployee.failure).toBe(undefined)

      expect(result.current.strEmployee2.isLoading).toBe(true)
      expect(result.current.strEmployee2.data).toBe(undefined)
      expect(result.current.strEmployee2.failure).toBe(undefined)

      expect(result.current.andStream.isLoading).toBe(true)
      expect(result.current.andStream.data).toBe(undefined)
      expect(result.current.andStream.failure).toBe(undefined)
    })

    it('should be in loading if any of the streams is in loading', () => {
      const lens = Lens.fromProp<Employee>()('name')

      const modifiedDefaultValue = lens.set('Gabor Chromy')(defaultValue)

      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>()
        const strEmployee2 = useStream<Employee>()

        const andStream = strEmployee.and(strEmployee2)

        return { strEmployee, strEmployee2, andStream }
      })

      expect(result.current.andStream.isLoading).toBe(true)
      expect(result.current.andStream.data).toBe(undefined)
      expect(result.current.andStream.failure).toBe(undefined)

      act(() => {
        result.current.strEmployee.emit(defaultValue)
      })

      expect(result.current.andStream.isLoading).toBe(true)
      expect(result.current.andStream.data).toBe(undefined)
      expect(result.current.andStream.failure).toBe(undefined)

      act(() => {
        result.current.strEmployee.emit(new Error('Test error'))
      })

      expect(result.current.andStream.isLoading).toBe(true)
      expect(result.current.andStream.data).toBe(undefined)
      expect(result.current.andStream.failure).toBe(undefined)
    })

    it.skip('should not update upstream on loading', async () => {})

    it.skip('should not update upstream  on emit', async () => {})

    it.skip('should not update upstream with on failure', async () => {})

    it.skip('should update downstream ', async () => {})

    it.skip('should update downstream if upstream changes', async () => {})
  })
  describe('reduce', () => {
    it('should start with initial value and apply all changes on the accumulated value', () => {
      const lens = Lens.fromProp<Employee>()('name')
      const modifiedDefaultValue = lens.set('Gabor Chromy')(defaultValue)

      const { result } = renderHook(() => {
        const strEmployee = useStream<Employee>({ defaultValue })

        const reduced = strEmployee.fold<Employee[]>((prev, item) => {
          return [...(prev ? prev : []), item]
        })

        return { strEmployee, reduced }
      })

      expect(result.current.reduced.isLoading).toBe(false)
      expect(result.current.reduced.data).toStrictEqual([defaultValue])
      expect(result.current.reduced.failure).toBe(undefined)

      act(() => {
        result.current.strEmployee.loading()
      })

      expect(result.current.reduced.isLoading).toBe(true)
      expect(result.current.reduced.data).toBe(undefined)
      expect(result.current.reduced.failure).toBe(undefined)

      act(() => {
        result.current.strEmployee.emit(modifiedDefaultValue)
      })

      expect(result.current.reduced.isLoading).toBe(false)
      expect(result.current.reduced.data).toStrictEqual([
        defaultValue,
        modifiedDefaultValue,
      ])
      expect(result.current.reduced.failure).toBe(undefined)
    })
    it.skip('should not update upstream on loading', async () => {})

    it.skip('should not update upstream  on emit', async () => {})

    it.skip('should not update upstream with on failure', async () => {})

    it.skip('should update downstream ', async () => {})

    it.skip('should update downstream if upstream changes', async () => {})
  })
})
