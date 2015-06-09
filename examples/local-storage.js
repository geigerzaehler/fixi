import {h} from 'virtual-dom'
import * as B from 'baconjs'
import {component} from 'fixi'


export default function app (render) {
  let initialName = localStorage.getItem('name')

  let nameInput = component(textInput(initialName))
  let name = nameInput.output.value
  let enterName = nameInput.output.enter

  let $save = component(button(B.constant('Save')))
  let save = $save.output.merge(enterName)
  let savedName = name.sampledBy(save).toProperty(initialName)

  savedName.onValue((n) => {
    render(h('div', [
      h('div', ['Initial name: ', initialName]),
      h('div', ['Current name: ', n]),
      h('change it! ', [nameInput.node, $save.node])
    ]))

    localStorage.setItem('name', n)
  })
}


//========================================

function button (label) {
  return function (render) {
    let click = new B.Bus()
    label.onValue(function (label) {
      render(h('button', {'ev-click': handler}, [label]))
    })
    return click
    function handler (ev) {
      click.push(ev)
    }
  }

}

function textInput (initial) {
  return function (render) {
    let value = new B.Bus()
    let commit = new B.Bus()
    let enter = new B.Bus()
    render(h('input', {
      'value': initial,
      'ev-input': valuePush(value),
      'ev-change': valuePush(commit),
      'ev-keydown': function (ev) {
        if (ev.keyCode === 13) {
          enter.push(null)
        }
      }
    }))
    enter.log('ee')
    return {
      value: value.toProperty(initial),
      commited: commit.toProperty(initial),
      enter: enter
    }
    function valuePush (bus) {
      return function (event) {
        setTimeout(() => bus.push(event.target.value))
      }
    }
  }
}
