import raf from'raf'
import {create, diff, patch} from 'virtual-dom'
import VText from 'virtual-dom/vnode/vtext'
import Thunk from 'vdom-thunk'

export default function createLoop() {
    let redrawScheduled = false

    let currentTree = emptyTree()
    let newTree = null;
    let target = create(currentTree)

    let thunk = new Thunk(() => {
      return {
        type: "Widget",
        init: () => target,
      }
    })

    return { update, thunk }

    function update(tree) {
        if (!redrawScheduled) {
            redrawScheduled = true
            raf(redraw)
        }

        newTree = tree
    }

    function redraw() {
        redrawScheduled = false;
        let patches = diff(currentTree, newTree)
        target = patch(target, patches)
        currentTree = newTree
    }
}

function emptyTree () {
  return new VText('')
}
