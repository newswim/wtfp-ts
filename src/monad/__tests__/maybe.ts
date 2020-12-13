import * as laws from 'fp-ts-laws'
import * as fc from 'fast-check'

import { eqString } from 'fp-ts/lib/Eq'
import { Monad } from '../Monad'
import { maybe as M, getEq } from '../Maybe'
import { HKT, Kind } from 'fp-ts/HKT'

const URI = 'Maybe'
type URI = typeof URI

// describe('my maybe monad instance', () => {
//   it('should test Monad laws', () => {
//     const monadSpace: Monad<URI> = M

//     laws.monad(monadSpace)(getEq)
//   })
// })
