import {
  getPath,
  isEqual
} from '../Util'

const prop = {
  prefix: 'on',
  symbol: '!',
  bind (element, eventName, handlerKey) {
    if (eventName === '') {
      // This will be an object of event handlers
      let lastHandlers = {}
      return function setEventListeners (data) {
        const handlers = getPath(data, handlerKey)
        if (handlers === lastHandlers) {
          return
        }

        if (handlers == null || handlers.constructor !== Object) {
          // Remove all the events we have previously set
          for (const [event, handler] of Object.entries(lastHandlers)) {
            element.removeEventListener(event, handler)
          }

          lastHandlers = {}
        } else {
          // Set each event handler
          for (const [event, handler] of Object.entries(handlers)) {
            if (!isEqual(handler, lastHandlers[event])) {
              if (typeof lastHandlers[event] === 'function') {
                element.removeEventListener(event, lastHandlers[event])
              }
              if (typeof handler === 'function') {
                element.addEventListener(event, handler)
              }
            }
          }

          // Remove keys not in the new handlers
          for (const event of Object.keys(lastHandlers)) {
            if (
              !Object.hasOwnProperty.call(handlers, event) &&
              typeof lastHandlers[event] === 'function'
            ) {
              element.removeEventListener(event, lastHandlers[event])
            }
          }

          // Keep track of the event handlers we set
          lastHandlers = handlers
        }
      }
    }

    let lastHandler = null
    return function setEventListener (data) {
      const handler = getPath(data, handlerKey)
      if (!isEqual(lastHandler, handler)) {
        if (typeof lastHandler === 'function') {
          element.removeEventListener(eventName, lastHandler)
        }
        if (typeof handler === 'function') {
          element.addEventListener(eventName, handler)
        }

        lastHandler = handler
      }
    }
  }
}

export default prop
