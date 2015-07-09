import {extend, constant} from 'lodash'
import {observe, component, h, fix} from 'fixi'
import {run} from 'examples'
import K from 'kefir'
import {List} from 'immutable'

import * as L from './lenses'
import * as UI from './ui'

run(app())

function app () {
  let initialItems = List(['Item 1', 'Item 2'])
  try {
    initialItems = List(JSON.parse(window.localStorage.getItem('items')))
  } catch (e) {}

  let addButton = UI.button(['Add'])

  // only apply options when the last entry is valid
  let guard = opGuard(L.last())

  let addNewEntry = L.push('')

  // on click push a new entry
  let adds = addButton.stream
    .map(constant(addNewEntry))
    .map(guard)

  let makeOneItem = (is) => is.isEmpty() ? addNewEntry(is) : is

  let entries = fix(function (entries) {
    let dels = entries
      .flatMapLatest(L.get('stream'))
      .map(L.get('data'))
      .map(L.remove)

    let sets = entries.flatMapLatest(L.get('updates'))

    let ops = K.merge([adds, dels, sets])

    let items = apply(ops, initialItems)

    items.onValue((items) => {
      window.localStorage.setItem('items', JSON.stringify(items.toJS()))
    })

    return items
    .map(makeOneItem)
    .map(renderItemList)
  })


  return h('div', [
    component(entries),
    addButton
  ])
}


function renderItemList (is) {
  let rendered = is.map(renderItem).toJS()
  let updates = K.merge(rendered.map(L.get('update')))

  return extend(
    observe('entry:remove', h('.entries', rendered)),
    {updates}
  )
}

function renderItem (name, key) {
  let deleteButton = UI.buttonDelegate('', 'entry:remove', key, ['remove'])

  let nameInput = UI.input(name, {placeholder: 'Name', required: true})
  let update = nameInput.stream.map(L.set(key))

  let elements = UI.withRightSidebar(nameInput, deleteButton)

  return extend(
    h('div', {key}, [elements]),
    {update}
  )
}

function apply (ops, val) {
  return val ? run(val) : run

  function run (val) {
    return ops.scan((v, op) => op(v), val)
  }
}

function opGuard (pred) {
  return function (op) {
    return function maybePush (list) {
      if (pred(list)) {
        return op(list)
      } else {
        return list
      }
    }
  }
}
