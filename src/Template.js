import {
  getPath,
  isEqual
} from './Util'

const ATTR_PREFIX_REGISTRY = new Map()
const ATTR_SYMBOL_REGISTRY = new Map()
const TAG_DIRECTIVE_REGISTRY = new Map()

export function registerAttributeDirective (def) {
  const {
    prefix,
    bind,
    symbol = null,
    override = false
  } = def

  if (!override && ATTR_PREFIX_REGISTRY.has(prefix)) {
    throw Error(`An attribute directive with prefix ${prefix} has already been registered`)
  }

  if (!override && symbol != null && ATTR_SYMBOL_REGISTRY.has(symbol)) {
    throw Error(`An attribute directive with symbol ${symbol} has already been registered`)
  }

  ATTR_PREFIX_REGISTRY.set(prefix, bind)
  if (symbol != null) {
    ATTR_SYMBOL_REGISTRY.set(symbol, bind)
  }
}

export function registerTagDirective (def) {
  const {
    tag,
    bind,
    override = false
  } = def

  const ucTag = tag.toUpperCase()
  if (!override && TAG_DIRECTIVE_REGISTRY.has(ucTag)) {
    throw Error(`A tag directive with the tag ${tag} has already been registered`)
  }

  TAG_DIRECTIVE_REGISTRY.set(ucTag, bind)
}

export function generateBinding (rootElement) {
  const bindings = bindElementChildren(rootElement)
  return (data) => {
    for (const binding of bindings) {
      binding(data)
    }
  }
}

export function bindElementChildren (element) {
  return Array.prototype.flatMap.call(element.childNodes, (childNode) => {
    switch (childNode.nodeType) {
      case Node.ELEMENT_NODE:
        return processElementNode(childNode)
      case Node.TEXT_NODE:
        return processTextNode(childNode)
    }

    return []
  })
}

function processElementNode (element) {
  const tagName = element.tagName
  const directiveAtt = element.getAttribute('directive')
  if (TAG_DIRECTIVE_REGISTRY.has(tagName)) {
    const bind = TAG_DIRECTIVE_REGISTRY.get(tagName)
    return bind(element)
  } else if (directiveAtt && TAG_DIRECTIVE_REGISTRY.has(directiveAtt.toUpperCase())) {
    const bind = TAG_DIRECTIVE_REGISTRY.get(directiveAtt.toUpperCase())
    return bind(element)
  } else {
    return [
      bindElementAttributes(element),
      bindElementChildren(element)
    ].flat()
  }
}

function processTextNode (textNode) {
  const parts = textNode.data.split(/\{\{([^}]+)\}\}/)

  if (parts.length === 1) {
    // This is a non-interpolated text node
    return []
  }

  const bindings = []
  const newNode = document.createDocumentFragment()
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]
    if (index % 2 === 0) {
      // This is a static portion of the template.
      if (part !== '') {
        newNode.appendChild(new Text(part))
      }
    } else {
      // This is a dynamic portion of the template.
      const path = part.trim()

      // Make empty by default and set the content when rendered
      const boundTextNode = new Text('')
      bindings.push((data) => {
        const value = getPath(data, path)
        const textValue = value == null ? '' : String(value)
        if (!isEqual(textValue, boundTextNode.data)) {
          boundTextNode.data = textValue
        }
      })
      newNode.appendChild(boundTextNode)
    }
  }

  const parentNode = textNode.parentNode
  parentNode.replaceChild(newNode, textNode)

  return bindings
}

function bindElementAttributes (element) {
  const names = element.getAttributeNames()
  return names.flatMap((name) => {
    const value = element.getAttribute(name)
    if (/^[~!@#$%^&*?.|]/.test(name)) {
      // Symbol directive
      const [symbol, nameValue] = /^([~!@#$%^&*?.|]+)(.*)$/.exec(name).slice(1)
      if (!ATTR_SYMBOL_REGISTRY.has(symbol)) {
        return []
      }

      const bind = ATTR_SYMBOL_REGISTRY.get(symbol)
      element.removeAttribute(name)
      return bind(element, nameValue, value)
    }
    const parts = name.split(':', 2)
    if (parts.length === 1) {
      // TODO: Process as interpolated string
      return processAttribute(element, name)
    }

    const [prefix, nameValue] = parts
    if (!ATTR_PREFIX_REGISTRY.has(prefix)) {
      return processAttribute(element, name)
    }

    const bind = ATTR_PREFIX_REGISTRY.get(prefix)
    element.removeAttribute(name)
    return bind(element, nameValue, value)
  })
}

function processAttribute (element, name) {
  const value = element.getAttribute(name)
  const parts = value.split(/\{\{([^}]+)\}\}/)
  if (parts.length === 1) {
    return []
  }

  const boundParts = []
  for (let index = 0; index < parts.length; index += 1) {
    const part = parts[index]
    if (index % 2 === 0) {
      // This is a static portion of the template.
      if (part !== '') {
        boundParts.push(part)
      }
    } else {
      // This is a dynamic portion of the template.
      const path = part.trim()

      // Make empty by default and set the content when rendered
      boundParts.push((data) => {
        const value = getPath(data, path)
        if (value == null) {
          return ''
        }

        return String(value)
      })
    }
  }

  element.setAttribute(name, boundParts.map((part) => {
    if (typeof part === 'string') {
      return part
    }

    return ''
  }).join(''))

  return function interpolateAttribute (data) {
    const value = boundParts.map((part) => {
      if (typeof part === 'string') {
        return part
      }

      return part(data)
    }).join('')

    if (!isEqual(value, element.getAttribute(name))) {
      element.setAttribute(name, value)
    }
  }
}
