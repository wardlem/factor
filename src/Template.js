import {
  getPath,
  isEqual
} from './Util'

import propDirective from './attrPrefixes/prop'
import attrDirective from './attrPrefixes/attr'
import onDirective from './attrPrefixes/on'
import classDirective from './attrPrefixes/class'

const ATTR_PREFIX_REGISTRY = new Map()
const ATTR_SYMBOL_REGISTRY = new Map()
const ELEMENT_DIRECTIVE_REGISTRY = new Map()

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

export function generateBinding (rootElement) {
  const bindings = bindElementChildren(rootElement)
  return (data) => {
    for (const binding of bindings) {
      binding(data)
    }
  }
}

function bindElementChildren (element) {
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
  return [
    bindElementAttributes(element),
    bindElementChildren(element)
  ].flat()
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
        const value = getPath(data, path) || ''
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
      return []
    }

    const [prefix, nameValue] = parts
    if (!ATTR_PREFIX_REGISTRY.has(prefix)) {
      return []
    }

    const bind = ATTR_PREFIX_REGISTRY.get(prefix)
    element.removeAttribute(name)
    return bind(element, nameValue, value)
  })
}

// Bind default attribute binders
registerAttributeDirective(propDirective)
registerAttributeDirective(attrDirective)
registerAttributeDirective(onDirective)
registerAttributeDirective(classDirective)
