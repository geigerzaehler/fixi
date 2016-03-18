import {component, a, h, ho, fixs, evi} from 'fixi'
import {run} from 'examples'
import K from 'kefir'
import {List} from 'immutable'
import * as T from 'transducers-js'
import focusHook from 'virtual-dom/virtual-hyperscript/hooks/focus-hook.js'

import * as L from './lenses'
import * as UI from './ui'

run(app())

function app () {
  // initialItems :: List {name: String, focus: Boolean}
  let initialItems =
    loadItems()
    .filter((x) => !!x)
    .push('')
    .map((name) => ({name}))

  let addButton = UI.button(['Add'])

  // addNewEntry :: Transducer Any Op
  let addNewEntry =
    T.map(() => (list) => {
      if (list.last().name) {
        return list.push({name: '', focus: true})
      } else {
        return list
      }
    })

  // entries :: Property Node
  let entries = fixs(function (stream) {
    let dels = stream.transduce(L.select('remove'))
    let sets = stream.transduce(L.select('update'))
    let enter = stream.transduce(L.select('enter'))

    let adds =
      K.merge([addButton.stream, enter])
      .transduce(addNewEntry);

    let ops = K.merge([adds, dels, sets])

    let items =
      apply(ops)(initialItems)
      // Make sure there is at least one item
      .map((is) => is.isEmpty() ? is.push({name: ''}) : is)
      // Add the 'last' property to the final element
      .map((items) => {
        return items.map((obj, i) => (obj.last = (i === items.size - 1), obj))
      })

    items.onValue((list) => {
      let names = list.map(L.get('name'))
      storeItems(names)
    })

    return items.map(renderItemList)
  })

  return h('div', [
    component(entries),
    addButton
  ])
}


function renderItemList (items) {
  let rendered = items.map(renderItem).toJS()
  let stream = K.merge(rendered.map(L.get('stream')))

  return ho('.entries', {}, rendered, stream)
}


function renderItem ({focus, name, last}, key) {
  // let nameInput = UI.input(name, {placeholder: 'Name', required: true})
  let nameInput = ho('input.form-control', {
    type: 'text',
    value: name,
    style: {
      borderStyle: 'solid',
      borderWidth: '1px',
      borderColor: last ? 'red' : 'blue'
    },
    placeholder: 'Name',
    required: true,
    tabindex: a(key + 2),
    hasFocus: focus && focusHook(),
    blur: evi('update', (ev) => ev.target.value),
    input: evi('update', (ev) => ev.target.value),
    keydown: evi('enter', (ev) => ev.keyCode)
  })

  let inputUpdates = nameInput.stream.transduce(
    T.comp(
      L.atTT('update', T.comp(
        T.map((name) => ({name})),
        T.map(L.set(key))
      )),
      L.atTT('blur', T.map((list) => {
        list.update(key, (x) => (delete x.focus, x))
      })),
      L.atTT('enter', T.filter((code) => code === 13))
    )
  )

  // let deleteButton = UI.buttonDelegate('', 'entry:remove', key, ['remove'])
  let deleteButton = UI.button(['remove'])
  let deleteStream = deleteButton.stream
    .map(() => ({type: 'remove', value: L.remove(key)}))

  let stream = K.merge([inputUpdates, deleteStream])

  let elements = UI.withRightSidebar(nameInput, deleteButton)
  return ho('div', {key}, [elements], stream)
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
  window.localStorage.setItem('items', JSON.stringify(items.toJS()))
}


// apply :: Stream (a -> a) -> a -> Property a
function apply (ops) {
  return function run (val) {
    return ops.scan((v, op) => op(v), val)
  }
}
