import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useDataResult } from '../common/MyDataResult'
import userEvent from '@testing-library/user-event'

export interface ITestComponentProps {}

type State = {
  text: string
  number: number
}

type Payload = {
  text: string
}

const TestComponent: React.FC<ITestComponentProps> = (
  props: ITestComponentProps
) => {
  const { completed, failure, state } = useDataResult<State, Payload>(
    {
      text: 'This the payload',
    },
    true
  )

  const handleClick = (params) => {
    // if (state.data) {
    //   failure(new Error('Test'))
    // } else {
    //   completed({
    //     text: 'completed',
    //     number: 10,
    //   })
    // }
    console.log('HandleClick')
  }

  return (
    <>
      <button onClick={handleClick}>Click me</button>
    </>
  )
}

describe('Page', () => {
  render(<TestComponent />)

  const button = screen.getByText('Click me')

  it('should be rendered', async () => {
    userEvent.click(button)
  })
})
