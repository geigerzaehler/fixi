import {
  assert,
  sinon,
  describeEachEngine,
} from 'support'

import {h} from 'fixi'
import * as C from 'fixi/component'

describeEachEngine('VTree.Component', function () {
  it('renders initial when component is patched in', function (doc) {
    const factory = sinon.spy((paint) => paint(h('div', {id: 'target'})))
    const c = C.primitive(factory)
    const initial = h('div')

    doc.paint(initial)
    assert.notCalled(factory)
    assert.notHasSelector(doc, '#target')

    doc.paint(c)
    assert.hasSelector(doc, '#target')
    assert.calledOnce(factory)
  })

  it('does not call factory when node is rerendered', function (doc) {
    const factory = sinon.spy((paint) => paint(h('div')))
    const c = C.primitive(factory)
    doc.paint(c)
    factory.reset()
    doc.paint(c)
    assert.notCalled(factory)
  })

  it('does not call factory when component has same mount', function (doc) {
    const factory = sinon.spy((paint) => paint(h('div')))
    doc.paint(C.primitive(factory))
    factory.reset()
    doc.paint(C.primitive(factory))
    assert.notCalled(factory)
  })

  it('patches inner nodes', function (doc) {
    doc.paint(C.primitive((p) => p(h('div', {id: 'target', class: 'B'}))))
    const target = doc.getElementById('target')
    assert.equal(target.classList[0], 'B')

    doc.paint(C.primitive((p) => p(h('div', {id: 'target', class: 'C'}))))
    // Instead or creating a new target node the node should be mutated.
    assert.equal(target.classList[0], 'C')
    assert.strictEqual(target, doc.getElementById('target'))
  })

  it('calls "destroy" when node is patched out', function (doc) {
    const destroy = sinon.stub()
    const c = C.primitive((paint) => {
      paint(h('div'))
      return destroy
    })

    doc.paint(c)
    assert.notCalled(destroy)
    doc.paint(h('div'))
    assert.calledOnce(destroy)
  })

  it('updates dom when calling paint', function (doc) {
    let paint
    const c = C.primitive((paint_) => {
      paint = paint_
      paint(h('div', {id: 'initial'}))
    })

    doc.paint(c)
    assert.hasSelector(doc, '#initial')

    paint(h('div', {id: 'next'}))
    assert.notHasSelector(doc, '#initial')
    assert.hasSelector(doc, '#next')

    paint(h('div', {id: 'other'}))
    assert.notHasSelector(doc, '#next')
    assert.hasSelector(doc, '#other')
  })

  it('gets element in paint callback', function (doc) {
    let paint
    const painted = sinon.spy()
    const c = C.primitive((paint_) => {
      paint = paint_
      paint(h('div', {id: 'X'}), painted)
    })

    doc.paint(c)
    const target = doc.getElementById('X')
    assert.calledWith(painted, target)

    painted.reset()
    paint(h('div', {id: 'Y'}), painted)
    assert.calledWith(painted, target)
  })

  describe('events', function () {
    it('emits DOM events on event stream', function (doc) {
      let events, paint
      const c = C.primitive((_paint, getEventStream) => {
        events = getEventsRef(getEventStream('click'))
        paint = _paint
        paint(h('button', {id: 'button-1'}))
      })
      doc.paint(c)
      doc.getElementById('button-1').click()
      paint(h('button', {id: 'button-2'}))
      doc.getElementById('button-2').click()

      assert.equal(events.length, 2)
      assert.equal(events[0].type, 'click')
      assert.equal(events[1].type, 'click')
    })

    it('ends event stream when component is unmounted', function (doc) {
      const onEnd = sinon.spy()
      const c = C.primitive((paint, getEventStream) => {
        getEventStream('click').onEnd(onEnd)
        paint(h('div'))
      })
      doc.paint(c)
      doc.paint(h('div'))
      assert.calledOnce(onEnd)
    })

    it('continues to listen to replacement dom', function (doc) {
      let events, paint
      const c = C.primitive((_paint, getEventStream) => {
        events = getEventsRef(getEventStream('click'))
        paint = _paint
        paint(h('button', {id: 'button-1'}))
      })
      doc.paint(c)
      doc.getElementById('button-1').click()
      // We use a different element to make sure that the DOM node has been
      // replaced
      paint(h('select', {id: 'button-2'}))
      doc.getElementById('button-2').click()

      assert.equal(events.length, 2)
      assert.equal(events[0].type, 'click')
      assert.equal(events[1].type, 'click')
    })
  })

  it('emits events', function (doc) {
    let emit
    const c = C.primitive((paint, _, _emit) => {
      emit = _emit
      paint(h('div'))
    })
    doc.paint(c)

    const onEmit = sinon.spy()
    doc.addEventListener('customevent', onEmit)
    const event = new doc.defaultView.Event('customevent', {bubbles: true})
    emit(event)
  })
})

// TODO move to kefir-extra
function getEventsRef (stream) {
  const events = []
  stream.onValue((x) => events.unshift(x))
  return events
}
