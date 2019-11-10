import { Element } from '../Factor.js'

describe('FactorElement', function () {
  beforeEach(function () {
    document.body.innerHTML = ''
  })

  it('extends HTMLElement', function () {
    expect(Object.prototype.isPrototypeOf.call(HTMLElement.prototype, Element.prototype)).to.equal(true)
  })

  it('instances of child classes can be created with document.createElement', function () {
    class Test extends Element {}
    window.customElements.define('test-instances-can-be-created', Test)
    const element = document.createElement('test-instances-can-be-created')
    expect(element).to.be.instanceof(Element)
  })

  it('attaches a shadow root by default', function () {
    class Test extends Element {}
    window.customElements.define('test-attach-shadow-by-default', Test)
    const element = document.createElement('test-attach-shadow-by-default')
    expect(element.shadowRoot).to.exist // eslint-disable-line no-unused-expressions
  })

  it('sets the rootNode property to the shadow root', function () {
    class Test extends Element {}
    window.customElements.define('test-root-node-set-to-shadow-root', Test)
    const element = document.createElement('test-root-node-set-to-shadow-root')
    expect(element.rootNode).to.equal(element.shadowRoot)
  })

  it('attaches a template when the element is created', function () {
    const template = document.createElement('template')
    template.innerHTML = '<p>just testin</p>'
    class Test extends Element {
      static get template () {
        return template
      }
    }
    window.customElements.define('test-template-attached-on-creation', Test)
    const element = document.createElement('test-template-attached-on-creation')
    expect(element.rootNode.innerHTML).to.equal('<p>just testin</p>')
  })

  describe('.transform', function () {
    it('transforms an element\'s state', function () {
      class Test extends Element {}
      const symbol = Symbol('test symbol')
      Test.transforms = {
        test (state, data) {
          return {
            ...state,
            thing: data.thing + 5
          }
        },
        [symbol] (state, data) {
          return {
            ...state,
            thing2: data.thing + 6
          }
        }
      }

      window.customElements.define('test-base-element-transform', Test)
      const element = document.createElement('test-base-element-transform')
      element.set('value', 'ABC')
      expect(element.state).to.deep.equal({ value: 'ABC' })
      element.transform('test', { thing: 2 })
      expect(element.state).to.deep.equal({ value: 'ABC', thing: 7 })
      element.transform(symbol, { thing: 2 })
      expect(element.state).to.deep.equal({ value: 'ABC', thing: 7, thing2: 8 })
    })
  })
})
