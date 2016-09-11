import sinon from 'sinon'
import {jsdom} from 'jsdom'
import {create} from 'virtual-dom'
import proxyquire from 'proxyquire'

// export * from '../../src'

export function createDocument (vnode) {
  let doc = jsdom()
  let renderOpts = {document: doc}

  if (vnode) {
    let el = create(vnode, renderOpts)
    doc.body.appendChild(el)
  }

  let raf = sinon.stub()
  let component = proxyquire('../../src/component', {
    'raf': raf,
  }).default

  return Object.assign(doc, {
    // component: (nodes) => component(nodes, renderOpts)
    createCustomEvent (name, detail) {
      let ev = doc.createEvent('CustomEvent')
      ev.initCustomEvent(name, true, true, detail)
      return ev
    },

    add (vnode) {
      let el = create(vnode, renderOpts)
      doc.body.appendChild(el)
    },

    component: component,
    raf: raf,
  })
}

