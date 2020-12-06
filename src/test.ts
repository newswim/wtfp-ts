import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'

declare const foo: O.Option<number>

// Monads

interface User {
  name: string
  cats: number
}

const example: O.Option<User> = pipe(O.some({ name: 'bob', cats: 4 }))

const frank = 'frank'

function passByRef(s: string) {
  s = 'bob'

  return s
}

passByRef(frank) //?

frank //?
