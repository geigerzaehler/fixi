import {defaults} from 'lodash-node'

export default function eventHook (event, data) {
  return new NodeEventHook(event, data)
}

class NodeEventHook {
  constructor (event, data, opts = {}) {
    defaults(opts, {
      preventDefault: true,
      stopPropagation: true,
    })

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
      ev2.data = data
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
