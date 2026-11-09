import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createVersion } from '../../src/index.ts'
import type { VersionEntry } from '../../src/index.ts'
import { OjVersionHistory } from '../../src/vue/index.ts'

/**
 * `OjVersionHistory` 的组件契约。
 *
 * 数据操作在 `test/versions.test.ts` 用 `node --test` 覆盖；这里验：
 * 时间线顺序、恢复必须经确认条、行内命名按 Enter/失焦提交、Esc 取消。
 */

const LABELS = {
  label: '版本历史',
  previewLabel: '预览',
  restoreLabel: '恢复',
  renameLabel: '重命名',
  restorePrompt: '恢复后当前内容会被覆盖',
  confirmRestoreLabel: '确认恢复',
  cancelRestoreLabel: '取消',
  formatTime: (at: number) => `T${at}`,
}

const ENTRIES: VersionEntry[] = [
  { id: 'v1', at: 100, author: '张三' },
  { id: 'v2', at: 300, author: '李四', name: '定稿' },
  { id: 'v3', at: 200, author: '王五', summary: '改了第二段' },
]

function mountHistory(entries: readonly VersionEntry[] = ENTRIES, overrides: Record<string, unknown> = {}) {
  return mount(OjVersionHistory, { props: { entries, ...LABELS, ...overrides } })
}

describe('OjVersionHistory', () => {
  it('按时间倒序渲染，名字、时间、作者与摘要各归各位', () => {
    const wrapper = mountHistory()
    const items = wrapper.findAll('.oj-version-history__item')
    expect(items.map((item) => item.attributes('data-version'))).toEqual(['v2', 'v3', 'v1'])

    expect(items[0]!.find('.oj-version-history__name').text()).toBe('定稿')
    expect(items[0]!.find('.oj-version-history__time').text()).toBe('T300')
    expect(items[0]!.find('.oj-version-history__author').text()).toBe('李四')
    // 没名字的条目只是不画名字，不留一个空标题
    expect(items[2]!.find('.oj-version-history__name').exists()).toBe(false)
    expect(items[1]!.find('.oj-version-history__summary').text()).toBe('改了第二段')
    wrapper.unmount()

    const empty = mountHistory([])
    expect(empty.find('.oj-version-history').exists()).toBe(false)
    empty.unmount()

    const hint = mountHistory([], { emptyLabel: '还没有历史版本' })
    expect(hint.find('.oj-version-history__empty').text()).toBe('还没有历史版本')
    hint.unmount()
  })

  it('预览直接上抛条目 id', async () => {
    const wrapper = mountHistory()
    await wrapper.findAll('.oj-version-history__item')[0]!.findAll('button')[0]!.trigger('click')
    expect(wrapper.emitted('preview')?.[0]).toEqual(['v2'])
    wrapper.unmount()
  })

  it('恢复必须经确认条：点一次只是问，确认后才上抛', async () => {
    const wrapper = mountHistory()
    const item = wrapper.findAll('.oj-version-history__item')[0]!

    await item.findAll('button')[1]!.trigger('click')
    expect(wrapper.emitted('restore')).toBeUndefined()
    const bar = wrapper.find('.oj-version-history__confirm')
    expect(bar.exists()).toBe(true)
    expect(bar.attributes('role')).toBe('alertdialog')
    expect(bar.attributes('aria-label')).toBe('恢复后当前内容会被覆盖')

    // 取消：确认条收起，什么都不发生
    await bar.findAll('button')[0]!.trigger('click')
    expect(wrapper.find('.oj-version-history__confirm').exists()).toBe(false)
    expect(wrapper.emitted('restore')).toBeUndefined()

    // 再问一次并确认
    await wrapper.findAll('.oj-version-history__item')[0]!.findAll('button')[1]!.trigger('click')
    await wrapper.find('.oj-version-history__confirm-restore').trigger('click')
    expect(wrapper.emitted('restore')?.[0]).toEqual(['v2'])
    expect(wrapper.find('.oj-version-history__confirm').exists()).toBe(false)
    wrapper.unmount()
  })

  it('行内命名：带着原名出现，Enter 提交去空白后的名字', async () => {
    const wrapper = mountHistory()
    const item = wrapper.findAll('.oj-version-history__item')[0]!
    await item.findAll('button')[2]!.trigger('click')

    const input = wrapper.find('.oj-version-history__input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('定稿')

    await input.setValue('  终稿  ')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('rename')?.[0]).toEqual(['v2', '终稿'])
    expect(wrapper.find('.oj-version-history__input').exists()).toBe(false)
    wrapper.unmount()
  })

  it('清空名字 = 退回自动版本；原样提交与 Esc 都不上抛', async () => {
    const wrapper = mountHistory()
    const item = wrapper.findAll('.oj-version-history__item')[0]!
    await item.findAll('button')[2]!.trigger('click')
    await wrapper.find('.oj-version-history__input').setValue('   ')
    await wrapper.find('.oj-version-history__input').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('rename')?.[0]).toEqual(['v2', ''])
    wrapper.unmount()

    const cancel = mountHistory()
    await cancel.findAll('.oj-version-history__item')[0]!.findAll('button')[2]!.trigger('click')
    const input = cancel.find('.oj-version-history__input')
    await input.setValue('别的名字')
    await input.trigger('keydown', { key: 'Escape' })
    expect(cancel.emitted('rename')).toBeUndefined()
    expect(cancel.find('.oj-version-history__input').exists()).toBe(false)
    cancel.unmount()

    const untouched = mountHistory()
    await untouched.findAll('.oj-version-history__item')[0]!.findAll('button')[2]!.trigger('click')
    await untouched.find('.oj-version-history__input').trigger('keydown', { key: 'Enter' })
    expect(untouched.emitted('rename')).toBeUndefined()
    untouched.unmount()
  })
})
