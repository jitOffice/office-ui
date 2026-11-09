/**
 * 拖放协议（M3：`OjDragDropContext`）。
 *
 * 内部拖拽与外部拖入必须能分开：判错的两种后果都很具体——拖选区内文字被当成"格式不支持的文件"，
 * 或者从桌面拖进来的文件被插进正文变成乱码。判定信号是私有 MIME 标记，全在纯函数里。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DRAG_MARKER,
  negotiateTransfer,
  readTransfer,
  writeInternalDrag,
} from '../src/index.ts'
import type { DragTransfer } from '../src/index.ts'

function transfer(types: readonly string[], data: Record<string, string> = {}, files: readonly string[] = []): DragTransfer<string> {
  return {
    types,
    files,
    getData: (format) => data[format] ?? '',
  }
}

test('写入内部拖拽：标记 + 宿主数据 + 可选的富文本兜底', () => {
  const written: Record<string, string> = {}
  writeInternalDrag({ setData: (format, value) => (written[format] = value) }, {
    id: 'block-7',
    html: '<p>一段</p>',
    text: '一段',
  })
  assert.equal(written[DRAG_MARKER], 'block-7')
  assert.equal(written['text/html'], '<p>一段</p>')
  assert.equal(written['text/plain'], '一段')

  // 只给 id 时不写空文本：空串会盖掉浏览器自己的默认拖拽文本
  const plain: Record<string, string> = {}
  writeInternalDrag({ setData: (format, value) => (plain[format] = value) }, { id: 'x' })
  assert.deepEqual(Object.keys(plain), [DRAG_MARKER])
})

test('读载荷：带标记就是内部拖拽，不再当文件处理', () => {
  const internal = readTransfer(
    transfer([DRAG_MARKER, 'text/html', 'text/plain'], {
      [DRAG_MARKER]: 'block-7',
      'text/html': '<p>一段</p>',
      'text/plain': '一段',
    }),
  )
  assert.equal(internal.kind, 'internal')
  assert.equal(internal.data, 'block-7')
  assert.equal(internal.html, '<p>一段</p>')

  const files = readTransfer(transfer(['Files'], {}, ['a.docx', 'b.pdf']))
  assert.equal(files.kind, 'files')
  assert.deepEqual(files.files, ['a.docx', 'b.pdf'])
  assert.equal(files.data, '')

  assert.equal(readTransfer(transfer(['text/html', 'text/plain'])).kind, 'html')
  assert.equal(readTransfer(transfer(['text/plain'])).kind, 'text')
  assert.equal(readTransfer(transfer([])).kind, 'none')

  // dragenter 阶段读 dataTransfer 会抛 SecurityError：不能让它冒到事件处理器外面
  const throwing: DragTransfer<string> = {
    types: ['Files'],
    files: [],
    getData: () => {
      throw new Error('SecurityError')
    },
  }
  assert.equal(readTransfer(throwing).html, '')
})

test('协商：内部拖拽永远接管；扩展名规则只能放行到 drop 再判', () => {
  // 内部拖拽与 accept 无关
  assert.equal(negotiateTransfer([DRAG_MARKER], { types: ['.pdf'] }), true)

  // 没有任何限制 = 全收
  assert.equal(negotiateTransfer(['Files']), true)
  // 只有扩展名规则：拖入阶段拿不到文件名，先放行，drop 后再由 selectDropped 判
  assert.equal(negotiateTransfer(['Files'], { types: ['.docx'] }), true)
  assert.equal(negotiateTransfer(['Files'], { types: ['.docx', '.pdf'] }), true)

  // MIME 规则可以提前挡
  assert.equal(negotiateTransfer(['Files', 'image/png'], { types: ['image/*'] }), true)
  assert.equal(negotiateTransfer(['Files', 'text/plain'], { types: ['image/*'] }), false)
  assert.equal(negotiateTransfer(['Files'], { types: ['application/pdf'] }), false)
  // 混合规则：MIME 规则命中就够了
  assert.equal(negotiateTransfer(['Files', 'image/png'], { types: ['.docx', 'image/*'] }), true)

  // 文本默认不接管：文档里拖选区内文字太常见
  assert.equal(negotiateTransfer(['text/plain']), false)
  assert.equal(negotiateTransfer(['text/html', 'text/plain']), false)
  assert.equal(negotiateTransfer(['text/html'], { text: true }), true)
  assert.equal(negotiateTransfer(['text/plain'], { text: true }), true)

  assert.equal(negotiateTransfer([]), false)
})
