/**
 * Ribbon 的布局与折叠（prd/03 §3 B 组）：
 *   - `packRibbon`：`OjRibbonGroup` 的三档尺寸与 `»` 溢出；
 *   - `ribbonSelect` / `ribbonToggleCollapsed` / …：`OjRibbon` 的选项卡与自动折叠。
 *
 * 全是纯函数，宽度由组件侧量（ResizeObserver）后喂进来——不碰 DOM 才能在零依赖的
 * `node --test` 里把"先降级、再溢出"的每一条规则钉死。真实布局里这些分支最容易被
 * 写得"看起来对"：窗口一窄，最先坏掉的不是样式而是**顺序与可点性**。
 *
 * 还有一条 03 §8.2 的硬约束：降级必须按**实测宽度**触发，不能按字符数。德语/俄语标签
 * 长度约为中文的 1.8 倍，中日韩全角字符更宽——字符数在这件事上不是宽度。
 */

export type RibbonItemSize = 'large' | 'medium' | 'small'

/**
 * 声明给组件的一条命令。
 *
 * `width` 可以不给：`OjRibbonGroup` 会按"整组逐档探测 → 量到就记"的方式自己补，
 * 宿主不必在渲染前就知道每档多宽。给了就以此为准（设计稿尺寸、SSR、快照测试都走这条）。
 */
export interface RibbonItemSpec {
  id: string
  /** 设计想要的尺寸 */
  size: RibbonItemSize
  /** 实测宽度（px），量的是 `size` 这一档下的宽度 */
  width?: number
  /**
   * 降级到各档时的实测宽度。缺省档位沿用 `width`。
   *
   * 不给这张表时降级就省不出地方——这是诚实的默认：没量过就不要假装降级有用，
   * 让它老老实实走到溢出分支，而不是靠一个拍脑袋的缩放比例把按钮挤扁。
   */
  widths?: Partial<Record<RibbonItemSize, number>>
}

/** 真正参与计算的一条命令：宽度必须已经确定（由 `width` / `widths` / 组件实测补齐）。 */
export interface RibbonPackItem extends RibbonItemSpec {
  width: number
}

/** `id → 各档实测宽度`。组件量到的都记在这张表里。 */
export type RibbonWidthTable = Readonly<Record<string, Partial<Record<RibbonItemSize, number>>>>

export interface RibbonPackedItem extends RibbonPackItem {
  /** 降级之后实际使用的尺寸 */
  display: RibbonItemSize
}

export interface RibbonPackResult {
  visible: RibbonPackedItem[]
  /** 从尾部收进 `»` 的项，顺序与入参一致 */
  overflow: RibbonPackedItem[]
  /** 整组实际占用的总宽度：可见项连同间距，有溢出时还含 `»` 及其间距 */
  used: number
}

export interface RibbonPackOptions {
  gap?: number
  /** `»` 按钮自身的宽度。必须预留，否则溢出按钮自己会被挤出容器 */
  overflowWidth?: number
}

const DEGRADE: Record<RibbonItemSize, RibbonItemSize | undefined> = {
  large: 'medium',
  medium: 'small',
  small: undefined,
}

const SIZE_RANK: Record<RibbonItemSize, number> = { large: 2, medium: 1, small: 0 }

/** 取更小的那一档。探测时用它保证只会往下压，不会把命令反向放大。 */
export function ribbonSmallerSize(a: RibbonItemSize, b: RibbonItemSize): RibbonItemSize {
  return SIZE_RANK[a] <= SIZE_RANK[b] ? a : b
}

/**
 * 还差哪一档的宽度没量到。
 *
 * 没给 `width` 的命令，第一版只能按"设计尺寸"渲染出来才量得到宽度；比它更小的档位
 * 则要**真的按那一档渲染一次**才能量。所以组件按 `medium` → `small` 的顺序整组探一次，
 * 量到就记进表里、立刻按真实宽度重算——不靠比例猜，也不事先克隆一份插槽内容去量。
 *
 * 返回 `undefined` 表示已经量全，或者所有缺失都被使用方用 `widths` 显式给出了。
 */
export function ribbonProbeSize(
  items: readonly RibbonItemSpec[],
  measured: RibbonWidthTable,
): RibbonItemSize | undefined {
  for (const target of ['medium', 'small'] as const) {
    const missing = items.some((item) => {
      // 比目标还小的命令不会渲染成目标尺寸，探它没意义
      if (SIZE_RANK[item.size] < SIZE_RANK[target]) return false
      // 设计尺寸这一档首帧渲染就会量到，不需要专门探一次
      if (target === item.size) return false
      if (item.widths?.[target] !== undefined) return false
      return measured[item.id]?.[target] === undefined
    })
    if (missing) return target
  }
  return undefined
}

function widthOf(item: RibbonPackedItem): number {
  return item.widths?.[item.display] ?? item.width
}

function span(items: RibbonPackedItem[], gap: number): number {
  if (items.length === 0) return 0
  return items.reduce((sum, item) => sum + widthOf(item), 0) + gap * (items.length - 1)
}

/**
 * 把命令铺进有限宽度：
 *   1. 放得下就原样放；
 *   2. 放不下先**降级**（large→medium→small）：先整组降一档，还不够再整组降第二档，
 *      每降一个就复查一次——顺序不能乱，Ribbon 的肌肉记忆全靠位置；
 *   3. 还装不下就从**末尾**往 `»` 里塞，塞到连"最后一个可见项 + `»`"都放不下为止。
 */
export function packRibbon(
  items: readonly RibbonPackItem[],
  availableWidth: number,
  options: RibbonPackOptions = {},
): RibbonPackResult {
  const gap = options.gap ?? 2
  const overflowWidth = options.overflowWidth ?? 20

  const packed: RibbonPackedItem[] = items.map((item) => ({ ...item, display: item.size }))
  if (packed.length === 0) return { visible: [], overflow: [], used: 0 }

  if (span(packed, gap) <= availableWidth) {
    return { visible: packed, overflow: [], used: span(packed, gap) }
  }

  // 第 2 步：降级。先全部 large→medium，再全部 medium→small，任何一次装得下就停。
  for (const target of ['medium', 'small'] as const) {
    for (const item of packed) {
      if (DEGRADE[item.display] !== target) continue
      item.display = target
      if (span(packed, gap) <= availableWidth) return { visible: packed, overflow: [], used: span(packed, gap) }
    }
  }

  // 第 3 步：溢出。从尾部拿，每拿一个都要重新预留给 `»` 的位置。
  const visible = [...packed]
  const overflow: RibbonPackedItem[] = []
  while (visible.length > 0) {
    const needed = span(visible, gap) + gap + overflowWidth
    if (needed <= availableWidth) break
    overflow.unshift(visible.pop() as RibbonPackedItem)
  }
  const used = span(visible, gap) + (overflow.length > 0 ? (visible.length > 0 ? gap : 0) + overflowWidth : 0)
  return { visible, overflow, used }
}

/* ------------------------------------------------------------------ *
 * 选项卡与自动折叠（`OjRibbon`）
 *
 * 三个字段就够，但少一个都会写错：
 *   - `tab`：当前选项卡——折叠时也不能忘，否则展开回来会跳回第一个；
 *   - `collapsed`：**固定**收起（双击标签 / 点收起箭头切换）；
 *   - `peek`：收起态下"单击看一眼"的临时展开，用户点别处就收回。
 * 把 `collapsed` 和 `peek` 合成一个布尔是这里最经典的偷懒：那样"临时展开"
 * 会被记成"永久展开"，用户点一下文档才发现功能区长回来了。
 * ------------------------------------------------------------------ */

export interface RibbonChromeState {
  tab: string
  /** 固定收起：面板默认不可见 */
  collapsed: boolean
  /** 临时展开：只在 `collapsed` 时有意义 */
  peek: boolean
}

export function createRibbonChrome(tab: string, collapsed = false): RibbonChromeState {
  return { tab, collapsed, peek: false }
}

/** 面板此刻是否可见。收起 + 没临时展开 = 不可见。 */
export function ribbonPanelOpen(state: RibbonChromeState): boolean {
  return !state.collapsed || state.peek
}

/**
 * 单击选项卡。展开态只切标签；收起态先临时展开，
 * 再点同一个标签则收回（Word/WPS 都是这个手感）。
 */
export function ribbonSelect(state: RibbonChromeState, id: string): RibbonChromeState {
  if (!state.collapsed) {
    return state.tab === id ? state : { ...state, tab: id, peek: false }
  }
  if (state.peek && state.tab === id) return { ...state, peek: false }
  return { tab: id, collapsed: true, peek: true }
}

/** 双击选项卡（或点收起箭头）：在"固定展开"与"固定收起"之间切，顺手清掉临时展开。 */
export function ribbonToggleCollapsed(state: RibbonChromeState): RibbonChromeState {
  return { tab: state.tab, collapsed: !state.collapsed, peek: false }
}

/** Esc / 点到面板外面：只收回临时展开，不动固定状态。 */
export function ribbonDismiss(state: RibbonChromeState): RibbonChromeState {
  return state.peek ? { ...state, peek: false } : state
}

/* ------------------------------------------------------------------ *
 * Key Tips（03 §5 第 2 条）
 *
 * 按 `Alt` 在标签上浮出字母提示，再按字母直接跳过去——这是办公用户判断
 * "是不是真办公组件库"的第一标准，也是 03 §8.2 点名的坑：
 * Windows 上裸 `Alt` 只发 `keyup`（`keydown` 被系统菜单吞掉），所以提示必须由
 * **keyup 唤起**，之后的字母则由 keydown 拦截——否则浏览器菜单会先跳出来。
 * ------------------------------------------------------------------ */

export interface RibbonKeyTipItem {
  id: string
  /** 显示在标签上的提示键，例如 `H` / `N`。中日韩标签推不出字母，必须显式给。 */
  keyTip?: string
}

/**
 * 把一次按键映射到选项卡 id。只认单字符、大小写不敏感、先到先得。
 * 多字符（`Enter`、`ArrowLeft`）一律不认：那些键在 Ribbon 里另有语义。
 */
export function ribbonKeyTip(items: readonly RibbonKeyTipItem[], key: string): string | undefined {
  if (key.length !== 1) return undefined
  const wanted = key.toLowerCase()
  for (const item of items) {
    if (item.keyTip !== undefined && item.keyTip.length > 0 && item.keyTip.toLowerCase() === wanted) return item.id
  }
  return undefined
}

/** 有没有任何标签配了 Key Tip——没配就别在按 `Alt` 时弹一排空提示。 */
export function ribbonHasKeyTips(items: readonly RibbonKeyTipItem[]): boolean {
  return items.some((item) => item.keyTip !== undefined && item.keyTip.length > 0)
}
