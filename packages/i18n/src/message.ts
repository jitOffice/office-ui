/**
 * 消息语法解析与渲染（04 §6.2 规则 5）。
 *
 * 支持三种形态：`{name}` 插值、`{n, plural, one {…} other {…}}`、`{x, select, a {…} other {…}}`，
 * 分支体可再嵌指令，所以是递归下降而不是正则。复数走 `Intl.PluralRules`，不引格式化库。
 *
 * 语法错误在**构造期**抛出而不是渲染期：消息源都是我们自己的语言包，测试会把四份包
 * 全量 parse 一遍，因此线上不可能遇到坏语法；把错误留到渲染期只会变成"界面空白"。
 */

import { cachedNumberFormat, pluralCategory } from './intl.ts'
import type { OjMessageValue, OjMessageValues } from './types.ts'

export type PluralForm = 'plural' | 'select'

export interface Choice {
  key: string
  body: MessageNode[]
}

export type MessageNode =
  | { kind: 'text'; value: string }
  | { kind: 'count' }
  | { kind: 'arg'; name: string }
  | { kind: 'select'; form: PluralForm; name: string; choices: Choice[] }

export interface MessageSlot {
  name: string
  /** `plural` 槽位必须是数字，其余接受字符串或数字。 */
  kind: 'arg' | PluralForm
}

const PLURAL_CATEGORIES = new Set(['zero', 'one', 'two', 'few', 'many', 'other'])
const EXACT_KEY = /^=-?\d+$/

interface Cursor {
  i: number
}

function isSpace(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'
}

function skipSpace(source: string, cur: Cursor): void {
  while (cur.i < source.length && isSpace(source[cur.i] as string)) cur.i += 1
}

export function parseMessage(source: string): MessageNode[] {
  return parseSequence(source, { i: 0 }, false, false)
}

/**
 * 读到 `}` 时：顶层的 `}}` 是字面量转义，分支内的单个 `}` 是分支结束。
 * 两条规则不能同时生效——`…characters}}` 里前一个 `}` 必须闭合分支，否则分支永远闭不上。
 * 分支结束时不消费 `}`，交给 `parseChoices` 校验后吃掉，两层各自负责自己的闭合。
 */
function parseSequence(source: string, cur: Cursor, inBranch: boolean, inPlural: boolean): MessageNode[] {
  const out: MessageNode[] = []
  let literal = ''
  const flush = (): void => {
    if (literal !== '') {
      out.push({ kind: 'text', value: literal })
      literal = ''
    }
  }

  while (cur.i < source.length) {
    const ch = source[cur.i] as string
    const next = source[cur.i + 1]

    if (ch === '{') {
      if (next === '{') {
        literal += '{'
        cur.i += 2
        continue
      }
      cur.i += 1
      flush()
      out.push(parseSlot(source, cur))
      continue
    }
    if (ch === '}') {
      if (!inBranch && next === '}') {
        literal += '}'
        cur.i += 2
        continue
      }
      if (!inBranch) throw new Error(`消息语法错误：「${source}」有未配对的 }`)
      flush()
      return out
    }
    if (ch === '#' && inPlural) {
      flush()
      out.push({ kind: 'count' })
      cur.i += 1
      continue
    }
    literal += ch
    cur.i += 1
  }

  if (inBranch) throw new Error(`消息语法错误：「${source}」的分支缺少 }`)
  flush()
  return out
}

/** 名字里出现 `{` 只可能是上一层语法错误，不能当普通字符吞掉，否则错误会漂到更深处。 */
function readName(source: string, cur: Cursor, stop: string): string {
  const from = cur.i
  while (cur.i < source.length) {
    const ch = source[cur.i] as string
    if (stop.includes(ch)) break
    if (ch === '{') throw new Error(`消息语法错误：「${source}」第 ${cur.i} 位出现未闭合的 {`)
    cur.i += 1
  }
  return source.slice(from, cur.i).trim()
}

function parseSlot(source: string, cur: Cursor): MessageNode {
  const name = readName(source, cur, ',}')
  if (name === '') throw new Error(`消息语法错误：「${source}」第 ${cur.i} 位的槽位名为空`)
  if (cur.i >= source.length) throw new Error(`消息语法错误：「${source}」的槽位 {${name} 未闭合`)

  if (source[cur.i] === '}') {
    cur.i += 1
    return { kind: 'arg', name }
  }

  cur.i += 1 // 吃掉 ','
  const form = readName(source, cur, ',}')
  if (form !== 'plural' && form !== 'select') {
    throw new Error(`消息语法错误：不支持的指令「${form}」，只支持 plural 与 select`)
  }
  if (source[cur.i] !== ',') throw new Error(`消息语法错误：{${name}, ${form} 缺少分支`)
  cur.i += 1 // 吃掉 ','

  const choices = parseChoices(source, cur, name, form)
  if (source[cur.i] !== '}') throw new Error(`消息语法错误：{${name}, ${form} 未闭合`)
  cur.i += 1
  return { kind: 'select', form, name, choices }
}

function parseChoices(source: string, cur: Cursor, name: string, form: PluralForm): Choice[] {
  const out: Choice[] = []
  const seen = new Set<string>()
  for (;;) {
    skipSpace(source, cur)
    if (cur.i >= source.length) throw new Error(`消息语法错误：{${name}, ${form}} 未闭合`)
    if (source[cur.i] === '}') {
      // 指令自身的闭合括号留给 parseSlot 消费，两层各吃各的括号。
      break
    }

    const key = readName(source, cur, '{')
    if (key === '') throw new Error(`消息语法错误：{${name}, ${form} 第 ${cur.i} 位缺少分支键`)
    if (form === 'plural' && !EXACT_KEY.test(key) && !PLURAL_CATEGORIES.has(key)) {
      throw new Error(
        `消息语法错误：plural 分支键「${key}」非法，应为 =数字 或 ${[...PLURAL_CATEGORIES].join('/')}`,
      )
    }
    if (seen.has(key)) throw new Error(`消息语法错误：{${name}, ${form} 分支键「${key}」重复`)
    seen.add(key)

    skipSpace(source, cur)
    if (source[cur.i] !== '{') throw new Error(`消息语法错误：{${name}, ${form} 的分支「${key}」缺少 { }`)
    cur.i += 1
    const body = parseSequence(source, cur, true, form === 'plural')
    if (source[cur.i] !== '}') throw new Error(`消息语法错误：{${name}, ${form} 的分支「${key}」未闭合`)
    cur.i += 1
    out.push({ key, body })
  }

  if (form === 'plural' && !out.some((c) => c.key === 'other')) {
    throw new Error(`消息语法错误：{${name}, plural} 必须有 other 分支`)
  }
  return out
}

/** 供生成器提取每个 key 需要的占位符；嵌套分支里的槽位同样收集。 */
export function slotsOf(nodes: MessageNode[], into: MessageSlot[] = []): MessageSlot[] {
  for (const node of nodes) {
    if (node.kind === 'arg') into.push({ name: node.name, kind: 'arg' })
    else if (node.kind === 'select') {
      into.push({ name: node.name, kind: node.form })
      for (const choice of node.choices) slotsOf(choice.body, into)
    }
  }
  return into
}

export interface RenderContext {
  values: OjMessageValues | undefined
  /** 喂给 `Intl.PluralRules` 与 `#` 的 BCP-47 标签。 */
  intl: string
  /** 只用于告警定位。 */
  key: string
  dev?: boolean
}

/**
 * `count` 是 plural 分支里的 `#`，值由上一层 `renderSelect` 显式传进来。
 * 不用"往 values 里塞一个魔法键"的做法：那条路会让调用方传入的同名参数被覆盖，
 * 也让 `slotsOf` 与渲染结果对不上。
 */
function renderNodes(nodes: MessageNode[], ctx: RenderContext, count: OjMessageValue | undefined): string {
  let out = ''
  for (const node of nodes) {
    switch (node.kind) {
      case 'text':
        out += node.value
        break
      case 'count':
        out += count === undefined ? '' : cachedNumberFormat(ctx.intl, {}).format(Number(count))
        break
      case 'arg': {
        const value = ctx.values?.[node.name]
        out += value === undefined ? missing(node.name, ctx) : String(value)
        break
      }
      case 'select':
        out += renderSelect(node, ctx, count)
        break
    }
  }
  return out
}

function missing(name: string, ctx: RenderContext): string {
  // 返回可见的槽位名而不是空串：界面里出现 `{rows}` 会被立刻发现，空串会一路漂到线上。
  if (ctx.dev) console.warn(`[i18n] ${ctx.key} 缺少参数「${name}」`)
  return `{${name}}`
}

function renderSelect(
  node: Extract<MessageNode, { kind: 'select' }>,
  ctx: RenderContext,
  count: OjMessageValue | undefined,
): string {
  const value = ctx.values?.[node.name]
  if (value === undefined) return missing(node.name, ctx)

  const other = node.choices.find((c) => c.key === 'other')
  let chosen: Choice | undefined
  if (node.form === 'select') {
    chosen = node.choices.find((c) => c.key === String(value)) ?? other
  } else {
    const num = typeof value === 'number' ? value : Number(value)
    // NaN / Infinity 不进 Intl（`select()` 会抛 RangeError），直接落 other。
    chosen = Number.isFinite(num)
      ? (node.choices.find((c) => c.key === `=${num}`) ??
        node.choices.find((c) => c.key === pluralCategory(ctx.intl, num)) ??
        other)
      : other
  }

  if (!chosen) {
    // plural 必须有 other（解析期已强制），走到这里只可能是 select 写漏了。
    if (ctx.dev) console.warn(`[i18n] ${ctx.key} 的 ${node.form} 缺 other 分支，值「${String(value)}」无处匹配`)
    return String(value)
  }
  return renderNodes(chosen.body, ctx, node.form === 'plural' ? value : count)
}

export function render(nodes: MessageNode[], ctx: RenderContext): string {
  return renderNodes(nodes, ctx, undefined)
}
