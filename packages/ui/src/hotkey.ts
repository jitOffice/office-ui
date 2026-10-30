/**
 * 快捷键层（prd/03 §3 B 组 `OjHotkey`）。
 *
 * 注册表里的 `keys` 只写 `'mod+b'` 这种**平台无关**的写法（见 `@jitoffice/shared` 的
 * `OjKeyBinding`），`mod` 到底是 Ctrl 还是 Cmd，由这一层决定。所以这里必须框架无关、
 * 不碰 DOM：平台推断、解析、匹配、显示、冲突检测，五件事都能在 `node --test` 里钉死。
 *
 * 三个容易写错的地方：
 *   1. **匹配要严格等于**。`Ctrl+B` 不能顺带响应 `Ctrl+Shift+B`——宽松匹配会让
 *      "加粗"和"清除格式"互抢，且用户无从判断为什么按这个键会触发那个命令。
 *   2. **`mod` 按平台展开，而不是按事件猜**。看事件里有没有 metaKey 来决定匹配哪个，
 *      会把 Windows 键盘上的 Win 键也算成 mod。
 *   3. **显示顺序是 Apple HIG 的顺序**：⌃⌥⇧⌘ + 主键；Windows 侧是 Ctrl+Alt+Shift。
 */

export type OjPlatform = 'mac' | 'win' | 'linux'

export interface OjHotkeySpec {
  /** 规范化后的主键：小写，`' '` → `space`、`esc` → `escape`、`up` → `arrowup` */
  key: string
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean
}

/** 与 `KeyboardEvent` 结构对齐，但只取匹配需要的那几个字段，Node 里传个对象就能测。 */
export interface OjKeyEventLike {
  key: string
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
}

export interface OjHotkeyBinding {
  id: string
  keys?: string | readonly string[]
}

export interface OjHotkeyConflict {
  /** 冲突的规范化写法，例如 `Ctrl+B` */
  label: string
  ids: string[]
}

const MODIFIERS = new Set(['mod', 'ctrl', 'control', 'cmd', 'command', 'meta', 'alt', 'option', 'shift'])

const KEY_ALIASES: Record<string, string> = {
  ' ': 'space',
  spacebar: 'space',
  esc: 'escape',
  del: 'delete',
  ins: 'insert',
  up: 'arrowup',
  down: 'arrowdown',
  left: 'arrowleft',
  right: 'arrowright',
  plus: '+',
  add: '+',
}

/** 显示用的主键名：字母照抄、特殊键给人看得懂的写法 */
const KEY_LABELS: Record<string, string> = {
  space: 'Space',
  escape: 'Esc',
  enter: 'Enter',
  tab: 'Tab',
  backspace: 'Backspace',
  delete: 'Del',
  insert: 'Ins',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  '+': '+',
  '-': '-',
}

export function normalizeKey(raw: string): string {
  // 空格的 `KeyboardEvent.key` 就是 `' '`，一 trim 就没了，必须在这之前接住
  if (raw === ' ') return 'space'
  const lower = raw.trim().toLowerCase()
  return KEY_ALIASES[lower] ?? lower
}

/** 平台推断只看字符串，方便测试。空串按 linux 处理（最保守的一档）。 */
export function platformFrom(source: string): OjPlatform {
  if (/mac|iphone|ipad|ipod/i.test(source)) return 'mac'
  if (/win/i.test(source)) return 'win'
  return 'linux'
}

/** 运行时平台。拿不到 `navigator` 时按 linux——宁可显示 Ctrl，也不要显示一个假 ⌘。 */
export function detectPlatform(): OjPlatform {
  const nav = (globalThis as { navigator?: { platform?: string; userAgent?: string } }).navigator
  return platformFrom(`${nav?.platform ?? ''} ${nav?.userAgent ?? ''}`)
}

function emptySpec(): OjHotkeySpec {
  return { key: '', ctrl: false, alt: false, shift: false, meta: false }
}

/**
 * 解析 `'mod+shift+z'`。坏绑定一律返回 `undefined`，不抛异常：
 * 命令表是数据，一条写错不应该把整个应用带崩。
 */
export function parseHotkey(binding: string, platform: OjPlatform): OjHotkeySpec | undefined {
  // `ctrl++` 想表达的是"Ctrl + 加号键"：先把它换成 `ctrl+plus` 再切，
  // 否则切出来末尾两个空片段，主键直接丢了。
  const trimmed = binding.trim()
  const source = trimmed.endsWith('++') ? `${trimmed.slice(0, -2)}+plus` : trimmed
  const parts = source.split('+').map((part) => part.trim())

  const spec = emptySpec()
  const keys: string[] = []

  for (const part of parts) {
    if (part.length === 0) return undefined
    const lower = part.toLowerCase()
    if (MODIFIERS.has(lower)) {
      if (lower === 'mod') {
        if (platform === 'mac') spec.meta = true
        else spec.ctrl = true
      } else if (lower === 'ctrl' || lower === 'control') {
        spec.ctrl = true
      } else if (lower === 'cmd' || lower === 'command' || lower === 'meta') {
        spec.meta = true
      } else if (lower === 'alt' || lower === 'option') {
        spec.alt = true
      } else {
        spec.shift = true
      }
      continue
    }
    keys.push(normalizeKey(part))
  }

  // 没有主键（`'ctrl+'`）或不止一个主键（`'a+b'`）都不是快捷键
  if (keys.length !== 1) return undefined
  spec.key = keys[0] as string
  return spec
}

/** 严格匹配：修饰键多一个、少一个都不算命中。 */
export function matchHotkey(spec: OjHotkeySpec, event: OjKeyEventLike): boolean {
  return (
    normalizeKey(event.key) === spec.key &&
    event.ctrlKey === spec.ctrl &&
    event.altKey === spec.alt &&
    event.shiftKey === spec.shift &&
    event.metaKey === spec.meta
  )
}

/** 显示用文案：mac 用符号且不加 `+`，Windows/Linux 用 `Ctrl+Shift+Z` 这种写法。 */
export function formatHotkey(binding: string, platform: OjPlatform): string {
  const spec = parseHotkey(binding, platform)
  if (spec === undefined) return binding

  const key = KEY_LABELS[spec.key] ?? (spec.key.length === 1 ? spec.key.toUpperCase() : spec.key)
  if (platform === 'mac') {
    // Apple HIG 的顺序：Control、Option、Shift、Command，最后接主键
    return `${spec.ctrl ? '\u2303' : ''}${spec.alt ? '\u2325' : ''}${spec.shift ? '\u21e7' : ''}${
      spec.meta ? '\u2318' : ''
    }${key}`
  }
  const parts: string[] = []
  if (spec.ctrl) parts.push('Ctrl')
  if (spec.alt) parts.push('Alt')
  if (spec.shift) parts.push('Shift')
  if (spec.meta) parts.push('Win')
  parts.push(key)
  return parts.join('+')
}

function canonical(spec: OjHotkeySpec): string {
  return `${spec.ctrl ? 'C' : ''}${spec.alt ? 'A' : ''}${spec.shift ? 'S' : ''}${spec.meta ? 'M' : ''}:${spec.key}`
}

function keysOf(binding: OjHotkeyBinding): string[] {
  const keys = binding.keys
  if (keys === undefined) return []
  return typeof keys === 'string' ? [keys] : [...keys]
}

/**
 * 冲突检测。同一个命令把同一条快捷键写两遍不算冲突——冲突是**两个命令抢一个键**，
 * 报出来的第一条就是"后注册的把先注册的盖掉了"。
 */
export function hotkeyConflicts(
  bindings: readonly OjHotkeyBinding[],
  platform: OjPlatform,
): OjHotkeyConflict[] {
  const seen = new Map<string, { label: string; ids: string[] }>()

  for (const binding of bindings) {
    for (const key of keysOf(binding)) {
      const spec = parseHotkey(key, platform)
      if (spec === undefined) continue
      const id = canonical(spec)
      const entry = seen.get(id)
      if (entry === undefined) {
        seen.set(id, { label: formatHotkey(key, platform), ids: [binding.id] })
        continue
      }
      if (!entry.ids.includes(binding.id)) entry.ids.push(binding.id)
    }
  }

  return [...seen.values()]
    .filter((entry) => entry.ids.length > 1)
    .map((entry) => ({ label: entry.label, ids: entry.ids }))
}
