/**
 * 审阅与协同的行为层（M3 第一批：`OjCommentThread` / `OjReviewPanel` / `OjPresenceAvatars` / `OjFileNameHeader`）。
 *
 * 这批逻辑的共同点：**每一条都会在界面上表现为"点了一下，什么也没发生"**——
 * 回复空文本、把筛选结果当全部、批注解决后又自动重开、文件名裁完空白变空。
 * 它们全都能在 `node --test` 里断言，不需要 DOM。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  AVATAR_TONES,
  addReply,
  avatarTone,
  changeAuthors,
  commentCounts,
  decideAll,
  decideChange,
  fileNameProblem,
  filterChanges,
  filterThreads,
  initialsOf,
  isDirty,
  nextOpenThread,
  renameFile,
  reviewCounts,
  setResolved,
  stackPeople,
} from '../src/index.ts'
import type { CommentThread, ReviewChange } from '../src/index.ts'

const ADA = { id: 'u-ada', name: 'Ada Lovelace' }
const ZHANG = { id: 'u-zhang', name: '张伟' }
const LI = { id: 'u-li', name: '李娜' }

function thread(id: string, resolved = false, replies: CommentThread['replies'] = []): CommentThread {
  return { id, anchor: `block-${id}`, author: ADA, at: 1, text: `批注 ${id}`, replies, resolved }
}

test('头像首字母：拉丁取首尾词首字母，中日韩取首字，空名不抛错', () => {
  assert.equal(initialsOf('Ada Lovelace'), 'AL')
  assert.equal(initialsOf('张伟'), '张')
  // 取首字而不是末字：张伟/王伟 在头像上会撞成同一个字
  assert.equal(initialsOf('  王  伟  '), '王')
  assert.equal(initialsOf('ada'), 'A')
  assert.equal(initialsOf('   '), '')
})

test('头像色档：同一 id 恒定、显式 tone 优先、负数回绕', () => {
  const first = avatarTone(ADA)
  assert.equal(avatarTone({ ...ADA }), first)
  assert.ok(first >= 0 && first < AVATAR_TONES)
  assert.equal(avatarTone({ ...ADA, tone: 2 }), 2)
  assert.equal(avatarTone({ ...ADA, tone: -1 }), AVATAR_TONES - 1)
  // 前缀相同、尾号不同的 id 必须散开：按首字符取模会全撞到同一档
  const tones = new Set([1, 2, 3, 4, 5, 6, 7, 8].map((n) => avatarTone({ id: `user-${n}`, name: `U${n}` })))
  assert.ok(tones.size >= 3, `期望散开，实际 ${[...tones].join(',')}`)
  // 哈希里用了有符号位移，溢出后 `%` 会留下负数（`u-zhang` 曾得到 -1，头像于是无色）。
  // 这里把一批 id 全扫一遍，负档不可能靠"看着还行"发现。
  for (const id of ['u-ada', 'u-zhang', 'u-li', 'u-wang', 'u-sato', 'a', 'zzzzzz', 'user-42', '🎯']) {
    const tone = avatarTone({ id, name: id })
    assert.ok(tone >= 0 && tone < AVATAR_TONES, `${id} 得到非法档位 ${tone}`)
  }
})

test('头像堆叠：为"更多"按钮留一格，max=0 表示这个位置放不下', () => {
  const people = [ADA, ZHANG, LI, { id: 'u-wang', name: '王芳' }]
  assert.deepEqual(stackPeople(people.slice(0, 2), 5), { visible: people.slice(0, 2), overflow: 0 })
  // 4 人、5 格：全画，不出现"更多"
  assert.equal(stackPeople(people, 5).overflow, 0)
  // 4 人、3 格：画 2 个 + "更多 2"
  const mixed = stackPeople(people, 3)
  assert.equal(mixed.visible.length, 2)
  assert.equal(mixed.overflow, 2)
  assert.deepEqual(stackPeople(people, 0), { visible: [], overflow: 4 })
  assert.deepEqual(stackPeople(people, -2), { visible: [], overflow: 4 })
})

test('回复：空文本不产生新对象（引用不变，上游不会重渲染）', () => {
  const base = thread('c1')
  assert.equal(addReply(base, { id: 'r0', author: ZHANG, at: 2, text: '   ' }), base)
  const replied = addReply(base, { id: 'r1', author: ZHANG, at: 2, text: '同意' })
  assert.equal(replied.replies.length, 1)
  assert.equal(base.replies.length, 0)
  // 回复不改解决状态：只回一句确认不该让批注自动重开
  const resolved = setResolved(base, true)
  assert.equal(addReply(resolved, { id: 'r2', author: LI, at: 3, text: '收到' }).resolved, true)
})

test('解决态：同值返回原对象；统计与筛选', () => {
  const base = thread('c1')
  assert.equal(setResolved(base, false), base)
  assert.equal(setResolved(base, true).resolved, true)

  const threads = [thread('c1'), thread('c2', true, [{ id: 'r1', author: LI, at: 5, text: 'ok' }]), thread('c3')]
  assert.deepEqual(commentCounts(threads), { total: 3, open: 2, resolved: 1, replies: 1 })
  assert.deepEqual(
    filterThreads(threads, 'open').map((entry) => entry.id),
    ['c1', 'c3'],
  )
  assert.deepEqual(
    filterThreads(threads, 'resolved').map((entry) => entry.id),
    ['c2'],
  )
  assert.equal(filterThreads(threads, 'all').length, 3)
})

test('下一个未解决批注：到头不环绕，全解决时返回 undefined', () => {
  const threads = [thread('c1'), thread('c2', true), thread('c3')]
  assert.equal(nextOpenThread(threads, undefined), 'c1')
  assert.equal(nextOpenThread(threads, 'c1'), 'c3')
  // 跳过已解决的 c2
  assert.equal(nextOpenThread(threads, 'c3', -1), 'c1')
  // 已在最后一条：不回头
  assert.equal(nextOpenThread(threads, 'c3'), undefined)
  assert.equal(nextOpenThread([thread('c1', true)], 'c1'), undefined)
})

const CHANGES: readonly ReviewChange[] = [
  { id: 'a1', kind: 'insert', author: ADA, at: 1, summary: '插入「乙方」', anchor: 'p1' },
  { id: 'a2', kind: 'delete', author: ZHANG, at: 2, summary: '删除「甲方」', anchor: 'p2' },
  { id: 'a3', kind: 'format', author: ADA, at: 3, summary: '加粗标题', anchor: 'p3' },
]

test('修订筛选：种类与作者都支持"全部"', () => {
  assert.deepEqual(
    filterChanges(CHANGES, { kind: 'insert' }).map((change) => change.id),
    ['a1'],
  )
  assert.deepEqual(
    filterChanges(CHANGES, { authorId: 'u-ada' }).map((change) => change.id),
    ['a1', 'a3'],
  )
  assert.equal(filterChanges(CHANGES, { kind: 'all', authorId: 'all' }).length, 3)
  // 不认识的键缺省即"不过滤"
  assert.equal(filterChanges(CHANGES, {}).length, 3)
})

test('批量决策只作用于当前筛选结果；单条决策找不到时引用不变', () => {
  // "只看张三"下点全部接受：不能把 Ada 的两条一起处理
  const left = decideAll(CHANGES, { authorId: 'u-zhang' })
  assert.deepEqual(
    left.map((change) => change.id),
    ['a1', 'a3'],
  )
  assert.equal(decideAll(CHANGES, { kind: 'insert' }).length, 2)

  assert.equal(decideChange(CHANGES, 'missing'), CHANGES)
  assert.deepEqual(
    decideChange(CHANGES, 'a2').map((change) => change.id),
    ['a1', 'a3'],
  )
})

test('修订统计与作者顺序：作者按首次出现排序，筛选下拉不会乱跳', () => {
  assert.deepEqual(reviewCounts(CHANGES), { total: 3, insert: 1, delete: 1, format: 1 })
  assert.deepEqual(
    changeAuthors(CHANGES).map((author) => author.id),
    ['u-ada', 'u-zhang'],
  )
})

test('文件名校验：按 Windows 最严规则，保留名带扩展名也算', () => {
  assert.equal(fileNameProblem('合同 2026.docx'), undefined)
  assert.equal(fileNameProblem('   '), 'empty')
  assert.equal(fileNameProblem('a/b'), 'illegal')
  assert.equal(fileNameProblem('a:b'), 'illegal')
  assert.equal(fileNameProblem('什么?'), 'illegal')
  assert.equal(fileNameProblem('CON'), 'reserved')
  // CON.txt 在 Windows 上同样建不出来
  assert.equal(fileNameProblem('con.txt'), 'reserved')
  assert.equal(fileNameProblem('..'), 'reserved')
})

test('重命名：未改动视为成功；裁空白；非法名带回原因', () => {
  assert.deepEqual(renameFile('合同.docx', '合同.docx'), { ok: true, name: '合同.docx' })
  assert.deepEqual(renameFile('合同.docx', '  新合同.docx '), { ok: true, name: '新合同.docx' })
  assert.deepEqual(renameFile('合同.docx', ''), { ok: false, problem: 'empty' })
  assert.deepEqual(renameFile('合同.docx', 'a|b'), { ok: false, problem: 'illegal' })
  // 只改空白等于没改：不该报错，也不该把名字改成空
  assert.deepEqual(renameFile('合同.docx', ' 合同.docx '), { ok: true, name: '合同.docx' })
})

test('保存态：只有 saved 是"已落盘"，saving 也算未落盘', () => {
  assert.equal(isDirty('saved'), false)
  assert.equal(isDirty('saving'), true)
  assert.equal(isDirty('unsaved'), true)
})
