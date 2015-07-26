import raf from 'raf'
import VText from 'virtual-dom/vnode/vtext'
import vdom from 'virtual-dom'
import {diff, patch} from 'virtual-dom'
import _observe from './observe'
import _fix from './fix_frp'

export var fix = _fix
export var observe = _observe
export var create = vdom.create

export var h = vdom.h

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
      if (obs) obs.onAny(dispatch)

      if (redrawScheduled) {
        currentTree = newTree
        redrawScheduled = false
      }
      target = create(currentTree)
      return target
    },
    remove () {
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
    redrawScheduled = false;
    let patches = diff(currentTree, newTree)
    target = patch(target, patches)
    currentTree = newTree
  }

}
