import {
  bindElementChildren
} from '../Template'

import {
  getPath,
  immediately,
  getAnimationValues,
  animate
} from '../Util'

function makeBind (inverted) {
  return function bind (element) {
    const conditionKey = element.getAttribute('condition')
    let childNodes
    let bindElement
    if (element.tagName === 'IF' || element.tagName === 'UNLESS') {
      bindElement = element
      childNodes = [...element.childNodes]
    } else {
      bindElement = document.createElement('template')
      const cloned = element.cloneNode(true)
      for (const attribute of ['directive', 'condition']) {
        cloned.removeAttribute(attribute)
      }
      childNodes = [cloned]
      bindElement.append(cloned)
    }

    const childBindings = bindElementChildren(bindElement)

    const {
      enterAnimationOpts,
      exitAnimationOpts
    } = getAnimationOpts(element)

    const placeholder = document.createComment(`if ${conditionKey}`)

    element.parentNode.replaceChild(placeholder, element)

    let showing = false
    return function ifBinding (data) {
      let value = getPath(data, conditionKey)
      if (inverted) {
        value = !value
      }
      if (value && !showing) {
        // Append all the child nodes to the parent node
        for (const binding of childBindings) {
          binding(data)
        }
        insertElements(childNodes, placeholder, enterAnimationOpts)
        showing = true
      } else if (!value && showing) {
        // Remove all the child nodes
        removeElements(childNodes, exitAnimationOpts)
        showing = false
      } else if (value) {
        for (const binding of childBindings) {
          binding(data)
        }
      }
    }
  }
}

const ifDirective = {
  tag: 'if',
  bind: makeBind(false)
}

const unlessDirective = {
  tag: 'unless',
  bind: makeBind(true)
}

function insertElements (childNodes, placeholder, animationOpts) {
  const nextSibling = placeholder.nextSibling
  const parentNode = placeholder.parentNode
  if (!parent) {
    return
  }

  for (const node of childNodes) {
    parentNode.insertBefore(node, nextSibling)
    if (animationOpts && typeof node.animate === 'function') {
      // No backwards compatibility for browsers that do not support
      // the Animation API. A polyfill is the best way to add support.
      node.classList.add(animationOpts.class)
      dispatchEvent(node, 'entering')
      immediately(() => {
        const start = getAnimationValues(node, animationOpts.properties)
        node.classList.remove(animationOpts.class)
        const end = getAnimationValues(node, animationOpts.properties)
        const animation = animate(node, start, end, animationOpts)
        animation.addEventListener('finish', (event) => {
          animation.cancel()
          dispatchEvent(node, 'entered')
        }, {
          once: true,
          passive: true
        })
      })
    } else {
      dispatchEvent(node, 'entering')
      immediately(() => {
        dispatchEvent(node, 'entered')
      })
    }
  }
}

function removeElements (childNodes, animationOpts) {
  for (const node of childNodes) {
    if (animationOpts && typeof node.animate === 'function') {
      dispatchEvent(node, 'exiting')
      immediately(() => {
        const start = getAnimationValues(node, animationOpts.properties)
        node.classList.add(animationOpts.class)
        const end = getAnimationValues(node, animationOpts.properties)
        const animation = animate(node, start, end, animationOpts)
        animation.addEventListener('finish', (event) => {
          node.parentNode && node.parentNode.removeChild(node)
          animation.cancel()
          dispatchEvent(node, 'exited')
        }, {
          once: true,
          passive: true
        })
      })
    } else {
      dispatchEvent(node, 'exiting')
      node.parentNode && node.parentNode.removeChild(node)
      immediately(() => {
        dispatchEvent(node, 'exited')
      })
    }
  }
}

function getAnimationOpts (element) {
  let enterAnimationOpts = null
  let exitAnimationOpts = null
  if (element.hasAttribute('animate')) {
    const animateClass = element.getAttribute('animate-class')
    const enterClass = element.getAttribute('enter-class') || animateClass
    const exitClass = element.getAttribute('exit-class') || animateClass
    const animateDuration = element.getAttribute('animate-duration') || '400'
    const enterDuration = element.getAttribute('enter-duration') || animateDuration
    const exitDuration = element.getAttribute('exit-duration') || animateDuration
    const animateEasing = element.getAttribute('animate-easing') || 'linear'
    const enterEasing = element.getAttribute('enter-easing') || animateEasing
    const exitEasing = element.getAttribute('exit-easing') || animateEasing
    const animateDelay = element.getAttribute('animate-delay') || '0'
    const enterDelay = element.getAttribute('enter-delay') || animateDelay
    const exitDelay = element.getAttribute('exit-delay') || animateDelay
    const animateEndDelay = element.getAttribute('animate-end-delay') || '0'
    const enterEndDelay = element.getAttribute('enter-end-delay') || animateEndDelay
    const exitEndDelay = element.getAttribute('exit-end-delay') || animateEndDelay
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
  }

  return { enterAnimationOpts, exitAnimationOpts }
}

function dispatchEvent (element, type) {
  const event = new Event(type)
  element.dispatchEvent(event)
}

export { ifDirective, unlessDirective }
