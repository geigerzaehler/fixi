import superagent from 'superagent'
import Bluebird from 'bluebird'
import * as B from 'baconjs'
import {component, h} from 'fixi'
import * as L from 'lodash'
import VText from 'virtual-dom/vnode/vtext'

export default function app (render) {
  let $getButton = component(button('Get Data'))

  let entries = requester($getButton.output, getEntries)
  .map((e) => L.map(e, 'fields'))
  .toProperty(null)
  let entriesView = component(responseView(B.never(), entries))

  let ct = requester($getButton.output, getContentType)
  .map('.fields')
  .toProperty(null)
  let ctView = component(responseView(B.never(), ct))

  render(h('div', [
    h('div', $getButton),
    h('hr'),

    h('h3', 'Content Type Fields'),
    ctView,

    h('h3', 'Entries'),
    entriesView
  ]))
}


function responseView (requested, received){
  return function (render) {
    requested.onValue(() => {
      render(t('loading...'))
    })

    received.onValue((entries) => {
      if (entries === null)
        render(t('No Data!'))
      else
        render(h('pre', serialize(entries)))
    })
  };
}

function getEntries () {
  return getEntity('entries')
  .then(({items}) => items)
}

function getContentType () {
  return getEntity('content_types/4uIogsRC12u0QieEOK00eO')
}

function getEntity (entity) {
  let space = 'g1hfpcpv96v7'
  let token = '2522fe7a33efa4cabf79df42d16f1d81' +
              'b12b1d9ce94e92fead139cc1c33425d6'

  let url = `//cdn.contentful.com/spaces/${space}/${entity}`

  return Bluebird.fromNode((c) => {
    superagent
    .get(url)
    .set('Authorization', `Bearer ${token}`)
    .end(c)
  })
  .then(({text}) => JSON.parse(text))
}

function requester (trigger, req) {
  return trigger.flatMap(function () {
    return B.fromPromise(req())
  })
}


function button (label) {
  if (typeof label === 'string')
    label = B.constant(label)
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

function t (text) {
  return new VText(text)
}

function serialize (d) {
  return JSON.stringify(d, null, 2)
}
