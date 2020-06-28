import {
  CONSTRUCTABLE_STYLES_AVAILABLE
} from './Util'

const URL_REGEXP = /^(https?:|\.{0,2}\/)/

const STYLE_CACHE = new Map()
const URL_CACHE = new Map()

function isUrl (string) {
  if (typeof string === 'string') {
    return URL_REGEXP.test(string)
  }

  return string instanceof URL
}

export function loadStyleSheet (stylesheet) {
  if (stylesheet == null) {
    return Promise.resolve(null)
  }

  if (isUrl(stylesheet)) {
    return loadStyleSheetFromUrl(stylesheet)
  }

  return loadStyleSheetFromString(stylesheet)
}

export async function loadStyleSheetFromUrl (url) {
  const fullUrl = new URL(url, window.location).href
  if (!URL_CACHE.has(fullUrl)) {
    const loadPromise = fetch(fullUrl)
      .then((response) => {
        if (!response.ok) {
          throw Error(`Attempting to load stylesheet at ${fullUrl} failed: ${response.statusText}`)
        }

        return response.text()
      })
      .then((css) => {
        return loadStyleSheetFromString(css)
      })

    URL_CACHE.set(fullUrl, loadPromise)
  }

  return URL_CACHE.get(fullUrl)
}

export function loadStyleSheetFromString (css) {
  if (!STYLE_CACHE.has(css)) {
    let loadPromise
    if (CONSTRUCTABLE_STYLES_AVAILABLE) {
      const stylesheet = new CSSStyleSheet()
      loadPromise = stylesheet.replace(css)
    } else {
      const styleUrl = URL.createObjectURL(new Blob(Array.from(css), { type: 'text/css' }))
      loadPromise = Promise.resolve(styleUrl)
    }

    STYLE_CACHE.set(css, loadPromise)
  }

  return STYLE_CACHE.get(css)
}
