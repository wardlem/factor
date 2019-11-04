export function setFunctionName (func, name) {
  const nameDescriptor = Object.getOwnPropertyDescriptor(func, 'name')
  nameDescriptor.value = name
  Object.defineProperty(func, 'name', nameDescriptor)
}

export function camelToKebab (str) {
  return str.replace(/([^^-])([A-Z])/g, '$1-$2').toLowerCase()
}
