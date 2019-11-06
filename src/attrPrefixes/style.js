import {
  getPath,
  isEqual,
  camelToKebab
} from '../Util'

const style = {
  prefix: 'style',
  symbol: '$',
  bind (element, styleName, styleKey) {
    if (styleName === '') {
      // This will be an object of style values
      let lastStyles = {}
      return function setStyles (data) {
        let styles = getPath(data, styleKey)
        if (typeof props === 'function') {
          styles = styles(data)
        }

        if (isEqual(lastStyles, styles)) {
          lastStyles = styles
          return
        }

        if (styles == null || styles.constructor !== Object) {
          // Remove all the styles we have previously set
          for (const [key, value] of Object.entries(lastStyles)) {
            if (value != null && value !== false) {
              element.style.removeProperty(camelToKebab(key))
            }
          }

          lastStyles = {}
        } else {
          // Remove keys not in the new styles
          for (const [key, value] of Object.entries(lastStyles)) {
            if (value != null && value !== false && !Object.hasOwnProperty.call(styles, key)) {
              element.style.removeProperty(camelToKebab(key))
            }
          }

          // Set each style in styles
          for (const [key, value] of Object.entries(styles)) {
            if (!isEqual(value, lastStyles[key])) {
              if (value == null || value === false) {
                element.style.removeProperty(camelToKebab(key))
              } else {
                element.style.setProperty(camelToKebab(key), String(value))
              }
            }
          }

          // Keep track of the styles we set
          lastStyles = styles
        }
      }
    }

    let lastValue = null
    return function setStyle (data) {
      let value = getPath(data, styleKey)
      if (typeof value === 'function') {
        value = value(data)
      }

      if (!isEqual(lastValue, value)) {
        if (value == null || value === false) {
          element.style.removeProperty(camelToKebab(styleName))
        } else {
          element.style.setProperty(camelToKebab(styleName), String(value))
        }
      }

      lastValue = value
    }
  }
}

export default style
