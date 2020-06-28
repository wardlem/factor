import {
  getPath,
  isEqual
} from '../Util'

const id = {
  prefix: 'id',
  symbol: '#',
  bind (element, propName, propKey) {
    const staticParts = propName === '' ? [] : [propName]
    let lastId = null
    return function setId (data) {
      let id = getPath(data, propKey)
      if (typeof id === 'function') {
        id = id(data)
      }

      if (id != null && !Array.isArray(id)) {
        id = [id]
      }

      const newId = id == null ? null : [...staticParts, ...id].join('-')
      if (isEqual(lastId, newId)) {
        return
      }

      if (id == null) {
        lastId = null
        element.removeAttribute('id')
      } else {
        lastId =
        element.setAttribute('id', newId)
      }

      lastId = newId
    }
  }
}

export default id
