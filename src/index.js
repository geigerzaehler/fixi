import raf from'raf'
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
  let redrawScheduled = false

  let currentTree = new VText('')
  let newTree = null;
  let target = create(currentTree)

  let widget = {
    type: 'Widget',
    observable: obs,
    init () {
      obs.onValue(update)
      return target
    },
    remove () {
      obs.offValue(update)
    }
  }

  return {
    type: 'Thunk',
    render (previous) {
      if (previous && previous.observable === obs)
        return this.vnode
      else
        return widget
    }
  }

  function update (tree) {
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
