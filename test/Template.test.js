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

describe('Template', function () {
  describe('generateBinding', function () {
    it('returns a function', function () {
      const fragment = document.createDocumentFragment()
      const binding = generateBinding(fragment)
      expect(typeof binding).to.equal('function')
    })

    it('dynamically updates a text node when the binding is called', function () {
      const fragment = getFragmentFromString('Hello {{person}}')
      const binding = generateBinding(fragment)
      const container = attachFragment(fragment)
      expect(container.innerHTML).to.equal('Hello ')
      binding({ person: 'George' })
      expect(container.innerHTML).to.equal('Hello George')
    })

    it('binds nested child elements', function () {
      const fragment = getFragmentFromString('<div><p>Hello {{person}}</p></div>')
      const binding = generateBinding(fragment)
      const container = attachFragment(fragment)
      expect(container.innerHTML).to.equal('<div><p>Hello </p></div>')
      binding({ person: 'Marianne' })
      expect(container.innerHTML).to.equal('<div><p>Hello Marianne</p></div>')
    })
  })
})
