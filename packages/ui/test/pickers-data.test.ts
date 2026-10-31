import assert from 'node:assert/strict'
import test from 'node:test'

import {
  COLOR_SWATCH_GROUPS,
  FONT_OPTIONS,
  SYMBOL_GROUPS,
  filterFonts,
  filterSymbols,
  flattenSymbols,
  isCssColor,
  neighborSwatch,
  normalizeHex,
  stepFont,
} from '../src/index.ts'

/**
 * 第二批 picker 的数据模型（M2）。
 *
 * 这些断言守的是"什么值会被写进文档"：颜色只认归一化后的 `#rrggbb` 或 token 引用，
 * 字体只认 token 字体栈，符号只收 Unicode 文本（不引表情资产，00 §4 红线）。
 */

test('normalizeHex 补 # 并展开三位写法', () => {
  assert.equal(normalizeHex('#abc'), '#aabbcc')
  assert.equal(normalizeHex('abc'), '#aabbcc')
  assert.equal(normalizeHex('#AABBCC'), '#aabbcc')
  assert.equal(normalizeHex('  #3366ff  '), '#3366ff')
  // 四位（带 alpha 的简写）与八位刻意不收：透明度在文档格式里是独立属性
  assert.equal(normalizeHex('#abcd'), undefined)
  assert.equal(normalizeHex('#aabbccdd'), undefined)
  assert.equal(normalizeHex('red'), undefined)
  assert.equal(normalizeHex(''), undefined)
})

test('isCssColor 只放行组件能渲染的写法', () => {
  assert.equal(isCssColor('var(--oj-brand-6)'), true)
  assert.equal(isCssColor('#fff'), true)
  assert.equal(isCssColor('rgb(0 0 0 / 40%)'), true)
  assert.equal(isCssColor('hsl(210 100% 50%)'), true)
  assert.equal(isCssColor('transparent'), true)
  assert.equal(isCssColor('currentColor'), true)
  // 有名字的颜色不放行：`red` 与 `#ff0000` 两种表示会让 diff 读不出谁改了
  assert.equal(isCssColor('red'), false)
  assert.equal(isCssColor('var(--oj-brand)'), true)
  assert.equal(isCssColor('var(--x)'), false)
  assert.equal(isCssColor(''), false)
})

test('色板样本全部是组件能渲染的值，且品牌色走 token', () => {
  for (const group of COLOR_SWATCH_GROUPS) {
    for (const value of group.values) {
      assert.ok(isCssColor(value), `${group.id} 里的 ${value} 不是合法颜色`)
    }
  }
  const brand = COLOR_SWATCH_GROUPS.find((group) => group.id === 'brand')
  assert.ok(brand)
  for (const value of brand!.values) {
    assert.match(value, /^var\(--oj-brand-\d\)$/, `品牌色样本必须是 token 引用，实际是 ${value}`)
  }
})

test('neighborSwatch 在两端停住，当前值不在表里时落到第一个', () => {
  const values = ['a', 'b', 'c']
  assert.equal(neighborSwatch(values, 'a', 1), 'b')
  assert.equal(neighborSwatch(values, 'c', 1), undefined)
  assert.equal(neighborSwatch(values, 'a', -1), undefined)
  assert.equal(neighborSwatch(values, 'zzz', 1), 'a')
  assert.equal(neighborSwatch([], 'a', 1), undefined)
})

test('filterFonts 按 id 与显示名做子串过滤', () => {
  assert.deepEqual(filterFonts(FONT_OPTIONS, '').map((font) => font.id), ['sans', 'mono', 'mono-cjk', 'doc'])
  assert.deepEqual(filterFonts(FONT_OPTIONS, 'mono').map((font) => font.id), ['mono', 'mono-cjk'])
  assert.deepEqual(filterFonts(FONT_OPTIONS, 'SERIF').map((font) => font.id), ['doc'])
  assert.deepEqual(filterFonts(FONT_OPTIONS, '  cjk ').map((font) => font.id), ['mono-cjk'])
  assert.deepEqual(filterFonts(FONT_OPTIONS, 'nope'), [])
})

test('字体栈必须引用 token，不许把字体族抄进组件', () => {
  for (const font of FONT_OPTIONS) {
    assert.match(font.stack, /^var\(--oj-font-[a-z-]+\)$/, `${font.id} 的字体栈不是 token 引用`)
  }
})

test('stepFont 到两端停住，未知 id 落到第一个', () => {
  assert.equal(stepFont(FONT_OPTIONS, 'sans', 1), 'mono')
  assert.equal(stepFont(FONT_OPTIONS, 'doc', 1), 'doc')
  assert.equal(stepFont(FONT_OPTIONS, 'sans', -1), 'sans')
  assert.equal(stepFont(FONT_OPTIONS, 'nope', 1), 'sans')
  assert.equal(stepFont([], 'sans', 1), 'sans')
})

test('filterSymbols 支持名字与直接输入字符', () => {
  const arrows = filterSymbols(SYMBOL_GROUPS, 'arrow')
  assert.equal(arrows.length, 1)
  assert.equal(arrows[0]!.id, 'arrow')

  const direct = filterSymbols(SYMBOL_GROUPS, '→')
  assert.equal(direct.length, 1)
  assert.equal(direct[0]!.symbols.length, 1)

  assert.equal(filterSymbols(SYMBOL_GROUPS, 'nope').length, 0)
  assert.equal(filterSymbols(SYMBOL_GROUPS, '').length, SYMBOL_GROUPS.length)
})

test('符号表只用 Unicode 文本：没有图片、没有字体文件', () => {
  const flat = flattenSymbols(SYMBOL_GROUPS)
  assert.ok(flat.length >= 30)
  for (const symbol of flat) {
    assert.equal([...symbol.char].length, 1, `${symbol.name} 不是单个字符：${symbol.char}`)
    // 可打印：ASCII 可见字符，或 U+00A1 以上的文字区；私人使用区（E000–F8FF）必须排除——
    // 那里的字符只在自己装的字体里可见，装到别的机器上就是豆腐块
    const code = symbol.char.codePointAt(0)!
    const printable = (code >= 0x21 && code <= 0x7e) || code >= 0xa1
    const privateUse = code >= 0xe000 && code <= 0xf8ff
    assert.ok(printable && !privateUse, `${symbol.name} 的码位 U+${code.toString(16)} 不像可打印符号`)
  }
})
