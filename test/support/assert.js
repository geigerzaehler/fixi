import sinon from 'sinon'
import {assert} from 'chai'

export function calledOnceWith (spy, ...args) {
  sinon.assert.calledOnce(spy)
  sinon.assert.calledWith(spy, ...args)
}

export function equal (a, b, message) {
  assert.deepEqual(a, b, message)
}

export function notEqual (a, b, message) {
  assert.notDeepEqual(a, b, message)
}

export function same (a, b, message) {
  assert.strictEqual(a, b, message)
}

export function notSame (a, b, message) {
  assert.notStrictEqual(a, b, message)
}

export function hasSelector (elem, selector) {
  const result = elem.querySelector(selector)
  assert(result, `Unable to find element ${selector}`)
}

export function notHasSelector (elem, selector) {
  const result = elem.querySelector(selector)
  assert(!result, `Element has selector ${selector}`)
}
