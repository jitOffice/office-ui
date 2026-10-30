/**
 * 搜索索引的召回测试（04 §4）。
 *
 * 这些用例的价值不在于"索引能建出来"，而在于**钉死分词接线没有退化成默认分词**：
 * 一旦有人把 `tokenize: tokenizeCJK` 从 `buildIndex()` 里摘掉，或者客户端 `loadJSON` 时忘了传，
 * "表格"搜不到"表格选择器"、"OjButton" 搜不到 `OjSplitButton`，下面立刻红。
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

import MiniSearch from 'minisearch'

import { buildIndex } from '../.vitepress/scripts/build-search-index.ts'
import { SEARCH_FIELDS, SEARCH_OPTIONS, STORE_FIELDS } from '../.vitepress/search/options.ts'
import { tokenizeCJK } from '../.vitepress/search/tokenize.ts'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const indexFile = join(docsRoot, 'public', 'search', 'index.json')

/** 与客户端 `OjSearch.vue` 用**同一组** options 复原索引——两边不一致就是召回不一致。 */
function loadSearcher(): MiniSearch {
  const parsed = JSON.parse(buildIndex()) as { index: unknown }
  return MiniSearch.loadJSON(JSON.stringify(parsed.index), {
    fields: [...SEARCH_FIELDS],
    storeFields: [...STORE_FIELDS],
    tokenize: tokenizeCJK,
  })
}

const searcher = loadSearcher()
const paths = (query: string): string[] =>
  searcher.search(query, SEARCH_OPTIONS).map((result) => result.path as string)

test('中文整词：搜"功能区"能落到 Ribbon 页', () => {
  assert.ok(paths('功能区').includes('/components/api/ribbon'))
})

test('中文子串：搜"选择器"命中组件总览', () => {
  assert.ok(paths('选择器').includes('/components/'))
})

test('驼峰拆词：`OjButton` 与 `button` 都能命中命令按钮页', () => {
  assert.ok(paths('button').includes('/components/api/command-button'))
  assert.ok(paths('OjButton').includes('/components/api/command-button'))
})

test('中文与英文写法命中同一批页面（PRD 要求三写法）', () => {
  const byCJK = new Set(paths('按钮'))
  const byLatin = new Set(paths('button'))
  assert.ok([...byLatin].some((path) => byCJK.has(path)))
})

test('标题命中优先于正文命中：搜 `Ribbon` 首条是 Ribbon 页', () => {
  // 不加 `boostDocument` 的实测症状：短文档（指南页）靠归一化后的分数虚高排第一
  assert.equal(paths('Ribbon')[0], '/components/api/ribbon')
})

test('不在站点里的页面不进索引（ADR 被 srcExclude 排除）', () => {
  assert.ok(!paths('ADR').some((path) => path.startsWith('/adr')))
  assert.ok(!paths('命名空间').some((path) => path.startsWith('/adr')))
})

test('入库的索引与当前文档同源', () => {
  assert.equal(readFileSync(indexFile, 'utf8'), buildIndex(), '跑 `pnpm docs:search` 重新生成')
})
