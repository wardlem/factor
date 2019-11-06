import {
  generateBinding
} from '../src/Template'

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
  const binding = generateBinding(fragment)
  const container = attachFragment(fragment)

  return { binding, container }
}

describe('Template', function () {
  describe('generateBinding', function () {
    it('returns a function', function () {
      const fragment = document.createDocumentFragment()
      const binding = generateBinding(fragment)
      expect(typeof binding).to.equal('function')
    })

    it('dynamically updates a text node when the binding is called', function () {
      const { binding, container } = bindAndContain('Hello {{person}}')
      expect(container.innerHTML).to.equal('Hello ')
      binding({ person: 'George' })
      expect(container.innerHTML).to.equal('Hello George')
    })

    it('binds nested child elements', function () {
      const { binding, container } = bindAndContain('<div><p>Hello {{person}}</p></div>')
      expect(container.innerHTML).to.equal('<div><p>Hello </p></div>')
      binding({ person: 'Marianne' })
      expect(container.innerHTML).to.equal('<div><p>Hello Marianne</p></div>')
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
  })
})
