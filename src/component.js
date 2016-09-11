import simpleComponent from './simple-component'

export default function component (prop, renderOpts) {
  if (typeof prop.onAny !== 'function') {
    throw new TypeError('Expected observable')
  }

  return simpleComponent((paint) => {
    // TODO use `subscribe`
    prop.onAny(dispatch)
    return destroy

    function destroy () {
      if (prop) prop.offAny(dispatch)
    }

    function dispatch (event) {
      if (event.type === 'value') {
        paint(event.value)
      } else if (event.type === 'end') {
        // Don’t know if this is necessary
        prop.offAny(dispatch)
        prop = null
      } else {
        throw event.value
      }
    }
  }, renderOpts)
}
