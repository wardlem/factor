import {
  generateBinding
} from './Template'

import {
  getPath,
  setPath,
  immediately
} from './Util'

export default class FactorElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
    this._initState()
    this._initView()
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
    this.state = this._defaultProps()
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
    this._binding(this.state)
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

  get (key) {
    return getPath(this.state, key)
  }

  set (key, value) {
    this.state = setPath(this.state, key, value)
  }

  _defaultProps () {
    return this.constructor.defaultProps || {}
  }
}
