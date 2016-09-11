import {component, h, ev} from 'fixi'
import {run} from 'examples'
import * as K from 'kefir'

run(app())

export function app () {
  let nameInput = h('input', {type: 'text', input: ev()})
  let nameFromInput = nameInput.stream
    .map((ev) => ev.target.value)

  let clearButton = h('button', {click: ev()}, ['Clear'])
  let nameFromClear = clearButton.stream.map(() => '')

  let name = K.merge([nameFromInput, nameFromClear])
    .map((n) => n.toLowerCase().trim() === 'thomas' ? 'Busted!' : n)
    .toProperty(() => '')

  return component(name.map(build))

  function build (name) {
    return h('div', [
      h('label', ['Name:']),
      nameInput,
      clearButton,
      h('hr'),
      h('h1', ['Hello ' + name]),
    ])
  }
}
