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
    styles: _styles = null,
    props = {},
    calculations = {},
    handlers = {},
    transforms = {},
    actions = {},
    register = true,
    reactive = true
  } = processDefinition(definition)

  const templateElement = document.createElement('template')
  templateElement.innerHTML = template

  const defaultProps = calculateDefaultProps(props)
  const observedAttributes = Object.entries(props).map(
    ([name, prop]) => prop.attribute || camelToKebab(name)
  )

  let styles = _styles
  if (styles == null) {
    styles = []
  } else if (!Array.isArray(styles)) {
    styles = [styles]
  }

  class CustomElement extends FactorElement {
    static get tag () {
      return tag
    }

    static get template () {
      return templateElement
    }

    static get stylesheets () {
      return styles.map(loadStyleSheet)
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

function processDefinition (_definition) {
  const {
    mixins = []
  } = _definition

  const mixedIn = {}
  const OBJECT_PROPS = ['calculations', 'props', 'handlers', 'transforms', 'actions']
  const ARRAY_PROPS = ['styles']
  const OVERRIDABLE_PROPS = ['template']
  for (const mixin of mixins.concat([_definition])) {
    for (const key of OBJECT_PROPS) {
      if (mixin[key]) {
        mixedIn[key] = {
          ...(mixedIn[key] || {}),
          ...mixin[key]
        }
      }
    }

    for (const key of ARRAY_PROPS) {
      if (mixin[key] == null) {
        continue
      }

      let value = mixin[key]
      if (!Array.isArray(value)) {
        value = [value]
      }

      mixedIn[key] = (mixedIn[key] || []).concat(value)
    }

    for (const key of OVERRIDABLE_PROPS) {
      if (mixin[key] != null) {
        mixedIn[key] = mixin[key]
      }
    }
  }

  return { ..._definition, ...mixedIn }
}
