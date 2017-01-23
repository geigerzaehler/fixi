VTree
-----

The VTree is a data representation of a virtual DOM tree.

The simplest way to construct a VTree is to use the well-known hyperscript
function.

~~~js
h('div', ['Hello!'])
~~~

This returns a VTree that looks like this
~~~
Element {
  tag: 'div',
  attrs: {},
  children: [
    Text { text: 'Hello!' }
  ]
}
~~~

A Haskell-like data specification for a VTree looks like this
~~~haskell
data VTree
    Text String
  | Element String [Attribute] [VTree]
  | Component MountFn
  | Thunk (IO VTree)

type MountFn =
  (VTree -> IO ())  -- paint a tree
  -> IO (IO ())     -- return cleanup function

data Attribute =
    Attribute String String
  | Property String JSValue
  | EventHandler String (Event -> IO ())
~~~

The actual definition which is written in PureScript is a bit more involved
since it includes event handling and uses effects instead of the `IO` monad.

TODO explain from and to React

TODO
----

* Explain engines
