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
})
