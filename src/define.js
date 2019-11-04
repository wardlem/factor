import FactorElement from './FactorElement'
import {
  setFunctionName,
  camelToKebab
} from './Util'

export default function define (name, definition = {}) {
  const {
    tag = camelToKebab(name),
    register = true
  } = definition

  class CustomElement extends FactorElement {
    static get tag () {
      return tag
    }
  }

  setFunctionName(CustomElement, name)

  if (register) {
    if (customElements.get(tag)) {
      // The error thrown by some browsers when a duplicate tag is registered is
      // not always helpful (I'm looking at you Firefox), so we throw our own
      // error with an actually useful error message.
      throw Error(`An element with the tag ${tag} has already been registered with the custom element registry`)
    }
    customElements.define(tag, CustomElement)
  }

  return CustomElement
}
