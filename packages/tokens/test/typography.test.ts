/**
 * 语言排版重置层验收（prd/01 §7「日文专项」）。
 *
 * `line-break`、`text-autospace`、`-webkit-font-smoothing` 是元素级规则，不进注册表，
 * 所以 JS 侧的对账测试（parity.test.ts）抓不到它们漏发或写错作用域。
 * 这里直接断言 CSS 文本：这类规则错了只有在真机上看得见，测试是唯一能在门禁里拦住它的地方。
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

function readArtifact(name: string): string {
  try {
    return readFileSync(join(dist, name), 'utf8')
  } catch {
    throw new Error(`缺少产物 dist/${name}，先运行：node packages/tokens/scripts/generate.ts`)
  }
}

const css = readArtifact('index.css')
// 注释里写的多是反面案例（`not([lang="ja"])`），断言前必须去掉，否则自己会抓到自己。
const rules = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)]

function declsOf(needle: string): Record<string, string> {
  const hit = rules.find((r) => (r[1] as string).replace(/\s+/g, ' ').trim().includes(needle))
  assert.ok(hit, `产物里找不到选择器含 ${needle} 的规则`)
  const out: Record<string, string> = {}
  for (const d of ((hit as RegExpMatchArray)[2] as string).matchAll(/([-\w]+)\s*:\s*([^;]+);/g)) {
    out[(d[1] as string).trim()] = (d[2] as string).trim()
  }
  return out
}

test('日文：禁止全角标点落在行首，下划线不压假名，半角/全角混排补间距', () => {
  // 这组值都是实测出来的，改动任何一条都会静默失去效果：Chromium 150 的 text-autospace
  // 只认 normal 与 no-autospace，写成 ideograph-alpha ideograph-numeric 整条被丢弃；
  // 而它的 UA 默认值就是 no-autospace，所以这条声明删不得（01 §7 有 +8px 的数字）。
  assert.deepEqual(declsOf('html[lang|="ja"] body'), {
    'line-break': 'strict',
    'word-break': 'normal',
    'text-underline-position': 'from-font',
    'text-autospace': 'normal',
  })
})

test('antialiased 只作用在非日文作用域，且全产物只有这一处', () => {
  assert.deepEqual(declsOf('html:not([lang|="ja"]) body'), { '-webkit-font-smoothing': 'antialiased' })
  // 全局 `html { -webkit-font-smoothing: antialiased }` 是主流库的做法，会把 Yu Gothic 削细。
  assert.equal(css.split('-webkit-font-smoothing').length - 1, 1, '-webkit-font-smoothing 不该出现在别的选择器里')
})

test('繁体只覆写字体栈，不覆写排版：zh-TW 没有排版层是设计决定', () => {
  assert.equal(rules.some((r) => (r[1] as string).includes('lang|="zh-TW"') && /body/.test(r[1] as string)), false)
  // 繁体没有「字小一号」的排版惯例，硬套日文的 13px 与 strict 换行反而是错的。
  assert.equal(Object.keys(declsOf('html[lang|="zh-TW"]')).length, 1)
})

test('产物里不存在精确匹配的语言选择器', () => {
  const exact = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/\[lang\s*=/g)]
  assert.deepEqual(exact.map((m) => m[0]), [], '必须用 [lang|="…"]：精确匹配命不中带地区子标签的 lang')
})

test('排版规则只在 CSS 侧，不进 JS 产物与 tokenNames', async () => {
  const mod = await import('../dist/index.js')
  for (const name of ['line-break', 'text-autospace', 'font-smoothing', 'word-break']) {
    assert.equal(mod.tokenNames.some((n) => n.includes(name)), false, `${name} 是元素级规则，不该成为 token`)
  }
  assert.equal(readArtifact('index.js').includes('line-break'), false)
})

test('等宽 CJK 档存在：表格单元格与公式栏靠它对齐字宽', async () => {
  assert.equal(Object.keys(declsOf(':root')).includes('--oj-font-mono-cjk'), true)
  // 不写结构断言：直接吃 dist/index.d.ts 的类型。d.ts 与运行时树不同源时这里就报错，
  // 而不是等用户发现 tokens.font.monoCjk 在类型里根本不存在。
  const mod = await import('../dist/index.js')
  assert.equal(mod.tokens.font.monoCjk.startsWith('"Sarasa Mono SC"'), true)
  // CSS 侧保留 var() 引用（惰性解析），JS 侧必须已展开成字面值（canvas 拿不到 var）。
  assert.equal(mod.tokens.font.monoCjk.includes('var('), false)
})
