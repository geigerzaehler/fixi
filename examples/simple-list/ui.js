import {extend} from 'lodash'
import AttributeHook from 'virtual-dom/virtual-hyperscript/hooks/attribute-hook'
import {ev, h, ho, del} from 'fixi'

export function button (selector, children) {
  if (typeof selector !== 'string') {
    children = selector
    selector = ''
  }

  let tag = 'button.btn' + selector
  let props = {
    type: 'button',
    click: ev()
  }

  return ho(tag, props, children)
}


export function buttonDelegate (selector, event, data, children) {
  let tag = 'button.btn' + selector
  let props = {type: 'button', click: del(event, data)}
  return h(tag, props, children)
}


export function input (value, props = {}) {
  return ho('input.form-control', extend({
    type: 'text',
    value: value,
    input: ev((e) => e.target.value)
  }, props))
}

export function textarea (props = {}) {
  return h('textarea.form-control', extend({
    type: 'text',
    input: ev((e) => e.target.value)
  }, props))
}


export function icon (name) {
  return h(`i.icon-${name}`)
}

export function withRightSidebar (...els) {
  let sidebarInner = els.pop()
  let main = els.map((el) => {
    return h('div', {style: {'flex-grow': '1'}}, el)
  })
  let sidebar = h('div', { style: { flex: '0 0 auto' } }, [sidebarInner])
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
