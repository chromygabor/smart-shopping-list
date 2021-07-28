interface IStreamData<T> {
  (value?: T): void
  setName(name: string): void
}

class StreamData<T> {
  private constructor(
    // constructable via `create()`
    private name = 'world'
  ) {}

  public call(value?: T): void {
    console.log(`Hello ${this.name}!`)
  }

  public setName(name: string) {
    this.name = name
  }

  public static create<T>(): IStreamData<T> {
    const instance = new StreamData<T>()
    return Object.assign((value?: T) => instance.call(value), {
      setName: (name: string) => instance.setName(name),
      // ... forward other methods
    })
  }
}

const stream = StreamData.create()
stream() // prints 'Hello world!'
stream('Dolly')
stream() // prints 'Hello Dolly!'

export default StreamData
