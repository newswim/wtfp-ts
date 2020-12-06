import { Applicative } from './Applicative'
import { Chain } from './Chain'
import { URIS } from 'fp-ts/HKT'

export interface Monad<F extends URIS> extends Applicative<F>, Chain<F> {}
