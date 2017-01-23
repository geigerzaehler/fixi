import {Attribute} from './vtree'
import h from './hyperscript/h'

export const a = Attribute.Attribute

export const ev = Attribute.Event

export {h}

// TODO Style is a special property. We should encode it as such
export function style (props) {
  return Attribute.Property(props)
}
