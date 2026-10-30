import assert from 'node:assert/strict'
import test from 'node:test'

import {
  formatHotkey,
  hotkeyConflicts,
  matchHotkey,
  normalizeKey,
  parseHotkey,
  platformFrom,
} from '../src/index.ts'

/**
 * 快捷键层（03 §3 B 组 `OjHotkey`）。
 *
 * 钉三件事：`mod` 按平台展开、匹配严格等于、显示顺序符合各平台习惯。
 * 这三件各自写错都会表现成"快捷键有时候不好使"，而那种 bug 最难被用户描述清楚。
 */

const win = { ctrlKey: true, altKey: false, shiftKey: false, metaKey: false }
const mac = { ctrlKey: false, altKey: false, shiftKey: false, metaKey: true }

test('mod 按平台展开：Windows 是 Ctrl，mac 是 ⌘', () => {
  const onWin = parseHotkey('mod+b', 'win')
  const onMac = parseHotkey('mod+b', 'mac')

  assert.deepEqual(onWin, { key: 'b', ctrl: true, alt: false, shift: false, meta: false })
  assert.deepEqual(onMac, { key: 'b', ctrl: false, alt: false, shift: false, meta: true })
  // 同一个绑定在另一平台上不该命中
  assert.equal(matchHotkey(onWin!, { key: 'b', ...mac }), false)
})

test('主键别名：空格、Esc、方向键、加号', () => {
  assert.equal(parseHotkey('mod+space', 'win')?.key, 'space')
  assert.equal(parseHotkey('mod+esc', 'win')?.key, 'escape')
  assert.equal(parseHotkey('mod+up', 'win')?.key, 'arrowup')
  assert.equal(parseHotkey('ctrl++', 'win')?.key, '+')
  assert.equal(normalizeKey(' '), 'space')
  assert.equal(normalizeKey('ArrowLeft'), 'arrowleft')
})

test('坏绑定返回 undefined，不抛异常', () => {
  assert.equal(parseHotkey('', 'win'), undefined)
  assert.equal(parseHotkey('ctrl+', 'win'), undefined)
  assert.equal(parseHotkey('a+b', 'win'), undefined)
  assert.equal(parseHotkey('mod', 'win'), undefined)
})

test('匹配严格等于：多一个修饰键就不算', () => {
  const spec = parseHotkey('mod+b', 'win')!

  assert.equal(matchHotkey(spec, { key: 'b', ...win }), true)
  assert.equal(matchHotkey(spec, { key: 'b', ctrlKey: true, altKey: false, shiftKey: true, metaKey: false }), false)
  assert.equal(matchHotkey(spec, { key: 'b', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false }), false)
  // Shift+B 的 event.key 是大写 B，但绑定本身带 shift 时应该命中
  const redo = parseHotkey('mod+shift+z', 'win')!
  assert.equal(matchHotkey(redo, { key: 'Z', ctrlKey: true, altKey: false, shiftKey: true, metaKey: false }), true)
})

test('显示：mac 用符号且不加加号，Windows 用 Ctrl+…', () => {
  assert.equal(formatHotkey('mod+b', 'mac'), '\u2318B')
  assert.equal(formatHotkey('mod+shift+z', 'mac'), '\u21e7\u2318Z')
  assert.equal(formatHotkey('mod+alt+arrowleft', 'mac'), '\u2325\u2318\u2190')
  assert.equal(formatHotkey('mod+b', 'win'), 'Ctrl+B')
  assert.equal(formatHotkey('mod+shift+z', 'win'), 'Ctrl+Shift+Z')
  assert.equal(formatHotkey('ctrl+alt+delete', 'win'), 'Ctrl+Alt+Del')
  // 解析不了就原样返回，别在 UI 上显示空白
  assert.equal(formatHotkey('a+b', 'win'), 'a+b')
})

test('冲突检测：两个命令抢一个键才报；同一命令写两遍不算', () => {
  const conflicts = hotkeyConflicts(
    [
      { id: 'format.bold', keys: 'mod+b' },
      { id: 'format.italic', keys: ['mod+i', 'mod+b'] },
      { id: 'edit.redo', keys: ['mod+shift+z', 'mod+shift+z'] },
    ],
    'win',
  )

  assert.deepEqual(conflicts, [{ label: 'Ctrl+B', ids: ['format.bold', 'format.italic'] }])
})

test('冲突按平台算：ctrl+b 与 mod+b 在 Windows 上撞，在 mac 上不撞', () => {
  const bindings = [
    { id: 'a', keys: 'ctrl+b' },
    { id: 'b', keys: 'mod+b' },
  ]

  assert.equal(hotkeyConflicts(bindings, 'win').length, 1)
  assert.equal(hotkeyConflicts(bindings, 'mac').length, 0)
})

test('平台推断只认字符串，手头没有 navigator 时按 linux', () => {
  assert.equal(platformFrom('Macintosh; Intel Mac OS X 10_15_7'), 'mac')
  assert.equal(platformFrom('iPad; CPU OS 17_0 like Mac OS X'), 'mac')
  assert.equal(platformFrom('Windows NT 10.0; Win64; x64'), 'win')
  assert.equal(platformFrom('Linux x86_64'), 'linux')
  assert.equal(platformFrom(''), 'linux')
})
