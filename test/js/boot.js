import * as B from 'bluebird'
import chai from 'chai'
import dirtyChai from 'dirty-chai'

chai.use(dirtyChai)

global.coit = function coit (desc, fn) {
  let run
  if (fn) {
    run = B.coroutine(fn)
  }

  it(desc, run)
}

global.fcoit = function onlyCoit (desc, fn) {
  let run
  if (fn) {
    run = B.coroutine(fn)
  }

  it.only(desc, run)
}

global.fit = function fit (...args) {
  it.only(...args)
}

global.xcoit = function xcoit (...args) {
  global.xit(...args)
}

global.fdescribe = function fdescribe (...args) {
  global.describe.only(...args)
}

