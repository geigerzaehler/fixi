import {
  assert,
  sinon,
  describeEachEngine,
} from 'support'

import {h} from 'fixi'
import * as T from 'fixi/thunk'
import * as C from 'fixi/component'
import deepEqual from 'lodash/isEqual'

describeEachEngine('VTree.Thunk', function () {

  // Test that thunk are only rendered when arguments are strictly equal
  test('thunk()', function (doc) {
    const render = sinon.spy((...children) => {
      return h('div', {id: 'target'}, children)
    })
    const t = T.thunk(render)
    assert.notCalled(render)
    doc.paint(t('A', 'B'))
    assert.calledOnceWith(render, 'A', 'B')

    const target = doc.getElementById('target')
    assert.equal(target.textContent, 'AB')

    // Rerender with same arguments
    render.reset()
    doc.paint(t('A', 'B'))
    assert.notCalled(render)

    // Rerender with different arguments
    render.reset()
    doc.paint(t('A', 'C'))
    assert.calledOnceWith(render, 'A', 'C')

    // Assert we patch the node and do not replace it
    assert.equal(target.textContent, 'AC')
  })

  it('rerenders thunk with different function', function (doc) {
    const t1 = T.thunk(() => h('div', {id: 't1'}))
    const t2 = T.thunk(() => h('div', {id: 't2'}))
    doc.paint(t1('A'))
    assert.hasSelector(doc, '#t1')
    doc.paint(t2('A'))
    assert.hasSelector(doc, '#t2')
  })

  // TODO only works with preact
  test('nested thunk', function (doc) {
    if (doc.engine === 'virtual-dom') { return }

    const render = sinon.spy((...children) => {
      return h('div', {id: 'target'}, children)
    })
    const inner = T.thunk(render)
    const outer = T.thunk(inner)
    doc.paint(outer('A', 'B'))
    assert.calledOnceWith(render, 'A', 'B')
  })


  test('thunk() with custom equality', function (doc) {
    const render = sinon.spy((...children) => {
      return h('div', {id: 'target'}, children)
    })
    const t = T.thunk(render, (as, bs) => {
      as = as.map((x) => x.toLowerCase())
      bs = bs.map((x) => x.toLowerCase())
      return deepEqual(as, bs)
    })
    assert.notCalled(render)
    doc.paint(t('A', 'B'))
    assert.calledOnceWith(render, 'A', 'B')

    const target = doc.getElementById('target')
    assert.equal(target.textContent, 'AB')

    // Rerender when custom equality returns true
    render.reset()
    doc.paint(t('a', 'b'))
    assert.notCalled(render)

    // Rerender with different arguments
    render.reset()
    doc.paint(t('A', 'C'))
    assert.calledOnceWith(render, 'A', 'C')

    // Assert we patch the node and do not replace it
    assert.equal(target.textContent, 'AC')
  })


  // Return a component from the thunk
  test('thunk() with component', function (doc) {
    const mount = sinon.spy()
    const t = T.thunk((...children) => {
      return C.primitive((paint) => {
        mount(...children)
        paint(h('div', {id: 'target'}, children))
      })
    })

    doc.paint(t('A', 'B'))
    assert.calledOnce(mount)

    const target = doc.getElementById('target')
    assert.equal(target.textContent, 'AB')

    // Rerender with same arguments
    mount.reset()
    doc.paint(t('A', 'B'))
    assert.notCalled(mount)

    // Rerender with different arguments
    mount.reset()
    doc.paint(t('A', 'C'))
    assert.calledOnceWith(mount, 'A', 'C')

    // Assert we patch the node and do not replace it
    assert.equal(target.textContent, 'AC')
  })


  // Test that thunk are only rendered when arguments are deep equal
  test('thunkDeepEqual()', function (doc) {
    const render = sinon.spy(({a, b}) => {
      return h('div', {id: 'target'}, [a, b])
    })
    const t = T.thunkDeepEqual(render)

    doc.paint(t({a: 'A1', b: 'B1'}))
    assert.calledOnce(render)

    doc.paint(t({a: 'A1', b: 'B1'}))
    assert.calledOnce(render)

    const target = doc.getElementById('target')
    assert.equal(target.textContent, 'A1B1')

    doc.paint(t({a: 'A2', b: 'B1'}))
    assert.equal(target.textContent, 'A2B1')
  })
})
