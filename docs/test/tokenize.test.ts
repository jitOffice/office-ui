import assert from 'node:assert/strict'
import test from 'node:test'

import { isCJKChar, tokenizeCJK } from '../.vitepress/search/tokenize.ts'

/**
 * 文档站搜索分词（04 §4）。
 *
 * 这几条不是"跑通即可"的用例，它们各自对应一个**会让搜索静默失效**的具体写法：
 * 按空格分词、只索引整词、不折叠长音、不拆驼峰。每一种的临床表现都是"搜不到"，
 * 而控制台一声不响。
 */

test('中文 bigram：搜「表格」能命中「表格选择器」', () => {
  const tokens = tokenizeCJK('表格选择器')
  assert.ok(tokens.includes('表格'))
  assert.ok(tokens.includes('格选'))
  assert.ok(tokens.includes('选择'))
  assert.ok(tokens.includes('择器'))
  // 单字也进索引，否则搜「表」同样落空
  assert.ok(tokens.includes('表'))
})

test('英文按词切分并小写，标点与空格都当分隔符', () => {
  assert.deepEqual(tokenizeCJK('Insert Table'), ['insert', 'table'])
  assert.deepEqual(tokenizeCJK('insert-table'), ['insert-table', 'insert', 'table'])
})

test('驼峰拆词：OjCommandButton 能被 button / command 搜到', () => {
  const tokens = tokenizeCJK('OjCommandButton')
  assert.ok(tokens.includes('oj'))
  assert.ok(tokens.includes('command'))
  assert.ok(tokens.includes('button'))
})

test('NFKC：全角数字与半角片假名统一到同一形态', () => {
  assert.ok(tokenizeCJK('１０行').includes('10'))
  // 全角与半角两种写法必须落到**同一批 token** 上，否则同一篇文档会有两份索引
  assert.deepEqual(tokenizeCJK('１０ファイル'), tokenizeCJK('10ファイル'))
  assert.deepEqual(tokenizeCJK('ﾌｧｲﾙ'), tokenizeCJK('ファイル'))
})

test('长音折叠：サーバー 与 サーバ 命中的是同一批 token', () => {
  const withLong = tokenizeCJK('サーバー')
  const without = tokenizeCJK('サーバ')
  assert.ok(withLong.includes('サー'))
  assert.ok(withLong.includes('ーバ'))
  // 关键断言：两种写法必须有交集，交集就是"用户怎么打都能命中"的那部分
  const shared = without.filter((token) => withLong.includes(token))
  assert.ok(shared.length > 0, `两种写法没有交集：${withLong.join(',')} / ${without.join(',')}`)
  assert.ok(!withLong.includes('ーー'), '不该产生纯长音的 bigram')
})

test('中日混排：拉丁段与 CJK 段互不截断', () => {
  const tokens = tokenizeCJK('OjRibbon 功能区')
  assert.ok(tokens.includes('oj'))
  assert.ok(tokens.includes('ribbon'))
  assert.ok(tokens.includes('功能'))
  assert.ok(tokens.includes('能区'))
})

test('返回值去重且顺序稳定', () => {
  const once = tokenizeCJK('表格 表格')
  const twice = tokenizeCJK('表格 表格')
  assert.deepEqual(once, twice)
  assert.equal(new Set(once).size, once.length)
})

test('空串与纯标点不产生 token', () => {
  assert.deepEqual(tokenizeCJK(''), [])
  assert.deepEqual(tokenizeCJK('—— · · '), [])
})

test('CJK 区间判定覆盖汉字、假名与谚文，不误伤拉丁字母', () => {
  assert.equal(isCJKChar('汉'), true)
  assert.equal(isCJKChar('あ'), true)
  assert.equal(isCJKChar('カ'), true)
  assert.equal(isCJKChar('한'), true)
  assert.equal(isCJKChar('a'), false)
  assert.equal(isCJKChar('1'), false)
})
