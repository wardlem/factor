import { define, Element } from '../Factor.js'

describe('define', function () {
  it('creates classes that extend Factor.Element', function () {
    const FirstTestElement = define('FirstTestElement', { register: false })
    expect(Object.prototype.isPrototypeOf.call(Element.prototype, FirstTestElement.prototype)).to.equal(true)
  })

  it('creates classes that extend HTMLElement', function () {
    const SecondTestElement = define('SecondTestElement', { register: false })
    expect(Object.prototype.isPrototypeOf.call(HTMLElement.prototype, SecondTestElement.prototype)).to.equal(true)
  })

  it('correctly names the class', function () {
    const TheShredder = define('TheShredder', { register: false })
    expect(TheShredder.name).to.equal('TheShredder')
  })

  it('correctly calculates the tag of the class if not supplied', function () {
    const ThisIsMyClassName = define('ThisIsMyClassName', { register: false })
    expect(ThisIsMyClassName.tag).to.equal('this-is-my-class-name')
  })

  it('uses the received tag if supplied', function () {
    const TestElement = define('TestElement', {
      register: false,
      tag: 'other-tag'
    })

    expect(TestElement.tag).to.equal('other-tag')
  })

  it('accepts a kebab name', function () {
    const TestElement = define('test-element', { register: false })
    expect(TestElement.name).to.equal('test-element')
    expect(TestElement.tag).to.equal('test-element')
  })

  it('does not register an element if the register option is false', function () {
    const FirstRegistrationTest = define('FirstRegistrationTest', { register: false })
    // eslint-disable-next-line no-unused-expressions
    expect(window.customElements.get(FirstRegistrationTest.tag)).to.be.undefined
  })

  it('registers an element if the register option is true', function () {
    const SecondRegistrationTest = define('SecondRegistrationTest', { register: true })
    expect(window.customElements.get(SecondRegistrationTest.tag)).to.equal(SecondRegistrationTest)
  })

  it('registers an element if no register option provided', function () {
    const ThirdRegistrationTest = define('ThirdRegistrationTest', {})
    expect(window.customElements.get(ThirdRegistrationTest.tag)).to.equal(ThirdRegistrationTest)
  })

  it('sets a template property on the constructor that is a template element', function () {
    const TemplateTest = define('TemplateTest', { register: false })
    expect(TemplateTest.template).to.be.an.instanceof(HTMLTemplateElement)
  })

  it('creates an empty template by default', function () {
    const TemplateTest = define('TemplateTest', { register: false })
    expect(TemplateTest.template.innerHTML).to.equal('')
  })

  it('sets the templates html when provided', function () {
    const TemplateTest = define('TemplateTest', {
      register: false,
      template: 'template contents'
    })
    expect(TemplateTest.template.innerHTML).to.equal('template contents')
  })

  it('allows properties to be defined with default values', function () {
    const props = {
      firstTest: { default: 'one' },
      secondTest: { default: 'two' }
    }

    const DefinePropertyTestOne = define('DefinePropertyTestOne', { props })

    const element = document.createElement(DefinePropertyTestOne.tag)
    expect(element.firstTest).to.equal('one')
    expect(element.secondTest).to.equal('two')
  })

  it('makes props updatable as a property', function () {
    const props = {
      testProp: { default: 'initial' }
    }

    const DefinePropertyTestTwo = define('DefinePropertyTestTwo', { props })

    const element = document.createElement(DefinePropertyTestTwo.tag)
    expect(element.testProp).to.equal('initial')
    element.testProp = 'updated'
    expect(element.testProp).to.equal('updated')
  })

  it('makes props updatable as an attribute', function () {
    const props = {
      testProp: { default: 'initial' }
    }

    const DefinePropertyTestThree = define('DefinePropertyTestThree', { props })

    const element = document.createElement(DefinePropertyTestThree.tag)
    expect(element.testProp).to.equal('initial')
    element.setAttribute('testProp', 'updated')
    expect(element.testProp).to.equal('updated')
  })

  it('dynamically updates the view when the property changes', function (done) {
    const props = {
      testProp: { default: 'initial' }
    }

    const template = '{{testProp}}'

    const PropertyUpdateTestOne = define('PropertyUpdateTestOne', { props, template })
    const element = document.createElement(PropertyUpdateTestOne.tag)
    expect(element.rootNode.innerHTML).to.equal('initial')
    element.testProp = 'updated'

    // Updates are asynchronously batched, so we have to wait a moment...
    setTimeout(() => {
      expect(element.rootNode.innerHTML).to.equal('updated')
      done()
    }, 10)
  })
})
