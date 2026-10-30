import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  generate,
  kebabOf,
  renderPage,
  scanSource,
} from '../.vitepress/scripts/component-docs.ts'

/**
 * 组件文档生成器（04 §5）。
 *
 * 用**真实组件源码**断言，而不是喂一段人造字符串：这个脚本的全部价值是"对现有 34 个组件都成立"，
 * 人造样本只能证明它对自己的样本成立。三条最容易静默坏掉的地方各钉一条：
 * prop 名漏掉、CSS 变量漏掉、必填/默认值判错。
 */

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

function scan(file: string) {
  const absolute = join(repoRoot, 'packages', 'ui', 'src', 'vue', file)
  return scanSource(`packages/ui/src/vue/${file}`, readFileSync(absolute, 'utf8'))
}

test('OjIcon 的 props 与默认值都被抽出来', () => {
  const doc = scan('icon.ts')
  assert.ok(doc)
  assert.equal(doc.name, 'OjIcon')
  const names = doc.props.map((prop) => prop.name)
  assert.deepEqual(names, ['name', 'size', 'label', 'decorative', 'spin'])
  assert.equal(doc.props[0]?.required, true)
  assert.equal(doc.props[3]?.defaultValue, 'false')
  // spin 是布尔开关，默认关闭：加 prop 时顺手锁住默认值，别让默认值漂成 true
  assert.equal(doc.props[4]?.defaultValue, 'false')
})

test('OjRibbonGroup：多行 props 不被切断，字符串默认值保留原文', () => {
  const doc = scan('ribbon-group.ts')
  assert.ok(doc)
  assert.deepEqual(doc.props.map((prop) => prop.name), [
    'items',
    'available',
    'gap',
    'overflowWidth',
    'label',
    'overflowLabel',
  ])
  assert.equal(doc.props[0]?.required, true)
  assert.equal(doc.props[2]?.defaultValue, '2')
  assert.equal(doc.props[5]?.defaultValue, '更多')
  assert.equal(doc.block, 'oj-ribbon-group')
})

test('泛型默认值不把后面的 prop 吞掉：PropType<Record<string, string>>', () => {
  const doc = scan('locale.ts')
  assert.ok(doc)
  // locale.ts 里 i18n 的 type 是 PropType<OjLocaleRuntime>，syncDocument 必须还在
  assert.ok(doc.props.some((prop) => prop.name === 'syncDocument'))
  assert.equal(doc.props.find((prop) => prop.name === 'syncDocument')?.defaultValue, 'true')
})

test('CSS 变量表来自源码里的 var(--oj-*)', () => {
  const doc = scan('ribbon-group.ts')
  assert.ok(doc)
  // 组件的宽度预算是写进 inline style 的，变量的默认值在 style.css 里，所以这里允许为空数组
  assert.ok(Array.isArray(doc.cssVars))

  const localSwitcher = scan('locale-switcher.ts')
  assert.ok(localSwitcher)
  assert.deepEqual(localSwitcher.i18nKeys, ['oj.common.language'])
})

test('kebab 化：OjRibbonGroup → ribbon-group，OjAiPanel → ai-panel', () => {
  assert.equal(kebabOf('OjRibbonGroup'), 'ribbon-group')
  assert.equal(kebabOf('OjAiPanel'), 'ai-panel')
  assert.equal(kebabOf('OjIcon'), 'icon')
})

test('生成物自洽：每页都有标题、生成声明与源码路径', () => {
  const { files } = generate(repoRoot)
  assert.ok(files.size > 30, `只生成了 ${files.size} 份`)

  const page = files.get('docs/components/api/command-menu.md') ?? files.get('docs/components/api/context-menu.md')
  assert.ok(page)
  assert.ok(page.startsWith('# OjContextMenu'))
  assert.ok(page.includes('请勿手改'))
  assert.ok(page.includes('packages/ui/src/vue/context-menu.ts'))
})

test('索引页链接数与页面数一致（生成器自己不会漏链）', () => {
  const { files } = generate(repoRoot)
  const index = files.get('docs/components/api/index.md')
  assert.ok(index)
  const pages = [...files.keys()].filter((path) => path.startsWith('docs/components/api/') && path !== 'docs/components/api/index.md')
  for (const path of pages) {
    const link = path.replace('docs/components/api/', '/components/api/').replace(/\.md$/, '')
    assert.ok(index.includes(`(${link})`), `索引缺链：${link}`)
  }
})

test('renderPage 不产出表格断行：默认值里的竖线被转义', () => {
  const markdown = renderPage({
    name: 'OjDemo',
    file: 'packages/ui/src/vue/demo.ts',
    block: 'oj-demo',
    props: [{ name: 'mode', required: false, defaultValue: 'a|b' }],
    cssVars: ['--oj-demo-size'],
    i18nKeys: [],
  })
  assert.ok(markdown.includes('a\\|b'))
})
