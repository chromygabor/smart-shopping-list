import * as React from 'react'

export interface ITestComponentProps {}

const TestComponent: React.FC<ITestComponentProps> = (
  props: ITestComponentProps
) => {
  return (
    <div>
      <p>Component</p>
    </div>
  )
}

export default TestComponent
