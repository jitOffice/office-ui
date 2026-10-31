/**
 * "人"的最小模型（03 §3 E 组：批注作者、协同头像、修订作者共用）。
 *
 * 三处界面都要显示同一个人，但**不共用同一个"用户对象"**：批注里历史作者是快照（改名后旧批注仍显示旧名），
 * 协同头像显示的是当前状态。所以这里只定义形状，不定义"从哪儿来"。
 *
 * 头像上的字是**由姓名派生的**，不允许传进来：一旦允许调色板/首字母从外部传，
 * 同一个用户在批注区与头像区就会显示成两种颜色——而这类不一致没人会当成 bug 报，只会觉得"乱"。
 */

export interface OjPerson {
  readonly id: string
  readonly name: string
  /** 显式色板序号（0–7）。不给就按 `id` 派生，保证同一人处处同色。 */
  readonly tone?: number
}

/** 头像色板档数。8 档配 `--oj-brand-*` / `--oj-text-*` 之外的一组中性命名色。 */
export const AVATAR_TONES = 8

/**
 * 头像上的首字母。
 *
 * 拉丁名取首尾两词首字母（`Ada Lovelace` → `AL`），单字取首字符，中日韩整名取**首字**——
 * 取末字会让"张伟 / 王伟"这类名字在头像上撞成同一个字。
 *
 * 中日韩名字中间带空格（`王 伟`）时仍只取一个字：这类空格是排版习惯，不是"两个词"，
 * 取两个字符在圆形头像里会挤成一团。
 *
 * 用 `[...name]` 而不是 `name[0]`：emoji 与部分 CJK 扩展字是代理对，按 UTF-16 切会切出半个字符。
 */
const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 0)
  if (parts.length === 0) return ''
  const first = [...(parts[0] as string)][0] ?? ''
  if (parts.length === 1 || CJK.test(first)) return first.toUpperCase()
  const last = [...(parts[parts.length - 1] as string)][0] ?? ''
  return (first + last).toUpperCase()
}

/**
 * 色板序号：稳定哈希，同一 `id` 永远同一档。
 *
 * 不用 `charCodeAt(0)` 取模：`user-1`/`user-2`… 这类 id 的首字符全一样，会全部撞到同一档；
 * djb2 变体对"前缀相同、尾号不同"的 id 分布足够散。
 */
export function avatarTone(person: OjPerson): number {
  if (person.tone !== undefined && Number.isInteger(person.tone)) {
    return ((person.tone % AVATAR_TONES) + AVATAR_TONES) % AVATAR_TONES
  }
  let hash = 5381
  for (let index = 0; index < person.id.length; index += 1) {
    hash = ((hash << 5) + hash + person.id.charCodeAt(index)) % 2147483647
  }
  return hash % AVATAR_TONES
}

/** 堆叠后的结果：能直接画的那几个 + 折叠掉的人数。 */
export interface StackedPeople {
  readonly visible: readonly OjPerson[]
  readonly overflow: number
}

/**
 * 头像堆叠：超过 `max` 个就折叠，**折叠数不含"更多"按钮自身**（按钮显示 `overflow` 个人）。
 *
 * `max` 为 0 时返回空 + 全折叠：调用方据此在窄侧栏里把整组隐藏掉，而不是渲染一个 `+5` 再也没地方展开。
 * `max` 非整数或负数按 0 处理——`max` 常常来自"容器宽度算出来的档数"，算错时应该什么都不画，而不是画非整数个。
 */
export function stackPeople(people: readonly OjPerson[], max: number): StackedPeople {
  const limit = Number.isFinite(max) && max > 0 ? Math.floor(max) : 0
  if (limit === 0) return { visible: [], overflow: people.length }
  if (people.length <= limit) return { visible: [...people], overflow: 0 }
  // 留一格给"更多"按钮，否则最后一格永远显示不出来
  const shown = Math.max(limit - 1, 0)
  return { visible: people.slice(0, shown), overflow: people.length - shown }
}
