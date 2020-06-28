import Element from './src/FactorElement.js'
import define from './src/define.js'
import * as Template from './src/Template'

import propDirective from './src/attrDirectives/prop'
import attrDirective from './src/attrDirectives/attr'
import onDirective from './src/attrDirectives/on'
import classDirective from './src/attrDirectives/class'
import styleDirective from './src/attrDirectives/style'
import idDirective from './src/attrDirectives/id'

import {
  ifDirective,
  unlessDirective
} from './src/tagDirectives/if'
import forDirective from './src/tagDirectives/for'

import {
  eventToTransform,
  eventToAction
} from './src/eventHelpers'

// Bind default attribute binders
Template.registerAttributeDirective(propDirective)
Template.registerAttributeDirective(attrDirective)
Template.registerAttributeDirective(onDirective)
Template.registerAttributeDirective(classDirective)
Template.registerAttributeDirective(styleDirective)
Template.registerAttributeDirective(idDirective)

// Bind default tag directives
Template.registerTagDirective(ifDirective)
Template.registerTagDirective(unlessDirective)
Template.registerTagDirective(forDirective)

export {
  Element,
  define,
  Template,
  eventToTransform,
  eventToAction
}
