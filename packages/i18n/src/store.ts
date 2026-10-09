/**
 * i18n 运行时：语言表 + 当前语言 + 取值（04 §6.3）。
 *
 * 框架无关：只暴露 `subscribe`，Vue 层的 `OjLocaleProvider` / `useLocale` 建在它上面，
 * jQuery 与 Node 直接用（ADR-0005）。这里**不碰 document**——写 `html[lang]` 是 Provider 的副作用，
 * 否则同一个包在 SSR 里就炸了。
 */

import { createDateFormat, createNumberFormat } from './formats.ts'
import { parseMessage, render } from './message.ts'
import type { MessageNode } from './message.ts'
import type {
  OjI18n,
  OjI18nOptions,
  OjLocale,
  OjMessageValues,
} from './types.ts'

const nodeCache = new Map<string, MessageNode[]>()

function compile(source: string): MessageNode[] {
  let nodes = nodeCache.get(source)
  if (!nodes) {
    nodes = parseMessage(source)
    nodeCache.set(source, nodes)
  }
  return nodes
}

/**
 * 用 `hasOwnProperty.call` 而不是 `Object.hasOwn`：后者是 ES2022，落在 B2 的
 * Chromium 86 候选基线之外，而这条路径每次取文案都会走。
 */
function lookup(root: OjLocale['messages'], key: string): unknown {
  let node: unknown = root
  for (const seg of key.split('.')) {
    if (typeof node !== 'object' || node === null || !Object.prototype.hasOwnProperty.call(node, seg)) {
      return undefined
    }
    node = (node as Record<string, unknown>)[seg]
  }
  return node
}

export function createI18n(options: OjI18nOptions): OjI18n {
  const dev = options.dev ?? false
  const registry = new Map<string, OjLocale>()
  const listeners = new Set<(locale: OjLocale) => void>()
  let disposed = false

  for (const locale of options.locales ?? []) registry.set(locale.name, locale)

  const requested = typeof options.locale === 'string' ? registry.get(options.locale) : options.locale
  if (!requested) {
    const known = [...registry.keys()].join(', ') || '（空）'
    throw new Error(`[i18n] 初始语言「${String(options.locale)}」未注册，已注册：${known}`)
  }
  if (!registry.has(requested.name)) registry.set(requested.name, requested)
  let current = requested

  const number = createNumberFormat(() => current)
  const date = createDateFormat(() => current)

  function value(key: string, values?: OjMessageValues): string {
    const raw = lookup(current.messages, key)
    if (typeof raw !== 'string') {
      // 只对 `oj.` 前缀告警：业务 key 本来就不在我们的表里，静默透传才是对的。
      if (dev && key.startsWith('oj.')) console.warn(`[i18n] ${current.name} 缺少文案 ${key}`)
      return key
    }
    return render(compile(raw), { values, intl: current.intl, key, dev })
  }

  function notify(): void {
    if (disposed) return
    for (const listener of [...listeners]) listener(current)
  }

  return {
    get locale() {
      return current
    },
    get lang() {
      return current.name
    },
    register(locale) {
      const previous = registry.get(locale.name)
      if (previous && previous !== locale && dev) {
        console.warn(`[i18n] 语言包 ${locale.name} 被替换`)
      }
      registry.set(locale.name, locale)
      return () => {
        // 只恢复注册表，不动当前语言：正在用这个包的应用不该因为别人注销就换语言。
        if (registry.get(locale.name) !== locale) return
        if (previous) registry.set(locale.name, previous)
        else registry.delete(locale.name)
      }
    },
    has(name) {
      return registry.has(name)
    },
    use(next) {
      const locale = typeof next === 'string' ? registry.get(next) : next
      if (!locale) {
        const known = [...registry.keys()].join(', ') || '（空）'
        throw new Error(`[i18n] 语言「${String(next)}」未注册，已注册：${known}`)
      }
      if (!registry.has(locale.name)) registry.set(locale.name, locale)
      if (locale === current) return
      current = locale
      notify()
    },
    list() {
      return [...registry.values()].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
    },
    t(key, values) {
      return value(key, values as OjMessageValues | undefined)
    },
    translate(key, values) {
      return value(key, values)
    },
    resolve(message) {
      return typeof message === 'string' ? message : value(message.key, message.params)
    },
    number,
    date,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    dispose() {
      listeners.clear()
      // 只做减法：取值路径保持可用，避免卸载之后仍存活的引用在读取时抛错。
      disposed = true
    },
  }
}
