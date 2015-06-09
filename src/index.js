import vdom from 'virtual-dom'
import createLoop from './loop'
import Delegator from 'dom-delegator'


/**
 * type Component a :: RenderCont -> a
 * component :: Component a -> (VTree, a)
 */
export function component (c) {
  let loop = createLoop()

  let thunk = loop.thunk
  thunk.output = c(update)
  return thunk

  function update (tree) {
    setTimeout(() => {
      loop.update(tree)
    })
  }
}

export var h = vdom.h

export function run (c, container) {
  new Delegator(document)
  let node = component(c)
  container.appendChild(vdom.create(node));
}
