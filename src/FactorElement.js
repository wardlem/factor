import {
  generateBinding
} from './Template'

import {
  getPath,
  setPath,
  immediately,
  objectFrom,
  isEqual
} from './Util'

export default class FactorElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this._initState()
    this._initView()
    this._handlers = this._generateHandlers()
    this._render()
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

    this.transform('init', {}, false)
  }

  _initView () {
    const template = this.constructor.template
    if (template) {
      const fragment = document.importNode(template.content, true)
      this._binding = generateBinding(fragment)
      this.rootNode.appendChild(fragment)
    } else {
      // NOOP
      this._binding = () => {}
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
      ...this._handlers
    }
  }

  _generateHandlers () {
    const handlers = this.constructor.handlers || {}
    return objectFrom(Object.entries(handlers).map(
      ([key, handle]) => [key, (event) => handle(event, this)]
    ))
  }

  get _transforms () {
    return this.constructor.transforms || {}
  }

  get _actions () {
    return this.constructor.actions || {}
  }

  _defaultProps () {
    return this.constructor.defaultProps || {}
  }
}
