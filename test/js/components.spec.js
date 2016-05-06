import sinon from 'sinon'
import {expect} from 'chai'

import * as K from 'kefir'
import {diff, patch, create, h} from 'virtual-dom'
import {jsdom} from 'jsdom'
import proxyquire from 'proxyquire'

let component = proxyquire('../../src/component', {
  'raf': (fn) => component.raf(fn)
}).default


describe('component()', () => {

  // TODO
  function createDocument () {
    return jsdom()
  }

  beforeEach(function () {
    component.raf = sinon.stub()
  })

  it('subscribes to stream when created', function () {
    let subscribe = sinon.stub()
    let nodes = K.stream(subscribe)
      .toProperty(() => h('div'))

    sinon.assert.notCalled(subscribe)
    create(component(nodes))
    sinon.assert.calledOnce(subscribe)
  })

  it('subscribes to stream when patched into dom', function () {
    let subscribe = sinon.stub()
    let nodes = K.stream(subscribe)
      .toProperty(() => h('div'))
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
      .toProperty(() => h('div'))
    let comp = component(nodes)
    let el = create(comp)

    sinon.assert.notCalled(unsubscribe)
    patch(el, diff(comp, h('div')))
    sinon.assert.calledOnce(unsubscribe)
  })

  it('creates initial node immediately', function () {
    let getInitial = sinon.stub().returns(h('#initial'))
    let nodes = K.never().toProperty(getInitial)
    let comp = component(nodes)

    let doc = createDocument()
    sinon.assert.notCalled(getInitial)
    let el = create(comp, {document: doc})
    sinon.assert.calledOnce(getInitial)
    expect(el.id).to.equal('initial')
  })

  it('updates node in dom after raf', function () {
    let doc = createDocument()
    let renderOpts = {document: doc}

    let emitter
    let nodes = K.stream((e) => { emitter = e })
      .toProperty(() => h('div'))
    let comp = component(nodes, renderOpts)
    let el = create(comp, renderOpts)
    doc.body.appendChild(el)

    emitter.emit(h('div#target'))
    expect(doc.getElementById('target')).to.be.null
    component.raf.yield()
    expect(doc.getElementById('target')).not.to.be.null
  })
})
