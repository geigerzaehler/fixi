import {component, create, h, observe} from 'fixi'
import {run} from 'examples'

run(app())

export function app () {
  let nameInput = textInput()
  let name = nameInput.stream
    .map((ev) => ev.target.value)
    .toProperty(() => '')
    .map((n) => n.toLowerCase().trim() === 'thomas' ? 'Busted!' : n)

  return component(name.map(build))

  function build (name) {
    return h('div', [
      h('label', 'Name:'),
      nameInput,
      h('hr'),
      h('h1', 'Hello ' + name)
    ]);
  }
}

function textInput () {
  return observe('input', h('input', {type: 'text'}))
}
