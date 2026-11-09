/**
 * 版本历史（03 §3 E 组 `OjVersionHistory`）。
 *
 * 两个容易做错的地方，都在这里定死：
 *   - **恢复必须走"确认"这一步**，而且确认是状态机而不是一个 `confirming: boolean`：
 *     点错行时布尔值只能表达"某处要恢复了"，说不清是哪一条，用户会更慌。
 *   - **排序与命名是纯数据操作**：把排序写在组件渲染里，重命名后列表顺序会跟着变，
 *     用户刚改完名字就找不到那一条。名字只是标签，时间才是顺序。
 */

export interface VersionEntry {
  readonly id: string
  /** 毫秒时间戳。 */
  readonly at: number
  readonly author: string
  /** 用户起的名字（"定稿"）；没有就是自动版本。 */
  readonly name?: string
  /** 预览摘要（首段、字数变化），由宿主生成。 */
  readonly summary?: string
}

export type RestoreState =
  | { readonly status: 'idle' }
  | { readonly status: 'confirming'; readonly entryId: string }
  | { readonly status: 'restoring'; readonly entryId: string }

export const IDLE_RESTORE: RestoreState = { status: 'idle' }

/** 新的在前；时间相同保持原有顺序（`Array.prototype.sort` 是稳定排序）。 */
export function sortVersions(entries: readonly VersionEntry[]): readonly VersionEntry[] {
  return [...entries].sort((left, right) => right.at - left.at)
}

export function latestVersion(entries: readonly VersionEntry[]): VersionEntry | undefined {
  return sortVersions(entries)[0]
}

export interface CreateVersionInput {
  readonly id: string
  readonly at: number
  readonly author: string
  readonly name?: string
  readonly summary?: string
}

/** 建条目：时间非数字归 0（宁可排在最后，也不要整列顺序变成随机）。 */
export function createVersion(input: CreateVersionInput): VersionEntry {
  return {
    id: input.id,
    at: Number.isFinite(input.at) ? input.at : 0,
    author: input.author.trim(),
    ...(input.name === undefined ? {} : { name: input.name }),
    ...(input.summary === undefined ? {} : { summary: input.summary }),
  }
}

/**
 * 重命名。空白名字等于"去掉名字"，退回自动版本——
 * 清空输入框却留下一个空标题的条目，用户会以为重命名失败了。
 */
export function renameVersion(entries: readonly VersionEntry[], id: string, name: string): readonly VersionEntry[] {
  const trimmed = name.trim()
  let changed = false
  const next = entries.map((entry) => {
    if (entry.id !== id) return entry
    const current = entry.name ?? ''
    if (current === trimmed) return entry
    changed = true
    if (trimmed === '') {
      // 显式重建对象：`exactOptionalPropertyTypes` 下不能给 `name` 赋 undefined
      return {
        id: entry.id,
        at: entry.at,
        author: entry.author,
        ...(entry.summary === undefined ? {} : { summary: entry.summary }),
      }
    }
    return { ...entry, name: trimmed }
  })
  return changed ? next : entries
}

export function deleteVersion(entries: readonly VersionEntry[], id: string): readonly VersionEntry[] {
  const next = entries.filter((entry) => entry.id !== id)
  return next.length === entries.length ? entries : next
}

/** 请求恢复：进入"待确认"。同一条重复请求返回原对象。 */
export function requestRestore(state: RestoreState, entryId: string): RestoreState {
  if (state.status === 'confirming' && state.entryId === entryId) return state
  return { status: 'confirming', entryId }
}

export function cancelRestore(state: RestoreState): RestoreState {
  return state.status === 'idle' ? state : IDLE_RESTORE
}

/** 用户点了"确认恢复"：进入执行态，组件据此上抛 `restore`。 */
export function confirmRestore(state: RestoreState): RestoreState {
  if (state.status !== 'confirming') return state
  return { status: 'restoring', entryId: state.entryId }
}

export function restoreEntryId(state: RestoreState): string | undefined {
  return state.status === 'idle' ? undefined : state.entryId
}
