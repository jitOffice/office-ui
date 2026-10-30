/**
 * 菜单的数据模型与键盘导航（03 §3 B 组 `OjContextMenu`）。
 *
 * 抽成零依赖纯函数的原因和 `table-grid.ts`、`shell/gallery.ts` 一样：**"方向键怎么走"
 * 是最容易写歪的一段**，而它又只能靠手感验证。写成"下标 +1/-1"，遇到禁用项与分隔线
 * 就会停在点不着的地方；写成"跳过禁用项"却忘了环绕，按到最后一项就卡住——
 * Office / Windows 的菜单都是**环绕**的。这些规则在这里被逐条钉死，组件只负责接线。
 *
 * 右键菜单还有一个和普通下拉不同的前提：它可以**没有 DOM 锚点**（canvas 上按坐标弹出），
 * 所以这里不出现任何元素引用，定位交给 `placePopper` 的 `anchorBox`。
 */

export type OjMenuItemKind = 'item' | 'separator'

interface OjMenuItemBase {
  disabled?: boolean | undefined
  /** 在它上面先画一条分隔线（比单独插一条 separator 更不容易写错顺序） */
  separatorBefore?: boolean | undefined
}

/** 可执行的菜单项。**只有它有 id**——分隔线没有身份，硬给它一个 id 只会污染命令日志。 */
export interface OjMenuItemAction extends OjMenuItemBase {
  kind?: 'item' | undefined
  /** 选中时回传的 id。命令 id 是公开 API（03 §7），菜单里通常直接用它 */
  id: string
  label?: string | undefined
  /** 危险操作（删除、清空）：红色文字，读屏不额外播报——颜色之外还有文案 */
  danger?: boolean | undefined
  /** 右侧快捷键提示，只展示不绑定（绑定是 `OjHotkey` 的事） */
  shortcut?: string | undefined
}

/** 分隔线：不可聚焦、不可选中、不会触发 `select`。 */
export interface OjMenuSeparator extends OjMenuItemBase {
  kind: 'separator'
}

export type OjMenuItem = OjMenuItemAction | OjMenuSeparator

/** 这一项能不能被选中/聚焦。分隔线与禁用项都不行。 */
export function menuSelectable(item: OjMenuItem): item is OjMenuItemAction {
  return item.kind !== 'separator' && item.disabled !== true
}

/** 可选项的下标表，按原顺序。组件用它做 tabindex 轮换，导航用它算邻居。 */
export function menuSelectableIndices(items: readonly OjMenuItem[]): number[] {
  const out: number[] = []
  items.forEach((item, index) => {
    if (menuSelectable(item)) out.push(index)
  })
  return out
}

/**
 * 方向键/Home/End 之后该聚焦哪一项。返回**项下标**，没有可选项时返回 `-1`。
 *
 * `index` 传 `-1` 表示"当前没有任何项被聚焦"：`ArrowDown` 落到第一个可选项，
 * `ArrowUp` 落到最后一个——这是菜单刚打开时的两种进入方向。
 * 未知按键原样返回 `index`，调用方据此判断"这个键不归我管"。
 */
export function menuNeighbor(items: readonly OjMenuItem[], index: number, key: string): number {
  const enabled = menuSelectableIndices(items)
  if (enabled.length === 0) return -1

  const at = enabled.indexOf(index)
  const first = enabled[0] as number
  const last = enabled[enabled.length - 1] as number

  if (key === 'Home') return first
  if (key === 'End') return last
  // at = -1 时 (at + 1) % n = 0，正好是"从第一个开始"
  if (key === 'ArrowDown') return enabled[(at + 1) % enabled.length] as number
  // at = -1 或 0 都回绕到最后一项
  if (key === 'ArrowUp') return enabled[(at <= 0 ? enabled.length : at) - 1] as number
  return index
}

/** 回车/空格该触发哪一项。`-1`（无聚焦）或落在禁用项上时返回 `undefined`。 */
export function menuAction(items: readonly OjMenuItem[], index: number): OjMenuItemAction | undefined {
  const item = items[index]
  if (item === undefined || !menuSelectable(item)) return undefined
  return item
}
