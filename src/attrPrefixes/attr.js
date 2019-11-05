import {
  getPath,
  isEqual
} from '../Util'

const attr = {
  prefix: 'attr',
  symbol: '@',
  bind (element, attrName, attrKey) {
    if (attrName === '') {
      // This will be an object of attributes
      let lastKeys = []
      return function setAttrs (data) {
        const attrs = getPath(data, attrKey)
        if (attrs == null || attrs.constructor !== Object) {
          // Remove all the attributes we have previously set
          for (const key of lastKeys) {
            element.removeAttribute(key)
          }

          lastKeys = []
        } else {
          // Set each attribute in attrs
          const newLastKeys = Object.keys(attrs)
          for (const key of newLastKeys) {
            const value = attrs[key]
            setAttribute(element, key, value)
          }

          // Remove keys not in the new attrs
          for (const key of lastKeys) {
            if (!newLastKeys.includes(key)) {
              element.removeAttribute(key)
            }
          }

          // Keep track of the attrs we set
          lastKeys = newLastKeys
        }
      }
    }

    return function setAttr (data) {
      const value = getPath(data, attrKey)
      setAttribute(element, attrName, value)
    }
  }
}

function setAttribute (element, key, value) {
  if (value == null || value === false) {
    element.removeAttribute(key)
  } else {
    const stringValue = value === true ? '' : String(value)
    if (!isEqual(stringValue, element.getAttribute(key))) {
      element.setAttribute(key, stringValue)
    }
  }
}

export default attr
