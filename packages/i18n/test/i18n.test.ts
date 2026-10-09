/**
 * `@jitoffice/i18n` 契约测试（04 §6）。
 * 零依赖：Node 24 的类型剥离直接跑 `.ts`，不需要 vitest 在场。
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { buildKeys, locales, parityProblems, sourceLocale } from '../scripts/gen-keys.ts'
import { createI18n } from '../src/index.ts'
import { parseMessage, render, slotsOf } from '../src/message.ts'
import type { OjLocale } from '../src/types.ts'
import enUS from '../src/locales/en-US.ts'
import jaJP from '../src/locales/ja-JP.ts'
import zhCN from '../src/locales/zh-CN.ts'

function withWarnings<T>(run: (calls: string[]) => T): T {
  const calls: string[] = []
  const original = console.warn
  console.warn = (...args: unknown[]): void => {
    calls.push(args.join(' '))
  }
  try {
    return run(calls)
  } finally {
    console.warn = original
  }
}

/** 只给语法层用的最小语言包：语言包的形状由 `OjMessages` 约束，测指令不该被迫填满 41 个 key。 */
function engine(intl: string) {
  return (source: string, values?: Record<string, string | number>): string =>
    render(parseMessage(source), { values, intl, key: '<test>', dev: false })
}

const zh = engine('zh-CN')
const en = engine('en-US')

test('插值与字面文本混排', () => {
  assert.equal(zh('{rows} × {cols} 表格', { rows: 3, cols: 5 }), '3 × 5 表格')
  assert.equal(zh('前后 {a} 中间', { a: 'X' }), '前后 X 中间')
})

test('plural 的 # 由 Intl 数字格式渲染，中英各按自己的复数规则', () => {
  const msg = '{max, plural, one {Up to # character} other {Up to # characters}}'
  assert.equal(en(msg, { max: 1 }), 'Up to 1 character')
  assert.equal(en(msg, { max: 0 }), 'Up to 0 characters')
  assert.equal(en(msg, { max: 12 }), 'Up to 12 characters')
  assert.equal(en(msg, { max: 1234.5 }), 'Up to 1,234.5 characters')
  // 精确匹配分支优先于类别。
  assert.equal(en('{n, plural, =2 {exactly two} one {# item} other {# items}}', { n: 2 }), 'exactly two')
  assert.equal(zh('{max, plural, other {最多 # 个字符}}', { max: 7 }), '最多 7 个字符')
})

test('select 与嵌套：分支体里还能有槽位与指令', () => {
  assert.equal(zh('{g, select, male {他} female {她} other {TA}}', { g: 'female' }), '她')
  assert.equal(zh('{g, select, male {他} other {{n} 位成员}}', { g: 'x', n: 3 }), '3 位成员')
  assert.equal(
    en('共 {n, plural, one {{label} 项（#）} other {{label} 项（#）}}', { n: 2, label: '筛选条件' }),
    '共 筛选条件 项（2）',
  )
})

test('{{ 与 }} 是字面括号，正文里可以放心写括号', () => {
  assert.equal(zh('设置 {{a}} 后生效'), '设置 {a} 后生效')
  assert.equal(zh('组合 }} 与 {{ 结束'), '组合 } 与 { 结束')
})

test('缺参数时输出可见的槽位名，不输出空串', () => {
  const got = withWarnings((calls) => {
    const i18n = createI18n({ locale: 'zh-CN', locales: [zhCN], dev: true })
    return { text: i18n.translate('oj.tableGridPicker.size', { rows: 3 }), calls }
  })
  assert.equal(got.text, '3 × {cols} 表格')
  assert.match(got.calls.join('\n'), /oj\.tableGridPicker\.size/)
})

test('未命中的 key 原样返回；只有 oj. 前缀才告警', () => {
  const i18n = createI18n({ locale: zhCN, dev: true })
  const calls = withWarnings((c) => {
    i18n.translate('biz.order.save', { id: 7 })
    i18n.translate('oj.nope')
    return c
  })
  assert.equal(i18n.translate('biz.order.save', { id: 7 }), 'biz.order.save')
  assert.equal(i18n.translate('oj.nope'), 'oj.nope')
  assert.equal(calls.length, 1, '业务 key 不该污染控制台')
  assert.match(calls[0] as string, /oj\.nope/)
})

test('查表不走原型链', () => {
  const i18n = createI18n({ locale: zhCN })
  assert.equal(i18n.translate('oj.common.constructor'), 'oj.common.constructor')
  assert.equal(i18n.translate('__proto__'), '__proto__')
  assert.equal(i18n.translate('oj.common.__proto__.polluted'), 'oj.common.__proto__.polluted')
})

test('use 切换语言后取值与 Intl 一起换，未注册的语言抛错而不是静默回退', () => {
  const i18n = createI18n({ locale: zhCN, locales: [zhCN, enUS, jaJP] })
  const seen: string[] = []
  const off = i18n.subscribe((locale) => seen.push(locale.name))

  assert.equal(i18n.t('oj.common.confirm'), '确定')
  i18n.use('en-US')
  assert.equal(i18n.t('oj.common.confirm'), 'OK')
  i18n.use(jaJP)
  assert.equal(i18n.t('oj.validation.maxLength', { max: 3 }), '最大 3 文字です')
  assert.equal(i18n.t('oj.common.empty'), 'データがありません')
  assert.deepEqual(seen, ['en-US', 'ja-JP'])
  off()
  i18n.use('zh-CN')
  assert.deepEqual(seen, ['en-US', 'ja-JP'], '注销后不再收到通知')

  assert.throws(() => i18n.use('de-DE'), /未注册/)
  assert.equal(i18n.lang, 'zh-CN', '失败的 use 不得留下半切状态')
})

test('同语言重复 use 不产生通知', () => {
  const i18n = createI18n({ locale: zhCN, locales: [zhCN, enUS] })
  const seen: string[] = []
  i18n.subscribe((locale) => seen.push(locale.name))
  i18n.use('zh-CN')
  assert.deepEqual(seen, [])
})

test('dispose 后不再通知，但取值仍可用', () => {
  const i18n = createI18n({ locale: zhCN, locales: [zhCN, enUS] })
  const seen: string[] = []
  i18n.subscribe((locale) => seen.push(locale.name))
  i18n.dispose()
  i18n.use('en-US')
  assert.deepEqual(seen, [])
  assert.equal(i18n.t('oj.common.confirm'), 'OK')
})

test('register 的注销只恢复注册表，不改当前语言', () => {
  const i18n = createI18n({ locale: zhCN })
  const off = i18n.register(enUS)
  i18n.use('en-US')
  off()
  assert.equal(i18n.lang, 'en-US')
  assert.equal(i18n.has('en-US'), false)
  assert.throws(() => i18n.use('en-US'), /未注册/)
})

test('resolve 是命令注册表的适配器：裸文案透传，引用查表', () => {
  const i18n = createI18n({ locale: enUS })
  assert.equal(i18n.resolve('Bold'), 'Bold')
  assert.equal(i18n.resolve({ key: 'oj.common.clear' }), 'Clear')
  assert.equal(i18n.resolve({ key: 'oj.tableGridPicker.size', params: { rows: 2, cols: 4 } }), '2 × 4 table')
  assert.equal(i18n.resolve({ key: 'biz.undo' }), 'biz.undo')
})

test('数字格式化委托 Intl，切语言即时生效且不重建实例', () => {
  const i18n = createI18n({ locale: zhCN, locales: [zhCN, enUS, jaJP] })
  assert.equal(i18n.number.decimal(1234.5, 2), '1,234.50')

  // 货币符号本身按语言变（ja 全角 ￥、en/zh 半角 ¥），所以断言要写在该语言下。
  i18n.use(jaJP)
  assert.equal(i18n.number.currency(1235, 'JPY'), '￥1,235')

  i18n.use('en-US')
  assert.equal(i18n.number.integer(1234567.89), '1,234,568')
  assert.equal(i18n.number.percent(0.1234), '12%')
  assert.equal(i18n.number.percent(0.1234, 1), '12.3%')
  assert.equal(i18n.number.currency(1235, 'JPY'), '¥1,235')
})

test('日期按语言包里的格式串渲染，不走 Intl 的 dateStyle', () => {
  const stamp = new Date(2026, 9, 9, 14, 5, 3)
  const i18n = createI18n({ locale: zhCN, locales: [zhCN, enUS, jaJP] })
  assert.equal(i18n.date.date(stamp), '2026年10月9日')
  assert.equal(i18n.date.dateTime(stamp), '2026年10月9日 14时5分')

  i18n.use(jaJP)
  assert.equal(i18n.date.date(stamp), '2026年10月9日')

  i18n.use('en-US')
  assert.equal(i18n.date.date(stamp), 'Oct 9, 2026')
  assert.equal(i18n.date.time(stamp), '2:05 PM')
  assert.equal(i18n.date.pattern('D MMMM, YYYY', stamp), '9 October, 2026')
  assert.equal(i18n.date.pattern("'day' D 'of' MMM", stamp), 'day 9 of Oct')
})

test('星期名走 weekday()；W 不是 token，写进格式串只会得到字面量', () => {
  const stamp = new Date(2026, 9, 9, 14, 5, 3) // 周五
  const i18n = createI18n({ locale: zhCN, locales: [zhCN, enUS, jaJP] })
  assert.equal(i18n.date.weekday(stamp), '周五')
  assert.equal(i18n.date.weekday(stamp, 'long'), '星期五')

  i18n.use(jaJP)
  assert.equal(i18n.date.weekday(stamp), '金')
  assert.equal(i18n.date.weekday(stamp, 'long'), '金曜日')

  i18n.use('en-US')
  assert.equal(i18n.date.weekday(stamp), 'Fri')
  assert.equal(i18n.date.weekday(stamp.getTime()), 'Fri')
  // day.js 里 W/WW 是周序号。这里刻意不实现它：保留字面量比给出错误的数字更安全。
  assert.equal(i18n.date.pattern('YYYY-MM-DD (WW)', stamp), '2026-10-09 (WW)')
})

test('weekStartsOn 是当前语言的快照，切换后必须跟着变', () => {
  const i18n = createI18n({ locale: zhCN, locales: [zhCN, enUS] })
  assert.equal(i18n.date.weekStartsOn, 1)
  i18n.use('en-US')
  assert.equal(i18n.date.weekStartsOn, 0)
})

test('list() 顺序稳定，语言切换器不会因注册顺序而抖动', () => {
  const i18n = createI18n({ locale: zhCN, locales: [jaJP, enUS, zhCN] })
  assert.deepEqual(i18n.list().map((l) => l.name), ['en-US', 'ja-JP', 'zh-CN'])
})

test('基线内核缺 Intl.PluralRules 时退化为"1 单数、其余复数"', () => {
  const original = Intl.PluralRules
  // lib 把 Intl 成员声明成 readonly，`delete` / 赋值都要靠 ts-expect-error 压掉；
  // defineProperty 是同一件事的类型安全写法，恢复也走同一条路径。
  const redefine = (value: unknown): void => {
    Object.defineProperty(Intl, 'PluralRules', { value, configurable: true, writable: true })
  }
  redefine(undefined)
  try {
    const msg = '{max, plural, one {Up to # character} other {Up to # characters}}'
    assert.equal(en(msg, { max: 1 }), 'Up to 1 character')
    assert.equal(en(msg, { max: 2 }), 'Up to 2 characters')
  } finally {
    redefine(original)
  }
})

test('坏语法在构造期抛出，不留到界面变空白', () => {
  assert.throws(() => parseMessage('{a, plural, one {#}}'), /必须有 other/)
  assert.throws(() => parseMessage('{a} }'), /未配对的 \}/)
  assert.throws(() => parseMessage('{a, plural, other {#'), /分支缺少 \}/)
  assert.throws(() => parseMessage('{a, gender, one {#}}'), /不支持的指令/)
  assert.throws(() => parseMessage('{a, plural, foo {#} other {x}}'), /分支键「foo」非法/)
  assert.throws(() => parseMessage('{a, plural, other {#} other {y}}'), /分支键「other」重复/)
  assert.throws(() => parseMessage('文本}'), /未配对的 }/)
  assert.throws(() => parseMessage('{a{b}}'), /出现未闭合的 \{/)
  assert.throws(() => parseMessage('{}'), /槽位名为空/)
})

test('slotsOf 覆盖嵌套分支，这是 IntlValues 的输入', () => {
  const slots = slotsOf(parseMessage('{n, plural, one {{label} # {u, select, a {A} other {B}}} other {x}}'))
  assert.deepEqual(
    slots.map((s) => `${s.name}:${s.kind}`).sort(),
    ['label:arg', 'n:plural', 'u:select'],
  )
})

test('四语 key 集合与占位符一致（04 §6.2 规则 3）', () => {
  assert.deepEqual(parityProblems(), [])
})

test('生成的 IntlKey 表与磁盘产物同源', () => {
  assert.equal(readFileSync(new URL('../src/generated/keys.ts', import.meta.url), 'utf8'), buildKeys())
})

test('语言档位只能取 tokens 认得的三个值', () => {
  const allowed = new Set(['zh', 'zh-TW', 'ja'])
  for (const locale of locales) {
    assert.ok(allowed.has(locale.tokenLang), `${locale.name} 的 tokenLang=${locale.tokenLang} 非法`)
  }
  assert.equal(sourceLocale.name, 'zh-CN', '源语言必须是简体中文')
})

test('name 与 intl 各司其职：name 给 html[lang]，intl 给 Intl.*', () => {
  const byName = new Map<string, OjLocale>()
  for (const locale of locales) {
    assert.ok(!byName.has(locale.name), `name 重复：${locale.name}`)
    byName.set(locale.name, locale)
    assert.match(locale.name, /^[a-z]{2,3}(-[A-Z]{2,4})?(-[A-Za-z]{2,4})?$/)
    assert.match(locale.intl, /^[a-z]{2,3}(-[A-Z]{2,4})?$/)
  }
  // ja-JP 是"带地区的 name"，正是精确属性匹配会漏掉、而 |="ja" 能命中的那种写法。
  assert.equal(byName.get('ja-JP')?.tokenLang, 'ja')
})
