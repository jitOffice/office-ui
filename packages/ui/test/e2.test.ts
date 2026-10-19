import assert from 'node:assert/strict'
import test from 'node:test'

import {
  A4_WIDTH_PX,
  COMMAND_ALIGN_LEFT,
  COMMAND_ITALIC,
  COMMAND_UNDERLINE,
  clampZoom,
  extendStroke,
  filterTree,
  icons,
  neighbor,
  pageWidth,
  replaceAll,
  replaceOne,
  rulerTicks,
  searchHits,
  selectByKey,
  startStroke,
  stepZoom,
  strokePath,
  toggleId,
} from '../src/index.ts'
import type { FileNode } from '../src/index.ts'

const tree: readonly FileNode[] = [
  {
    id: 'docs',
    name: '文档',
    kind: 'folder',
    children: [
      { id: 'prd', name: '产品说明', kind: 'file' },
      { id: 'notes', name: '会议记录', kind: 'file' },
    ],
  },
  { id: 'budget', name: '预算', kind: 'file' },
]

test('图标都是 currentColor 的 SVG', () => {
  assert.equal(Object.keys(icons).length, 31)
  for (const markup of Object.values(icons)) {
    assert.equal(markup.includes('currentColor'), true)
    assert.equal(markup.includes('<script'), false)
  }
})

test('选项卡方向键在一组里循环', () => {
  const ids = ['start', 'insert', 'view']
  assert.equal(selectByKey(ids, 'start', 'ArrowRight'), 'insert')
  assert.equal(selectByKey(ids, 'view', 'ArrowRight'), 'start')
  assert.equal(selectByKey(ids, 'start', 'ArrowLeft'), 'view')
  assert.equal(selectByKey(ids, 'insert', 'Home'), 'start')
  assert.equal(selectByKey(ids, 'insert', 'End'), 'view')
  assert.equal(selectByKey(ids, 'insert', 'Enter'), 'insert')
})

test('查找替换保留未命中的文字', () => {
  const text = '外壳与外壳'
  const hits = searchHits(text, { find: '外壳', replace: '界面', matchCase: false })
  assert.deepEqual(hits, [
    { start: 0, end: 2 },
    { start: 3, end: 5 },
  ])
  assert.equal(replaceOne(text, hits[0]!, '界面'), '界面与外壳')
  assert.deepEqual(replaceAll(text, { find: '外壳', replace: '界面', matchCase: true }), {
    text: '界面与界面',
    count: 2,
  })
  assert.deepEqual(searchHits('Ab', { find: 'a', replace: '', matchCase: true }), [])
  assert.equal(neighbor(-1, 2, 1), 0)
  assert.equal(neighbor(0, 2, -1), 1)
  assert.equal(neighbor(0, 0, 1), -1)
})

test('缩放夹在 50 与 200，文件树按名称过滤', () => {
  assert.equal(clampZoom(10), 50)
  assert.equal(clampZoom(240), 200)
  assert.equal(stepZoom(100, 1), 110)
  assert.equal(stepZoom(50, -1), 50)
  assert.equal(pageWidth(100), A4_WIDTH_PX)
  const matched = filterTree(tree, '说明')
  assert.equal(matched.length, 1)
  assert.deepEqual(
    matched[0]?.children?.map((node) => node.id),
    ['prd'],
  )
  assert.equal(filterTree(tree, '文档')[0]?.children?.length, 2)
  assert.deepEqual(toggleId(['docs'], 'docs'), [])
  assert.deepEqual(toggleId(['docs'], 'sheets'), ['docs', 'sheets'])
})

test('标尺从 0 开始，签名路径连接点', () => {
  const ticks = rulerTicks(pageWidth(100), 100)
  assert.equal(ticks[0]?.label, '0')
  assert.equal(ticks[0]?.offset, 0)
  assert.equal(ticks.length > 1, true)
  const strokes = extendStroke(startStroke([], { x: 1, y: 2 }), { x: 4, y: 6 })
  assert.equal(strokePath(strokes[0]!), 'M 1 2 L 4 6')
  assert.equal([COMMAND_ITALIC, COMMAND_UNDERLINE, COMMAND_ALIGN_LEFT].every((id) => id.startsWith('format.')), true)
})
