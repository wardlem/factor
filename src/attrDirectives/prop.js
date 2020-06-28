import {
  getPath,
  isEqual,
  kebabToCamel
} from '../Util'

const prop = {
  prefix: 'prop',
  symbol: ':',
  bind (element, propName, propKey) {
    if (propName === '') {
      // This will be an object of properties
      let lastKeys = []
      return function setProps (data) {
        let props = getPath(data, propKey)
        if (typeof props === 'function') {
          props = props(data)
        }

        if (props == null || props.constructor !== Object) {
          // Remove all the properties we have previously set
          for (const key of lastKeys) {
            element[key] = undefined
          }

          lastKeys = []
        } else {
          // Set each property in props
          const newLastKeys = Object.keys(props)
          for (const key of newLastKeys) {
            if (!isEqual(props[key], element[key])) {
              element[kebabToCamel(key)] = props[key]
            }
          }

          // Remove keys not in the new props
          for (const key of lastKeys) {
            if (!newLastKeys.includes(key)) {
              element[kebabToCamel(key)] = undefined
            }
          }

          // Keep track of the props we set
          lastKeys = newLastKeys
        }
      }
    }

    return function setProp (data) {
      const value = getPath(data, propKey)
      if (!isEqual(element[propName], value)) {
        element[kebabToCamel(propName)] = value
      }
    }
  }
}

export default prop
