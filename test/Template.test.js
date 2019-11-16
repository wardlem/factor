import '../node_modules/web-animations-js/web-animations.min.js'

import { Template } from '../Factor'

function getFragmentFromString (text) {
  const template = document.createElement('template')
  template.innerHTML = text
  return document.importNode(template.content, true)
}

function attachFragment (fragment) {
  const container = document.createElement('div')
  container.appendChild(fragment)
  return container
}

function bindAndContain (text) {
  const fragment = getFragmentFromString(text)
  const binding = Template.generateBinding(fragment)
  const container = attachFragment(fragment)

  return { binding, container }
}

describe('Template', function () {
  describe('generateBinding', function () {
    it('returns a function', function () {
      const fragment = document.createDocumentFragment()
      const binding = Template.generateBinding(fragment)
      expect(typeof binding).to.equal('function')
    })

    it('dynamically updates a text node when the binding is called', function () {
      const { binding, container } = bindAndContain('Hello {{person}}')
      expect(container.innerHTML).to.equal('Hello ')
      binding({ person: 'George' })
      expect(container.innerHTML).to.equal('Hello George')
    })

    it('dynamically updates an interpolated attribute when the binding is called', function () {
      const { binding, container } = bindAndContain('<div id="thing-{{id}}"></div>')
      expect(container.innerHTML).to.equal('<div id="thing-"></div>')
      binding({ id: 12 })
      expect(container.innerHTML).to.equal('<div id="thing-12"></div>')
    })

    it('binds nested child elements', function () {
      const { binding, container } = bindAndContain('<div><p>Hello {{person}}</p></div>')
      expect(container.innerHTML).to.equal('<div><p>Hello </p></div>')
      binding({ person: 'Marianne' })
      expect(container.innerHTML).to.equal('<div><p>Hello Marianne</p></div>')
    })

    it('renders 0', function () {
      const { binding, container } = bindAndContain('Hello {{person}}')
      expect(container.innerHTML).to.equal('Hello ')
      binding({ person: 0 })
      expect(container.innerHTML).to.equal('Hello 0')
    })
  })

  describe('prop:', function () {
    it('binds properties with the prop: prefix', function () {
      const { binding, container } = bindAndContain('<div prop:test="dude"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('prop:test')).to.not.exist
      expect(div.test).to.not.exist
      binding({ dude: 'Vader' })
      expect(div.test).to.equal('Vader')
    })

    it('binds properties with the # prefix', function () {
      const { binding, container } = bindAndContain('<div #test="dude"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('#test')).to.not.exist
      expect(div.test).to.not.exist
      binding({ dude: 'Vader' })
      expect(div.test).to.equal('Vader')
    })

    it('binds an object of properties with the prop: prefix', function () {
      const { binding, container } = bindAndContain('<div prop:="theProps"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('prop:')).to.not.exist
      expect(div.prop1).to.not.exist
      expect(div.prop2).to.not.exist
      binding({
        theProps: {
          prop1: 'one',
          prop2: 'two'
        }
      })
      expect(div.prop1).to.equal('one')
      expect(div.prop2).to.equal('two')
    })

    it('binds an object of properties with the # prefix', function () {
      const { binding, container } = bindAndContain('<div #="theProps"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('#')).to.not.exist
      expect(div.prop1).to.not.exist
      expect(div.prop2).to.not.exist
      binding({
        theProps: {
          prop1: 'one',
          prop2: 'two'
        }
      })
      expect(div.prop1).to.equal('one')
      expect(div.prop2).to.equal('two')
    })

    it('removes missing props when removed from second update', function () {
      const { binding, container } = bindAndContain('<div #="theProps"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('#')).to.not.exist
      expect(div.prop1).to.not.exist
      expect(div.prop2).to.not.exist
      binding({
        theProps: {
          prop1: 'one'
        }
      })
      expect(div.prop1).to.equal('one')
      expect(div.prop2).to.not.exist
      binding({
        theProps: {
          prop2: 'two'
        }
      })
      expect(div.prop1).to.not.exist
      expect(div.prop2).to.equal('two')
    })

    it('removes all missing props when second update has null value', function () {
      const { binding, container } = bindAndContain('<div #="theProps"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('#')).to.not.exist
      expect(div.prop1).to.not.exist
      expect(div.prop2).to.not.exist
      binding({
        theProps: {
          prop1: 'one',
          prop2: 'two'
        }
      })
      expect(div.prop1).to.equal('one')
      expect(div.prop2).to.equal('two')
      binding({
        theProps: null
      })
      expect(div.prop1).to.not.exist
      expect(div.prop2).to.not.exist
    })

    it('calls a function for an object value', function () {
      const { binding, container } = bindAndContain('<div prop:="fn"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('prop:test')).to.not.exist
      expect(div.test).to.not.exist
      binding({ value: 5, fn: (data) => ({ v: data.value + 2 }) })
      expect(div.v).to.equal(7)
    })

    it('converts kebab-case to camelCase', function () {
      const { binding, container } = bindAndContain('<div #test-prop="dude"></div>')
      const div = container.childNodes[0]
      expect(div.testProp).to.not.exist
      binding({ dude: 'Vader' })
      expect(div.testProp).to.equal('Vader')
    })
  })

  describe('attr:', function () {
    it('binds attributes with the attr: prefix', function () {
      const { binding, container } = bindAndContain('<div attr:test="dude"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('attr:test')).to.not.exist
      expect(div.getAttribute('test')).to.not.exist
      binding({ dude: 'Vader' })
      expect(div.getAttribute('test')).to.equal('Vader')
    })

    it('binds attributes with the @ prefix', function () {
      const { binding, container } = bindAndContain('<div @test="dude"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('@test')).to.not.exist
      expect(div.getAttribute('test')).to.not.exist
      binding({ dude: 'Vader' })
      expect(div.getAttribute('test')).to.equal('Vader')
    })

    it('binds an object of attributes with the attr: prefix', function () {
      const { binding, container } = bindAndContain('<div attr:="theAttrs"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('attr:')).to.not.exist
      expect(div.getAttribute('attr1')).to.not.exist
      expect(div.getAttribute('prop2')).to.not.exist
      binding({
        theAttrs: {
          attr1: 'one',
          attr2: 'two'
        }
      })
      expect(div.getAttribute('attr1')).to.equal('one')
      expect(div.getAttribute('attr2')).to.equal('two')
    })

    it('binds an object of attributes with the @ prefix', function () {
      const { binding, container } = bindAndContain('<div @="theAttrs"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('@')).to.not.exist
      expect(div.getAttribute('attr1')).to.not.exist
      expect(div.getAttribute('prop2')).to.not.exist
      binding({
        theAttrs: {
          attr1: 'one',
          attr2: 'two'
        }
      })
      expect(div.getAttribute('attr1')).to.equal('one')
      expect(div.getAttribute('attr2')).to.equal('two')
    })

    it('removes missing attributes when removed from second update', function () {
      const { binding, container } = bindAndContain('<div @="theAttrs"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('@')).to.not.exist
      expect(div.getAttribute('attr1')).to.not.exist
      expect(div.getAttribute('attr2')).to.not.exist
      binding({
        theAttrs: {
          attr1: 'one'
        }
      })
      expect(div.getAttribute('attr1')).to.equal('one')
      expect(div.getAttribute('attr2')).to.not.exist
      binding({
        theAttrs: {
          attr2: 'two'
        }
      })
      expect(div.getAttribute('attr1')).to.not.exist
      expect(div.getAttribute('attr2')).to.equal('two')
    })

    it('removes all missing attributes when second update has null value', function () {
      const { binding, container } = bindAndContain('<div @="theAttrs"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('#')).to.not.exist
      expect(div.getAttribute('attr1')).to.not.exist
      expect(div.getAttribute('attr2')).to.not.exist
      binding({
        theAttrs: {
          attr1: 'one',
          attr2: 'two'
        }
      })
      expect(div.getAttribute('attr1')).to.equal('one')
      expect(div.getAttribute('attr2')).to.equal('two')
      binding({
        theAttrs: null
      })
      expect(div.getAttribute('attr1')).to.not.exist
      expect(div.getAttribute('attr2')).to.not.exist
    })

    it('calls a function for an object value', function () {
      const { binding, container } = bindAndContain('<div attr:="fn"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('prop:test')).to.not.exist
      expect(div.test).to.not.exist
      binding({ value: 5, fn: (data) => ({ v: data.value + 2 }) })
      expect(div.getAttribute('v')).to.equal('7')
    })
  })

  describe('on:', function () {
    it('binds event listeners with the on: prefix', function (done) {
      const { binding, container } = bindAndContain('<div on:custom="theHandler"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('on:custom')).to.not.exist
      const handler = (event) => {
        expect(event).to.be.instanceof(CustomEvent)
        expect(event.detail).to.equal('just testing')
        done()
      }
      binding({ theHandler: handler })

      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
    })

    it('binds event listeners with the ! prefix', function (done) {
      const { binding, container } = bindAndContain('<div !custom="theHandler"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('!custom')).to.not.exist
      const handler = (event) => {
        expect(event).to.be.instanceof(CustomEvent)
        expect(event.detail).to.equal('just testing')
        done()
      }
      binding({ theHandler: handler })

      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
    })

    it('binds an object of event listeners with the on: prefix', function (done) {
      const { binding, container } = bindAndContain('<div on:="handlers"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('on:')).to.not.exist
      const handler = (event) => {
        expect(event).to.be.instanceof(CustomEvent)
        expect(event.detail).to.equal('just testing')
        done()
      }
      binding({ handlers: { custom: handler } })

      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
    })

    it('binds an object of event listeners with the ! prefix', function (done) {
      const { binding, container } = bindAndContain('<div !="handlers"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('!')).to.not.exist
      const handler = (event) => {
        expect(event).to.be.instanceof(CustomEvent)
        expect(event.detail).to.equal('just testing')
        done()
      }
      binding({ handlers: { custom: handler } })

      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
    })

    it('removes event listeners when subsequently set to null', function (done) {
      const { binding, container } = bindAndContain('<div !custom="theHandler"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('!custom')).to.not.exist
      const handler = (event) => {
        expect.fail('Event handler should be removed')
      }
      binding({ theHandler: handler })
      binding({ theHandler: null })
      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
      setTimeout(done, 5)
    })

    it('removes event listeners when missing from subsequent binds', function (done) {
      const { binding, container } = bindAndContain('<div !="handlers"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('!')).to.not.exist
      const handler = (event) => {
        expect.fail('Event handler should be removed')
      }
      binding({ handlers: { custom: handler } })
      binding({ handlers: {} })
      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
      setTimeout(done, 5)
    })

    it('removes event listeners when object missing from subsequent binds', function (done) {
      const { binding, container } = bindAndContain('<div !="handlers"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('!')).to.not.exist
      const handler = (event) => {
        expect.fail('Event handler should be removed')
      }
      binding({ handlers: { custom: handler } })
      binding({})
      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
      setTimeout(done, 5)
    })

    it('calls a function for an object value', function (done) {
      const { binding, container } = bindAndContain('<div on:="fn"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('on:')).to.not.exist
      expect(div.test).to.not.exist
      const handler = (event) => {
        done()
      }
      binding({ handler, fn: (data) => ({ custom: data.handler }) })
      const event = new CustomEvent('custom', { detail: 'just testing' })
      div.dispatchEvent(event)
    })
  })

  describe('class:', function () {
    it('adds a class with the class: prefix if it resolves to a truthy value', function () {
      const { binding, container } = bindAndContain('<div class:test="bool"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('class:test')).to.not.exist
      expect(div.classList.contains('test')).to.be.false
      binding({ bool: true })
      expect(div.classList.contains('test')).to.be.true
      binding({ bool: {} })
      expect(div.classList.contains('test')).to.be.true
      binding({ bool: 1 })
      expect(div.classList.contains('test')).to.be.true
    })

    it('does not add a class with the class: prefix if it resolves to a falsy value', function () {
      const { binding, container } = bindAndContain('<div class:test="bool"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('class:test')).to.not.exist
      expect(div.classList.contains('test')).to.be.false
      binding({ bool: false })
      expect(div.classList.contains('test')).to.be.false
      binding({ bool: 0 })
      expect(div.classList.contains('test')).to.be.false
      binding({ bool: null })
      expect(div.classList.contains('test')).to.be.false
      binding({ bool: '' })
      expect(div.classList.contains('test')).to.be.false
      binding({})
      expect(div.classList.contains('test')).to.be.false
    })

    it('treats the . prefix as an alias to class:', function () {
      const { binding, container } = bindAndContain('<div .test="bool"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.test')).to.not.exist
      expect(div.classList.contains('test')).to.be.false
      binding({ bool: true })
      expect(div.classList.contains('test')).to.be.true
    })

    it('removes a class if it becomes falsey', function () {
      const { binding, container } = bindAndContain('<div .test="bool"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.test')).to.not.exist
      expect(div.classList.contains('test')).to.be.false
      binding({ bool: true })
      expect(div.classList.contains('test')).to.be.true
      binding({ bool: false })
      expect(div.classList.contains('test')).to.be.false
    })

    it('adds an array of classes', function () {
      const { binding, container } = bindAndContain('<div .="theClasses"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.')).to.not.exist
      expect(div.classList.length).to.equal(0)
      binding({ theClasses: ['first', 'two'] })
      expect(div.classList.length).to.equal(2)
      expect(div.classList.contains('first')).to.be.true
      expect(div.classList.contains('two')).to.be.true
    })

    it('adds a string of classes', function () {
      const { binding, container } = bindAndContain('<div .="theClasses"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.')).to.not.exist
      expect(div.classList.length).to.equal(0)
      binding({ theClasses: ' first two ' })
      expect(div.classList.length).to.equal(2)
      expect(div.classList.contains('first')).to.be.true
      expect(div.classList.contains('two')).to.be.true
    })

    it('adds an object of classes if the value is truthy', function () {
      const { binding, container } = bindAndContain('<div .="theClasses"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.')).to.not.exist
      expect(div.classList.length).to.equal(0)
      binding({ theClasses: { first: true, two: 'ok', third: false } })
      expect(div.classList.length).to.equal(2)
      expect(div.classList.contains('first')).to.be.true
      expect(div.classList.contains('two')).to.be.true
      expect(div.classList.contains('third')).to.be.false
    })

    it('removes classes that were previously present', function () {
      const { binding, container } = bindAndContain('<div .="theClasses"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.')).to.not.exist
      expect(div.classList.length).to.equal(0)
      binding({ theClasses: ['first', 'two'] })
      expect(div.classList.length).to.equal(2)
      expect(div.classList.contains('first')).to.be.true
      expect(div.classList.contains('two')).to.be.true
      binding({ theClasses: ['first', 'third'] })
      expect(div.classList.length).to.equal(2)
      expect(div.classList.contains('first')).to.be.true
      expect(div.classList.contains('third')).to.be.true
      expect(div.classList.contains('two')).to.be.false
    })

    it('removes all classes that were previously present when the value is invalid', function () {
      const { binding, container } = bindAndContain('<div .="theClasses"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.')).to.not.exist
      expect(div.classList.length).to.equal(0)
      binding({ theClasses: ['first', 'two'] })
      expect(div.classList.length).to.equal(2)
      expect(div.classList.contains('first')).to.be.true
      expect(div.classList.contains('two')).to.be.true
      binding({ theClasses: 1 })
      expect(div.classList.length).to.equal(0)
      expect(div.classList.contains('first')).to.be.false
      expect(div.classList.contains('third')).to.be.false
      expect(div.classList.contains('two')).to.be.false
    })

    it('will call a function with the data for a single class', function () {
      const { binding, container } = bindAndContain('<div .test="fn"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('.test')).to.not.exist
      expect(div.classList.contains('test')).to.be.false
      binding({
        bool: 'clown',
        fn: (data) => data.bool === 'clown'
      })
      expect(div.classList.contains('test')).to.be.true
    })

    it('will call a function with the data for a single class', function () {
      const { binding, container } = bindAndContain('<div .="fn"></div>')
      const div = container.childNodes[0]
      binding({
        doFirst: false,
        doSecond: true,
        fn: (data) => ({ first: data.doFirst, second: data.doSecond })
      })
      expect(div.classList.length).to.equal(1)
      expect(div.classList.contains('second')).to.be.true
    })
  })

  describe('style:', function () {
    it('sets a style with the style: prefix', function () {
      const { binding, container } = bindAndContain('<div style:border-radius="borderRadius"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('style:border-radius')).to.not.exist
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      binding({ borderRadius: '2px' })
      expect(div.style.getPropertyValue('border-radius')).to.equal('2px')
    })

    it('sets a style with the $ prefix', function () {
      const { binding, container } = bindAndContain('<div $border-radius="borderRadius"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('$border-radius')).to.not.exist
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      binding({ borderRadius: '2px' })
      expect(div.style.getPropertyValue('border-radius')).to.equal('2px')
    })

    it('sets an object of styles with the style: prefix', function () {
      const { binding, container } = bindAndContain('<div style:="theStyles"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('style:')).to.not.exist
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      expect(div.style.getPropertyValue('border-width')).to.equal('')
      binding({ theStyles: { borderRadius: '2px', 'border-width': '4px' } })
      expect(div.style.getPropertyValue('border-radius')).to.equal('2px')
      expect(div.style.getPropertyValue('border-width')).to.equal('4px')
    })

    it('sets an object of styles with the $ prefix', function () {
      const { binding, container } = bindAndContain('<div $="theStyles"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('$')).to.not.exist
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      expect(div.style.getPropertyValue('border-width')).to.equal('')
      binding({ theStyles: { borderRadius: '2px', 'border-width': '4px' } })
      expect(div.style.getPropertyValue('border-radius')).to.equal('2px')
      expect(div.style.getPropertyValue('border-width')).to.equal('4px')
    })

    it('removes a style if it becomes falsey', function () {
      const { binding, container } = bindAndContain('<div style:border-radius="borderRadius"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('style:border-radius')).to.not.exist
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      binding({ borderRadius: '2px' })
      expect(div.style.getPropertyValue('border-radius')).to.equal('2px')
      binding({ borderRadius: false })
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
    })

    it('removes a style from an object of styles if it becomes falsey', function () {
      const { binding, container } = bindAndContain('<div $="theStyles"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('$')).to.not.exist
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      expect(div.style.getPropertyValue('border-width')).to.equal('')
      binding({ theStyles: { borderRadius: '2px', 'border-width': '4px' } })
      expect(div.style.getPropertyValue('border-radius')).to.equal('2px')
      expect(div.style.getPropertyValue('border-width')).to.equal('4px')
      binding({ theStyles: { borderRadius: null, 'border-width': '4px' } })
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      expect(div.style.getPropertyValue('border-width')).to.equal('4px')
    })

    it('removes all styles from an object of styles if it becomes falsey', function () {
      const { binding, container } = bindAndContain('<div $="theStyles"></div>')
      const div = container.childNodes[0]
      expect(div.getAttribute('$')).to.not.exist
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      expect(div.style.getPropertyValue('border-width')).to.equal('')
      binding({ theStyles: { borderRadius: '2px', 'border-width': '4px' } })
      expect(div.style.getPropertyValue('border-radius')).to.equal('2px')
      expect(div.style.getPropertyValue('border-width')).to.equal('4px')
      binding({ theStyles: null })
      expect(div.style.getPropertyValue('border-radius')).to.equal('')
      expect(div.style.getPropertyValue('border-width')).to.equal('')
    })
  })

  describe('if', function () {
    it('does not show the value initially', function () {
      const { container } = bindAndContain('<if condition="show"><p>Hello!</p></if>')
      expect(container.querySelector('p')).to.not.exist
    })

    it('shows the elements if the condition becomes truthy', function () {
      const { binding, container } = bindAndContain('<if condition="show"><p>Hello!</p></if>')
      expect(container.querySelector('p')).to.not.exist
      binding({ show: true })
      expect(container.querySelector('p')).to.exist
    })

    it('removes the elements if the condition becomes falsy', function () {
      const { binding, container } = bindAndContain('<if condition="show"><p>Hello!</p></if>')
      expect(container.querySelector('p')).to.not.exist
      binding({ show: true })
      expect(container.querySelector('p')).to.exist
      binding({ show: false })
      expect(container.querySelector('p')).to.not.exist
    })

    it('updates the child nodes bindings when visible', function () {
      const { binding, container } = bindAndContain('<if condition="show"><p #something="prop">Hello {{person}}!</p></if>')
      expect(container.querySelector('p')).to.not.exist
      binding({ show: true, prop: 'ok', person: 'Luke' })
      expect(container.querySelector('p')).to.exist
      expect(container.querySelector('p').something).to.equal('ok')
      expect(container.querySelector('p').innerText).to.equal('Hello Luke!')
      binding({ show: true, prop: 'updated', person: 'Obi' })
      expect(container.querySelector('p')).to.exist
      expect(container.querySelector('p').something).to.equal('updated')
      expect(container.querySelector('p').innerText).to.equal('Hello Obi!')
    })

    it('animates entry if the animate flag is set to true', function (done) {
      this.timeout(4000)
      const { binding, container } = bindAndContain(`
        <style>
          .animate {
            opacity: 0;
            transform: scale(0.5) translate(-128px, -128px);
          }
          #container {
            display: inline-block;
            box-sizing: border-box;
            width: 128px;
            height: 128px;
            background: gray;
            border: 2px dashed black;
            padding: 32px;
          }
          #item {
            display: inline-block;
            box-sizing: border-box;
            width: 64px;
            height: 64px;
            background: red;
            border: 2px solid black;
          }
        </style>
        <div id="container">
          <if condition="show"
            animate-class="animate"
            animate-duration="1000"
            animate-easing="ease-in-out"
            animate>
            <div id="item" !entering="entering" !exiting="exiting"></div>
          </if>
        </div>
      `)

      let start, end
      const entering = (event) => {
        start = Date.now()
        event.target.addEventListener('entered', () => {
          end = Date.now()
          expect(end - start).to.be.above(900)
          expect(end - start).to.be.below(1100)
          binding({
            show: false,
            entering,
            exiting
          })
        })
      }

      const exiting = (event) => {
        start = Date.now()
        event.target.addEventListener('exited', () => {
          end = Date.now()
          expect(end - start).to.be.above(900)
          expect(end - start).to.be.below(1100)
          const item = container.querySelector('#item')
          expect(item).to.not.exist
          document.body.removeChild(container)
          done()
        })
      }

      document.body.appendChild(container)
      binding({
        show: true,
        entering,
        exiting
      })
      const item = container.querySelector('#item')
      expect(item).to.exist
      expect(item.classList.contains('animate')).to.be.true
    })
  })

  describe('unless', function () {
    it('does not show the value initially', function () {
      const { container } = bindAndContain('<unless condition="show"><p>Hello!</p></unless>')
      expect(container.querySelector('p')).to.not.exist
    })

    it('shows the elements if the condition becomes falsey', function () {
      const { binding, container } = bindAndContain('<unless condition="show"><p>Hello!</p></unless>')
      expect(container.querySelector('p')).to.not.exist
      binding({ show: false })
      expect(container.querySelector('p')).to.exist
    })

    it('removes the elements if the condition becomes truthy', function () {
      const { binding, container } = bindAndContain('<unless condition="show"><p>Hello!</p></unless>')
      expect(container.querySelector('p')).to.not.exist
      binding({ show: false })
      expect(container.querySelector('p')).to.exist
      binding({ show: true })
      expect(container.querySelector('p')).to.not.exist
    })

    it('updates the child nodes bindings when visible', function () {
      const { binding, container } = bindAndContain('<unless condition="show"><p #something="prop">Hello {{person}}!</p></unless>')
      expect(container.querySelector('p')).to.not.exist
      binding({ show: false, prop: 'ok', person: 'Luke' })
      expect(container.querySelector('p')).to.exist
      expect(container.querySelector('p').something).to.equal('ok')
      expect(container.querySelector('p').innerText).to.equal('Hello Luke!')
      binding({ show: false, prop: 'updated', person: 'Obi' })
      expect(container.querySelector('p')).to.exist
      expect(container.querySelector('p').something).to.equal('updated')
      expect(container.querySelector('p').innerText).to.equal('Hello Obi!')
    })
  })

  describe('for', function () {
    it('does not show any values initially', function () {
      const { container } = bindAndContain('<for values="items" as="item"><p>{{index}}: {{item}}</p></for>')
      expect(container.querySelector('p')).to.not.exist
    })

    it('renders a list of items', function () {
      const { container, binding } = bindAndContain('<for values="items" as="item"><p>{{index}}: {{item}}</p></for>')
      binding({
        items: ['zero', 'one', 'two']
      })

      const children = container.querySelectorAll('p')
      expect(children.length).to.equal(3)
      expect(children[0].innerText).to.equal('0: zero')
      expect(children[1].innerText).to.equal('1: one')
      expect(children[2].innerText).to.equal('2: two')
    })

    it('appends to an existing list', function () {
      const { container, binding } = bindAndContain('<for values="items" as="item"><p>{{index}}: {{item}}</p></for>')
      binding({
        items: ['one']
      })

      const children1 = container.querySelectorAll('p')
      expect(children1.length).to.equal(1)
      expect(children1[0].innerText).to.equal('0: one')

      binding({
        items: ['one', 'four']
      })

      const children2 = container.querySelectorAll('p')
      expect(children2.length).to.equal(2)
      expect(children2[0].innerText).to.equal('0: one')
      expect(children2[1].innerText).to.equal('1: four')
      expect(children1[0]).to.equal(children2[0])

      binding({
        items: ['zero', 'one', 'four']
      })

      const children3 = container.querySelectorAll('p')
      expect(children3.length).to.equal(3)
      expect(children3[0].innerText).to.equal('0: zero')
      expect(children3[1].innerText).to.equal('1: one')
      expect(children3[2].innerText).to.equal('2: four')
      expect(children2[0]).to.equal(children3[0])
      expect(children2[1]).to.equal(children3[1])

      binding({
        items: ['zero', 'one', 'two', 'three', 'four']
      })

      const children4 = container.querySelectorAll('p')
      expect(children4.length).to.equal(5)
      expect(children4[0].innerText).to.equal('0: zero')
      expect(children4[1].innerText).to.equal('1: one')
      expect(children4[2].innerText).to.equal('2: two')
      expect(children4[3].innerText).to.equal('3: three')
      expect(children4[4].innerText).to.equal('4: four')
      expect(children3[0]).to.equal(children4[0])
      expect(children3[1]).to.equal(children4[1])
      expect(children3[2]).to.equal(children4[2])
    })

    it('removes a child', function () {
      const { container, binding } = bindAndContain('<for values="items" as="item"><p>{{index}}: {{item}}</p></for>')
      binding({
        items: ['zero', 'one', 'two', 'three', 'four']
      })

      const children1 = container.querySelectorAll('p')
      expect(children1.length).to.equal(5)
      expect(children1[0].innerText).to.equal('0: zero')
      expect(children1[1].innerText).to.equal('1: one')
      expect(children1[2].innerText).to.equal('2: two')
      expect(children1[3].innerText).to.equal('3: three')
      expect(children1[4].innerText).to.equal('4: four')

      binding({
        items: ['zero', 'one', 'three', 'four']
      })

      const children2 = container.querySelectorAll('p')
      expect(children2.length).to.equal(4)
      expect(children2[0].innerText).to.equal('0: zero')
      expect(children2[1].innerText).to.equal('1: one')
      expect(children2[2].innerText).to.equal('2: three')
      expect(children2[3].innerText).to.equal('3: four')

      binding({
        items: ['one', 'three', 'four']
      })

      const children3 = container.querySelectorAll('p')
      expect(children3.length).to.equal(3)
      expect(children3[0].innerText).to.equal('0: one')
      expect(children3[1].innerText).to.equal('1: three')
      expect(children3[2].innerText).to.equal('2: four')

      binding({
        items: []
      })

      const children5 = container.querySelectorAll('p')
      expect(children5.length).to.equal(0)
    })

    it('reorders a list of items based on a key path', function () {
      const { container, binding } = bindAndContain('<for values="items" as="item" key-path="id"><p>{{item.id}}: {{item.name}}</p></for>')
      binding({
        items: [
          { id: 'v', name: 'Vader' },
          { id: 's', name: 'Sidius' },
          { id: 'p', name: 'Plagueis' }
        ]
      })

      const children1 = container.querySelectorAll('p')
      expect(children1.length).to.equal(3)
      expect(children1[0].innerText).to.equal('v: Vader')
      expect(children1[1].innerText).to.equal('s: Sidius')
      expect(children1[2].innerText).to.equal('p: Plagueis')

      binding({
        items: [
          { id: 'p', name: 'Unknown' },
          { id: 's', name: 'Palpatine' },
          { id: 'v', name: 'Anakin' }
        ]
      })

      const children2 = container.querySelectorAll('p')
      expect(children2.length).to.equal(3)
      expect(children2[0].innerText).to.equal('p: Unknown')
      expect(children2[1].innerText).to.equal('s: Palpatine')
      expect(children2[2].innerText).to.equal('v: Anakin')

      expect(children1[0]).to.equal(children2[2])
      expect(children1[1]).to.equal(children2[1])
      expect(children1[2]).to.equal(children2[0])
    })

    it('reorders a list of items based on a key function', function () {
      const { container, binding } = bindAndContain('<for values="items" as="item" key-function="getId"><p>{{item.id}}: {{item.name}}</p></for>')
      function getId (item) {
        return item.id
      }

      binding({
        getId,
        items: [
          { id: 'v', name: 'Vader' },
          { id: 's', name: 'Sidius' },
          { id: 'p', name: 'Plagueis' }
        ]
      })

      const children1 = container.querySelectorAll('p')
      expect(children1.length).to.equal(3)
      expect(children1[0].innerText).to.equal('v: Vader')
      expect(children1[1].innerText).to.equal('s: Sidius')
      expect(children1[2].innerText).to.equal('p: Plagueis')

      binding({
        getId,
        items: [
          { id: 'p', name: 'Unknown' },
          { id: 's', name: 'Palpatine' },
          { id: 'v', name: 'Anakin' }
        ]
      })

      const children2 = container.querySelectorAll('p')
      expect(children2.length).to.equal(3)
      expect(children2[0].innerText).to.equal('p: Unknown')
      expect(children2[1].innerText).to.equal('s: Palpatine')
      expect(children2[2].innerText).to.equal('v: Anakin')

      expect(children1[0]).to.equal(children2[2])
      expect(children1[1]).to.equal(children2[1])
      expect(children1[2]).to.equal(children2[0])
    })

    it('renders an object of items', function () {
      const { container, binding } = bindAndContain('<for values="items" as="item"><p>{{index}}: {{item}}</p></for>')
      binding({
        items: {
          first: 'one',
          second: 'two',
          third: 'three'
        }
      })

      const children = container.querySelectorAll('p')
      expect(children.length).to.equal(3)
      expect(children[0].innerText).to.equal('first: one')
      expect(children[1].innerText).to.equal('second: two')
      expect(children[2].innerText).to.equal('third: three')
    })

    it('animates when items are reordered and the animate flag is true', function (done) {
      this.timeout(3000)
      const { container, binding } = bindAndContain(`
        <style>
          #container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            border: 2px dashed gray;
            width: 128px;
            height: 64px;
            box-sizing: border-box;
          }
          .enter {
            transform: translateY(-64px);
            opacity: 0;
          }
          .exit {
            transform: translateY(64px);
            opacity: 0;
          }
          .box {
            width: 32px;
            height: 32px;
            border: 2px solid black;
            box-sizing: border-box;
          }
          #one {
            background: blue;
          }
          #two {
            background: yellow;
          }
          #three {
            background: red;
          }
        </style>
        <div id="container">
          <for
            values="items"
            as="item"
            key-path="id"
            enter-class="enter"
            animate><div class="box" @id="item.id">{{item.number}}</div></for>
        </div>
      `)

      document.body.appendChild(container)

      binding({
        items: [
          { id: 'one', value: 1 },
          { id: 'two', value: 2 },
          { id: 'three', value: 3 }
        ]
      })

      setTimeout(() => {
        binding({
          items: [
            { id: 'three', value: 3 },
            { id: 'one', value: 1 },
            { id: 'two', value: 2 }
          ]
        })

        setTimeout(() => {
          document.body.removeChild(container)
          done()
        }, 1000)
      }, 1000)
    })

    it('animates when items are added and the animate flag is true', function (done) {
      this.timeout(3000)
      const { container, binding } = bindAndContain(`
        <style>
          #container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            border: 2px dashed gray;
            width: 128px;
            height: 64px;
            box-sizing: border-box;
          }
          .enter {
            transform: translateY(-64px);
            opacity: 0;
          }
          .exit {
            transform: translateY(64px);
            opacity: 0;
          }
          .box {
            width: 32px;
            height: 32px;
            border: 2px solid black;
            box-sizing: border-box;
          }
          #one {
            background: blue;
          }
          #two {
            background: yellow;
          }
          #three {
            background: red;
          }
          #four {
            background: green;
          }
        </style>
        <div id="container">
          <for
            values="items"
            as="item"
            key-path="id"
            enter-class="enter"
            exit-class="exit"
            animate><div class="box" @id="item.id">{{item.number}}</div></for>
        </div>
      `)

      document.body.appendChild(container)

      binding({
        items: [
          { id: 'one', value: 1 },
          { id: 'two', value: 2 }
        ]
      })

      setTimeout(() => {
        binding({
          items: [
            { id: 'one', value: 1 },
            { id: 'three', value: 3 },
            { id: 'two', value: 2 }
          ]
        })

        setTimeout(() => {
          document.body.removeChild(container)
          done()
        }, 1000)
      }, 1000)
    })

    it('animates when items are removed and the animate flag is true', function (done) {
      this.timeout(10000)
      const { container, binding } = bindAndContain(`
        <style>
          #container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            border: 2px dashed gray;
            width: 128px;
            height: 64px;
            box-sizing: border-box;
            position: relative;
          }
          .enter {
            transform: translateY(-64px) rotate(45deg);
            opacity: 0;
          }
          .exit {
            transform: translateY(64px) rotate(-45deg);
            opacity: 0;
          }
          .box {
            width: 32px;
            height: 32px;
            border: 2px solid black;
            box-sizing: border-box;
          }
          #one {
            background: blue;
          }
          #two {
            background: yellow;
          }
          #three {
            background: red;
          }
        </style>
        <div id="container">
          <for
            values="items"
            as="item"
            key-path="id"
            enter-class="enter"
            exit-class="exit"
            exit-duration="200"
            animate-easing="ease-in"
            animate><div class="box" @id="item.id">{{item.number}}</div></for>
        </div>
      `)

      document.body.appendChild(container)

      binding({
        items: [
          { id: 'one', value: 1 },
          { id: 'two', value: 2 },
          { id: 'three', value: 3 }
        ]
      })

      setTimeout(() => {
        binding({
          items: [
            { id: 'one', value: 1 },
            { id: 'three', value: 3 }
          ]
        })

        setTimeout(() => {
          document.body.removeChild(container)
          done()
        }, 1000)
      }, 1000)
    })

    it('animates all elements within the div', function (done) {
      this.timeout(10000)
      const { container, binding } = bindAndContain(`
        <style>
          #container {
            display: flex;
            justify-content: space-around;
            align-items: center;
            border: 2px dashed gray;
            width: 256px;
            height: 64px;
            box-sizing: border-box;
          }
          .enter.first {
            transform: translateY(-64px) translateX(64px) scale(0.1) rotate(180deg);
            opacity: 0;
          }
          .enter.second {
            transform: translateY(64px) translateX(-64px) scale(0.1) rotate(180deg);
          }
          .exit.first {
            transform: translateY(64px) translateX(64px) scale(0.1) rotate(180deg);
            opacity: 0;
          }
          .exit.second {
            transform: translateY(-64px) translateX(-64px) scale(0.1) rotate(180deg);
          }
          .box {
            width: 32px;
            height: 32px;
            border: 2px solid black;
            box-sizing: border-box;
          }
          .second {
            border-style: dashed;
          }
          #one-a, #one-b {
            background: blue;
          }
          #two-a, #two-b {
            background: yellow;
          }
          #three-a, #three-b {
            background: red;
          }
          #four-a, #four-b {
            background: green;
          }
        </style>
        <div id="container">
          <for
            values="items"
            as="item"
            key-path="id"
            enter-class="enter"
            exit-class="exit"
            animate>
            <div class="box first" @id="item.id">{{item.number}}a</div>
            <div class="box second" @id="item.id2">{{item.number}}b</div>

            </for>
        </div>
      `)

      document.body.appendChild(container)

      binding({
        items: [
          { id: 'one-a', id2: 'one-b', value: 1 },
          { id: 'two-a', id2: 'two-b', value: 2 },
          { id: 'three-a', id2: 'three-b', value: 3 }
        ]
      })

      setTimeout(() => {
        binding({
          items: [
            { id: 'two-a', id2: 'two-b', value: 2 },
            { id: 'one-a', id2: 'one-b', value: 1 },
            { id: 'three-a', id2: 'three-b', value: 3 }
          ]
        })

        setTimeout(() => {
          binding({
            items: [
              { id: 'two-a', id2: 'two-b', value: 2 },
              { id: 'one-a', id2: 'one-b', value: 1 }
            ]
          })

          setTimeout(() => {
            binding({
              items: [
                { id: 'two-a', id2: 'two-b', value: 2 },
                { id: 'four-a', id2: 'four-b', value: 4 },
                { id: 'one-a', id2: 'one-b', value: 1 }
              ]
            })

            setTimeout(() => {
              document.body.removeChild(container)
              done()
            }, 1000)
          }, 1000)
        }, 1000)
      }, 1000)
    })
  })
})
