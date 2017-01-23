import {h} from 'fixi'
import {flatten} from 'lodash'

export function link (url) {
  return h('link', {
    rel: 'stylesheet',
    href: url,
  })
}

export function style (rules) {
  return h('style', [renderRules(rules)])
}

export function prop (key, value) {
  return [[key, value]]
}

export function rule (selectors, props) {
  return {selectors, props}
}

function renderRules (rules) {
  return rules.map(renderRule).join('')
}

function renderRule (rule) {
  const {selectors, props} = rule
  const propStrings = flatten(props).map(([k, v]) => `${k}:${v}`)
  return `${selectors.join(' ')} { ${propStrings.join(';\n')} }\n`
}
