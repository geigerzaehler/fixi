import VDom from 'virtual-dom'
import _thunk from 'vdom-thunk'

import _component from './component'
import * as H from './hooks'
import * as O from './observe'
import _fix from './fix_frp'
import attribute from './attribute'
import _h from './hyperscript'

export var fix = _fix

export var thunk = _thunk
export var create = VDom.create
export var component = _component

export var h = _h

export var observe = O.default
export var ho = O.h
export var ev = H.eventStream
export var evi = H.eventStreamInject
export var del = H.delegate
export var a = attribute

export function fixs (fn) {
  return fix((s) => {
    return fn(s.flatMapLatest(({stream}) => stream))
  })
}
