import raf from'raf'
import {create, diff, patch} from 'virtual-dom'
import VText from 'virtual-dom/vnode/vtext'
import thunk from 'vdom-thunk'

export default function component (obs) {
  let redrawScheduled = false

  let currentTree = emptyTree()
  let newTree = null;
  let target = create(currentTree)

  return thunk(() => {
    return {
      type: 'Widget',
      init () {
        obs.onValue(update)
        return target
      },
      remove () {
        obs.offValue(update)
      }
    }
  })


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

class Thunk {
  constructor (widget) {
    this.widget = widget;
  }

  render () {
    return this.widget
  }
}

Thunk.prototype.type = 'Thunk'

function emptyTree () {
  return new VText('')
}
