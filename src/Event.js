import {Attribute} from './vtree'

// TODO private
// TODO fix global
// TODO test
// TODO document
/* global Event */


export function delegate (type, trsf, opts = {}) {
  return Attribute.Event((ev) => {
    if (trsf) {
      delegate.data = trsf(ev)
    }

    ev.target.dispatchEvent(delegate)
    if (opts.preventDefault !== false) {
      ev.stopPropagation()
    }

    if (opts.preventDefault !== false) {
      ev.preventDefault()
    }

    const newEv = makeEvent(Event, type, trsf(ev))
    ev.currentTarget.dispatchEvent(newEv)
  })
}


export function maybeDelegate (type, trsf, opts = {}) {
  return Attribute.Event((ev) => {
    if (opts.preventDefault !== false) {
      ev.stopPropagation()
    }

    if (opts.preventDefault !== false) {
      ev.preventDefault()
    }

    const data = trsf(ev)
    if (data !== undefined) {
      const newEv = makeEvent(Event, type, data)
      ev.currentTarget.dispatchEvent(newEv)
    }
  })
}


function makeEvent (Event, type, data) {
  const ev = new Event(type, {bubbles: true})
  ev.data = data
  return ev
}
