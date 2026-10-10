/**
 * 产物面加载测试（A2 验收的零依赖版本）。
 *
 * 与 shared 那份同构，但这里多一条**无构建器端到端**：把两个 UMD 文件装进同一个
 * `node:vm` 空上下文（没有 `module`、没有 `exports`、没有 `define`），只用全局对象上的
 * `OfficeUII18n` 与 `OfficeUILocaleJaJP` 完成一次日文取值——这就是 02 §4.1 那条
 * `<script src>` 路径在 Node 里能达到的最接近的真实形态。
 *
 * 不读 `src`：`exports` 改指 `dist` 之后，只有这些用例会真去加载发出去的文件。
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { test } from 'node:test'
import { createContext, runInContext } from 'node:vm'

import type * as I18nTypes from '../dist/types/index.js'

const requireFromHere = createRequire(import.meta.url)

/**
 * 说明符写成变量而不是字面量：`dist/es` 旁边没有 `.d.ts`，TS 一旦静态解析它就报 implicit any，
 * 而类型本来就由 `dist/types` 提供。运行时解析仍然按调用文件的 URL 走，路径写错照样炸。
 */
async function loadEsm<T>(specifier: string): Promise<T> {
  return (await import(specifier)) as T
}

const esm = await loadEsm<typeof I18nTypes>('../dist/es/index.js')
const zhCNDefault = await loadEsm<{ default: I18nTypes.OjLocale }>('../dist/es/locales/zh-CN.js')
const cjs = requireFromHere('../dist/cjs/index.cjs') as typeof I18nTypes
const jaJPPath = requireFromHere('../dist/cjs/locales/ja-JP.cjs') as I18nTypes.OjLocale

/** `<script src>` 环境：只有 JS 内置对象，没有 CommonJS 与 AMD 的任何痕迹。 */
function loadUmd(file: string, globals: Record<string, unknown> = {}): Record<string, unknown> {
  const context = createContext({ ...globals })
  runInContext(readFileSync(new URL(file, import.meta.url), 'utf8'), context, { filename: file })
  return context as unknown as Record<string, unknown>
}

test('ESM 产物：根入口与语言包子路径可用', () => {
  const i18n = esm.createI18n({ locale: zhCNDefault.default, locales: [zhCNDefault.default] })
  assert.equal(i18n.t('oj.common.confirm'), '确定')
})

test('CJS 产物与 ESM 产物暴露同一组具名导出', () => {
  assert.deepEqual(Object.keys(cjs).sort(), Object.keys(esm).sort())
  const i18n = cjs.createI18n({ locale: jaJPPath, locales: [jaJPPath] })
  assert.equal(i18n.t('oj.common.empty'), 'データがありません')
})

test('./locales/* 子路径两条链都可达', () => {
  const zh = requireFromHere('../dist/cjs/locales/zh-CN.cjs') as I18nTypes.OjLocale
  assert.equal(zh.name, 'zh-CN')
  assert.equal(zhCNDefault.default.name, 'zh-CN')
})

test('UMD 语言包挂上默认导出的全局名', () => {
  const context = loadUmd('../dist/locale/ja-JP.js')
  const locale = context['OfficeUILocaleJaJP'] as { name: string; direction: string }
  assert.equal(locale.name, 'ja-JP')
  assert.equal(locale.direction, 'ltr')
})

test('UMD 语言包同时输出 AMD 形态', () => {
  const calls: unknown[] = []
  const context = loadUmd('../dist/locale/zh-TW.js', {
    define: Object.assign(
      (deps: unknown, factory: () => unknown) => {
        calls.push(factory())
      },
      { amd: true },
    ),
  })
  assert.equal(calls.length, 1, 'define 必须被调用一次')
  assert.equal((calls[0] as { name: string }).name, 'zh-TW')
  // AMD 分支命中时不得再污染全局，否则同一页面两种加载方式会给出两份语言包。
  assert.equal(context['OfficeUILocaleZhTW'], undefined)
})

test('无构建器路径：两个 UMD 文件在同一个空全局里即可完成日文取值', () => {
  const runtime = loadUmd('../dist/umd/office-ui-i18n.js')
  const i18nFactory = runtime['OfficeUII18n'] as { createI18n: (options: unknown) => { t: (key: string) => string } }
  const locale = loadUmd('../dist/locale/ja-JP.js')['OfficeUILocaleJaJP']
  const i18n = i18nFactory.createI18n({ locale, locales: [locale] })
  assert.equal(i18n.t('oj.common.confirm'), '確定')
})
