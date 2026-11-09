import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createShareState, resolveShare } from '../../src/index.ts'
import type { ShareState } from '../../src/index.ts'
import { OjShareDialog } from '../../src/vue/index.ts'

/**
 * `OjShareDialog` 的组件契约。
 *
 * 归一化规则在 `test/share.test.ts` 用 `node --test` 覆盖；这里验：
 * 不同范围画出哪些控件、选择上抛什么状态、确认时发的是不是归一化后的权限。
 */

const LABELS = {
  title: '共享设置',
  scopeLabel: '谁可以访问',
  roleLabel: '权限',
  scopeLabels: { private: '仅自己', link: '任何人有链接', org: '组织内', people: '指定人' },
  roleLabels: { viewer: '只读', commenter: '评论', editor: '编辑' },
  expiryLabel: '链接有效期',
  expiryOptions: [
    { days: 7, label: '7 天' },
    { days: 30, label: '30 天' },
  ],
  peopleLabel: '人数',
  confirmLabel: '完成',
  cancelLabel: '取消',
}

function mountDialog(state: ShareState = createShareState(), overrides: Record<string, unknown> = {}) {
  return mount(OjShareDialog, {
    props: { open: true, state, teleport: false, ...LABELS, ...overrides },
  })
}

describe('OjShareDialog', () => {
  it('关闭时不渲染；私有范围没有角色与有效期可选', () => {
    const closed = mountDialog(createShareState(), { open: false })
    expect(closed.find('.oj-dialog').exists()).toBe(false)
    closed.unmount()

    const wrapper = mountDialog()
    expect(wrapper.find('.oj-dialog').exists()).toBe(true)
    expect(wrapper.find('.oj-dialog__title').text()).toBe('共享设置')
    expect(wrapper.findAll('input[name="oj-share-scope"]')).toHaveLength(4)
    // 私有范围给一组全灰的角色单选，只会让用户以为漏点了什么
    expect(wrapper.find('input[name="oj-share-role"]').exists()).toBe(false)
    expect(wrapper.find('.oj-share__select').exists()).toBe(false)
    wrapper.unmount()
  })

  it('链接范围：角色只剩两档，有效期只在这里出现', () => {
    const wrapper = mountDialog(createShareState({ scope: 'link', role: 'commenter', expiryDays: 30 }))
    const roles = wrapper.findAll('input[name="oj-share-role"]')
    // 链接会被转发，转发者不该顺带给出编辑权
    expect(roles.map((role) => role.attributes('value'))).toEqual(['viewer', 'commenter'])
    expect(roles[1]!.attributes('checked')).toBeDefined()

    const select = wrapper.find('.oj-share__select')
    expect(select.exists()).toBe(true)
    expect(select.findAll('option')).toHaveLength(2)
    expect((select.element as HTMLSelectElement).value).toBe('30')
    // 人数只属于"指定人"范围
    expect(wrapper.find('.oj-share__count').exists()).toBe(false)
    wrapper.unmount()
  })

  it('切范围时角色跟着降级，选择上抛完整状态', async () => {
    const wrapper = mountDialog(createShareState({ scope: 'org', role: 'editor' }))
    await wrapper.find('input[name="oj-share-scope"][value="link"]').setValue()

    const next = wrapper.emitted('update:state')?.[0]?.[0] as ShareState
    expect(next.scope).toBe('link')
    // 不能把"可编辑"带进链接范围
    expect(next.role).toBe('viewer')
    wrapper.unmount()
  })

  it('角色、有效期、人数各走各的事件载荷', async () => {
    const link = mountDialog(createShareState({ scope: 'link', role: 'viewer', expiryDays: 7 }))
    await link.find('input[name="oj-share-role"][value="commenter"]').setValue()
    expect((link.emitted('update:state')?.[0]?.[0] as ShareState).role).toBe('commenter')

    await link.find('.oj-share__select').setValue('30')
    expect((link.emitted('update:state')?.[1]?.[0] as ShareState).expiryDays).toBe(30)
    link.unmount()

    const people = mountDialog(createShareState({ scope: 'people', role: 'commenter', peopleCount: 2 }))
    const count = people.find('.oj-share__count')
    expect(count.exists()).toBe(true)
    await count.setValue('5')
    expect((people.emitted('update:state')?.[0]?.[0] as ShareState).peopleCount).toBe(5)
    people.unmount()
  })

  it('确认上抛的是归一化后的权限，不是界面状态的拷贝', async () => {
    const state = createShareState({ scope: 'org', role: 'editor', expiryDays: 30, peopleCount: 5 })
    const wrapper = mountDialog(state)
    await wrapper.find('.oj-dialog__confirm').trigger('click')

    expect(wrapper.emitted('confirm')?.[0]?.[0]).toEqual(resolveShare(state))
    // 组织范围没有有效期、也没有指定人数：这两项必须是 undefined 而不是 30 / 5
    expect(wrapper.emitted('confirm')?.[0]?.[0]).toEqual({
      scope: 'org',
      role: 'editor',
      expiryDays: undefined,
      peopleCount: undefined,
    })
    wrapper.unmount()
  })

  it('取消与关闭都上抛，关闭同时转发给对话框', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    const cancel = buttons.find((button) => button.text() === '取消')
    expect(cancel).toBeDefined()
    await cancel!.trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    wrapper.unmount()
  })
})
