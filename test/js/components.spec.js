import sinon from 'sinon'
import {expect} from 'chai'

import * as K from 'kefir'
import {diff, patch, h} from 'virtual-dom'
import * as VDOM from 'virtual-dom'
import {jsdom} from 'jsdom'

import component_ from '../../src/component'

describe('component()', () => {

  function createContext () {
    let doc = jsdom()
    let raf = sinon.stub()
    return {
      raf: raf,
      doc: doc,
      create (vnode) {
        return VDOM.create(vnode, {document: doc})
      },
      component (nodes) {
        return component_(nodes, {
          document: doc,
          raf: raf,
        })
      }
    }
  }


  beforeEach(function () {
    Object.assign(this, createContext())
  })

  it('subscribes to stream when created', function () {
    let subscribe = sinon.stub()
    let nodes = K.stream(subscribe)
      .toProperty(() => h('div'))

    sinon.assert.notCalled(subscribe)
    this.create(this.component(nodes))
    sinon.assert.calledOnce(subscribe)
  })

  it('subscribes to stream when patched into dom', function () {
    let subscribe = sinon.stub()
    let nodes = K.stream(subscribe)
      .toProperty(() => h('div'))
    let comp = this.component(nodes)

    let prev = h('div')
    let el = this.create(prev)

    sinon.assert.notCalled(subscribe)
    patch(el, diff(prev, comp))
    sinon.assert.calledOnce(subscribe)
  })

  it('unsubscribes form stream when patched out dom', function () {
    let unsubscribe = sinon.stub()
    let nodes = K.stream(() => unsubscribe)
      .toProperty(() => h('div'))
    let comp = this.component(nodes)
    let el = this.create(comp)

    sinon.assert.notCalled(unsubscribe)
    patch(el, diff(comp, h('div')))
    sinon.assert.calledOnce(unsubscribe)
  })

  it('creates initial node immediately', function () {
    let getInitial = sinon.stub().returns(h('#initial'))
    let nodes = K.never().toProperty(getInitial)
    let comp = this.component(nodes)

    sinon.assert.notCalled(getInitial)
    let el = this.create(comp)
    sinon.assert.calledOnce(getInitial)
    expect(el.id).to.equal('initial')
  })

  it('updates node in dom after raf', function () {
    let emitter
    let nodes = K.stream((e) => { emitter = e })
      .toProperty(() => h('div'))
    let comp = this.component(nodes)
    let el = this.create(comp)
    this.doc.body.appendChild(el)

    emitter.emit(h('div#target'))
    expect(this.doc.getElementById('target')).to.be.null
    this.raf.yield()
    expect(this.doc.getElementById('target')).not.to.be.null
  })
})
