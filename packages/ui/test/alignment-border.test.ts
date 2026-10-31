import assert from 'node:assert/strict'
import test from 'node:test'

import {
  BORDER_COLORS,
  BORDER_STYLES,
  BORDER_WIDTHS,
  DEFAULT_ALIGNMENT,
  STYLE_PRESETS,
  borderCss,
  formatBorderWidth,
  isAlignmentValue,
  normalizeAlignment,
  normalizeBorder,
  stepHorizontal,
  stepVertical,
  styleLabel,
  stylePresetCss,
  textAlignCss,
  verticalAlignCss,
} from '../src/index.ts'

/**
 * 对齐 / 边框 / 样式画廊的模型（M2 第三批）。
 *
 * 这组的共同风险是"半合法状态"：水平对齐合法、垂直不合法时若只补一半，
 * 界面会出现两行里一行高亮、另一行全灭；边框选 `none` 时若还留着 1px，
 * 下游导出工具会画出一条看不见的线。归一化函数必须把这类状态一次收干净。
 */

test('normalizeAlignment 要么全合法，要么整体回退默认', () => {
  assert.deepEqual(normalizeAlignment({ horizontal: 'center', vertical: 'bottom' }), {
    horizontal: 'center',
    vertical: 'bottom',
  })
  // 只给一半：另一半回退默认，但已给的那半保留（不能因为半边非法把整个值丢掉）
  assert.deepEqual(normalizeAlignment({ horizontal: 'justify' }), { horizontal: 'justify', vertical: 'top' })
  // 非法值逐个回退
  assert.deepEqual(normalizeAlignment({ horizontal: 'middle' as never, vertical: 'bottom' }), {
    horizontal: 'left',
    vertical: 'bottom',
  })
  assert.deepEqual(normalizeAlignment(undefined), DEFAULT_ALIGNMENT)
  assert.equal(isAlignmentValue({ horizontal: 'left', vertical: 'top' }), true)
  assert.equal(isAlignmentValue({ horizontal: 'left' }), false)
  assert.equal(isAlignmentValue(null), false)
})

test('对齐步进在两端停住', () => {
  assert.equal(stepHorizontal('left', 1), 'center')
  assert.equal(stepHorizontal('justify', 1), 'justify')
  assert.equal(stepHorizontal('left', -1), 'left')
  assert.equal(stepVertical('top', 1), 'middle')
  assert.equal(stepVertical('bottom', 1), 'bottom')
  assert.equal(stepVertical('top', -1), 'top')
})

test('CSS 值映射：两端对齐原样透出，垂直 middle 不能写成 center', () => {
  assert.equal(textAlignCss('justify'), 'justify')
  assert.equal(textAlignCss('left'), 'left')
  // 表格单元格里的 vertical-align 只认 middle（center 在 td 上无效）
  assert.equal(verticalAlignCss('middle'), 'middle')
  assert.equal(verticalAlignCss('top'), 'top')
})

test('normalizeBorder：三档一起归一，none 的宽度必须是 0', () => {
  assert.deepEqual(normalizeBorder({ style: 'none', width: 1, color: '#000000' }), {
    style: 'none',
    width: 0,
    color: '#000000',
  })
  // 宽度夹取到 [0, 12] 并保留两位
  assert.equal(normalizeBorder({ width: 99 }).width, 12)
  assert.equal(normalizeBorder({ width: 0.75 }).width, 0.75)
  assert.equal(normalizeBorder({ width: -3 }).width, 0)
  // 非法线型与颜色各自回退，但不影响其它两个维度
  const fallback = normalizeBorder({ style: 'wavy' as never, width: 2, color: 'red' })
  assert.equal(fallback.style, 'solid')
  assert.equal(fallback.width, 2)
  assert.equal(fallback.color, 'var(--oj-text-1)')
})

test('borderCss 与预览共用一份拼装逻辑', () => {
  assert.equal(borderCss({ style: 'none' }), 'none')
  assert.equal(borderCss({ style: 'dashed', width: 2, color: '#ff0000' }), '2px dashed #ff0000')
  assert.equal(formatBorderWidth(1), '1')
  assert.equal(formatBorderWidth(0.75), '0.75')
})

test('边框档位表本身是合法的', () => {
  assert.equal(BORDER_WIDTHS.length, 6)
  for (const width of BORDER_WIDTHS) {
    assert.equal(normalizeBorder({ width }).width, width, `档位 ${width} 被归一化改动过`)
  }
  for (const color of BORDER_COLORS) {
    assert.equal(normalizeBorder({ color }).color, color, `颜色 ${color} 被判为非法`)
  }
  assert.deepEqual([...BORDER_STYLES], ['none', 'solid', 'dashed', 'dotted', 'double'])
})

test('样式预设走 token，且显示名可以缺省', () => {
  for (const preset of STYLE_PRESETS) {
    const css = stylePresetCss(preset)
    assert.equal(css.fontSize, `${preset.fontSize}px`)
    assert.match(css.fontFamily ?? '', /^var\(--oj-font-(sans|mono|doc)\)$/)
  }
  const body = STYLE_PRESETS.find((preset) => preset.id === 'body')
  assert.ok(body)
  assert.equal(stylePresetCss(body!).fontWeight, undefined)

  assert.equal(styleLabel({ body: '正文' }, 'body'), '正文')
  assert.equal(styleLabel(undefined, 'body'), 'body')
})
