In FP-TS

```ts
/**
 * A Functor is a type constructor which supports a mapping operation
 *
 * `map` turns functions (a -> b) into (f a -> f b)
 * `f` represents "some computational context"
 *
 * Instances must satisfy the following laws:
 *
 * 1. Identity: `F.map(fa, a => a) <-> fa`
 * 2. Composition: `F.map(fa, a => bc(ab(a))) <-> F.map(F.map(fa, ab), bc)`
 *
 */
interface Functor<F> {
  readonly URI: F
  readonly map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>
}

/**
 * The `Apply` class provides the `ap` which is used to apply a function to an argument under a type constructor.
 *
 * `Apply` can be used to lift functions of two or more arguments to work on values wrapped with the type constructor `f`.
 *
 * LAWS:
 *
 * 1. Associative composition:
 * F.ap(F.ap(F.map(fbc, bc => ab => a => bc(ab(a))), fab), fa)
 *                            =~=
 *                   F.ap(fbc, F.ap(fab, fa))
 *
 * Formally, `Apply` represents a strong lax semi-monoidal endofunctor.
 *
 */
interface Apply<F> extends Functor<F> {
  readonly ap: <A, B>(fab: Kind<F, (a: A) => B>, fa: Kind<F, A>) => Kind<F, B>
}

/**
 * The `Applicative` type class extends the `Apply` type class with a `of` function, which can be used to create values
 * of type `f a` from values of type `a`.
 *
 * Where `Apply` provides the ability to lift functions of two or more arguments to functions whose arguments are
 * wrapped using `f`, and `Functor` provides the ability to lift functions of one argument, `pure` can be seen as the
 * function which lifts functions of _zero_ arguments. That is, `Applicative` functors support a lifting operation for
 * any number of function arguments.
 *
 * Instances must satisfy the following laws in addition to the `Apply` laws:
 *
 * 1. Identity: `A.ap(A.of(a => a), fa) <-> fa`
 * 2. Homomorphism: `A.ap(A.of(ab), A.of(a)) <-> A.of(ab(a))`
 * 3. Interchange: `A.ap(fab, A.of(a)) <-> A.ap(A.of(ab => ab(a)), fab)`
 *
 * Note. `Functor`'s `map` can be derived: `A.map(x, f) = A.ap(A.of(f), x)`
 *
 * @since 2.0.0
 */
interface Applicative<F> extends Apply<F> {
  readonly of: <A>(a: A) => Kind<F, A>
}

/**
 * The `Chain` type class extends the `Apply` type class with a `chain` operation which composes computations in
 * sequence, using the return value of one computation to determine the next computation.
 *
 * Instances must satisfy the following law in addition to the `Apply` laws:
 *
 * 1. Associativity: `F.chain(F.chain(fa, afb), bfc) <-> F.chain(fa, a => F.chain(afb(a), bfc))`
 *
 * Note. `Apply`'s `ap` can be derived: `(fab, fa) => F.chain(fab, f => F.map(fa, f))`
 */
interface Chain<F> extends Apply<F> {
  readonly chain: <A, B>(fa: Kind<F, A>, f: (a: A) => Kind<F, B>) => Kind<F, B>
}

/**
 * The `Monad` type class combines the operations of the `Chain` and `Applicative` type classes.
 * Therefore, `Monad` instances represent type constructors which support sequential composition,
 * and also lifting of functions of arbitrary arity.
 *
 * Instances must satisfy the following laws in addition to the `Applicative` and `Chain` laws:
 *
 * 1. Left identity: `M.chain(M.of(a), f) <-> f(a)`
 * 2. Right identity: `M.chain(fa, M.of) <-> fa`
 *
 * Note. `Functor`'s `map` can be derived: `A.map = (fa, f) => A.chain(fa, a => A.of(f(a)))`
 */
interface Monad<F> extends Applicative<F>, Chain<F> {}
```

### What are the natural transformations?

They're whatever the natural transformations are for that endofunctor... :)

> In practice, we represent these going "up" or "down" a heirarchy of endofunctors.

```
Up   == "return" (of/pure for Applicative)
Down == "bind"   (flatten/chain for Chain)
```

### The "Maybe" monad

- In a world of effectful programs, we may want to represent a notion of "failure"

The essence of "Maybe"

```ts
if (isNothing(fa)) {
  return nothing
}
```

### Variations in Haskell

Haskell has several operators which operate on Monads/Functors.

```
| sym  | pronunciation                      | signature                             |
| ---- | ---------------------------------- | ------------------------------------- |
| <=<  | "left fish"                         | (b -> m c) -> (a -> m b) -> a -> m c  |
| >=>  | "right fish"                        | (a -> m b) -> (b -> m c) -> a -> m c  |
| >>=  | "bind" or "sequence"               | m a -> (a -> m b) -> m b              |
| <*>  | "ap" or "apply"                    | f (a -> b) -> f a -> f b              |
| <|>  | "or", "alt", or "alternative"      | f a -> f a -> f a                     |
| <$>  | "fmap", "functor map", "infix map"  | (a -> b) -> f a -> f b                |
```

### Monad laws

```
# bind

return a >>= k                  =  k a
m        >>= return             =  m
m        >>= (\x -> k x >>= h)  =  (m >>= k) >>= h


# left fish
f <=< (g <=< h) === (f <=< g) <=< h

```

### Resources:

- [Category Theory 10.1: Monads - Bartosz Milewski - YouTube](https://www.youtube.com/watch?v=gHiyzctYqZ0)
- [Brian Beckman: Don’t fear the Monad - YouTube](https://www.youtube.com/watch?v=ZhuHCtR3xq8)
- [Fantas, Eel, and Specification 15: Monad · Tom Harding](http://www.tomharding.me/2017/06/05/fantas-eel-and-specification-15/)
- [A Fistful of Monads - Learn You a Haskell for Great Good!](http://learnyouahaskell.com/a-fistful-of-monads)
- [Getting started with fp-ts: Monad - DEV](https://dev.to/gcanti/getting-started-with-fp-ts-monad-6k)
- Comprehending Monads: https://ncatlab.org/nlab/files/WadlerMonads.pdf (you’ll learn the relationship between list comprehensions and monads)
- Monads for functional programming: https://homepages.inf.ed.ac.uk/wadler/papers/marktoberdorf/baastad.pdf
