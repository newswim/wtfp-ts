In FP-TS

```ts
/**
 * A Functor is a type constructor which supports a mapping operation, @map
 *
 * @map turns functions (a -> b) into (f a -> f b)
 * `f` represents "some computational context"
 *
 * Instances must satisfy the following laws:
 *
 * 1. Identity: `F.map(fa, a => a) <-> fa`
 * 2. Composition: `F.map(fa, a => bc(ab(a))) <-> F.map(F.map(fa, ab), bc)`
 *
 */
export interface Functor<F> {
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
 *                            ==
 *                   F.ap(fbc, F.ap(fab, fa))
 *
 * Formally, `Apply` represents a strong lax semi-monoidal endofunctor. 🙄
 *
 */
export interface Apply<F> extends Functor<F> {
  readonly ap: <A, B>(fab: HKT<F, (a: A) => B>, fa: HKT<F, A>) => HKT<F, B>
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
export interface Applicative<F> extends Apply<F> {
  readonly of: <A>(a: A) => HKT<F, A>
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
export interface Chain<F> extends Apply<F> {
  readonly chain: <A, B>(fa: HKT<F, A>, f: (a: A) => HKT<F, B>) => HKT<F, B>
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
export interface Monad<F> extends Applicative<F>, Chain<F> {}
```

## The "essence" of Monad

A reasonable intuition is that a "monad" can be represented by the triple:

    monad = [endofunctor, naturalTransformationOne, naturalTransformationTwo]

### What is an endofunctor?

```
Functor {
  map: a -> b -> f a -> f b
}
```

```
Endofunctor {
  map: a -> a -> f a -> f a
}
```

is `toString()` an endofunctor?

```
toString: nonNull -> string
```

### What are the natural transformations?

They're whatever the natural transformations are for that endofunctor... :)

> In practice, we represent these going "up" or "down" a heirarchy of endofunctors.

```
Up == "return" (of/pure for Applicative)
Down == "bind" (flatten/chain for Chain)
```

### The "Maybe" monad

- In a world of effectful programs, we may want to represent a notion of "failure"

The essence of "Maybe"

```ts
if (isNothing(fa)) {
  return nothing
}
```
