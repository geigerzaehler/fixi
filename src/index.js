import raf from 'raf'
import VText from 'virtual-dom/vnode/vtext'
import vdom from 'virtual-dom'
import {diff, patch} from 'virtual-dom'
import {extend} from 'lodash-node'
import _thunk from 'vdom-thunk'
import _observe from './observe'
import _fix from './fix_frp'
import logger from 'debug'

let log = logger('fixi')

export var fix = _fix
export var observe = _observe
export var thunk = _thunk
export var create = vdom.create

export function h (...args) {
  let [tag, props, children, extension] = normalizeArgs(...args)
  return extend(vdom.h(tag, props, children), extension)
}

function normalizeArgs (...args) {
  let tag = ''
  let props = {}
  let children = []
  let extension = {}

  let current = args.shift()
  if (typeof current === 'string') {
    tag = current
    current = args.shift()
  }

  if (!Array.isArray(current)) {
    props = current
    current = args.shift()
  }

  if (current) {
    children = current
    current = args.shift()
  }

  if (current) {
    extension = current
  }

  return [tag, props, children, extension]
}

export function component (obs) {
  if (!(typeof obs.onValue === 'function')) {
    throw new Error('Expected observable')
  }

  let redrawScheduled = false
  let currentTree = new VText('')
  let newTree = null;
  let target = null;

  return {
    type: 'Widget',
    init () {
      log('init component', obs)
      if (obs) obs.onAny(dispatch)

      if (redrawScheduled) {
        currentTree = newTree
        redrawScheduled = false
      }
      target = create(currentTree)
      return target
    },
    remove () {
      log('remove component')
      if (obs) obs.offAny(dispatch)
    }
  }

  function dispatch (event) {
    if (event.type === 'value') {
      update(event.value)
    } else if (event.type === 'end') {
      // Don’t know if this is necessary
      obs.offAny(dispatch)
      obs = null
    } else {
      throw event.value
    }
  }

  function update (tree) {
    if (tree === currentTree) {
      return
    }

    if (!redrawScheduled) {
      redrawScheduled = true
      raf(redraw)
    }

    newTree = tree
  }

  function redraw () {
    log('redraw start')
    redrawScheduled = false;
    let patches = diff(currentTree, newTree)
    target = patch(target, patches)
    currentTree = newTree
    log('redraw finished', target)
  }

}
