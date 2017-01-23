import {
  assert,
  sinon,
  describeEachEngine,
} from 'support'

import * as K from 'kefir-extra'
import * as KM from 'kefir-extra/mock'

import {h} from 'fixi'
import * as C from 'fixi/component'

describeEachEngine('Component', function () {

  describe('fromProperty()', function () {
    it('rerenders when value changes', function (doc) {
      const id = KM.createProperty('initial')
      const c = C.fromProperty(id, (id) => h('div', {id}))
      doc.paint(c)
      assert.hasSelector(doc, '#initial')
      id.set('other')
      assert.notHasSelector(doc, '#initial')
      assert.hasSelector(doc, '#other')
    })

    it('(de)activates on (un)mount', function (doc) {
      const tree1 = KM.createProperty(h('div'))
      const c1 = C.fromProperty(tree1)
      assert.ok(!tree1.isActive())
      doc.paint(c1)
      assert.ok(tree1.isActive())

      const tree2 = KM.createProperty(h('div'))
      const c2 = C.fromProperty(tree2)
      doc.paint(c2)
      assert.ok(!tree1.isActive())
      assert.ok(tree2.isActive())

      doc.paint(h('div'))
      assert.ok(!tree2.isActive())
    })

    it('does not reactivate when property is used twice in component', function (doc) {
      const activate = sinon.spy((emitter) => {
        emitter.emit(null)
      })
      const tree = K.stream(activate).map(() => h('div'))
      const c1 = C.fromProperty(tree)
      const c2 = C.fromProperty(tree)
      doc.paint(c1)
      sinon.assert.calledOnce(activate)
      doc.paint(c2)
      sinon.assert.calledOnce(activate)
    })
  })

  test('stateful()', function (doc) {
    let update
    const render = sinon.spy((content, _update) => {
      update = _update
      return h('div', {id: 'target'}, [content])
    })
    const c = C.stateful(render, 'A')
    doc.paint(c)
    const target = doc.getElementById('target')

    assert.calledOnceWith(render, 'A')
    assert.equal(target.textContent, 'A')

    update('B')
    assert.calledWith(render, 'B')
    assert.equal(target.textContent, 'B')
  })
})
