import {
  bindElementChildren
} from '../Template'

import {
  getPath,
  isEqual,
  getAnimationValues,
  animate as runAnimation
} from '../Util'

const forDirective = {
  tag: 'for',
  bind: function (element) {
    const valuesKey = element.getAttribute('values')
    const keyPath = element.getAttribute('key-path')
    const keyFn = element.getAttribute('key-function')
    const as = element.getAttribute('as') || 'value'
    const indexAs = element.getAttribute('index-as') || 'index'
    const template = document.createElement('template')
    template.innerHTML = element.innerHTML

    const {
      enterAnimationOpts,
      exitAnimationOpts,
      moveAnimationOpts,
      animate
    } = getAnimationOpts(element)

    const placeholder = document.createComment(`for ${valuesKey} as ${indexAs}, ${as}`)
    const endPlaceholder = document.createComment(`endfor ${valuesKey} as ${indexAs}, ${as}`)

    element.parentNode.replaceChild(endPlaceholder, element)
    endPlaceholder.parentNode.insertBefore(placeholder, endPlaceholder)

    let lastDataMap = new Map()
    let lastValues = null
    return async function forBinding (data) {
      const values = getPath(data, valuesKey)
      if (isEqual(lastValues, values)) {
        return
      }

      let getKey
      if (keyPath) {
        getKey = (item) => getPath(item, keyPath)
      } else if (keyFn) {
        getKey = getPath(data, keyFn)
      } else {
        getKey = (item, index) => index
      }

      const dataMap = new Map([...lastDataMap].map(([key, info]) => {
        return [key, {
          ...info,
          prevPos: info.pos,
          pos: null
        }]
      }))

      // Keep the reference
      lastValues = values
      lastDataMap = dataMap

      const {
        keepItems,
        createItems,
        deleteItems,
        moveItems
      } = calculateUpdates(data, values, dataMap, getKey, template)

      const finalItems = keepItems.concat(createItems).sort((left, right) => left.pos - right.pos)
      const doAnimation = animate && Boolean(createItems.length || deleteItems.length || moveItems.length)
      const startRects = calculateStartRects(keepItems, doAnimation)

      const exitAnimations = removeElements(deleteItems, doAnimation, exitAnimationOpts)

      if (exitAnimations.length) {
        await Promise.all(exitAnimations)
      }

      updateActiveItems(finalItems, data, endPlaceholder, as, indexAs)

      const activeAnimations = animateActiveItems(finalItems, doAnimation, moveAnimationOpts, enterAnimationOpts, startRects)

      if (activeAnimations.length) {
        await Promise.all(activeAnimations)
      }
    }
  }
}

function calculateUpdates (data, values, dataMap, getKey, template) {
  let pos = 0
  function iterate (item, index) {
    const key = getKey(item, index, data)
    if (dataMap.has(key)) {
      const entry = dataMap.get(key)
      entry.pos = pos
      entry.item = item
      entry.index = index
    } else {
      dataMap.set(key, {
        pos,
        item,
        index,
        prevPos: null
      })
    }
    pos += 1
  }

  if (Array.isArray(values)) {
    for (const item of values) {
      iterate(item, pos)
    }
  } else if (values && values.constructor === Object) {
    for (const [index, item] of Object.entries(values)) {
      iterate(item, index)
    }
  }

  const keepItems = []
  const createItems = []
  const deleteItems = []
  const moveItems = []
  for (const value of dataMap.values()) {
    if (value.pos == null) {
      deleteItems.push(value)
    } else if (value.prevPos == null) {
      const fragment = document.importNode(template.content, true)
      const placeholder = document.createComment('')
      fragment.insertBefore(placeholder, fragment.firstChild)
      const bindings = bindElementChildren(fragment)
      value.binding = (data) => {
        for (const binding of bindings) {
          binding(data)
        }
      }
      value.placeholder = placeholder
      value.nodes = [...fragment.childNodes]
      createItems.push(value)
    } else {
      if (value.pos !== value.prevPos) {
        moveItems.push(value)
      }
      keepItems.push(value)
    }
  }

  return { keepItems, createItems, deleteItems, moveItems }
}

function calculateStartRects (items, doAnimation) {
  let startRects = null
  if (doAnimation) {
    startRects = new Map(items.flatMap((item) => {
      return item.nodes.map((node) => {
        return typeof node.animate === 'function' && [
          node,
          node.getBoundingClientRect()
        ]
      }).filter(Boolean)
    }))
  } else {
    startRects = new Map()
  }

  return startRects
}

function removeElements (items, doAnimation, exitAnimationOpts) {
  return items.flatMap((item) => {
    return item.nodes.map((node) => {
      if (doAnimation && exitAnimationOpts && typeof node.animate === 'function') {
        dispatchEvent(node, 'exiting')
        const start = getAnimationValues(node, exitAnimationOpts.properties)

        node.classList.add(exitAnimationOpts.class)
        const end = getAnimationValues(node, exitAnimationOpts.properties)
        const animation = runAnimation(node, start, end, exitAnimationOpts)

        return animation.finished.then(() => {
          animation.cancel()
          node.parentNode && node.parentNode.removeChild(node)
          dispatchEvent(node, 'exited')
        })
      } else {
        dispatchEvent(node, 'exiting')
        node.parentNode && node.parentNode.removeChild(node)
        dispatchEvent(node, 'exited')
        return false
      }
    }).filter(Boolean)
  })
}

function updateActiveItems (items, data, anchorNode, as, indexAs) {
  function getNextSiblingNode (pos) {
    if (pos + 1 < items.length) {
      const item = items[pos + 1]
      return item.placeholder
    }

    return anchorNode
  }

  const reversed = items.slice().reverse()
  for (const item of reversed) {
    const nextSiblingNode = getNextSiblingNode(item.pos)
    if (nextSiblingNode !== item.nodes[item.nodes.length - 1].nextSibling) {
      for (const node of item.nodes) {
        nextSiblingNode.parentNode.insertBefore(node, nextSiblingNode)
      }
    }

    const newData = Object.create(data)
    Object.assign(newData, {
      [as]: item.item,
      [indexAs]: item.index
    })
    item.binding(newData)
  }
}

function animateActiveItems (items, doAnimation, moveAnimationOpts, enterAnimationOpts, startRects) {
  const animations = items.flatMap((item) => {
    return item.nodes.map((node) => {
      if (typeof node.animate !== 'function') {
        return false
      }

      if (item.prevPos == null) {
        // Entering

        dispatchEvent(node, 'entering')
        if (!enterAnimationOpts) {
          dispatchEvent(node, 'entered')
          return false
        }

        node.classList.add(enterAnimationOpts.class)
        const start = getAnimationValues(node, enterAnimationOpts.properties)
        node.classList.remove(enterAnimationOpts.class)
        const end = getAnimationValues(node, enterAnimationOpts.properties)
        return runAnimation(node, start, end, enterAnimationOpts)
          .finished
          .then((animation) => {
            animation.cancel()
            dispatchEvent(node, 'entered')
          })
      }

      const startRect = startRects.get(node)

      if (startRect == null) {
        return false
      }

      const endRect = node.getBoundingClientRect()

      const startX = startRect.left + startRect.width / 2
      const startY = startRect.top + startRect.height / 2
      const endX = endRect.left + endRect.width / 2
      const endY = endRect.top + endRect.height / 2
      const deltaX = startX - endX
      const deltaY = startY - endY

      if (deltaX === 0 && deltaY === 0) {
        return false
      }

      const frameValues = {
        transform: [
          `translate(${deltaX}px, ${deltaY}px)`,
          'none'
        ]
      }

      return node.animate(frameValues, moveAnimationOpts)
        .finished
        .then((animation) => {
          animation.cancel()
        })
    }).filter(Boolean)
  })

  return Promise.all(animations)
    .then((animations) => {
      for (const animation of animations) {
        if (animation != null) {
          animation.cancel()
        }
      }
    })
}

function getAnimationOpts (element) {
  let enterAnimationOpts = null
  let exitAnimationOpts = null
  let moveAnimationOpts = null
  let animate = false
  if (element.hasAttribute('animate')) {
    animate = true
    const animateClass = element.getAttribute('animate-class')
    const enterClass = element.getAttribute('enter-class') || animateClass
    const exitClass = element.getAttribute('exit-class') || animateClass
    const animateDuration = element.getAttribute('animate-duration') || '200'
    const enterDuration = element.getAttribute('enter-duration') || animateDuration
    const exitDuration = element.getAttribute('exit-duration') || animateDuration
    const moveDuration = element.getAttribute('move-duration') || animateDuration
    const animateEasing = element.getAttribute('animate-easing') || 'linear'
    const enterEasing = element.getAttribute('enter-easing') || animateEasing
    const exitEasing = element.getAttribute('exit-easing') || animateEasing
    const moveEasing = element.getAttribute('move-easing') || animateEasing
    const animateDelay = element.getAttribute('animate-delay') || '0'
    const enterDelay = element.getAttribute('enter-delay') || animateDelay
    const exitDelay = element.getAttribute('exit-delay') || animateDelay
    const moveDelay = element.getAttribute('move-delay') || animateDelay
    const animateEndDelay = element.getAttribute('animate-end-delay') || '0'
    const enterEndDelay = element.getAttribute('enter-end-delay') || animateEndDelay
    const exitEndDelay = element.getAttribute('exit-end-delay') || animateEndDelay
    const moveEndDelay = element.getAttribute('move-end-delay') || animateEndDelay
    const animateProperties = element.getAttribute('animate-properties') || 'transform,opacity'
    const enterProperties = element.getAttribute('enter-properties') || animateProperties
    const exitProperties = element.getAttribute('exit-properties') || animateProperties

    enterAnimationOpts = enterClass ? {
      class: enterClass,
      duration: parseInt(enterDuration) || 0,
      easing: enterEasing,
      delay: parseInt(enterDelay) || 0,
      endDelay: parseInt(enterEndDelay) || 0,
      properties: enterProperties.split(',').filter((prop) => prop.trim())
    } : null

    exitAnimationOpts = exitClass ? {
      class: exitClass,
      duration: parseInt(exitDuration) || 0,
      easing: exitEasing,
      delay: parseInt(exitDelay) || 0,
      endDelay: parseInt(exitEndDelay) || 0,
      properties: exitProperties.split(',').filter((prop) => prop.trim())
    } : null

    moveAnimationOpts = {
      duration: parseInt(moveDuration) || 0,
      easing: moveEasing,
      delay: parseInt(moveDelay) || 0,
      endDelay: parseInt(moveEndDelay) || 0
    }
  }

  return { enterAnimationOpts, exitAnimationOpts, moveAnimationOpts, animate }
}

function dispatchEvent (element, type) {
  const event = new Event(type)
  element.dispatchEvent(event)
}

export default forDirective
