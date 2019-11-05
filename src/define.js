import FactorElement from './FactorElement'
import {
  setFunctionName,
  camelToKebab,
  isEqual
} from './Util'

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
  const observedAttributes = Object.keys(props).map(
    (name) => name.toLowerCase()
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

function defineProps (proto, props) {
  for (const [key, def] of Object.entries(props)) {
    defineProp(proto, key, def)
  }
}

function defineProp (proto, key, def) {
  const lcKey = key.toLowerCase()
  const descriptor = {
    get () {
      return this.get(key)
    },
    set (value) {
      const currentValue = this.get(key)
      if (!isEqual(currentValue, value)) {
        this.set(key, value)
        this.render()
      }
    }
  }

  Object.defineProperty(proto, key, descriptor)
  // We also define the lowercase key because attributes
  // are always converted to lowercase.
  if (lcKey !== key) {
    Object.defineProperty(proto, lcKey, descriptor)
  }
}

function calculateDefaultProps (props) {
  const defaults = {}
  for (const [key, data] of Object.entries(props)) {
    defaults[key] = data.default
  }

  return defaults
}
