import sinon from 'sinon'
import {createDocument} from './helpers'

import {h, ev, evi} from '../../src'


describe('hooks', function () {
  describe('#evi', function () {
    it('adds stream with DOM events', function () {
      let node = h('input#input', {
        input: evi('TYPE', (ev) => ev.detail.value),
      })
      let onValue = sinon.stub()
      node.stream.onValue(onValue)

      let doc = createDocument(node)
      let el = doc.getElementById('input')
      let event = doc.createCustomEvent('input', {value: 'VALUE'})

      sinon.assert.notCalled(onValue)
      el.dispatchEvent(event)
      sinon.assert.calledOnce(onValue)
      sinon.assert.calledWithExactly(onValue, {type: 'TYPE', value: 'VALUE'})
    })
  })

  describe('#ev', function () {
    it('adds stream with DOM events', function () {
      let node = h('input#input', {
        input: ev((ev) => ev.detail.value),
      })
      let onValue = sinon.stub()
      node.stream.onValue(onValue)

      let doc = createDocument(node)
      let el = doc.getElementById('input')
      let event = doc.createCustomEvent('input', {value: 'VALUE'})

      sinon.assert.notCalled(onValue)
      el.dispatchEvent(event)
      sinon.assert.calledOnce(onValue)
      sinon.assert.calledWithExactly(onValue, 'VALUE')
    })
  })
})
