import superagent from 'superagent'
import Bluebird from 'bluebird'
import * as B from 'baconjs'
import {component, h} from 'fixi'
import * as L from 'lodash'

export default function app (render) {
  let label = B.constant('Get Data')
  let $getButton = component(button(label))
  let fields = requester($getButton.output)
  .map((items) => L.map(items, 'fields'))
  .toProperty(null)

  let dataView = component((render) => {
    fields.onValue((items) => {
      render(h('pre', [JSON.stringify(items, null, 2)]))
    })
  })

  render(h('div', [
    h('div', [$getButton.node]),
    dataView.node
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
