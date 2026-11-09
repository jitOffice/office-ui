/**
 * 共享权限模型（M3：`OjShareDialog`）。
 *
 * 这一层唯一必须保证的事：**界面选的和实际发出的是同一个权限**。
 * 链接范围不给"可编辑"，私有没有角色，有效期只对链接有效——全在这里归一化。
 */

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  SHARE_MAX_EXPIRY_DAYS,
  SHARE_MAX_PEOPLE,
  createShareState,
  isShareEnabled,
  resolveShare,
  rolesForScope,
  setShareExpiry,
  setSharePeopleCount,
  setShareRole,
  setShareScope,
} from '../src/index.ts'

test('默认私有；各范围允许的角色集合不同', () => {
  const state = createShareState()
  assert.equal(state.scope, 'private')
  assert.equal(state.role, 'viewer')
  assert.equal(state.expiryDays, 0)
  assert.equal(state.peopleCount, 0)
  assert.equal(isShareEnabled(state), false)

  assert.deepEqual(rolesForScope('private'), [])
  // 链接会被转发，转发者不该顺带给出编辑权
  assert.deepEqual(rolesForScope('link'), ['viewer', 'commenter'])
  assert.deepEqual(rolesForScope('org'), ['viewer', 'commenter', 'editor'])
  assert.deepEqual(rolesForScope('people'), ['viewer', 'commenter', 'editor'])

  // 初始值也要合法：链接 + 可编辑会被降级
  assert.equal(createShareState({ scope: 'link', role: 'editor' }).role, 'viewer')
})

test('切范围顺手降级角色，且不会把界面上不允许的一档留给后端', () => {
  const org = createShareState({ scope: 'org', role: 'editor' })
  const link = setShareScope(org, 'link')
  assert.equal(link.scope, 'link')
  assert.equal(link.role, 'viewer')

  // 同一范围：返回原对象，宿主不会收到无变化的更新
  assert.equal(setShareScope(link, 'link'), link)
  // 私有范围没有角色，但保留上次选择，切回来还能用
  const back = setShareScope(org, 'private')
  assert.equal(back.role, 'editor')
  assert.equal(isShareEnabled(back), false)
})

test('选角色：范围不允许的直接忽略（UI 不该放出这种选项，宿主可能直接调）', () => {
  const link = createShareState({ scope: 'link' })
  assert.equal(setShareRole(link, 'editor'), link)
  assert.equal(setShareRole(link, 'commenter').role, 'commenter')
  assert.equal(setShareRole(link, 'viewer'), link)

  const org = createShareState({ scope: 'org' })
  assert.equal(setShareRole(org, 'editor').role, 'editor')
})

test('有效期与指定人数：夹进合法区间，非法值保留原值', () => {
  const state = createShareState({ scope: 'link' })
  assert.equal(setShareExpiry(state, 7).expiryDays, 7)
  assert.equal(setShareExpiry(state, -3).expiryDays, 0)
  assert.equal(setShareExpiry(state, 99999).expiryDays, SHARE_MAX_EXPIRY_DAYS)
  assert.equal(setShareExpiry(state, Number.NaN).expiryDays, state.expiryDays)
  assert.equal(setShareExpiry(state, 0.9).expiryDays, 0)
  assert.equal(setShareExpiry(state, 0), state)

  assert.equal(setSharePeopleCount(state, 3).peopleCount, 3)
  assert.equal(setSharePeopleCount(state, -1).peopleCount, 0)
  assert.equal(setSharePeopleCount(state, 1e9).peopleCount, SHARE_MAX_PEOPLE)
  assert.equal(setSharePeopleCount(state, 0), state)
})

test('归一化：私有没有角色，有效期只跟链接走，指定人数只跟指定人走', () => {
  const priv = createShareState({ role: 'editor' })
  assert.deepEqual(resolveShare(priv), {
    scope: 'private',
    role: undefined,
    expiryDays: undefined,
    peopleCount: undefined,
  })

  const link = createShareState({ scope: 'link', role: 'commenter', expiryDays: 30 })
  assert.deepEqual(resolveShare(link), {
    scope: 'link',
    role: 'commenter',
    expiryDays: 30,
    peopleCount: undefined,
  })

  const org = createShareState({ scope: 'org', role: 'editor', expiryDays: 30, peopleCount: 5 })
  assert.deepEqual(resolveShare(org), {
    scope: 'org',
    role: 'editor',
    expiryDays: undefined,
    peopleCount: undefined,
  })

  const people = createShareState({ scope: 'people', role: 'commenter', peopleCount: 5 })
  assert.deepEqual(resolveShare(people), {
    scope: 'people',
    role: 'commenter',
    expiryDays: undefined,
    peopleCount: 5,
  })

  // 即使绕过了 setShareScope 手工拼了一个非法组合，归一化也要给出合法权限
  const illegal = { ...createShareState({ scope: 'link' }), role: 'editor' as const }
  assert.equal(resolveShare(illegal).role, 'viewer')
})
