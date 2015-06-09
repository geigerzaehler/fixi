import superagent from 'superagent'
import Bluebird from 'bluebird'
import * as B from 'baconjs'
import {component, h} from 'fixi'
import * as L from 'lodash'
import VText from 'virtual-dom/vnode/vtext'


export default function app (render) {
  let label = B.constant('Get Data')
  let $getButton = component(button(label))

  let entries = requester($getButton.output)
  .map((e) => L.map(e, 'fields'))
  .toProperty(null)

  let requestedEntries = requester($getButton.output)

  let dataView = component((render) => {

    requestedEntries.onValue(() => {
      render(t('loading...'))
    })

    entries.onValue((entries) => {
      if (entries === null)
        return render(t('No Data!'))

      setTimeout(function () {
        render(h('pre', [JSON.stringify(entries, null, 2)]))
      }, 1000)
    })
  })

  render(h('div', [
    h('div', [$getButton]),
    h('hr'),
    dataView
  ]))
}

function getEntries () {
  let space = 'g1hfpcpv96v7'
  let token = '2522fe7a33efa4cabf79df42d16f1d81' +
              'b12b1d9ce94e92fead139cc1c33425d6'

  let url = `//cdn.contentful.com/spaces/${space}/entries`

  return Bluebird.fromNode((c) => {
    superagent
    .get(url)
    .set('Authorization', `Bearer ${token}`)
    .end(c)
  })
  .then(({text}) => JSON.parse(text))
  .then(({items}) => items)
}

function requester (trigger) {
  return trigger.flatMap(function () {
    return B.fromPromise(getEntries())
  })
}


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

function t (text) {
  return new VText(text)
}
