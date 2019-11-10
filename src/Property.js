import {
  isEqual,
  objectFrom
} from './Util'

export function defineProps (proto, props) {
  for (const [key, def] of Object.entries(props)) {
    defineProp(proto, key, def)
  }
}

function defineProp (proto, key, def) {
  const lcKey = key.toLowerCase()
  const descriptor = {
    get () {
      return this.get(key)
    },
    set (_value) {
      let value = _value
      const currentValue = this.get(key)
      if (typeof this.constructor.convertProp === 'function') {
        value = this.constructor.convertProp(key, value)
      }
      if (!isEqual(currentValue, value)) {
        this.set(key, value)
        this.render()
      }
    }
  }

  Object.defineProperty(proto, key, descriptor)
  // We also define the lowercase key because attributes
  // are always converted to lowercase.
  if (lcKey !== key) {
    Object.defineProperty(proto, lcKey, descriptor)
  }
}

export function calculateDefaultProps (props) {
  const defaults = {}
  for (const [key, prop] of Object.entries(props)) {
    if (Object.prototype.hasOwnProperty.call(prop, 'default')) {
      defaults[key] = prop.default
    } else if (prop.type) {
      switch (prop.type) {
        case String:
          defaults[key] = ''
          break
        case Boolean:
          defaults[key] = false
          break
        case Number:
          defaults[key] = 0
          break
        case Array:
          defaults[key] = []
          break
        case Object:
          defaults[key] = {}
          break
        case Date:
          defaults[key] = new Date(0)
          break
      }
    } else {
      defaults[key] = undefined
    }
  }

  return defaults
}

export function convertProp (prop, _value) {
  let value = _value
  if (prop.convert) {
    return prop.convert(value)
  }

  if (prop.allowNull && value == null) {
    return null
  }

  if (prop.type) {
    switch (prop.type) {
      case String:
        if (value == null) {
          return ''
        }

        return String(value)
      case Boolean:
        if (value === '') {
          return true
        }

        return Boolean(value)
      case Number:
        return Number(value) || 0
      case Array:
        if (typeof value === 'string' && value[0] === '[') {
          try {
            value = JSON.parse(value)
          } catch (err) {
            // Ignore
          }
        } else if (typeof value === 'string') {
          value = value.split(',')
        }

        if (!Array.isArray(value)) {
          return []
        }

        if (prop.sub) {
          return value.map((subValue) => convertProp(prop.sub, subValue))
        }

        return value
      case Object:
        if (typeof value === 'string' && value[0] === '{') {
          try {
            value = JSON.parse(value)
          } catch (err) {
            // Ignore
          }
        } else if (typeof value === 'string') {
          const pairs = value.split(',').map((part) => part.split(':', 2))
          value = objectFrom(pairs)
        }

        if (!value || value.constructor !== Object) {
          return {}
        }

        if (prop.sub) {
          const pairs = Object.entries(value).map(
            ([key, subValue]) => [key, convertProp(prop.sub, subValue)]
          )
          return objectFrom(pairs)
        }

        return value
      case Date:
        return new Date(value)
    }
  }

  return value
}
