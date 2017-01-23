import * as K from 'kefir-extra'

export default class EventStreamPool {
  constructor () {
    this.listeners = {}
  }

  getEventStream (name) {
    let listener = this.listeners[name]
    if (!listener) {
      listener = this.listeners[name] = new Listener(name)
    }
    return listener.bus.stream
  }

  setTarget (target) {
    Object.keys(this.listeners).forEach((key) => {
      this.listeners[key].setTarget(target)
    })
  }

  destroy () {
    if (!this.listeners) {
      throw new Error('Cannot destroy listener twice')
    }
    Object.keys(this.listeners).forEach((key) => {
      this.listeners[key].destroy()
    })
    delete this.listeners
  }
}

class Listener {
  constructor (eventName) {
    this.eventName = eventName

    // TODO we should only subscribe to events when stream is activated
    this.bus = K.createStreamBus()
    this.listener = (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
      this.bus.emit(ev)
    }
  }

  setTarget (target) {
    if (target === this.target) {
      return
    }

    if (this.target) {
      this.target.removeEventListener(this.eventName, this.listener)
    }

    this.target = target
    if (this.target) {
      this.target.addEventListener(this.eventName, this.listener)
    }
  }

  destroy () {
    this.bus.end()
    this.setTarget(null)
    this.bus = null
  }
}
