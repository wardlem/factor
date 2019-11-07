import {
  getPath,
  isEqual
} from '../Util'

const classDirective = {
  prefix: 'class',
  symbol: '.',
  bind (element, className, classKey) {
    if (className === '') {
      // This will be a string, array, object, set, or map of classes
      let lastClasses = []
      let lastClassesRef = null
      return function setClasses (data) {
        let classes = getPath(data, classKey)
        if (typeof classes === 'function') {
          classes = classes(data)
        }

        if (isEqual(classes, lastClassesRef)) {
          // Do nothing
          lastClassesRef = classes
          return
        }

        lastClassesRef = classes

        if (typeof classes === 'string') {
          classes = classes.split(/\s+/g).filter(Boolean)
        } else if (classes != null && classes.constructor === Object) {
          classes = Object.keys(classes).filter((className) => Boolean(classes[className]))
        } else if (classes != null && classes instanceof Map) {
          classes = [...classes.keys()].filter((className) => Boolean(classes.get(className)))
        } else if (classes != null && classes instanceof Set) {
          classes = [...classes]
        }

        if (!Array.isArray(classes)) {
          // Remove all the classes we have previously set
          element.classList.remove(...lastClasses)
          lastClasses = []
        } else {
          // Set each class in classes
          for (const className of classes) {
            if (!element.classList.contains(className)) {
              element.classList.add(className)
            }
          }

          // Remove classes not in the new classes
          for (const className of lastClasses) {
            if (!classes.includes(className)) {
              element.classList.remove(className)
            }
          }

          // Keep track of the classes we set
          lastClasses = classes
        }
      }
    }

    return function setClass (data) {
      let value = getPath(data, classKey)
      if (typeof value === 'function') {
        value = value(data)
      }

      if (value) {
        if (!element.classList.contains(className)) {
          element.classList.add(className)
        }
      } else if (element.classList.contains(className)) {
        element.classList.remove(className)
      }
    }
  }
}

export default classDirective
