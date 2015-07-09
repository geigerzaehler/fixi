import {VNode} from 'virtual-dom'
import {stream} from 'kefir'
import {mapValues, extend, forEach} from 'lodash'


/**
 * observeClick :: Node {|r} -> Node {click: Event|r}
 */
export default function observe (event, node, trsf) {
  let props = node.properties
  let hook = new EventStreamHook(trsf)
  props[event] = hook
  let observed = new VNode(
    node.tagName,
    props,
    node.children,
    node.key,
    node.namespace
  )
  observed.stream = hook.stream
  return observed
}

observe.all = observeAll
export function observeAll (events, vnode) {
  let props = vnode.properties
  let hooks = mapValues(events, eventStreamHook)
  extend(props, events)
  let observed = new VNode(
    vnode.tagName,
    props,
    vnode.children,
    vnode.key,
    vnode.namespace
  )
  forEach(hooks, (name, hook) => {
    observed['$' + name] = hook
  })
  return observed

}

function eventStreamHook (trsf) {
  return new EventStreamHook(trsf)
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

function noop () {}

function id (x) { return x }
