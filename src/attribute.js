export default function attr (val) {
  return new AttributeHook(val)
}

class AttributeHook {
  constructor (value) {
    this._value = value
  }

  hook (node, prop) {
    node.setAttribute(prop, this._value);
  }

  unhook (node, prop) {
    node.removeAttribute(prop, this._value);
  }
}

