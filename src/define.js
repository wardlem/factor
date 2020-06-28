import FactorElement from './FactorElement'
import {
  setFunctionName,
  camelToKebab
} from './Util'

import {
  loadStyleSheet
} from './Loader'

import {
  calculateDefaultProps,
  convertProp,
  defineProps
} from './Property'

export default function define (name, definition = {}) {
  const {
    tag = camelToKebab(name),
    template = '',
    styles = null,
    props = {},
    calculations = {},
    handlers = {},
    transforms = {},
    actions = {},
    register = true,
    reactive = true
  } = definition

  const templateElement = document.createElement('template')
  templateElement.innerHTML = template

  const defaultProps = calculateDefaultProps(props)
  const observedAttributes = Object.entries(props).map(
    ([name, prop]) => prop.attribute || camelToKebab(name)
  )

  class CustomElement extends FactorElement {
    static get tag () {
      return tag
    }

    static get template () {
      return templateElement
    }

    static get stylesheet () {
      return loadStyleSheet(styles)
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

    static get handlers () {
      return handlers
    }

    static get calculations () {
      return calculations
    }

    static get transforms () {
      return transforms
    }

    static get actions () {
      return actions
    }

    static get reactive () {
      return reactive
    }

    static get observedAttributes () {
      return observedAttributes
    }

    static toString () {
      return tag
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
