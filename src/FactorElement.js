import {
  generateBinding
} from './Template'

import {
  getPath,
  setPath,
  immediately,
  isEqual,
  CONSTRUCTABLE_STYLES_AVAILABLE
} from './Util'

export default class FactorElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this._dataProto = buildDataProto(this, this._handlers, this._calculations)
    this._initState()
    this._initView()
    this._render()
    this._initStyles()
      .catch((err) => {
        console.error(`Could not initialize stylesheet for ${this.constructor.name}`, err)
      })
    this._renderFrame = null
  }

  get rootNode () {
    if (this.shadowRoot) {
      return this.shadowRoot
    }

    return this
  }

  attributeChangedCallback (name, oldValue, newValue) {
    // This should trigger a setter
    this[name] = newValue
  }

  _initState () {
    this.state = {
      ...this._defaultProps()
    }

    for (const key of Object.keys(this.state)) {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        // The prop was set before the element type was defined.
        // This creates a situation where the prototype getter / setter
        // has been overwritten by a new property descriptor on the instance.
        // To correct this, we need to redefine the property and set the
        // current value in the state.

        const value = this[key]
        Object.defineProperty(
          this,
          key,
          Object.getOwnPropertyDescriptor(this.constructor.prototype, key)
        )

        // Make sure the setter is called
        this[key] = value
      }
    }

    this.transform('init', {}, false)
    this.action('init', {})
  }

  _initView () {
    const template = this.constructor.template
    if (template) {
      const fragment = document.importNode(template.content, true)
      if (!this.constructor.reactive) {
        // NOOP
        this._binding = () => {}
      } else {
        this._binding = generateBinding(fragment)
      }
      this.rootNode.appendChild(fragment)
    } else {
      // NOOP
      this._binding = () => {}
    }
  }

  async _initStyles () {
    const stylesheet = await this.constructor.stylesheet
    if (stylesheet) {
      if (CONSTRUCTABLE_STYLES_AVAILABLE) {
        this.rootNode.adoptedStyleSheets = [stylesheet]
      } else {
        const linkEl = document.createElement('link')
        linkEl.href = stylesheet
        linkEl.rel = 'stylesheet'
        this.rootNode.prepend(linkEl)
      }
    }
  }

  _render () {
    this._binding(this.viewData)
  }

  render () {
    if (this._renderFrame != null) {
      return
    }

    this._renderFrame = immediately(() => {
      this._renderFrame = null
      this._render()
    })
  }

  transform (type, data = {}, doRender = true) {
    const transforms = this._transforms
    if (typeof transforms[type] !== 'function') {
      return
    }

    const prevState = this.newState
    this.state = transforms[type](this.state, data)
    if (doRender && !isEqual(prevState, this.state)) {
      this.render()
    }
  }

  action (type, data = {}) {
    const actions = this._actions
    if (typeof actions[type] !== 'function') {
      return
    }

    // Always trigger actions asynchronously
    return new Promise((resolve) => {
      immediately(() => {
        resolve(actions[type](this.state, data, this))
      })
    })
  }

  get (key) {
    return getPath(this.state, key)
  }

  set (key, value) {
    this.state = setPath(this.state, key, value)
  }

  get viewData () {
    return {
      ...this.state,
      __proto__: this._dataProto
    }
  }

  get _transforms () {
    return this.constructor.transforms || {}
  }

  get _actions () {
    return this.constructor.actions || {}
  }

  get _handlers () {
    return this.constructor.handlers || {}
  }

  get _calculations () {
    return this.constructor.calculations || {}
  }

  _defaultProps () {
    return this.constructor.defaultProps || {}
  }
}

const resolving = Symbol('Factor/resolving')
function buildDataProto (element, handlers, calculations) {
  const cache = new WeakMap()
  const proto = {}
  for (const [key, calculate] of Object.entries(calculations)) {
    Object.defineProperty(proto, key, {
      get: function () {
        let cached = cache.get(this)
        if (cached == null) {
          cached = {}
          cache.set(this, cached)
        }

        if (cached[key] === resolving) {
          // Circular calculation...prevent an infinite loop
          throw Error(`Circular calculation detected for key ${key}`)
        } else if (typeof cached[key] !== 'undefined') {
          return cached[key]
        }

        // Set the key to prevent a circular loop
        cached[key] = resolving
        const result = calculate(this)
        // Cache the result
        cached[key] = result

        return result
      }
    })
  }

  for (const [key, handle] of Object.entries(handlers)) {
    proto[key] = function (event) {
      handle(event, element)
    }
  }

  return proto
}
