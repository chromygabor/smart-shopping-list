import { useStream } from '../common/LensStream'
import { renderHook, act } from '@testing-library/react-hooks'
import Kefir, { Emitter, Event } from 'kefir'
import { useRef } from 'react'
describe('Kefir', () => {
  it.skip('should', async () => {
    //const stream = Kefir.sequentially(100, [1, 2, 3])
    const stream2 = Kefir.stream<number, Error>((emitter) => {
      // emitter.value(10)
      // emitter.value(20)
      // emitter.value(30)
      setTimeout(() => {
        emitter.value(10)
        setTimeout(() => {
          emitter.end()
        })
      })
      return () => {
        console.log('End Callback is called')
      }
    })

    //stream.log()
    stream2.log()

    // stream2.observe({
    //   value: (value) => {
    //     console.log(value)
    //   },
    // })

    await stream2.toPromise()
    console.log('End')
  })

  it('Hook', () => {
    const { result } = renderHook(() => {
      const ref = useRef<Emitter<number, Error>>()

      const stream = Kefir.stream<number, Error>((emitter) => {
        ref.current = emitter
        // setTimeout(() => {
        //   emitter.value(10)
        //   setTimeout(() => {
        //     emitter.end()
        //   })
        // })
        return () => {
          console.log('End Callback is called')
        }
      })

      return { stream, ref }
    })

    act(() => {
      result.current.ref.current.value(10)
      //result.current.strName.setLoading()
    })

    result.current.stream.log()
  })
})
