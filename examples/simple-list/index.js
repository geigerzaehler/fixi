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
    let adds2 = entries
      .flatMapLatest(L.get('enterLast'))
      .map(constant(addNewEntry))
      .map(guard)

    let ops = K.merge([adds, adds2, dels, sets])

    let items = apply(ops)(initialItems)

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
  let enterLast = rendered[rendered.length - 1].enter

  return extend(
    observe('entry:remove', h('.entries', rendered)),
    {updates, enterLast}
  )
}

function renderItem (name, key) {
  let deleteButton = UI.buttonDelegate('', 'entry:remove', key, ['remove'])

  let nameInput = UI.input(name, {placeholder: 'Name', required: true})
  nameInput = observe.all({
    'change': (ev) => ev.target.value,
    'keydown': null
  }, nameInput)
  let update = nameInput.$change.map(L.set(key))

  let enter = nameInput.$keydown
    .filter((ev) => ev.keyCode === 13)
    .map(() => null)

  let elements = UI.withRightSidebar(nameInput, deleteButton)

  return extend(
    h('div', {key}, [elements]),
    {update, enter}
  )
}


function apply (ops, val) {
  return function run (val) {
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
