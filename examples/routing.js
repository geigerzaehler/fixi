import {component, create, h, observe, thunk} from 'fixi'
import {run} from 'examples'
import * as K from 'kefir'
import {extend, map, find} from 'lodash'
import ev from './simple-list/node_event'

run(app())

function app () {
  let route = router([{
    path: '/a',
    render: showPath
  }, {
    path: '/b',
    render: showPath
  }])
  return navigate(({path, data}) => {
    if (path === '/l' && !data.loaded) {
      let $navigate = K.later(1000, {path: 'l', data: {loaded: true}})
      return h('div', ['Loading'], {$navigate})
    }
    let view = route(path)
    let {$navigate} = view
    return h('div', [
      thunk(nav),
      thunk(eventButton),
      h('div', {style: {margin: '1em 0'}}, [`Current path: ${path}`]),
      h('pre', {style: {margin: '1em 0'}}, [JSON.stringify(data, null, 2)]),
      view
    ], {$navigate})
  })
}

function navigate (render) {
  let history = makeHistory()
  let view = history.stream.map(render)

  let viewNavigate = view
  .flatMapLatest(({$navigate}) => $navigate || K.never())

  let container = observe(
    'navigate', h('div', [component(view)]), (ev) => ev.data
  )

  K.merge([container.stream, viewNavigate])
  .onValue(history.push)

  return container;
}

function router (routes) {
  return function (path) {
    let route = find(routes, {path})
    return route ? route.render(route)
                 : h('div', ['Unknonw'])
  }
}

function showPath ({path}) {
  let next = observe('click', h('button', ['Next']))
  let $navigate = next.stream.map(() => ({path: path + '+'}))
  return h('div', [`Routed ${path} `, next], {$navigate})
}


function nav () {
  return ul([
    h('a', {href: '#/a'}, ['/a']),
    h('a', {href: '#/b'}, ['/b']),
    h('div', [
      h('a', {href: '#/l'}, ['Delyed load']),
      ' ',
      h('a', {
        href: '#/',
        click: ev('navigate', {path: '/', data: {loaded: false}})
      }, ['(reset)'])
    ])
  ])
}

function ul (children) {
  return h('ul', map(children, (e) => {
    return h('li', [e])
  }))
}

function eventButton () {
  return h('button', {
    click: ev('navigate', {path: '/c'})
  }, ['Go to /c'])
}


function makeHistory () {
  let bus = createBus();
  let popstate = K.fromEvents(window, 'hashchange', getCurrentState)
  let stream = K.merge([bus.stream, popstate])
              .toProperty(getCurrentState)
  let stateData = {}
  return {
    stream,
    push ({path, data}) {
      data = extend(stateData, data)
      bus.push({path, data})
      window.location.hash = path
    }
  }

  function getCurrentState () {
    let path = window.location.hash.substr(1)
    return {path, data: stateData}
  }
}


function createBus () {
  var emitter;
  return {
    push (data) {
      if (emitter) {
        emitter.emit(data);
      }
    },

    stream: K.stream(function (e) {
      emitter = e;
      return function () {
        emitter = null;
      }
    })
  }
}
