import thunk from 'vdom-thunk'
import {create} from 'virtual-dom'

import fix from './fix_frp'
import h from './hyperscript'
import component from './component'
import attribute from './attribute'


export {
  // Rexports
  thunk, create,
  // Main functions
  fix, h, component,
  attribute as a,
}

// Event attribute hooks
export {
  eventStream as ev,
  eventStreamInject as evi,
  delegate as del,
  emit as emit,
} from './hooks'



// Stream a -> Stream {stream :: Stream a}
export function fixs (fn) {
  return fix((s) => {
    return fn(s.flatMapLatest(({stream}) => stream))
  })
}
