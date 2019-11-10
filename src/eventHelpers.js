export function eventToTransform (_transform = null, dataFromEvent = null) {
  return function callTransform (event, ctx) {
    const transform = _transform || event.type
    const data = typeof dataFromEvent === 'function' ? dataFromEvent(event) : {}
    ctx.transform(transform, data)
  }
}

export function eventToAction (_action = null, dataFromEvent = null) {
  return function callAction (event, ctx) {
    const action = _action || event.type
    const data = typeof dataFromEvent === 'function' ? dataFromEvent(event) : {}
    ctx.action(action, data)
  }
}
