import {Bus} from 'baconjs'
import {component, h} from 'fixi'

export default function app (render) {
  let nameInput = component(textInput);
  nameInput.output
  .map((n) => n.toLowerCase().trim() == 'thomas' ? 'Busted!' : n)
  .map(build)
  .onValue(render)

  function build (name) {
    return h('div', [
      h('label', 'Name:'),
      nameInput,
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
