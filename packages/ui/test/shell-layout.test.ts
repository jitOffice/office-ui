/**
 * 外壳布局与导入的行为层（M3：`OjSplitter` / `OjDropZone`）。
 *
 * 两件事都属"在浏览器里几乎没法复现"的那类：分栏的边界 bug 出现在 min / max / 折叠三者的
 * 交界处（要精确到像素），拖放受理的 bug 只在"某个格式的文件恰好被静默吞掉"时出现。
 * 纯函数里一行断言就能钉死，组件测试只验接线。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SPLITTER_STEP,
  acceptsFile,
  classifyTransfer,
  clampPane,
  extensionOf,
  paneSplitter,
  resizePane,
  selectDropped,
  stepPane,
  togglePane,
} from '../src/index.ts'
import type { DropAccept } from '../src/index.ts'

const PANE = { min: 200, max: 400 }

test('分栏夹取：min/max 生效，max 写反时以 min 为准', () => {
  assert.equal(clampPane(300, PANE), 300)
  assert.equal(clampPane(120, PANE), 200)
  assert.equal(clampPane(600, PANE), 400)
  // 配置写反（max < min）不能算出 NaN 或负宽
  assert.equal(clampPane(300, { min: 200, max: 100 }), 200)
  assert.equal(clampPane(Number.NaN, PANE), 200)
  assert.equal(clampPane(-50, { min: 0, max: 400 }), 0)
  // 不写 max 表示"不限"：当成缺省 = min 会把拖拽直接夹死，拖一下弹回原处，看起来像坏了
  assert.equal(clampPane(3000, { min: 160 }), 3000)
  assert.equal(clampPane(3000, { min: 160, max: Number.POSITIVE_INFINITY }), 3000)
})

test('折叠阈值取 min/2：窄一点与想收起是两种意图，界线只有一条', () => {
  const collapsible = { ...PANE, collapsible: true }
  // 阈值正上方算"想窄一点"，被夹回 min；正下方才算"想收起"
  assert.equal(clampPane(100, collapsible), 200)
  assert.equal(clampPane(99, collapsible), 0)
  // 不可折叠时永远不会变成 0：折叠按钮不在，拖到 0 就再也拉不回来
  assert.equal(clampPane(1, PANE), 200)
})

test('拖拽增量：以按下时的尺寸为基准；已折叠的栏不因为手抖自动弹开', () => {
  assert.equal(resizePane(300, 40, PANE), 340)
  assert.equal(resizePane(300, -40, PANE), 260)
  assert.equal(resizePane(300, -400, PANE), 200)
  assert.equal(resizePane(300, Number.NaN, PANE), 300)
  // 0 是折叠态，不是"很小的尺寸"：resizePane 必须原样返回，展开走键盘或双击
  assert.equal(resizePane(0, 80, { ...PANE, collapsible: true }), 0)
})

test('键盘步进：折叠态下"变大"直接回到 min，不会卡在 0~min 之间', () => {
  const collapsible = { ...PANE, collapsible: true }
  assert.equal(stepPane(300, 1, PANE), 300 + SPLITTER_STEP)
  assert.equal(stepPane(300, -1, PANE), 300 - SPLITTER_STEP)
  assert.equal(stepPane(200, -1, collapsible), 0)
  assert.equal(stepPane(0, 1, collapsible), 200)
  assert.equal(stepPane(0, -1, collapsible), 0)
  // step=0 退回默认步长：否则方向键按下去毫无反应，看起来像键盘坏了
  assert.equal(stepPane(300, 1, PANE, 0), 300 + SPLITTER_STEP)
})

test('折叠切换：不可折叠时按钮点了没反应，好过变成 0 回不来', () => {
  assert.equal(togglePane(300, PANE), 300)
  const collapsible = { ...PANE, collapsible: true }
  assert.equal(togglePane(300, collapsible), 0)
  // 展开回到 min 而不是上一次的宽度：组件不存历史尺寸，猜一个值只会更奇怪
  assert.equal(togglePane(0, collapsible), 200)
})

test('多栏容器：分隔条只调固定宽的那一栏，可伸缩栏没有可拖的数值', () => {
  // 合同审阅的三段：左大纲固定、中文档伸缩、右批注固定
  const panes = [
    { id: 'outline', size: 240, min: 160, collapsible: true },
    { id: 'doc', size: 0, flexible: true, min: 320 },
    { id: 'comments', size: 320, min: 240, max: 560, collapsible: true },
  ]
  // 大纲 / 文档之间：后一栏伸缩，所以调前一栏（向左拖是放宽，方向为 before）
  assert.deepEqual(paneSplitter(panes, 1), { controlled: 'outline', side: 'before' })
  // 文档 / 批注之间：后一栏固定，按默认调后一栏
  assert.deepEqual(paneSplitter(panes, 2), { controlled: 'comments', side: 'after' })

  // 两侧都固定时调后一栏（与 OjSplitter 的默认方向一致）
  assert.deepEqual(
    paneSplitter(
      [
        { id: 'a', size: 200 },
        { id: 'b', size: 200 },
      ],
      1,
    ),
    { controlled: 'b', side: 'after' },
  )

  // 两侧都可伸缩：按比例分空间，拖谁都表达不成单个尺寸，干脆不画条子
  assert.equal(
    paneSplitter(
      [
        { id: 'a', size: 0, flexible: true },
        { id: 'b', size: 0, flexible: true },
      ],
      1,
    ),
    undefined,
  )

  // 固定宽且不允许拖（工具条栏）：条子不渲染，否则用户拖了没反应
  assert.equal(
    paneSplitter(
      [
        { id: 'a', size: 200, resizable: false },
        { id: 'b', size: 0, flexible: true },
      ],
      1,
    ),
    undefined,
  )

  // 越界不算错：容器可能只挂了一栏，也可能在遍历时多问了一次
  assert.equal(paneSplitter(panes, 0), undefined)
  assert.equal(paneSplitter(panes, 3), undefined)
  assert.deepEqual(
    paneSplitter(
      [
        { id: 'a', size: 200 },
        { id: 'b', size: 0, flexible: true },
      ],
      1,
    ),
    { controlled: 'a', side: 'before' },
  )
})

test('扩展名：大小写归一，点开头的文件没有扩展名', () => {
  assert.equal(extensionOf('合同.DOCX'), '.docx')
  assert.equal(extensionOf('photo.PNG'), '.png')
  // 多段后缀取最后一段：归档里的 .tar 不该被当成主体
  assert.equal(extensionOf('archive.tar.gz'), '.gz')
  assert.equal(extensionOf('README'), '')
  assert.equal(extensionOf('.gitignore'), '')
  assert.equal(extensionOf('trailing.'), '')
})

test('受理规则：扩展名 → MIME 通配 → MIME 精确，三处都空表示全收', () => {
  const docx = { name: '合同.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
  assert.equal(acceptsFile(docx, {}), true)
  assert.equal(acceptsFile(docx, { types: [] }), true)
  assert.equal(acceptsFile(docx, { types: ['.docx'] }), true)
  assert.equal(acceptsFile(docx, { types: [' .DOCX '] }), true)
  assert.equal(acceptsFile(docx, { types: ['.pdf'] }), false)

  // image/* 只比 MIME 前缀：写 + 号/别名会把 photo.PNG 这类全漏掉
  assert.equal(acceptsFile({ name: 'photo.PNG', type: 'image/png' }, { types: ['image/*'] }), true)
  assert.equal(acceptsFile({ name: 'notes.txt', type: 'text/plain' }, { types: ['image/*'] }), false)
  // 缺 type（某些平台拖进来的文件没有 MIME）时通配规则不成立，但扩展名规则仍可命中
  assert.equal(acceptsFile({ name: 'scan.pdf' }, { types: ['application/pdf'] }), false)
  assert.equal(acceptsFile({ name: 'scan.pdf' }, { types: ['.pdf'] }), true)
})

test('多文件受理：multiple=false 只收第一个，两种拒绝原因不混为一谈', () => {
  const accept: DropAccept = { types: ['.docx'], multiple: false }
  const one = selectDropped([{ name: 'a.docx' }, { name: 'b.docx' }], accept)
  assert.deepEqual(
    one.accepted.map((file) => file.name),
    ['a.docx'],
  )
  assert.equal(one.rejected, 'count')

  // 格式不对优先：用户要改的是"传什么"，不是"传几个"
  const mixed = selectDropped([{ name: 'a.docx' }, { name: 'b.exe' }, { name: 'c.docx' }], accept)
  assert.deepEqual(
    mixed.accepted.map((file) => file.name),
    ['a.docx'],
  )
  assert.equal(mixed.rejected, 'type')

  const none = selectDropped([{ name: 'a.exe' }], accept)
  assert.equal(none.accepted.length, 0)
  assert.equal(none.rejected, 'type')

  // 默认允许多选：不给 multiple 就等于"拖几个收几个"
  const many = selectDropped([{ name: 'a.docx' }, { name: 'b.docx' }], { types: ['.docx'] })
  assert.equal(many.accepted.length, 2)
  assert.equal(many.rejected, undefined)
})

test('受理结果保留子类型：宿主拿到的是原始文件对象，不是重新拼的副本', () => {
  const first = { name: 'a.docx', type: '', file: { size: 1 } }
  const second = { name: 'b.txt', type: 'text/plain', file: { size: 2 } }
  const selection = selectDropped([first, second], { types: ['.docx'] })
  assert.equal(selection.accepted[0]?.file, first.file)
  assert.equal(selection.rejected, 'type')
})

test('拖放载荷分支：文件优先于富文本，富文本优先于纯文本', () => {
  assert.equal(classifyTransfer(['Files']), 'files')
  assert.equal(classifyTransfer(['application/x-moz-file']), 'files')
  assert.equal(classifyTransfer(['text/html', 'text/plain']), 'html')
  assert.equal(classifyTransfer(['text/plain']), 'text')
  assert.equal(classifyTransfer([]), 'none')
  // 浏览器保证 types 是小写，但宿主/测试构造的未必是：不做归一就会漏判
  assert.equal(classifyTransfer(['FILES']), 'files')
  assert.equal(classifyTransfer(['Text/HTML']), 'html')
})
