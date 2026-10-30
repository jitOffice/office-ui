import { createApp, h, reactive } from 'vue'
import type { App, Component } from 'vue'

import type { OjLocaleRuntime } from './locale.ts'
import { OjLocaleProvider } from './locale.ts'
import { resolveOjComponent } from './registry.ts'

/**
 * 命令式 API（02 §4.2）：给 jQuery 用户一个"给我 DOM 节点，我渲染到它旁边"的入口，
 * 不需要懂 `createApp`。UMD 上就是 `OfficeUI.create('oj-table-grid-picker', {…})`。
 *
 * **这里最容易被忽略的坑是 provide/inject**：每个 `create` 是独立 app，
 * 拿不到页面里 `OjLocaleProvider` 提供的语言上下文——症状是"页面是日文，
 * 命令式创建的弹层里文案是中文"。所以有了 `configure({ i18n })`：
 * 宿主在启动时登记一次，之后所有 `create` / `hydrate` 出来的实例都自动套上同一个 i18n。
 */

export interface OjConfigureOptions {
  /** 与页面上 `OjLocaleProvider` 用的同一个 `createI18n()` 实例 */
  i18n?: OjLocaleRuntime
  /** 写入挂载容器的 `data-oj-theme`。当前 token 的主题选择器是 `html.dark`，元素级覆盖尚未支持 */
  theme?: 'light' | 'dark'
  /** 写入挂载容器的 `data-oj-density`，同上 */
  density?: 'comfortable' | 'compact'
}

export interface OjCreateOptions extends OjConfigureOptions {
  /** 挂载位置。可以是选择器、元素，或省略（挂到 `<body>`）。实例会插在这个元素**之后** */
  anchor?: string | Element
  props?: Record<string, unknown>
  /** 事件名 → 回调。`select` 会被转成 `onSelect` 传给组件 */
  on?: Record<string, (...args: unknown[]) => void>
}

export interface OjInstance {
  readonly el: Element
  readonly name: string
  /** 受控更新：浅合并到当前 props */
  setProps(next: Record<string, unknown>): void
  /** 必须显式调用，否则 app 与 DOM 都留着（02 §4.2 原文） */
  destroy(): void
}

let defaults: OjConfigureOptions = {}

export function configure(options: OjConfigureOptions): void {
  defaults = { ...defaults, ...options }
}

/** 只给测试用：清掉全局默认，避免用例之间互相污染 */
export function resetConfigure(): void {
  defaults = {}
}

const EVENT_PREFIX = 'on'

function toEventProp(name: string): string {
  if (name.length === 0) return EVENT_PREFIX
  return `${EVENT_PREFIX}${name.charAt(0).toUpperCase()}${name.slice(1)}`
}

function resolveAnchor(anchor: string | Element | undefined): Element | undefined {
  if (anchor === undefined) return undefined
  if (typeof anchor === 'string') {
    const el = document.querySelector(anchor)
    if (el === null) {
      throw new Error(`[office-ui] create 的 anchor 找不到：${anchor}`)
    }
    return el
  }
  return anchor
}

export function create(name: string, options: OjCreateOptions = {}): OjInstance {
  if (typeof document === 'undefined') {
    throw new Error('[office-ui] create 只能在浏览器里调用（SSR 请用组件本身）')
  }

  const component = resolveOjComponent(name)
  if (component === undefined) {
    throw new Error(
      `[office-ui] 未知组件「${name}」。用 OfficeUI.components（或 ojComponentNames()）看已注册的名字`,
    )
  }

  const el = document.createElement('div')
  el.setAttribute('data-oj-instance', name)

  const theme = options.theme ?? defaults.theme
  const density = options.density ?? defaults.density
  if (theme !== undefined) el.setAttribute('data-oj-theme', theme)
  if (density !== undefined) el.setAttribute('data-oj-density', density)

  const anchor = resolveAnchor(options.anchor)
  if (anchor === undefined) {
    document.body.appendChild(el)
  } else {
    // 插在 anchor 之后而不是塞进 anchor 内部：anchor 往往是按钮，塞进去会把按钮文字顶走
    anchor.after(el)
  }

  const props = reactive<Record<string, unknown>>({ ...options.props })
  for (const [event, handler] of Object.entries(options.on ?? {})) {
    props[toEventProp(event)] = handler
  }

  const i18n = options.i18n ?? defaults.i18n
  // 包装组件**刻意不设 `name` 字段**：文档生成器按组件名收集公开组件，
  // 起个名字就会凭空多出一个页面（真发生过，两次）。
  // 这两个只是 h() 的载体，没有任何对外语义。
  const root: Component = {
    setup() {
      return () => h(component, props)
    },
  }

  // syncDocument: false —— 这是挂在页面某处的局部实例，不该去改 html[lang]
  const app: App = createApp(
    i18n === undefined
      ? root
      : {
          setup() {
            return () => h(OjLocaleProvider, { i18n, syncDocument: false }, () => h(root))
          },
        },
  )
  app.mount(el)

  let destroyed = false
  return {
    el,
    name,
    setProps(next) {
      if (destroyed) return
      Object.assign(props, next)
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      app.unmount()
      el.remove()
    },
  }
}
