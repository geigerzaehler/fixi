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

  coit('subscribes to returned stream', function* () {
    let subscribe = sinon.stub()
    let fixed = fix((stream) => K.stream(subscribe))

    sinon.assert.notCalled(subscribe)
    fixed.onValue()
    sinon.assert.calledOnce(subscribe)
  })

  coit('unsubscribes from returned stream', function* () {
    let unsubscribe = sinon.stub()
    let fixed = fix((stream) => K.stream(() => unsubscribe))

    let cb = () => {}
    fixed.onValue(cb)
    sinon.assert.notCalled(unsubscribe)
    fixed.offValue(cb)
    sinon.assert.called(unsubscribe)
  })

  coit('immediately gets the inital value', function* () {
    let fixed = fix(() => K.constant('INITIAL'))
    let onValue = sinon.stub()
    fixed.onValue(onValue)
    sinon.assert.calledOnce(onValue)
    sinon.assert.calledWith(onValue, 'INITIAL')
  })

  coit('gets the initial value later', function* () {
    let fixed = fix(() => K.constant('INITIAL'))
    let onValue = sinon.stub()
    // Jump to the next tick
    yield Promise.resolve()
    fixed.onValue(onValue)
    yield Promise.resolve()
    sinon.assert.calledOnce(onValue)
    sinon.assert.calledWith(onValue, 'INITIAL')
  })

  it('creates delayed increasing property', function () {
    let onValue = sinon.stub()

    fix((stream) => {
      return stream
      .delay(10).map((x) => x + 1)
      .toProperty(() => 0)
    }).onValue(onValue)

    sinon.assert.calledWith(onValue, 0)
    for (let i = 1; i < 10; i++) {
      this.clock.tick(10)
      sinon.assert.calledWith(onValue, i)
    }
  })

  it('constructs undecoupled stream with "skipDuplicates"', function () {
    let onValue = sinon.stub()

    fix((stream) => {
      return stream
      .skipDuplicates()
      .toProperty(() => 0)
    }).onValue(onValue)
    sinon.assert.calledWith(onValue, 0)
  })
})
