import sinon from 'sinon'
import {expect} from 'chai'

import * as K from 'kefir'
import {diff, patch, create, h} from 'virtual-dom'
import DOM from 'jsdom'
import proxyquire from 'proxyquire'

let component = proxyquire('../../src/component', {
  'raf': (fn) => component.raf(fn)
}).default


describe('component()', () => {

  beforeEach(function () {
    component.raf = sinon.stub()
  })

  it('subscribes to stream when created', function () {
    let subscribe = sinon.stub()
    let nodes = K.stream(subscribe)

    sinon.assert.notCalled(subscribe)
    create(component(nodes))
    sinon.assert.calledOnce(subscribe)
  })

  it('subscribes to stream when patched into dom', function () {
    let subscribe = sinon.stub()
    let nodes = K.stream(subscribe)
    let comp = component(nodes)

    let prev = h('div')
    let el = create(prev)

    sinon.assert.notCalled(subscribe)
    patch(el, diff(prev, comp))
    sinon.assert.calledOnce(subscribe)
  })

  it('unsubscribes form stream when patched out dom', function () {
    let unsubscribe = sinon.stub()
    let nodes = K.stream(() => unsubscribe)
    let comp = component(nodes)
    let el = create(comp)

    sinon.assert.notCalled(unsubscribe)
    patch(el, diff(comp, h('div')))
    sinon.assert.calledOnce(unsubscribe)
  })

  it('renders a text node initially', function () {
    let nodes = K.constant(h('div'))
    let comp = component(nodes)

    let win = DOM.jsdom().defaultView
    let doc = win.document
    let el = create(comp, {document: doc})
    expect(el.nodeType).to.equal(win.Node.TEXT_NODE)
  })

  it('updates node in dom after raf', function () {
    let win = DOM.jsdom().defaultView
    let doc = win.document
    let renderOpts = {document: doc}

    let emitter
    let nodes = K.stream((e) => { emitter = e })
    let comp = component(nodes, renderOpts)
    let el = create(comp, renderOpts)
    doc.body.appendChild(el)

    emitter.emit(h('div#target'))
    expect(doc.getElementById('target')).to.be.null
    component.raf.yield()
    expect(doc.getElementById('target')).not.to.be.null
  })
})
