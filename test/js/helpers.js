import * as B from 'bluebird'

global.coit = function coit (desc, fn) {
  let run
  if (fn) {
    run = B.coroutine(fn)
  }

  it(desc, run)
}

global.coit.only = function onlyCoit (desc, fn) {
  let run
  if (fn) {
    run = B.coroutine(fn)
  }

  it.only(desc, run)
}

global.xcoit = global.xit
