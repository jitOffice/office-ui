/**
 * 语言包一致性校验 + `IntlKey` 类型生成（04 §6.2 规则 3、§6.4）。
 *
 * 两件事放一个脚本里是因为它们共用同一套遍历：key 集合 diff 与占位符提取
 * 都需要把四份语言包拍平成同样的路径树，分开写会漂移到两套不同的实现上。
 *
 * `MessageValues` 的类型来自**全部语言**的占位符并集，而不是只看源语言：
 * 英文有 `plural` 分支而中文没有，只看 zh-CN 会把 `{max, plural}` 需要的 `number` 放宽成
 * `string | number`，于是 `t('…', { max: '3' })` 这种在英文下依赖 `Intl.PluralRules` 的写法
 * 就没了编译期约束。
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import enUS from '../src/locales/en-US.ts'
import jaJP from '../src/locales/ja-JP.ts'
import zhCN from '../src/locales/zh-CN.ts'
import zhTW from '../src/locales/zh-TW.ts'
import type { OjLocale, OjMessages } from '../src/types.ts'
import { parseMessage, slotsOf } from '../src/message.ts'
import type { MessageSlot } from '../src/message.ts'

export const locales: readonly OjLocale[] = [zhCN, zhTW, jaJP, enUS]
/** 源语言：新增 key 先写这里，其余语言由 diff 脚本列出待译清单。 */
export const sourceLocale: OjLocale = zhCN

function flatten(messages: OjMessages): Map<string, string> {
  const out = new Map<string, string>()
  const walk = (node: Record<string, unknown>, path: string): void => {
    for (const [key, value] of Object.entries(node)) {
      const next = path === '' ? key : `${path}.${key}`
      if (typeof value === 'string') out.set(next, value)
      else walk(value as Record<string, unknown>, next)
    }
  }
  walk(messages as unknown as Record<string, unknown>, '')
  return out
}

const tables = new Map<string, Map<string, string>>(locales.map((l) => [l.name, flatten(l.messages)]))

/** 每个 key 的占位符并集：`plural` 优先于普通槽位，因为它的类型更严。 */
function slotsByKind(texts: Map<string, string>[]): Map<string, Map<string, MessageSlot['kind']>> {
  const out = new Map<string, Map<string, MessageSlot['kind']>>()
  for (const table of texts) {
    for (const [key, text] of table) {
      let kinds = out.get(key)
      if (!kinds) {
        kinds = new Map()
        out.set(key, kinds)
      }
      for (const slot of slotsOf(parseMessage(text))) {
        const prev = kinds.get(slot.name)
        kinds.set(slot.name, slot.kind === 'plural' || prev === 'plural' ? 'plural' : (prev ?? slot.kind))
      }
    }
  }
  return out
}

export function parityProblems(): string[] {
  const problems: string[] = []
  const base = tables.get(sourceLocale.name) as Map<string, string>

  const names = locales.map((l) => l.name)
  for (const dup of names.filter((n, i) => names.indexOf(n) !== i)) {
    problems.push(`语言包 name 重复：${dup}`)
  }

  for (const locale of locales) {
    const table = tables.get(locale.name) as Map<string, string>

    for (const key of base.keys()) {
      if (!table.has(key)) problems.push(`${locale.name} 缺 key「${key}」`)
    }
    for (const key of table.keys()) {
      if (!base.has(key)) problems.push(`${locale.name} 多出 key「${key}」，源语言 ${sourceLocale.name} 里没有`)
    }

    for (const [key, text] of table) {
      try {
        const slots = [...slotsOf(parseMessage(text))].map((s) => s.name).sort().join(',')
        const baseSlots = [...slotsOf(parseMessage(base.get(key) as string))].map((s) => s.name).sort().join(',')
        if (slots !== baseSlots) {
          problems.push(`${locale.name} 的「${key}」占位符为 [${slots}]，源语言为 [${baseSlots}]`)
        }
      } catch (error) {
        problems.push(`${locale.name} 的「${key}」语法错误：${(error as Error).message}`)
      }
    }
  }
  return problems
}

export function buildKeys(): string {
  const problems = parityProblems()
  if (problems.length > 0) {
    console.error(`[i18n] 语言包不一致，${problems.length} 项：`)
    for (const p of problems) console.error(`  - ${p}`)
    process.exit(1)
  }

  const keys = [...(tables.get(sourceLocale.name) as Map<string, string>).keys()]
  const kinds = slotsByKind([...tables.values()])

  const body: string[] = []
  for (const key of keys) {
    const slots = kinds.get(key)
    if (!slots || slots.size === 0) continue
    const fields = [...slots].map(([name, kind]) => `    ${name}: ${kind === 'plural' ? 'number' : 'OjMessageValue'}`)
    body.push(`  '${key}': {\n${fields.join('\n')}\n  }`)
  }

  const quoted = keys.map((k) => `  | '${k}'`).join('\n')

  return `/**
 * @jitoffice/i18n — 由 packages/i18n/scripts/gen-keys.ts 生成，请勿手改。
 * 源：packages/i18n/src/locales/*.ts（${keys.length} 个 key · ${locales.length} 种语言）。
 */

import type { OjMessageValue } from '../types.ts'

export type IntlKey =
${quoted}

/** 有占位符的 key 才出现在这张表里；没有占位符的 key 走 \`Record<string, never>\`，传任何值都报错。 */
export interface IntlValues {
${body.join('\n')}
}

export type MessageValues<K extends IntlKey> = K extends keyof IntlValues ? IntlValues[K] : Record<string, never>
`
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const invokedDirectly = process.argv[1] ? resolve(process.argv[1]) === resolve(import.meta.filename) : false

if (invokedDirectly) {
  const target = join(root, 'src', 'generated', 'keys.ts')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, buildKeys())
  const total = (tables.get(sourceLocale.name) as Map<string, string>).size
  console.log(`[i18n] ${total} 个 key × ${locales.length} 种语言一致 → src/generated/keys.ts`)
}
