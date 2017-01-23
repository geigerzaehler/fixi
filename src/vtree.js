import {makeSum} from 'sum-types'

/**
 * This module defines the data structures for the virtual DOM tree and
 * exports function for equality comparison.
 */

// TODO add assertions for constructors
export const Tree = makeSum({
  Element: ['tag', 'props', 'children'],
  Text: ['text'],
  Component: ['mount', 'key', 'events'],
  Thunk: ['render', 'value', 'eq'],
  Raw: ['create'],
})

// TODO add assertions for constructors
export const Attribute = makeSum({
  Attribute: ['value'],
  Property: ['value'],
  Event: ['handler'],
})


// TODO handle events and key
export function componentEqual (c1, c2) {
  return c1.mount === c2.mount
}


export function thunkEqual (t1, t2) {
  return t2.eq(t1.value, t2.value)
}
