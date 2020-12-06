import { Do } from 'fp-ts-contrib/lib/Do'
import { either, Either, right, left, getValidation } from 'fp-ts/lib/Either'
import { getMonoid } from 'fp-ts/lib/Array'

// https://paulgray.net/notes/do-validation

type Form = {
  name: string
  startDate: string
  endDate: string
}

type ValidatedForm = {
  name: string
  start: Date
  end: Date
}

function foo() {}

/**
 * Returns a left value if the string is empty,
 * and a right if the string is not empty.
 */
function nonEmpty(error: string, s: string): Either<string[], string> {
  return s === '' ? left([error]) : right(s)
}

/**
 * Returns a left value if the string is not a valid date
 * right, with the parsed date if it is
 */
function isDate(error: string, dateStr: string): Either<string[], Date> {
  const date = Date.parse(dateStr)
  return isNaN(date) ? left([error]) : right(new Date(date))
}

/**
 * Returns a left value if the start date is not before the end date,
 * a right value of number if it is (the number represents the number
 * of milliseconds in between the dates).
 */
function isBefore(
  error: string,
  start: Date,
  end: Date
): Either<string[], number> {
  const difference = end.getTime() - start.getTime()
  return difference > 0 ? right(difference) : left([error])
}

/**
 * This form for a has a few requirements:
 * 1. eventName is not empty
 * 2. startDate is a valid date
 * 3. endDate is a valid date
 * 4. startDate is before endDate
 * 5. The event cannot be longer than 30 minutes
 *
 * This function takes a Form and returns
 *   an Either<string[], ValidatedForm>
 * If there is an error with the form, a left value will be returned,
 *   and it will contain a string description of the errors,
 * If the form is valid, then a right value will be returned,
 *   and it will contain the validated values.
 */
export const validateForm = (form: Form) =>
  Do(getValidation(getMonoid<string>()))
    .sequenceS({
      nameIsNotEmpty: nonEmpty('Name cannot be empty', form.name),
      start: isDate('Start date is invalid', form.startDate),
      end: isDate('End date is invalid', form.endDate),
    })
    .bindL('lengthOfEvent', ({ start, end }) =>
      isBefore('Start date must be before end date.', start, end)
    )
    .bindL('lengthIsValid', ({ lengthOfEvent }) =>
      lengthOfEvent / 1000 / 60 / 30 > 1
        ? left(['The event cannot be longer than 30 minutes'])
        : right(lengthOfEvent)
    )
    .return(({ start, end }) => ({
      start,
      end,
      name: form.name,
    }))

validateForm({
  name: 'Event',
  startDate: '2020-03-27T01:35:00Z',
  endDate: '2020-03-27T01:45:00Z',
}) //?
// { _tag: 'Right',
//   right:
//    { start: 2020-03-27T01:35:00.000Z,
//      end: 2020-03-27T01:45:00.000Z,
//      name: 'Event' } }

validateForm({
  name: '',
  startDate: 'asdf',
  endDate: '2020-03-27T01:45:00Z',
})

// { _tag: 'Left',
// left: [ 'Name cannot be empty', 'Start date is invalid' ] }

validateForm({
  name: 'Event',
  startDate: '2020-03-27T01:35:00Z',
  endDate: '2020-03-27T02:55:00Z',
})

// { _tag: 'Left',
//   left: [ 'The event cannot be longer than 30 minutes' ] }

validateForm({
  name: 'Event',
  startDate: '2020-03-27T08:35:00Z',
  endDate: '2020-03-27T02:55:00Z',
})
// { _tag: 'Left',
//   left: [ 'Start date must be before end date.' ] }
