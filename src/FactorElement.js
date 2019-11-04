export default class FactorElement extends HTMLElement {
  constructor () {
    super()
    this.attachShadow({ mode: 'open' })
  }

  get rootNode () {
    if (this.shadowRoot) {
      return this.shadowRoot
    }

    return this
  }
}
