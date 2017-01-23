import {caseof} from 'sum-types'
import {Attribute} from '../../vtree'

/**
 * Converts a list of VTree properties into an object that can be
 * passed to the virtual-dom `h` function.
 */
export default function interpretProps (props) {
  const res = {
    attributes: {},
  }
  let nodeKey
  for (const [key, value] of props) {
    caseof(value, [
      [Attribute.Attribute, ({value}) => {
        if (key === 'key') {
          nodeKey = value
        } else {
          res.attributes[key] = value
        }
      }],
      // TODO properties
      [Attribute.Event, ({handler}) => {
        res['__' + key] = new EventHook(handler)
      }],
    ])
  }
  return [res, nodeKey]
}

class EventHook {
  constructor (handler) {
    this.handler = handler
  }

  hook (node, prop, prev) {
    if (!isEventHookEqual(prev, this)) {
      node.addEventListener(prop.substr(2), this.handler)
    }
  }

  unhook (node, prop, next) {
    if (!isEventHookEqual(this, next)) {
      node.removeEventListener(prop.substr(2), this.handler)
    }
  }
}

function isEventHookEqual (a, b) {
  return (
    a instanceof EventHook &&
    b instanceof EventHook &&
    a.handler === b.handler
  )
}
