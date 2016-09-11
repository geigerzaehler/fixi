import {component, a, h, fixs, ev, del} from 'fixi'
import {run} from 'examples'
import K from 'kefir'
import {List} from 'immutable'
import focusHook from 'virtual-dom/virtual-hyperscript/hooks/focus-hook.js'

import * as L from './lenses'
import * as UI from './ui'

run(app())

function app () {
  // initialItems :: List Item
  let initialItems =
    loadItems()
    .push('')
    .map((name) => ({name}))


  return component(fixs(function (ops) {
    let items = apply(ops)(initialItems)
      // Make sure there is at least one item
      .map((is) => is.isEmpty() ? is.push({name: ''}) : is)

    setTimeout(() => items.onValue(storeItems))

    let viewItems = items
      // Add the 'key' property to all elements and 'last' to the final one
      .map((items) => {
        return items.map((obj, i) => {
          obj.last = i === items.size - 1
          obj.key = i
          return obj
        })
      })


    let filter = UI.input({
      tabindex: a(1),
    })

    let state = K.combine(
      [viewItems, filter.stream.toProperty(() => '')],
      (items, filter) => {
        return items.filter(({name}) => name.match(filter))
      }
    )

    let events = {
      update: ev((ev) => {
        let [key, name] = ev.data
        return L.update(key, L.set('name')(name))
      }),
      add: ev(({data: last}) => {
        if (last) {
          return addNewEntryOp()
        } else {
          return L.noop()
        }
      }),
      remove: ev(({data: key}) => L.remove(key)),
      'entry:focus': ev(({data: key}) => L.update(key, L.set('focus')(false))),
    }

    return state.map((filtered) => {
      return h('div', events, [
        h('.filter', [
          'Filter: ', filter,
        ]),
        h('.entries', filtered.map(renderItem).toJS()),
        UI.buttonDelegate('', 'add', true, ['Add']),
      ])
    })
  }))
}


function addNewEntryOp (name = '') {
  return function (list) {
    if (list.last().name) {
      return list.push({name, focus: true})
    } else {
      return list
    }
  }
}

function renderItem ({focus, name, last, key}, index) {
  let nameInput = h('input.form-control', {
    type: 'text',
    value: name,
    style: {
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: last ? 'red' : 'blue',
    },
    placeholder: 'Name',
    required: true,
    tabindex: a(index + 2),
    hasFocus: focus && focusHook(),
    focus: del('entry:focus', () => key),
    input: del('update', (ev) => ([key, ev.target.value])),
    // Prevent default to trigger input
    keydown: del('add', (ev) => ev.keyCode === 13 && last, {preventDefault: false}),
  })

  let deleteButton = UI.buttonDelegate('', 'remove', key, ['remove'])

  let elements = UI.withRightSidebar(nameInput, deleteButton)
  return h('div', {key}, [elements])
}


// loadItems :: IO (List String)
function loadItems () {
  try {
    return List(JSON.parse(window.localStorage.getItem('items')))
  } catch (e) {
    return List(['Item 1', 'Item 2'])
  }
}


// storeItems :: List String -> IO ()
function storeItems (items) {
  let names = items.map(L.get('name')).filter(L.id)
  window.localStorage.setItem('items', JSON.stringify(names.toJS()))
}


// apply :: Stream (a -> a) -> a -> Property a
function apply (ops) {
  return function run (val) {
    return ops.scan((v, op) => op(v), val)
  }
}

