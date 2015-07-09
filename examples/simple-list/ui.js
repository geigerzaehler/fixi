import {extend} from 'lodash'
import AttributeHook from 'virtual-dom/virtual-hyperscript/hooks/attribute-hook'
import {observe, h} from 'fixi'
import ev from './node_event'

export function button (selector, children) {
  if (typeof selector !== 'string') {
    children = selector
    selector = ''
  }
  let tag = 'button.btn' + selector
  let props = {type: 'button'}

  return observe('click', h(tag, props, children))
}


export function buttonDelegate (selector, event, data, children) {
  let tag = 'button.btn' + selector
  let props = {type: 'button', click: ev(event, data)}
  return h(tag, props, children)
}


export function input (value, props = {}) {
  let node = h('input.form-control', extend({
    type: 'text', value: value,
  }, props))
  return observe('change', node, (e) => {
    return e.target.value
  })
}

export function textarea (props = {}) {
  let node = h('textarea.form-control', extend({
    type: 'text'
  }, props))
  return observe('change', node, (e) => {
    return e.target.value
  })
}


export function icon (name) {
  return h(`i.icon-${name}`)
}

export function withRightSidebar (...els) {
  let sidebarInner = els.pop()
  let main = els.map((el) => {
    return h('div', {style: {'flex-grow': '1'}}, el)
  })
  let sidebar = h('div', { style: {flex: '0 0 auto' } }, [sidebarInner])
  let children = main.concat([sidebar])
  return h('div', {style: {display: 'flex'}}, children)
}

export function dialog (id, title, content) {
  return h('modal', {id}, [
    h('.modal-dialog', [
      h('.modal-content', [
        h('.modal-header', [
          closeButton,
          h('h4.modal-title', [title])
        ]),
        h('.modal-body', content),
        h('.modal-footer')
      ])
    ])
  ])
}

var closeButton = h('button.close', {
  'type': 'button',
  'data-dismiss': a('modal'),
  'aria-hidden': a(true)
}, ['\u00D7'])

export function a (v, ns) {
  ns = ns || ''
  return new AttributeHook(ns, v)
}
