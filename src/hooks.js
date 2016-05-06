import {stream} from 'kefir'
import {constant, defaults} from 'lodash'

export function eventStream (trsf) {
  return new EventStreamHook(trsf)
}

/**
 * @usage
 * ho('input', {
 *   input: evi((ev) => ev.target.value)
 * }).stream.onValue(({type, value}) => {
 *   if (type === 'input') {
 *     console.log('input event', value)
 *   }
 * })
 */
export function eventStreamInject (type, trsf) {
  if (typeof type !== 'string') {
    trsf = type
    type = null
  }
  trsf = trsf || id
  return eventStream((ev) => {
    return {
      type: type || ev.type,
      value: trsf(ev)
    }
  })
}

export function delegate (name, makeData, opts) {
  return new DelegateHook(name, makeData, opts)
}

class EventStreamHook {
  constructor (trsf) {
    this.trsf = trsf || id

    let hook = this
    this.stream = stream(function activate (emitter) {
      hook._subscribe(emitter)
      return () => hook._unsubscribe()
    })

    this._listener = (ev) => this._emitter.emit(this.trsf(ev))

    this._hook = noop
    this._unhook = noop
  }

  hook (node, name) {
    let listener = this._listener

    this._hook = function hook () {
      node.addEventListener(name, listener)
    }

    this._unhook = function unhook () {
      node.removeEventListener(name, listener)
    }

    if (this._emitter) {
      this._hook()
    }
  }

  unhook (node, name) {
    this._unhook()
    this._hook = noop
    this._unhook = noop
  }

  _subscribe (emitter) {
    this._emitter = emitter
    this._hook()
  }

  _unsubscribe () {
    this._emitter = null
    this._unhook()
  }
}


export function emit (stream) {
  return new StreamEmitter(stream)
}

class StreamEmitter {
  constructor (stream) {
    this._stream = stream
  }

  hook (node, name) {
    this._dispatch = function dispatch (value) {
      let ev = new Event(name, {bubbles: true})
      ev.data = value
      node.dispatchEvent(ev)
    }

    this._stream.onValue(this._dispatch)
  }

  unhook (node, name) {
    this._stream.offValue(this._dispatch)
  }
}

class DelegateHook {
  constructor (event, makeData, opts = {}) {
    defaults(opts, {
      preventDefault: true,
      stopPropagation: true,
    })

    if (typeof makeData !== 'function') {
      makeData = constant(makeData)
    }

    let {preventDefault, stopPropagation} = opts

    this.listener = (ev) => {
      if (preventDefault) {
        ev.preventDefault()
      }

      if (stopPropagation) {
        ev.stopPropagation()
      }

      /* global Event */
      let ev2 = new Event(event, {bubbles: true})
      ev2.data = makeData(ev)
      ev.target.dispatchEvent(ev2)
    }
  }

  hook (node, name) {
    node.addEventListener(name, this.listener)
  }

  unhook (node, name) {
    node.removeEventListener(name, this.listener)
  }

}

function id (x) { return x }

function noop () {}
