/**
 * 示例契约（04 §3）：`docs/.vitepress/theme/examples.ts` 里的每一段都必须能被沙箱跑起来。
 *
 * 这些断言盯的是**只有真跑起来才会暴露、但静态检查看不见**的那类错误：
 *   1. 语法坏掉（少个引号、模板字符串提前闭合）——`new Function` 求值即红；
 *   2. 模板里用了没注册的 `oj-*` 标签——沙箱只 `createApp`，没有全局注册，
 *      这种错在页面上表现成"一个空标签"，看着像组件坏了；
 *   3. 用 `h()` 写示例——示例是给人抄的，模板字符串才是能直接搬走的那一版。
 *
 * 还有一条**覆盖对账**：`EXAMPLES` 的键必须与生成页面里真正引用的键完全相等。
 * 加了示例却忘了 `pnpm docs:gen` 时，页面不会出现示例区，而这条断言会立刻指出是哪个组件。
 */

import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { EXAMPLES } from '../.vitepress/theme/examples.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const apiDir = join(repoRoot, 'docs', 'components', 'api')

/** 沙箱里用到的 Vue API（写法规矩见 examples.ts 头部注释）。 */
const Vue = {
  ref: (value: unknown) => ({ value }),
  reactive: (value: unknown) => value,
  watch: () => () => {},
}

/**
 * `OfficeUI` 的成员既可能是组件（`OjIcon`），也可能是工具函数
 * （`createDockState` / `addReply` / `useLocale`）。这里统一给一个"能当组件也能调用"的桩：
 * 测试只验证 setup() 能跑完，不渲染任何东西。
 */
const OfficeUI = new Proxy({} as Record<string, unknown>, {
  get: () => () => ({}),
})

/** `OjPaneGroup` → `oj-pane-group` */
function kebabOf(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

const BUILTIN = new Set([
  'template',
  'component',
  'div',
  'span',
  'p',
  'ul',
  'ol',
  'li',
  'button',
  'input',
  'select',
  'option',
  'label',
  'strong',
  'kbd',
  'section',
  'a',
  'img',
  'br',
  'em',
  'b',
  'i',
  'small',
  'h1',
  'h2',
  'h3',
  'h4',
  'table',
  'thead',
  'tbody',
  'tr',
  'td',
  'th',
])

interface ExampleOptions {
  components?: Record<string, unknown>
  setup?: () => Record<string, unknown>
  template?: string
}

function evaluate(key: string): ExampleOptions {
  const code = EXAMPLES[key]
  assert.ok(code !== undefined && code.length > 0, `${key} 的示例是空的`)
  // 沙箱原样用 `new Function('Vue', 'OfficeUI', 'return (代码)')` 求值，这里复刻同一条路径
  const factory = new Function('Vue', 'OfficeUI', `return (${code})`) as (
    vue: typeof Vue,
    officeUI: typeof OfficeUI,
  ) => ExampleOptions
  return factory(Vue, OfficeUI)
}

const keys = Object.keys(EXAMPLES)

test('每个示例都是合法的组件选项对象', () => {
  for (const key of keys) {
    const options = evaluate(key)
    assert.equal(typeof options, 'object', `${key} 求值结果不是对象`)
    assert.equal(typeof options.template, 'string', `${key} 没有 template 字符串`)
  }
})

test('示例能安全执行 setup()', () => {
  for (const key of keys) {
    const options = evaluate(key)
    if (options.setup === undefined) continue
    assert.doesNotThrow(() => {
      options.setup?.()
    }, `${key} 的 setup() 跑不起来`)
  }
})

test('模板里用到的 oj-* 标签都已在该示例的 components 里注册', () => {
  for (const key of keys) {
    const options = evaluate(key)
    const template = options.template ?? ''
    const registered = new Set(Object.keys(options.components ?? {}).map(kebabOf))
    const used = [...template.matchAll(/<([a-z][a-z0-9-]*)/g)]
      .map((match) => match[1] as string)
      .filter((tag) => !BUILTIN.has(tag))

    for (const tag of used) {
      assert.ok(
        registered.has(tag),
        `${key} 的模板里用了 <${tag}>，但 components 里没有注册（沙箱不会全局注册，会渲染成空标签）`,
      )
    }
  }
})

test('示例用模板字符串而不是 h()', () => {
  for (const key of keys) {
    assert.ok(!/\bh\(/.test(EXAMPLES[key] as string), `${key} 用了 h()，示例要写成模板字符串`)
  }
})

test('EXAMPLES 的键与组件文档页引用的键完全一致', () => {
  const pages = readdirSync(apiDir).filter((file) => file.endsWith('.md') && file !== 'index.md')
  const referenced = new Set<string>()
  for (const page of pages) {
    const source = readFileSync(join(apiDir, page), 'utf8')
    for (const match of source.matchAll(/EXAMPLES\['([A-Za-z]+)'\]/g)) {
      referenced.add(match[1] as string)
    }
  }

  const missingInPages = keys.filter((key) => !referenced.has(key))
  const missingInExamples = [...referenced].filter((key) => !keys.includes(key))

  assert.deepEqual(
    missingInPages,
    [],
    `这些示例加了但页面里没有（忘了跑 pnpm docs:gen？）：${missingInPages.join(', ')}`,
  )
  assert.deepEqual(
    missingInExamples,
    [],
    `这些页面引用了不存在的示例键：${missingInExamples.join(', ')}`,
  )
})
