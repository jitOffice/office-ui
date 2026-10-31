/**
 * 修订（track changes）列表模型（03 §3 E 组 `OjReviewPanel`）。
 *
 * 修订与批注是两种东西，界面必须分开：批注是"人说的话"，修订是"文档的差异"。
 * 这里只建模**列表与决策**，正文怎么打补丁是宿主的责任（内核才知道 diff 怎么应用）。
 *
 * 决策后从列表移除，而不是标一个 `accepted: true`：Word 的行为就是这样——
 * 接受/拒绝之后那处修订就不在列表里了，留着会让人重复点。撤销由宿主的撤销栈负责。
 */

import type { OjPerson } from './people.ts'

export type ReviewKind = 'insert' | 'delete' | 'format'

export interface ReviewChange {
  readonly id: string
  readonly kind: ReviewKind
  readonly author: OjPerson
  readonly at: number
  /** 已由宿主格式化好的差异摘要（"把「甲方」改成「乙方」"）。组件不拼文案。 */
  readonly summary: string
  /** 该修订涉及的正文锚点，接受/拒绝时宿主据此定位。 */
  readonly anchor: string
}

export type ReviewDecision = 'accept' | 'reject'

/** 筛选条件。`'all'` 是"不过滤"，而不是"匹配所有种类"——两者在空列表上表现不同。 */
export interface ReviewFilter {
  readonly kind?: ReviewKind | 'all'
  readonly authorId?: string | 'all'
}

export const REVIEW_KINDS: readonly ReviewKind[] = ['insert', 'delete', 'format']

function match(change: ReviewChange, filter: ReviewFilter): boolean {
  const kind = filter.kind ?? 'all'
  const authorId = filter.authorId ?? 'all'
  if (kind !== 'all' && change.kind !== kind) return false
  if (authorId !== 'all' && change.author.id !== authorId) return false
  return true
}

/** 按种类/作者筛选，保持原有顺序（顺序即文档位置，重排会让"下一个修订"跳着走）。 */
export function filterChanges(changes: readonly ReviewChange[], filter: ReviewFilter): ReviewChange[] {
  return changes.filter((change) => match(change, filter))
}

/** 移除一条已决策的修订。找不到时返回原对象（引用不变，避免无意义重渲染）。 */
export function decideChange(changes: readonly ReviewChange[], id: string): readonly ReviewChange[] {
  const index = changes.findIndex((change) => change.id === id)
  if (index === -1) return changes
  return [...changes.slice(0, index), ...changes.slice(index + 1)]
}

/**
 * 批量决策：删除**当前筛选结果**里的全部修订。
 *
 * 语义按"当前所见"而不是"全部"：用户在"只看张三"的筛选下点"全部接受"，
 * 期望的是把张三的这几条处理掉；连别人的一起处理是数据事故。
 */
export function decideAll(changes: readonly ReviewChange[], filter: ReviewFilter): readonly ReviewChange[] {
  return changes.filter((change) => !match(change, filter))
}

export interface ReviewCounts {
  readonly total: number
  readonly insert: number
  readonly delete: number
  readonly format: number
}

export function reviewCounts(changes: readonly ReviewChange[]): ReviewCounts {
  const counts = { total: changes.length, insert: 0, delete: 0, format: 0 }
  for (const change of changes) counts[change.kind] += 1
  return counts
}

/** 列表里出现过的作者（按首次出现顺序），给筛选下拉用。 */
export function changeAuthors(changes: readonly ReviewChange[]): OjPerson[] {
  const seen = new Map<string, OjPerson>()
  for (const change of changes) {
    if (!seen.has(change.author.id)) seen.set(change.author.id, change.author)
  }
  return [...seen.values()]
}
