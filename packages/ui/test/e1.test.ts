import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { createCommandRegistry } from '../../shared/src/commands/index.ts'
import type { OjHistoryAdapter } from '../../shared/src/commands/index.ts'
import {
  bridgedCommandIds,
  COMMAND_ALIGN_LEFT,
  COMMAND_BOLD,
  COMMAND_HORIZONTAL_RULE,
  COMMAND_TABLE,
  createGridPicker,
  createMemoryEditor,
  createTooltipMachine,
  editorCommands,
  iconMarkup,
  icons,
  placePopper,
  registerEditorCommands,
  tiptapEditorHost,
} from '../src/index.ts'
import type { OjEditorHost } from '../src/index.ts'

const here = dirname(fileURLToPath(import.meta.url))

function collect(file: string, seen = new Set<string>()): string {
  if (seen.has(file)) return ''
  seen.add(file)
  const text = readFileSync(file, 'utf8')
  let out = text
  for (const match of text.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const spec = match[1]
    if (!spec) continue
    out += collect(join(dirname(file), spec), seen)
  }
  return out
}

function pump() {
  const queue: (() => void)[] = []
  return {
    schedule: (task: () => void) => {
      queue.push(task)
    },
    flush: () => {
      for (const task of queue.splice(0, queue.length)) task()
    },
  }
}

function setup() {
  const editor = createMemoryEditor({
    [COMMAND_BOLD]: { enabled: true, active: false },
    [COMMAND_HORIZONTAL_RULE]: { enabled: true },
    [COMMAND_TABLE]: { enabled: true },
  })
  const frames = pump()
  const history: string[] = []
  const adapter: OjHistoryAdapter = {
    transact(label, invoke) {
      const result = invoke()
      history.push(label)
      return result
    },
  }
  const registry = createCommandRegistry<OjEditorHost>({
    context: () => editor.host,
    schedule: frames.schedule,
    history: adapter,
    onError: () => {},
  })
  registerEditorCommands(registry)
  registry.bind(editor.host)
  frames.flush()
  return { editor, frames, history, registry }
}

test('根入口不依赖 vue 或 tiptap', () => {
  const text = collect(join(here, '../src/index.ts'))
  const specs = [...text.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1])
  assert.equal(specs.some((spec) => spec === 'vue' || spec?.startsWith('@tiptap')), false)
})

test('加粗状态经订阅推到注册表，禁用时 run 被挡住', async () => {
  const { editor, frames, registry } = setup()
  assert.equal(registry.state(COMMAND_BOLD)?.active, false)
  editor.set(COMMAND_BOLD, { active: true })
  frames.flush()
  assert.equal(registry.state(COMMAND_BOLD)?.active, true)

  editor.set(COMMAND_BOLD, { enabled: false, active: true })
  const blocked = await registry.run(COMMAND_BOLD)
  assert.equal(blocked.ok, false)
  assert.equal(blocked.skipped, 'disabled')
  assert.equal(editor.calls.length, 0)
})

test('分隔线命令调用 setHorizontalRule，并且可撤销', async () => {
  const seen: string[] = []
  const host = tiptapEditorHost({
    isActive: () => false,
    can: () => ({ setHorizontalRule: () => true, toggleBold: () => true }),
    commands: {
      setHorizontalRule: () => {
        seen.push('setHorizontalRule')
        return true
      },
    },
    on: () => {},
    off: () => {},
  })
  const frames = pump()
  const history: string[] = []
  const registry = createCommandRegistry<OjEditorHost>({
    context: () => host,
    schedule: frames.schedule,
    history: {
      transact(label, invoke) {
        history.push(label)
        return invoke()
      },
    },
  })
  registerEditorCommands(registry)
  const result = await registry.run(COMMAND_HORIZONTAL_RULE)
  assert.equal(result.ok, true)
  assert.deepEqual(seen, ['setHorizontalRule'])
  assert.deepEqual(history, ['oj.command.horizontalRule'])
})

test('插入表格只接受正整数行列', async () => {
  const { editor, history, registry } = setup()
  const bad = await registry.run(COMMAND_TABLE, { rows: 0, cols: 2 })
  assert.equal(bad.ok, false)
  assert.equal(editor.calls.length, 0)

  const ok = await registry.run(COMMAND_TABLE, { rows: 3, cols: 5 })
  assert.equal(ok.ok, true)
  assert.deepEqual(editor.calls[0], { id: COMMAND_TABLE, arg: { rows: 3, cols: 5 } })
  assert.deepEqual(history, ['oj.command.insertTable'])
})

test('框选：移出不清空，越上限不改当前格，键盘可提交', () => {
  const grid = createGridPicker()
  grid.move({ row: 3, col: 5 })
  grid.leave()
  assert.deepEqual(grid.hover, { row: 3, col: 5 })
  assert.deepEqual(grid.vars(), { '--oj-gp-row': '3', '--oj-gp-col': '5' })

  grid.move({ row: 11, col: 1 })
  assert.equal(grid.exceeded, true)
  assert.deepEqual(grid.hover, { row: 3, col: 5 })

  const fresh = createGridPicker()
  assert.equal(fresh.key('ArrowRight'), 'move')
  assert.deepEqual(fresh.hover, { row: 1, col: 1 })
  fresh.key('End')
  assert.deepEqual(fresh.hover, { row: 1, col: 20 })
  fresh.key('ArrowRight')
  assert.equal(fresh.exceeded, true)
  assert.equal(fresh.hover?.col, 20)
  fresh.key('ArrowLeft')
  assert.equal(fresh.exceeded, false)
  assert.equal(fresh.hover?.col, 19)
  fresh.key('Home')
  assert.equal(fresh.hover?.col, 1)
  fresh.key('ArrowLeft')
  assert.equal(fresh.exceeded, false)
  assert.equal(fresh.key('Enter'), 'commit')
  assert.deepEqual(fresh.commit(), { row: 1, col: 1 })
  assert.equal(fresh.key('Escape'), 'cancel')
})

test('浮层放不下就翻到上方，并夹进视口', () => {
  const below = placePopper({
    anchor: { x: 10, y: 10, width: 40, height: 20 },
    popup: { width: 100, height: 80 },
    viewport: { width: 800, height: 600 },
  })
  assert.equal(below.placement, 'bottom-start')
  assert.equal(below.y, 34)

  const above = placePopper({
    anchor: { x: 750, y: 500, width: 40, height: 20 },
    popup: { width: 100, height: 80 },
    viewport: { width: 800, height: 600 },
  })
  assert.equal(above.placement, 'top-start')
  assert.equal(above.y, 416)
  assert.equal(above.x, 692)
})

test('tooltip 未到 400ms 离开则不打开', () => {
  const clock: { fire: (() => void) | null; ms: number; alive: boolean } = { fire: null, ms: 0, alive: false }
  const machine = createTooltipMachine({
    schedule: (fn, ms) => {
      clock.fire = fn
      clock.ms = ms
      clock.alive = true
      return () => {
        clock.alive = false
      }
    },
  })
  machine.enter()
  assert.equal(machine.open, false)
  assert.equal(clock.ms, 400)
  machine.leave()
  if (clock.alive) clock.fire?.()
  assert.equal(machine.open, false)
  machine.enter()
  if (clock.alive) clock.fire?.()
  assert.equal(machine.open, true)
})

test('左对齐经 Tiptap 宿主翻译成 setTextAlign("left")，且 active 读同一参数', () => {
  const seen: unknown[] = []
  const active: unknown[] = []
  const host = tiptapEditorHost({
    isActive: (name) => {
      active.push(name)
      return true
    },
    can: () => ({
      setTextAlign: (...args: unknown[]) => {
        seen.push(['can', ...args])
        return true
      },
    }),
    commands: {
      setTextAlign: (...args: unknown[]) => {
        seen.push(['run', ...args])
        return true
      },
    },
    on: () => {},
    off: () => {},
  })

  assert.equal(host.can(COMMAND_ALIGN_LEFT), true)
  assert.equal(host.exec(COMMAND_ALIGN_LEFT), true)
  // 调用方没传参时用桥里钉住的 'left'，不能把 undefined 透给 Tiptap。
  assert.deepEqual(seen, [
    ['can', 'left'],
    ['run', 'left'],
  ])
  // 对齐不是布尔命令：active 必须按属性值问，否则「右对齐」也会让左对齐按钮高亮。
  assert.deepEqual(host.state(COMMAND_ALIGN_LEFT), { enabled: true, active: true })
  assert.deepEqual(active, [{ textAlign: 'left' }])
})

test('命令表与 Tiptap 桥没有漂移', () => {
  const declared = editorCommands()
    .map((command) => command.id)
    .sort()
  // 少一条映射时 host.can/exec 会静默返回 false，UI 上表现为按钮永远灰着、点了没反应。
  assert.deepEqual([...bridgedCommandIds()].sort(), declared)
})

test('三枚图标使用 currentColor，样式用一层 overlay', () => {
  for (const markup of Object.values(icons)) {
    assert.equal(markup.includes('currentColor'), true)
    assert.equal(markup.includes('<script'), false)
  }
  assert.equal(iconMarkup('oj-format-bold')?.includes('currentColor'), true)
  assert.equal(iconMarkup('missing'), undefined)
  const css = readFileSync(join(here, '../src/style.css'), 'utf8')
  assert.equal(css.includes('.oj-grid-picker__overlay'), true)
  assert.equal(css.includes('--oj-gp-row'), true)
  assert.equal(css.includes('--oj-gp-col'), true)
})
