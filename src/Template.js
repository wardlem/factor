import {
  getPath,
  isEqual
} from './Util'

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
  // TODO: Process attributes, etc.
  return bindElementChildren(element)
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
