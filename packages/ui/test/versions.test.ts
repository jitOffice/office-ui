/**
 * 版本历史（M3：`OjVersionHistory`）。
 *
 * 两件事必须钉死：排序只看时间（改名不能改变顺序），以及恢复必须经过"待确认"这一态
 * （布尔值说不清要恢复哪一条）。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  cancelRestore,
  confirmRestore,
  createVersion,
  deleteVersion,
  latestVersion,
  renameVersion,
  requestRestore,
  restoreEntryId,
  sortVersions,
} from '../src/index.ts'
import type { VersionEntry } from '../src/index.ts'

const entries: VersionEntry[] = [
  { id: 'v1', at: 100, author: '张三' },
  { id: 'v2', at: 300, author: '李四', name: '定稿' },
  { id: 'v3', at: 200, author: '王五', summary: '改了第二段' },
]

test('排序：新的在前，同一时间保持原顺序，且不改原数组', () => {
  const sorted = sortVersions(entries)
  assert.deepEqual(
    sorted.map((entry) => entry.id),
    ['v2', 'v3', 'v1'],
  )
  // 原数组不能被就地排序：宿主可能同时用它在别处渲染
  assert.deepEqual(
    entries.map((entry) => entry.id),
    ['v1', 'v2', 'v3'],
  )

  const sameTime: VersionEntry[] = [
    { id: 'a', at: 1, author: 'x' },
    { id: 'b', at: 1, author: 'y' },
  ]
  assert.deepEqual(
    sortVersions(sameTime).map((entry) => entry.id),
    ['a', 'b'],
  )
})

test('建条目：非法时间归 0，作者去空白，可选字段不写空值', () => {
  const entry = createVersion({ id: 'x', at: Number.NaN, author: '  张三  ' })
  assert.equal(entry.at, 0)
  assert.equal(entry.author, '张三')
  // 没有名字时不能留下 name: undefined（下游判断"有没有名字"会失效）
  assert.equal(Object.hasOwn(entry, 'name'), false)
  assert.equal(Object.hasOwn(entry, 'summary'), false)

  const named = createVersion({ id: 'y', at: 5, author: 'a', name: '定稿', summary: '说明' })
  assert.equal(named.name, '定稿')
  assert.equal(named.summary, '说明')
  assert.equal(latestVersion([]), undefined)
  assert.equal(latestVersion(entries)?.id, 'v2')
})

test('重命名：去空白、空名退回自动版本、无变化时返回原数组', () => {
  const renamed = renameVersion(entries, 'v1', '  初稿  ')
  assert.equal(renamed.find((entry) => entry.id === 'v1')?.name, '初稿')
  // 顺序不受影响
  assert.deepEqual(
    renamed.map((entry) => entry.id),
    ['v1', 'v2', 'v3'],
  )

  // 清空名字 = 退回自动版本
  const cleared = renameVersion(entries, 'v2', '   ')
  const target = cleared.find((entry) => entry.id === 'v2')
  assert.equal(target?.name, undefined)
  assert.equal(Object.hasOwn(target ?? {}, 'name'), false)

  // 同名/未知 id 都不产生新数组
  assert.equal(renameVersion(entries, 'v2', '定稿'), entries)
  assert.equal(renameVersion(entries, 'missing', 'x'), entries)
})

test('删除：未知 id 返回原数组', () => {
  const next = deleteVersion(entries, 'v3')
  assert.deepEqual(
    next.map((entry) => entry.id),
    ['v1', 'v2'],
  )
  assert.equal(deleteVersion(entries, 'missing'), entries)
})

test('恢复流程：待确认 → 执行；取消回空闲；同一条重复请求不再新建对象', () => {
  const idle = cancelRestore(confirmRestore(cancelRestore(requestRestore({ status: 'idle' }, 'v2'))))
  assert.equal(idle.status, 'idle')
  // 已经在空闲态：返回原对象
  assert.equal(cancelRestore(idle), idle)

  const asking = requestRestore(idle, 'v2')
  assert.deepEqual(asking, { status: 'confirming', entryId: 'v2' })
  assert.equal(requestRestore(asking, 'v2'), asking)
  // 换一条要恢复的版本：以最新一次点击为准
  assert.deepEqual(requestRestore(asking, 'v1'), { status: 'confirming', entryId: 'v1' })

  const restoring = confirmRestore(asking)
  assert.deepEqual(restoring, { status: 'restoring', entryId: 'v2' })
  // 非待确认态点确认无效
  assert.equal(confirmRestore(idle), idle)
  assert.equal(confirmRestore(restoring), restoring)

  assert.equal(restoreEntryId(asking), 'v2')
  assert.equal(restoreEntryId(restoring), 'v2')
  assert.equal(restoreEntryId(idle), undefined)
})
