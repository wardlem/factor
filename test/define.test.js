import { define, Element } from '../Factor.js'

function waitFor (time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time)
  })
}

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

  it('stringifies to the tag name', function () {
    const TestElement = define('TestElement', {
      register: false,
      tag: 'other-tag'
    })

    expect(String(TestElement)).to.equal('other-tag')
  })

  it('accepts a kebab name', function () {
    const TestElement = define('test-element', { register: false })
    expect(TestElement.name).to.equal('test-element')
    expect(TestElement.tag).to.equal('test-element')
  })

  it('does not register an element if the register option is false', function () {
    const FirstRegistrationTest = define('FirstRegistrationTest', { register: false })
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
    element.setAttribute('test-prop', 'updated')
    expect(element.testProp).to.equal('updated')
  })

  it('sets a sensible default if no default provided but type is provided', function () {
    const props = {
      stringProp: { type: String },
      boolProp: { type: Boolean },
      numProp: { type: Number },
      arrayProp: { type: Array },
      objProp: { type: Object },
      dateProp: { type: Date }
    }

    const DefinePropertyTestFour = define('DefinePropertyTestFour', { props })

    const element = document.createElement(DefinePropertyTestFour.tag)
    expect(element.stringProp).to.equal('')
    expect(element.boolProp).to.equal(false)
    expect(element.numProp).to.equal(0)
    expect(element.arrayProp).to.deep.equal([])
    expect(element.objProp).to.deep.equal({})
    expect(element.dateProp).to.deep.equal(new Date(0))
  })

  it('allows the attribute key to be overriden', function () {
    const props = {
      testProp: {
        default: 'initial',
        attribute: 'alternate-attribute'
      }
    }

    const DefinePropertyTestFive = define('DefinePropertyTestFive', { props })

    const element = document.createElement(DefinePropertyTestFive.tag)
    expect(element.testProp).to.equal('initial')
    element.setAttribute('alternate-attribute', 'updated')
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

  it('calls a convert function if provided', function (done) {
    const props = {
      testProp: {
        default: 'initial',
        convert: (value) => `${value}!!`
      }
    }

    const template = '{{testProp}}'

    const PropertyUpdateTestTwo = define('PropertyUpdateTestTwo', { props, template })
    const element = document.createElement(PropertyUpdateTestTwo.tag)
    expect(element.rootNode.innerHTML).to.equal('initial')
    element.testProp = 'updated'

    // Updates are asynchronously batched, so we have to wait a moment...
    setTimeout(() => {
      expect(element.rootNode.innerHTML).to.equal('updated!!')
      done()
    }, 15)
  })

  it('converts a property to a string if the type is String', function () {
    const props = {
      stringProp: { type: String }
    }

    const StringPropertyTest = define('StringPropertyTest', { props })
    const element = document.createElement(StringPropertyTest.tag)
    expect(element.stringProp).to.equal('')
    element.stringProp = 'updated'
    expect(element.stringProp).to.equal('updated')
    element.stringProp = 100
    expect(element.stringProp).to.equal('100')
    element.stringProp = true
    expect(element.stringProp).to.equal('true')
    element.stringProp = null
    expect(element.stringProp).to.equal('')
  })

  it('converts a property to a number if the type is Number', function () {
    const props = {
      numberProp: { type: Number }
    }

    const NumberPropertyTest = define('NumberPropertyTest', { props })
    const element = document.createElement(NumberPropertyTest.tag)
    expect(element.numberProp).to.equal(0)
    element.numberProp = '500.25'
    expect(element.numberProp).to.equal(500.25)
    element.numberProp = 100
    expect(element.numberProp).to.equal(100)
    element.numberProp = null
    expect(element.numberProp).to.equal(0)
  })

  it('converts a property to a boolean if the type is Boolean', function () {
    const props = {
      boolProp: { type: Boolean }
    }

    const BooleanPropertyTest = define('BooleanPropertyTest', { props })
    const element = document.createElement(BooleanPropertyTest.tag)
    expect(element.boolProp).to.equal(false)
    element.boolProp = 0
    expect(element.boolProp).to.equal(false)
    element.boolProp = 1
    expect(element.boolProp).to.equal(true)
    element.boolProp = ''
    expect(element.boolProp).to.equal(true)
    element.boolProp = 'ok'
    expect(element.boolProp).to.equal(true)
  })

  it('converts a property to an array if the type is Array', function () {
    const props = {
      arrayProp: { type: Array }
    }

    const ArrayPropertyTest = define('ArrayPropertyTest', { props })
    const element = document.createElement(ArrayPropertyTest.tag)
    expect(element.arrayProp).to.deep.equal([])
    element.arrayProp = '[1,2,3]'
    expect(element.arrayProp).to.deep.equal([1, 2, 3])
    element.arrayProp = 'first,second,third'
    expect(element.arrayProp).to.deep.equal(['first', 'second', 'third'])
    element.arrayProp = null
    expect(element.arrayProp).to.deep.equal([])
  })

  it('converts array sub properties if a sub is provided', function () {
    const props = {
      arrayProp: {
        type: Array,
        sub: {
          type: Number
        }
      }
    }

    const ArrayPropertyTest2 = define('ArrayPropertyTest2', { props })
    const element = document.createElement(ArrayPropertyTest2.tag)
    expect(element.arrayProp).to.deep.equal([])
    element.arrayProp = '["1","2","3"]'
    expect(element.arrayProp).to.deep.equal([1, 2, 3])
    element.arrayProp = '1,500,600'
    expect(element.arrayProp).to.deep.equal([1, 500, 600])
  })

  it('converts a property to an object if the type is Object', function () {
    const props = {
      objProp: { type: Object }
    }

    const ObjectPropertyTest = define('ObjectPropertyTest', { props })
    const element = document.createElement(ObjectPropertyTest.tag)
    expect(element.objProp).to.deep.equal({})
    element.objProp = '{"one": 1, "two": 2, "three": 3}'
    expect(element.objProp).to.deep.equal({ one: 1, two: 2, three: 3 })
    element.objProp = 'first:one,second:two,third:three'
    expect(element.objProp).to.deep.equal({
      first: 'one',
      second: 'two',
      third: 'three'
    })
    element.objProp = null
    expect(element.objProp).to.deep.equal({})
  })

  it('converts an object sub properties if a sub key is provided', function () {
    const props = {
      objProp: {
        type: Object,
        sub: {
          type: Number
        }
      }
    }

    const ObjectPropertyTest2 = define('ObjectPropertyTest2', { props })
    const element = document.createElement(ObjectPropertyTest2.tag)
    expect(element.objProp).to.deep.equal({})
    element.objProp = '{"one": "1", "two": "2", "three": "3"}'
    expect(element.objProp).to.deep.equal({ one: 1, two: 2, three: 3 })
    element.objProp = 'first:15,second:78,third:2'
    expect(element.objProp).to.deep.equal({
      first: 15,
      second: 78,
      third: 2
    })
  })

  it('converts a property to a date if the type is Date', function () {
    const props = {
      dateProp: { type: Date }
    }

    const DatePropertyTest = define('DatePropertyTest', { props })
    const element = document.createElement(DatePropertyTest.tag)
    expect(element.dateProp).to.deep.equal(new Date(0))
    element.dateProp = '2019-01-02T12:12:12.000Z'
    expect(element.dateProp).to.deep.equal(new Date('2019-01-02T12:12:12.000Z'))
    element.dateProp = 1573402593278
    expect(element.dateProp).to.deep.equal(new Date(1573402593278))
  })

  it('allows prop changes to trigger transforms', function () {
    const props = {
      value: { type: Number, default: 4, transform: 'double' }
    }

    const transforms = {
      double: (state) => {
        return {
          ...state,
          value: state.value * 2
        }
      }
    }

    const PropTransformTest = define('PropTransformTest', { props, transforms })
    const element = document.createElement(PropTransformTest.tag)
    expect(element.value).to.equal(4)
    element.value = 5
    expect(element.value).to.equal(10)
  })

  it('allows prop changes to trigger actions', function (done) {
    const props = {
      value: { type: Number, default: 4, action: 'double' }
    }

    const transforms = {
      add: (state, data) => {
        return {
          ...state,
          value: data * 2
        }
      }
    }

    const actions = {
      double: (state, data, ctx) => {
        ctx.transform('add', data)
      }
    }

    const PropActionTest = define('PropActionTest', {
      props,
      transforms,
      actions
    })
    const element = document.createElement(PropActionTest.tag)
    expect(element.value).to.equal(4)
    element.value = 5
    expect(element.value).to.equal(5)
    setTimeout(() => {
      expect(element.value).to.equal(10)
      done()
    }, 50)
  })

  it('registers props that are defined before the element is defined', function () {
    const props = {
      test: {
        type: String,
        default: 'wrong'
      }
    }

    const element = document.createElement('predefined-props-test')

    element.test = 'correct'

    const PredefinedPropsTest = define('PredefinedPropsTest', {
      props,
      tag: 'predefined-props-test'
    })

    document.body.appendChild(element)

    expect(element).to.be.instanceof(PredefinedPropsTest)
    expect(element.shadowRoot).to.exist
    expect(element.test).to.equal('correct')
    expect(element.state.test).to.equal('correct')

    document.body.removeChild(element)
  })

  it('allows event handlers to be defined', function (done) {
    const handlers = {
      customHandler: (event, ctx) => {
        expect(event).to.be.instanceof(Event)
        expect(event.type).to.equal('thing')
        expect(typeof ctx).to.equal('object')
        done()
      }
    }

    const template = '<div on:thing="customHandler"></div>'

    const HandlerTest1 = define('HandlerTest1', { handlers, template })

    const element = document.createElement(HandlerTest1.tag)

    const event = new Event('thing')
    element.rootNode.querySelector('div').dispatchEvent(event)
  })

  it('allows calculations to be defined', function (done) {
    const props = {
      number: {
        type: Number,
        default: 2
      }
    }

    const calculations = {
      squared: (data) => data.number ** 2
    }

    const template = '<div>{{squared}}</div>'

    const CalculationTest1 = define('CalculationTest1', {
      props,
      calculations,
      template
    })

    const element = document.createElement(CalculationTest1.tag)

    const div = element.rootNode.querySelector('div')
    expect(div.textContent).to.equal('4')
    element.setAttribute('number', '12')
    setTimeout(() => {
      expect(div.textContent).to.equal('144')
      done()
    }, 20)
  })

  it('detects recursive calculations', function () {
    const calculations = {
      bad: (data) => data.badder,
      badder: (data) => data.bad
    }

    const CalculationTest2 = define('CalculationTest2', {
      calculations
    })

    expect(() => {
      const element = document.createElement(CalculationTest2.tag)
      element.viewData.bad
    }).to.throw()
  })

  it('caches calculations', function () {
    let value = 1
    const calculations = {
      value: () => value++
    }

    const CalculationTest3 = define('CalculationTest3', {
      calculations
    })

    const element1 = document.createElement(CalculationTest3.tag)
    const element2 = document.createElement(CalculationTest3.tag)

    const viewData1 = element1.viewData
    const viewData2 = element2.viewData
    const viewData3 = element1.viewData

    expect(viewData1.value).to.equal(viewData1.value)
    expect(viewData2.value).to.not.equal(viewData1.value)
    expect(viewData3.value).to.not.equal(viewData1.value)
  })

  it('defines transform functions', function (done) {
    const symbol = Symbol('test transform')
    const transforms = {
      init: (state) => {
        return {
          ...state,
          value: 15
        }
      },
      test: (state, { add }) => {
        return {
          ...state,
          value: state.value + add
        }
      },
      [symbol]: (state, { minus }) => {
        return {
          ...state,
          value: state.value - minus
        }
      }
    }

    const template = '{{value}}'

    const TransformTest1 = define('TransformTest1', { transforms, template })

    const element = document.createElement(TransformTest1.tag)

    expect(element.rootNode.textContent).to.equal('15')
    element.transform('test', { add: 5 })
    expect(element.get('value')).to.equal(20)
    setTimeout(() => {
      expect(element.rootNode.textContent).to.equal('20')
      element.transform(symbol, { minus: 4 })
      expect(element.get('value')).to.equal(16)
      setTimeout(() => {
        expect(element.rootNode.textContent).to.equal('16')
        done()
      }, 15)
    }, 15)
  })

  it('defines action functions', async function () {
    const symbol = Symbol('test action')
    const actions = {
      test: (state, data, ctx) => {
        return new Promise((resolve) => {
          ctx.transform('test', data + 4)

          setTimeout(() => {
            resolve('ok')
          }, 10)
        })
      },
      [symbol]: (state, data, ctx) => {
        return new Promise((resolve) => {
          ctx.transform(symbol, data + 5)

          setTimeout(() => {
            resolve('yup')
          }, 10)
        })
      }
    }

    const transforms = {
      init: (state, data) => {
        return {
          ...state,
          tested: 1,
          symboled: 2
        }
      },
      test: (state, data) => {
        return { ...state, tested: data }
      },
      [symbol]: (state, data) => {
        return { ...state, symboled: data }
      }
    }

    const template = '{{tested}} / {{symboled}}'

    const ActionTest1 = define('ActionTest1', { transforms, actions, template })
    const element = document.createElement(ActionTest1.tag)
    expect(element.rootNode.textContent).to.equal('1 / 2')

    const testResult = await element.action('test', 2)
    expect(testResult).to.equal('ok')
    await waitFor(10)
    expect(element.rootNode.textContent).to.equal('6 / 2')

    const symbolResult = await element.action(symbol, 18)
    expect(symbolResult).to.equal('yup')
    await waitFor(10)
    expect(element.rootNode.textContent).to.equal('6 / 23')
  })

  it('allows styles to be defined', function (done) {
    const StyleTest1 = define('StyleTest1', {
      template: '<p class="testp"></p>',
      styles: '.testp {color: rgb(255, 0, 0)}'
    })

    const element = document.createElement(StyleTest1.tag)
    const p = element.rootNode.querySelector('p')
    expect(p).to.exist
    const styles = window.getComputedStyle(p)
    document.body.appendChild(element)
    // Delay, because it takes the browser a bit to parse / apply the styles
    setTimeout(() => {
      expect(styles.getPropertyValue('color')).to.equal('rgb(255, 0, 0)')
      document.body.removeChild(element)
      done()
    }, 50)
  })

  it('will load a stylesheet from a URL', function () {
    const StyleTest2 = define('StyleTest2', {
      template: '<p class="testp"></p>',
      styles: new URL('../static/test.css', import.meta.url).href
    })

    const element = document.createElement(StyleTest2.tag)
    const p = element.rootNode.querySelector('p')
    expect(p).to.exist
    const styles = window.getComputedStyle(p)
    document.body.appendChild(element)
    // Delay, because it takes the browser a bit to parse / apply the styles
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          expect(styles.getPropertyValue('color')).to.equal('rgb(255, 0, 0)')
          document.body.removeChild(element)
        } catch (err) {
          reject(err)
          return
        }

        resolve()
      }, 50)
    })
  })

  it('allows multipe styles to be defined', function () {
    const StyleTest3 = define('StyleTest3', {
      template: '<p class="testp"></p>',
      styles: [
        '.testp {font-weight: 800}',
        new URL('../static/test.css', import.meta.url)
      ]
    })

    const element = document.createElement(StyleTest3.tag)
    const p = element.rootNode.querySelector('p')
    expect(p).to.exist
    const styles = window.getComputedStyle(p)
    document.body.appendChild(element)
    // Delay, because it takes the browser a bit to parse / apply the styles
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          expect(styles.getPropertyValue('color')).to.equal('rgb(255, 0, 0)')
          expect(styles.getPropertyValue('font-weight')).to.equal('800')
          document.body.removeChild(element)
          resolve(null)
          return
        } catch (err) {
          reject(err)
        }
      }, 100)
    })
  })

  it('allows the view to be non-reactive', function (done) {
    const NonReactiveTest = define('NonReactiveTest', {
      register: true,
      template: '{{data}}',
      reactive: false,
      props: {
        data: {
          type: String,
          default: 'something'
        }
      }
    })

    expect(NonReactiveTest.template.innerHTML).to.equal('{{data}}')
    const element = document.createElement(NonReactiveTest.tag)
    element.data = 'something else'
    setTimeout(() => {
      expect(element.shadowRoot.innerHTML).to.equal('{{data}}')
      done()
    }, 50)
  })

  describe('mixins', function () {
    it('allows props to be mixed in', function () {
      const mixin = {
        props: {
          mixinProp: {
            type: String,
            default: 'mixed'
          },
          override: {
            type: Number,
            default: 2
          }
        }
      }

      const MixinPropTest1 = define('MixinPropTest1', {
        mixins: [mixin],
        props: {
          elementProp: {
            type: String,
            default: 'elemented'
          },
          override: {
            type: Number,
            default: 4
          }
        }
      })

      const element = document.createElement(MixinPropTest1.tag)
      expect(element.mixinProp).to.equal('mixed')
      expect(element.elementProp).to.equal('elemented')
      expect(element.override).to.equal(4)
    })

    it('allows calculations to be mixed in', function () {
      const mixin = {
        calculations: {
          mixedIn () {
            return 'mixed in'
          },
          override () {
            return 'wrong'
          }
        }
      }

      const MixinCalculationsTest1 = define('MixinCalculationsTest1', {
        mixins: [mixin],
        calculations: {
          elemented () {
            return 'element'
          },
          override () {
            return 'right'
          }
        },
        template: '{{mixedIn}} {{override}} {{elemented}}'
      })

      const element = document.createElement(MixinCalculationsTest1.tag)
      expect(element.shadowRoot.innerHTML).to.equal('mixed in right element')
    })

    it('allows handlers to be mixed in', function () {
      const data = {}
      const mixin = {
        handlers: {
          mixedIn () {
            data.mixedIn = 'mixed in'
          },
          override () {
            data.override = 'wrong'
          }
        }
      }

      const MixinHandlersTest1 = define('MixinHandlersTest1', {
        mixins: [mixin],
        handlers: {
          elemented () {
            data.elemented = 'element'
          },
          override () {
            data.override = 'right'
          }
        }
      })

      const element = document.createElement(MixinHandlersTest1.tag)
      const dataProto = element._dataProto
      expect(dataProto.mixedIn).to.be.a('function')
      expect(dataProto.mixedIn() || data.mixedIn).to.equal('mixed in')
      expect(dataProto.override).to.be.a('function')
      expect(dataProto.override() || data.override).to.equal('right')
      expect(dataProto.elemented).to.be.a('function')
      expect(dataProto.elemented() || data.elemented).to.equal('element')
    })

    it('allows transforms to be mixed in', function () {
      const mixin = {
        transforms: {
          mixedIn (state) {
            return {
              ...state,
              mixedIn: 'mixed in'
            }
          },
          override (state) {
            return {
              ...state,
              override: 'wrong'
            }
          }
        }
      }

      const MixinTransformsTest1 = define('MixinTransformsTest1', {
        mixins: [mixin],
        transforms: {
          elemented (state) {
            return {
              ...state,
              elemented: 'element'
            }
          },
          override (state) {
            return {
              ...state,
              override: 'right'
            }
          }
        }
      })

      const element = document.createElement(MixinTransformsTest1.tag)

      element.transform('mixedIn', {})
      expect(element.state.mixedIn).to.equal('mixed in')
      element.transform('override', {})
      expect(element.state.override).to.equal('right')
      element.transform('elemented', {})
      expect(element.state.elemented).to.equal('element')
    })

    it('allows actions to be mixed in', async function () {
      const mixin = {
        actions: {
          mixedIn () {
            return 'mixed in'
          },
          override () {
            return 'wrong'
          }
        }
      }

      const MixinActionsTest1 = define('MixinActionsTest1', {
        mixins: [mixin],
        actions: {
          elemented () {
            return 'element'
          },
          override () {
            return 'right'
          }
        },
        template: '{{mixedIn}} {{override}} {{elemented}}'
      })

      const element = document.createElement(MixinActionsTest1.tag)
      expect(await element.action('mixedIn', {})).to.equal('mixed in')
      expect(await element.action('elemented', {})).to.equal('element')
      expect(await element.action('override', {})).to.equal('right')
    })

    it('allows styles to be mixed in', function () {
      const mixin = {
        styles: 'p {color: rgb(255, 0, 0); font-weight: 200;}'
      }

      const MixinStylesTest1 = define('MixinStylesTest1', {
        mixins: [mixin],
        styles: 'p {color: rgb(0, 255, 0); opacity: 0.5;}',
        template: '<p>Some Text</p>'
      })

      const element = document.createElement(MixinStylesTest1.tag)
      document.body.appendChild(element)
      // Let the browser render it
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const p = element.rootNode.querySelector('p')
          const styles = window.getComputedStyle(p)
          try {
            expect(styles.getPropertyValue('color')).to.equal('rgb(0, 255, 0)')
            expect(styles.getPropertyValue('font-weight')).to.equal('200')
            expect(styles.getPropertyValue('opacity')).to.equal('0.5')
          } catch (err) {
            reject(err)
            return
          }

          resolve(null)
          document.body.removeChild(element)
        }, 100)
      })
    })

    it('allows a template to be mixed in', function () {
      const mixin = {
        template: 'ok'
      }

      const MixinTemplateTest1 = define('MixinTemplateTest1', {
        mixins: [mixin]
      })

      const element = document.createElement(MixinTemplateTest1.tag)
      expect(element.rootNode.innerHTML).to.equal('ok')
    })

    it('allows a mixed in template to be overwritten', function () {
      const mixin = {
        template: 'ok'
      }

      const MixinTemplateTest2 = define('MixinTemplateTest2', {
        mixins: [mixin],
        template: 'replaced'
      })

      const element = document.createElement(MixinTemplateTest2.tag)
      expect(element.rootNode.innerHTML).to.equal('replaced')
    })
  })
})
