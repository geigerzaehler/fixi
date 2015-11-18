import * as K from 'kefir'
import sinon from 'sinon'

import {fix} from '../../src'

describe('fix()', () => {

  beforeEach(function () {
    this.clock = sinon.useFakeTimers()
  })

  afterEach(function () {
    this.clock.restore()
  })

  coit('subscribes to returned stream', function *() {
    let subscribe = sinon.stub().returns({})
    let fixed = fix((stream) => K.stream(subscribe))

    sinon.assert.notCalled(subscribe)

    setTimeout(() => fixed, 1000)
    let cb = () => {}
    fixed.onValue(cb)
    this.clock.tick()
    sinon.assert.calledOnce(subscribe)
  })

  coit('unsubscribes from returned stream', function *() {
    let unsubscribe = sinon.stub().returns({})
    let fixed = fix((stream) => K.stream(() => unsubscribe))

    sinon.assert.notCalled(unsubscribe)
    let cb = () => {}
    fixed.onValue(cb)
    this.clock.tick()
    sinon.assert.notCalled(unsubscribe)
    fixed.offValue(cb)
    sinon.assert.called(unsubscribe)
  })

  coit('gets the inital value from the returned stream', function *() {
    let fixed = fix(() => K.constant('INITIAL'))
    let onValue = sinon.stub()
    this.clock.tick(1000)
    fixed.onValue(onValue)

    this.clock.tick(1)
    sinon.assert.calledOnce(onValue)
    sinon.assert.calledWith(onValue, 'INITIAL')
  })

  coit('receives values from a property', function *() {
    let onValue = sinon.stub()

    fix((stream) => {
      stream.onValue(onValue)
      return K.constant('INITIAL')
    })

    sinon.assert.notCalled(onValue)
    this.clock.tick(1)
    sinon.assert.calledOnce(onValue)
    sinon.assert.calledWith(onValue, 'INITIAL')
  })

  coit('receives values from a stream', function *() {
    let onValue = sinon.stub()

    fix((stream) => {
      stream.onValue(onValue)
      return K.later(100, 'INITIAL')
    })

    this.clock.tick(100)
    sinon.assert.notCalled(onValue)
    this.clock.tick(101)
    sinon.assert.calledOnce(onValue)
    sinon.assert.calledWith(onValue, 'INITIAL')
  })

})
