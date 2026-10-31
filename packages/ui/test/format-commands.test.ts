/**
 * 值型格式命令（M2「格式相关命令端到端可用」）。
 *
 * 这一组用例守的是一条不变式：
 *
 *   `run(id, x)` 之后 `state(id).value` 就是归一化后的 `x`，并且宿主收到的实参**一模一样**。
 *
 * 反过来说，只要宿主收到的和界面读回的不是同一个值，"选了一个颜色但文档没变"
 * 或者"文档变了但控件显示旧值"这类问题就一定会出现，且两者在浏览器里都看不出来。
 */

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { createCommandRegistry } from '../../shared/src/commands/index.ts'
import {
  COMMAND_ALIGN,
  COMMAND_BOLD,
  COMMAND_BORDER,
  COMMAND_FONT_FAMILY,
  COMMAND_FONT_SIZE,
  COMMAND_LINE_SPACING,
  COMMAND_TEXT_COLOR,
  alignArg,
  borderArg,
  createMemoryEditor,
  editorCommands,
  fontFamilyArg,
  fontSizeArg,
  lineSpacingArg,
  parseAlignValue,
  registerEditorCommands,
  textColorArg,
  tiptapEditorHost,
} from '../src/index.ts'
import type { OjEditorHost } from '../src/index.ts'

const here = dirname(fileURLToPath(import.meta.url))

function createSetup() {
  const queue: (() => void)[] = []
  const editor = createMemoryEditor()
  const registry = createCommandRegistry<OjEditorHost>({
    context: () => editor.host,
    schedule: (task) => {
      queue.push(task)
    },
  })
  registerEditorCommands(registry)
  registry.bind(editor.host)
  return {
    editor,
    registry,
    flush() {
      while (queue.length > 0) queue.shift()?.()
    },
  }
}

test('值型命令：宿主收到的实参与 state().value 是同一个值', async () => {
  const cases: Array<{ id: string; arg: unknown; expected: string | number }> = [
    { id: COMMAND_FONT_FAMILY, arg: ' mono ', expected: 'mono' },
    // 13.44 落到一位小数：与 `OjFontSizeField` 的显示口径一致，否则输入框会把值改写成 13.4 之外的数
    { id: COMMAND_FONT_SIZE, arg: 13.44, expected: 13.4 },
    { id: COMMAND_TEXT_COLOR, arg: ' var(--oj-brand-6) ', expected: 'var(--oj-brand-6)' },
    {
      id: COMMAND_BORDER,
      arg: { style: 'dashed', width: 1.5, color: 'var(--oj-text-1)' },
      expected: '1.5px dashed var(--oj-text-1)',
    },
    { id: COMMAND_LINE_SPACING, arg: 1.5, expected: 1.5 },
    { id: COMMAND_ALIGN, arg: { horizontal: 'center', vertical: 'middle' }, expected: 'center middle' },
  ]

  for (const { id, arg, expected } of cases) {
    const { editor, registry, flush } = createSetup()
    const result = await registry.run(id, arg)
    flush()
    assert.equal(result.ok, true, `${id} 应执行成功`)
    assert.deepEqual(editor.calls.at(-1), { id, arg: expected }, `${id} 的实参`)
    assert.equal(registry.state(id)?.value, expected, `${id} 的 value`)
  }
})

test('非法实参：run 失败、宿主一次都没被调用、界面上的值不被改', async () => {
  const invalid: Array<{ id: string; arg: unknown }> = [
    { id: COMMAND_FONT_FAMILY, arg: '   ' },
    { id: COMMAND_FONT_FAMILY, arg: 42 },
    { id: COMMAND_FONT_SIZE, arg: 1000 },
    { id: COMMAND_FONT_SIZE, arg: Number.NaN },
    { id: COMMAND_TEXT_COLOR, arg: 'not-a-color' },
    { id: COMMAND_BORDER, arg: 42 },
    { id: COMMAND_LINE_SPACING, arg: 0.2 },
    { id: COMMAND_ALIGN, arg: { horizontal: 'middle', vertical: 'top' } },
  ]

  for (const { id, arg } of invalid) {
    const { editor, registry, flush } = createSetup()
    const result = await registry.run(id, arg)
    flush()
    assert.equal(result.ok, false, `${id} 收到 ${JSON.stringify(arg)} 应失败`)
    assert.ok(result.error instanceof Error, `${id} 应带回错误对象`)
    // 归一化在 `host.exec` 之前抛错：宿主没有"收到一个非法值"这条路径
    assert.equal(editor.calls.length, 0, `${id} 不应触达宿主`)
    assert.equal(registry.state(id)?.value, undefined, `${id} 的旧值不该被污染`)
  }
})

test('值型命令写 value 而不是翻 active；布尔命令仍然翻 active', async () => {
  const { registry, flush } = createSetup()

  await registry.run(COMMAND_FONT_SIZE, 16)
  flush()
  // 字号不是布尔量：`active` 一旦跟着翻，字号控件会把自己渲染成"被选中"
  assert.deepEqual(registry.state(COMMAND_FONT_SIZE), { enabled: true, value: 16 })

  await registry.run(COMMAND_BOLD)
  flush()
  assert.deepEqual(registry.state(COMMAND_BOLD), { enabled: true, active: true })
})

test('归一化函数各自的边界', () => {
  assert.equal(fontFamilyArg('  doc '), 'doc')
  assert.throws(() => fontFamilyArg(''), /非空/)
  assert.throws(() => fontFamilyArg(7), /字符串/)

  assert.equal(fontSizeArg(16), 16)
  assert.equal(fontSizeArg(1), 1)
  assert.equal(fontSizeArg(999), 999)
  assert.throws(() => fontSizeArg(0), /超出/)
  assert.throws(() => fontSizeArg('16'), /数字/)

  assert.equal(textColorArg('#ABC'), '#ABC')
  assert.equal(textColorArg('transparent'), 'transparent')
  assert.throws(() => textColorArg('#12345'), /不认识/)

  assert.equal(borderArg('none'), 'none')
  // 只给 `style`：宽度/颜色由 `normalizeBorder` 补默认值，预览与落库同一个函数
  assert.equal(borderArg({ style: 'none' }), 'none')
  assert.equal(borderArg({}), '1px solid var(--oj-text-1)')
  assert.throws(() => borderArg(null), /BorderValue/)

  assert.equal(lineSpacingArg(1.15), 1.15)
  assert.equal(lineSpacingArg(10), 10)
  assert.throws(() => lineSpacingArg(10.5), /超出/)

  assert.equal(alignArg({ horizontal: 'justify', vertical: 'bottom' }), 'justify bottom')
  assert.deepEqual(parseAlignValue('justify bottom'), { horizontal: 'justify', vertical: 'bottom' })
  // 少一个维度就不认：编造一个垂直值会让"两端对齐 + 顶端"变成"两端对齐 + 居中"
  assert.equal(parseAlignValue('center'), undefined)
  assert.equal(parseAlignValue('center huge'), undefined)
  assert.equal(parseAlignValue(undefined), undefined)
})

test('命令表元数据：六条值型命令都进「开始」组、都可撤销、文案走 i18n', () => {
  const byId = new Map(editorCommands().map((command) => [command.id, command]))
  const expected: Array<[string, string]> = [
    [COMMAND_FONT_FAMILY, 'oj.command.fontFamily'],
    [COMMAND_FONT_SIZE, 'oj.command.fontSize'],
    [COMMAND_TEXT_COLOR, 'oj.command.textColor'],
    [COMMAND_BORDER, 'oj.command.border'],
    [COMMAND_LINE_SPACING, 'oj.command.lineSpacing'],
    [COMMAND_ALIGN, 'oj.command.align'],
  ]

  for (const [id, key] of expected) {
    const command = byId.get(id)
    assert.ok(command, `${id} 应登记在命令表里`)
    assert.deepEqual(command.label, { key }, `${id} 的文案`)
    assert.equal(command.group, '开始', `${id} 的分组`)
    // 格式类命令不可撤销就是数据找回能力缺失（03 §1 的 history 三档）
    assert.equal(command.history, 'undoable', `${id} 的可撤销档`)
  }
})

test('每条值型命令都有真实消费者：六条都被 demo 里的控件接到', () => {
  // 这条用例守的是本批次最实际的缺陷形态：命令登记好了、选择器也写好了，但两者没接线，
  // 于是"格式相关命令端到端可用"只在文档里成立。只断言"命令存在"是看不见这种状态的。
  const source = readFileSync(join(here, '../demo/main.ts'), 'utf8')
  const commands: Array<[string, string]> = [
    ['COMMAND_FONT_FAMILY', 'OjFontPicker'],
    ['COMMAND_FONT_SIZE', 'OjFontSizeField'],
    ['COMMAND_TEXT_COLOR', 'OjColorPicker'],
    ['COMMAND_BORDER', 'OjBorderPicker'],
    ['COMMAND_LINE_SPACING', 'OjLineSpacingPicker'],
    ['COMMAND_ALIGN', 'OjAlignmentPicker'],
  ]

  for (const [command, picker] of commands) {
    assert.equal(source.includes(command), true, `demo 没有消费 ${command}`)
    assert.equal(source.includes(picker), true, `demo 没有渲染 ${picker}`)
  }
})

test('Tiptap 桥：值型命令只看方法在不在，对齐只透水平方向', () => {
  const seen: unknown[] = []
  const host = tiptapEditorHost({
    isActive: () => false,
    can: () => ({
      setTextAlign: () => {
        seen.push('can')
        return true
      },
    }),
    commands: {
      setTextAlign: (arg: unknown) => {
        seen.push(arg)
        return true
      },
    },
    on: () => {},
    off: () => {},
  })

  // 没装扩展 = 没有这个方法：灰显，而不是"调一次 can() 得到 false"
  assert.equal(host.can(COMMAND_FONT_FAMILY), false)
  assert.equal(host.exec(COMMAND_FONT_SIZE, 16), false)
  assert.deepEqual(host.state(COMMAND_TEXT_COLOR), { enabled: false })

  // `format.align` 的值是 "center middle"，Tiptap 只认水平方向
  assert.equal(host.can(COMMAND_ALIGN), true)
  assert.equal(host.exec(COMMAND_ALIGN, 'center middle'), true)
  assert.deepEqual(seen, ['center'])
})
