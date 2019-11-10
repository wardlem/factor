import FactorElement from './FactorElement'
import {
  setFunctionName,
  camelToKebab
} from './Util'

import {
  calculateDefaultProps,
  convertProp,
  defineProps
} from './Property'

export default function define (name, definition = {}) {
  const {
    tag = camelToKebab(name),
    template = '',
    props = {},
    register = true
  } = definition

  const templateElement = document.createElement('template')
  templateElement.innerHTML = template

  const defaultProps = calculateDefaultProps(props)
  const observedAttributes = Object.entries(props).map(
    ([name, prop]) => prop.attribute || name.toLowerCase()
  )

  class CustomElement extends FactorElement {
    static get tag () {
      return tag
    }

    static get template () {
      return templateElement
    }

    static get defaultProps () {
      return defaultProps
    }

    static convertProp (name, value) {
      const prop = props[name]
      if (!prop) {
        return value
      }

      return convertProp(prop, value)
    }

    static get observedAttributes () {
      return observedAttributes
    }
  }

  setFunctionName(CustomElement, name)

  defineProps(CustomElement.prototype, props)

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
