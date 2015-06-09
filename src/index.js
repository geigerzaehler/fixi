import vdom from 'virtual-dom'
import createLoop from './loop'
import Delegator from 'dom-delegator'


/**
 * type Component a :: RenderCont -> a
 * component :: Component a -> (VTree, a)
 */
export function component (c) {
  let loop = createLoop()

  let node = loop.thunk
  let output = c(update)
  return { node, output }

  function update (tree) {
    setTimeout(() => {
      loop.update(tree)
    })
  }
}

export var h = vdom.h

export function run (c, document) {
  new Delegator(document)
  let node = component(c).node
  document.body.appendChild(vdom.create(node));
}
