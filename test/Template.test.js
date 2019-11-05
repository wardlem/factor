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
    })
  })
})
