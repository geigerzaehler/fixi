import {Bus} from 'baconjs'
import {component, h} from 'fixi'

export default function app (render) {
  let input = component(textInput);
  input.output
  .map(build)
  .onValue(render)

  function build (name) {
    return h('div', [
      h('label', 'Name:'),
      input.node,
      h('hr'),
      h('h1', 'Hello ' + name)
    ]);
  }
}

function textInput (render) {
  let value = new Bus()
  render(h('input', {'ev-keydown': push}))
  return value.toProperty('');
  function push (ev) {
    setTimeout(() => {
      value.push(ev.target.value)
    })
  }
}
