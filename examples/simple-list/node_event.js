export default function eventHook (event, data) {
  return new NodeEventHook(event, data)
}

class NodeEventHook {
  constructor(event, data) {
    this.event = event
    this.data = data

    this.listener = ({target}) => {
      let ev = new Event(this.event, {bubbles: true})
      ev.data = data
      target.dispatchEvent(ev)
    }
  }

  hook(node, name) {
    node.addEventListener(name, this.listener)
  }

  unhook(node, name) {
    node.removeEventListener(name, this.listener)
  }

}
