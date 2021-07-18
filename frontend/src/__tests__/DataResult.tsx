// import '@testing-library/jest-dom'
// import { render, screen } from '@testing-library/react'
// import { DataResult, useDataResult } from '../common/MyDataResult'
// import userEvent from '@testing-library/user-event'
// import { useEffect } from 'react'

// type State = {
//   text: string
//   number: number
// }

// type Payload = {
//   text: string
// }

// export interface ITestComponentProps<T> {
//   setOutput: (state: DataResult<T, Payload>) => void
//   mapper: (state: State) => T
// }

// const TestComponent: React.FC<ITestComponentProps<State>> = ({
//   setOutput,
//   mapper,
// }: ITestComponentProps<State>) => {
//   const { completed, failure, setLoading, state } = useDataResult<
//     State,
//     Payload
//   >(
//     {
//       text: 'This the payload',
//     },
//     false
//   )

//   const mapped = state.map(mapper)
//   useEffect(() => setOutput(mapped), [mapped])

//   return (
//     <>
//       <button onClick={() => setLoading()}>Loading</button>
//       <button
//         onClick={() =>
//           completed({
//             text: 'completed',
//             number: 10,
//           })
//         }
//       >
//         Complete
//       </button>
//       <button onClick={() => failure(new Error('test'))}>Failure</button>
//     </>
//   )
// }

// describe('DataResult', () => {
//   var output: DataResult<State, Payload>

//   it('should be initialized to proper values', () => {
//     render(
//       <TestComponent
//         setOutput={(state) => (output = state)}
//         mapper={(state: State) => ({
//           text: state.text + ' mapped',
//           number: state.number * 10,
//         })}
//       />
//     )

//     const loading = screen.getByText('Loading')
//     const complete = screen.getByText('Complete')
//     const failure = screen.getByText('Failure')

//     //userEvent.click(button)
//     expect(output.isLoading).toBe(false)
//     expect(output.payload).toStrictEqual({ text: 'This the payload' })
//     expect(output.data).toBe(undefined)
//     expect(output.error).toBe(undefined)
//     expect(output.prevData).toBe(undefined)
//     console.log(output)
//   })

//   it('should be modify to loading', () => {
//     render(
//       <TestComponent
//         setOutput={(state) => (output = state)}
//         mapper={(state: State) => ({
//           text: state.text + ' mapped',
//           number: state.number * 10,
//         })}
//       />
//     )

//     const loading = screen.getByText('Loading')
//     const complete = screen.getByText('Complete')
//     const failure = screen.getByText('Failure')
//     userEvent.click(loading)
//     expect(output.isLoading).toBe(true)
//     expect(output.payload).toStrictEqual({ text: 'This the payload' })
//     expect(output.data).toBe(undefined)
//     expect(output.error).toBe(undefined)
//     expect(output.prevData).toBe(undefined)
//     console.log(output)
//   })
// })
