/**
 * 符号表（03 §3 / M2 `OjSymbolPicker`）。
 *
 * **只收 Unicode 文本**，不引自绘图形/表情包：00 §4 红线 2/3 —— 表情与旗帜类资产
 * （openmoji 的 CC-BY-SA、twemoji 的 CC-BY 资产）与 Apache-2.0 结合作品时的授权链是断的，
 * 而"符号"用字体渲染完全够用。这也是 `OjSymbolPicker` 与"图标选择器"的区别：
 * 前者插入字符，后者插入组件。
 *
 * `name` 是 a11y 名字（英文、给读屏），显示名与分组标题都由使用方通过 props 提供——
 * 组件库里写死中文标题，日文界面上就永远翻不掉。
 */

export interface SymbolItem {
  readonly char: string
  /** 给读屏念的名字（英文）；不参与显示。 */
  readonly name: string
}

export interface SymbolGroup {
  readonly id: string
  readonly symbols: readonly SymbolItem[]
}

export const SYMBOL_GROUPS: readonly SymbolGroup[] = [
  {
    id: 'common',
    symbols: [
      { char: '©', name: 'copyright' },
      { char: '®', name: 'registered' },
      { char: '™', name: 'trademark' },
      { char: '§', name: 'section' },
      { char: '¶', name: 'paragraph' },
      { char: '°', name: 'degree' },
      { char: '‰', name: 'per mille' },
      { char: '№', name: 'numero' },
    ],
  },
  {
    id: 'math',
    symbols: [
      { char: '±', name: 'plus minus' },
      { char: '×', name: 'multiply' },
      { char: '÷', name: 'divide' },
      { char: '≠', name: 'not equal' },
      { char: '≤', name: 'less or equal' },
      { char: '≥', name: 'greater or equal' },
      { char: '∞', name: 'infinity' },
      { char: '∑', name: 'sum' },
      { char: '√', name: 'square root' },
      { char: 'π', name: 'pi' },
      { char: '≈', name: 'almost equal' },
      { char: 'µ', name: 'micro' },
    ],
  },
  {
    id: 'arrow',
    symbols: [
      { char: '←', name: 'left arrow' },
      { char: '→', name: 'right arrow' },
      { char: '↑', name: 'up arrow' },
      { char: '↓', name: 'down arrow' },
      { char: '↔', name: 'left right arrow' },
      { char: '⇄', name: 'swap arrows' },
      { char: '⇧', name: 'shift arrow' },
      { char: '⇒', name: 'double right arrow' },
    ],
  },
  {
    id: 'currency',
    symbols: [
      { char: '$', name: 'dollar' },
      { char: '€', name: 'euro' },
      { char: '£', name: 'pound' },
      { char: '¥', name: 'yen' },
      { char: '₩', name: 'won' },
      { char: '₹', name: 'rupee' },
      { char: '¢', name: 'cent' },
    ],
  },
  {
    id: 'punctuation',
    symbols: [
      { char: '—', name: 'em dash' },
      { char: '–', name: 'en dash' },
      { char: '…', name: 'ellipsis' },
      { char: '·', name: 'middle dot' },
      { char: '“', name: 'left double quote' },
      { char: '”', name: 'right double quote' },
      { char: '‘', name: 'left single quote' },
      { char: '’', name: 'right single quote' },
    ],
  },
]

/**
 * 按名字过滤。空查询返回原表（保持分组结构，调用方据此渲染标题）。
 * 同时接受直接输入字符：用户已经知道要插哪个符号时，比记名字快。
 */
export function filterSymbols(groups: readonly SymbolGroup[], query: string): SymbolGroup[] {
  const needle = query.trim().toLowerCase()
  if (needle.length === 0) return [...groups]
  return groups
    .map((group) => ({
      id: group.id,
      symbols: group.symbols.filter(
        (symbol) => symbol.char === needle || symbol.name.toLowerCase().includes(needle),
      ),
    }))
    .filter((group) => group.symbols.length > 0)
}

/** 摊平成一维（键盘导航按下标走，分组只是视觉）。 */
export function flattenSymbols(groups: readonly SymbolGroup[]): SymbolItem[] {
  return groups.flatMap((group) => [...group.symbols])
}
