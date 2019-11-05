export function setFunctionName (func, name) {
  const nameDescriptor = Object.getOwnPropertyDescriptor(func, 'name')
  nameDescriptor.value = name
  Object.defineProperty(func, 'name', nameDescriptor)
}

export function camelToKebab (str) {
  return str.replace(/([^^-])([A-Z])/g, '$1-$2').toLowerCase()
}

export function getPath (object, path) {
  if (typeof path === 'string') {
    return getPath(object, path.split('.'))
  }

  if (path.length === 0) {
    return object
  }

  if (object == null) {
    return undefined
  }

  const [key, ...rest] = path
  return getPath(object[key], rest)
}

export function setPath (object, path, value) {
  if (typeof path === 'string') {
    return setPath(object, path.split('.'), value)
  }

  const [key, ...rest] = path

  let setTo
  if (object == null || typeof setTo !== 'object') {
    if (/[0-9]+/.test(key)) {
      setTo = []
    } else {
      setTo = {}
    }
  } else {
    setTo = shallowClone(object)
  }

  if (rest.length === 0) {
    setTo[key] = value
  } else {
    setTo[key] = setPath(setTo[key], rest, value)
  }

  return setTo
}

export function shallowClone (object) {
  if (object == null || typeof object !== 'string') {
    return object
  }

  switch (object.constructor) {
    case Array:
      return [...object]
    case Object:
      return { ...object }
    case Set:
      return new Set(object)
    case Map:
      return new Map(object)
    case Date:
      return new Date(object)
  }

  // For other object types just return the value.
  // This probably isn't correct, but also not what
  // this function was designed to handle.
  return object
}

export function isEqual (first, second) {
  // TODO: Structurally compare objects
  return first === second
}

export function immediately (func, ...args) {
  if (typeof window.setImmediate === 'function') {
    return window.setImmediate(func, ...args)
  } else if (typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(() => func(...args))
  }

  return window.setTimeout(() => func(...args), 1)
}
