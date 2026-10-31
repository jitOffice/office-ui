import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  OjCommentThread,
  OjFileNameHeader,
  OjPresenceAvatars,
  OjReviewPanel,
} from '../../src/vue/index.ts'
import type { CommentThread, ReviewChange } from '../../src/index.ts'

/**
 * 审阅与协同四件（M3 第一批）。
 *
 * 只验"契约"：事件名与实参、受控不变量、非法输入的界面反馈。
 * 纯逻辑（筛选、统计、堆叠）在 `test/review-collab.test.ts` 里用 `node --test` 覆盖，
 * 这里不重复断言算法，只断言组件把算法结果正确接到 DOM 与事件上。
 */

const ADA = { id: 'u-ada', name: 'Ada Lovelace' }
const ZHANG = { id: 'u-zhang', name: '张伟' }

const formatTime = (at: number): string => `t${at}`

const THREAD: CommentThread = {
  id: 'c1',
  anchor: 'block-1',
  author: ADA,
  at: 1,
  text: '这里要补一句免责声明',
  replies: [{ id: 'r1', author: ZHANG, at: 2, text: '已改' }],
  resolved: false,
}

const CHANGES: readonly ReviewChange[] = [
  { id: 'a1', kind: 'insert', author: ADA, at: 1, summary: '插入「乙方」', anchor: 'p1' },
  { id: 'a2', kind: 'delete', author: ZHANG, at: 2, summary: '删除「甲方」', anchor: 'p2' },
]

describe('OjPresenceAvatars', () => {
  it('堆叠：超出 max 时留一格给"更多"，点击各自派发事件', async () => {
    const wrapper = mount(OjPresenceAvatars, {
      props: {
        people: [ADA, ZHANG, { id: 'u-li', name: '李娜' }],
        max: 2,
        label: '在线',
        overflowLabel: '还有 2 人',
      },
    })

    // max=2 → 1 个头像 + 1 个"更多"
    expect(wrapper.findAll('.oj-presence__avatar')).toHaveLength(1)
    const more = wrapper.find('.oj-presence__more')
    expect(more.text()).toBe('还有 2 人')
    expect(more.attributes('aria-label')).toBe('还有 2 人')

    await wrapper.find('.oj-presence__avatar').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual(['u-ada'])

    await more.trigger('click')
    expect(wrapper.emitted('overflow')).toHaveLength(1)

    wrapper.unmount()
  })

  it('降级：max=0 时整组不渲染（窄侧栏里不该出现"+"而没地方展开）', () => {
    const wrapper = mount(OjPresenceAvatars, {
      props: { people: [ADA], max: 0, label: '在线' },
    })
    expect(wrapper.find('.oj-presence').exists()).toBe(false)
    wrapper.unmount()
  })
})

describe('OjFileNameHeader', () => {
  const baseProps = {
    name: '合同.docx',
    state: 'saved' as const,
    stateLabel: '已保存',
    renameLabel: '重命名',
    favoriteLabel: '收藏',
    problemLabels: { empty: '不能为空', illegal: '含非法字符', reserved: '保留名' },
  }

  it('重命名：回车提交新名字，保存态带圆点', async () => {
    const wrapper = mount(OjFileNameHeader, { props: baseProps })
    expect(wrapper.find('.oj-file-name__state').text()).toBe('已保存')

    await wrapper.find('.oj-file-name__title').trigger('click')
    const input = wrapper.find('.oj-file-name__input')
    expect(input.element.tagName).toBe('INPUT')

    await input.setValue('新合同.docx')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('rename')?.[0]).toEqual(['新合同.docx'])
    expect(wrapper.find('.oj-file-name__input').exists()).toBe(false)

    wrapper.unmount()
  })

  it('非法名：留在编辑态并给出原因，不吞用户输入', async () => {
    const wrapper = mount(OjFileNameHeader, { props: baseProps })
    await wrapper.find('.oj-file-name__title').trigger('click')
    const input = wrapper.find('.oj-file-name__input')
    await input.setValue('a/b')
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('rename')).toBeUndefined()
    const still = wrapper.find('.oj-file-name__input')
    expect(still.exists()).toBe(true)
    expect(still.attributes('aria-invalid')).toBe('true')
    expect(wrapper.find('.oj-file-name__problem').text()).toBe('含非法字符')

    // Esc 退出编辑态且不发事件
    await still.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.oj-file-name__input').exists()).toBe(false)

    wrapper.unmount()
  })

  it('收藏是受控的：只发 update:favored，不改自己', async () => {
    const wrapper = mount(OjFileNameHeader, { props: { ...baseProps, favored: false } })
    const button = wrapper.find('.oj-file-name__favorite')
    expect(button.attributes('aria-pressed')).toBe('false')
    await button.trigger('click')
    expect(wrapper.emitted('update:favored')?.[0]).toEqual([true])
    expect(button.attributes('aria-pressed')).toBe('false')

    wrapper.unmount()
  })
})

describe('OjCommentThread', () => {
  const props = {
    thread: THREAD,
    formatTime,
    resolveLabel: '解决',
    reopenLabel: '重新打开',
    replyLabel: '回复',
    replyPlaceholder: '回复这条批注…',
  }

  it('渲染作者、时间与回复；时间由外部格式化', () => {
    const wrapper = mount(OjCommentThread, { props })
    expect(wrapper.find('.oj-comment__author').text()).toBe('Ada Lovelace')
    expect(wrapper.find('.oj-comment__time').text()).toBe('t1')
    expect(wrapper.findAll('.oj-comment__reply')).toHaveLength(1)
    expect(wrapper.find('.oj-comment__resolve').text()).toBe('解决')
    wrapper.unmount()
  })

  it('回复：空文本发送按钮禁用；提交后清空草稿但线程由宿主改', async () => {
    const wrapper = mount(OjCommentThread, { props })
    const send = wrapper.find('.oj-comment__send')
    expect(send.attributes('disabled')).toBeDefined()

    const input = wrapper.find('.oj-comment__input')
    await input.setValue('同意')
    expect(wrapper.find('.oj-comment__send').attributes('disabled')).toBeUndefined()

    await wrapper.find('.oj-comment__send').trigger('click')
    expect(wrapper.emitted('reply')?.[0]).toEqual(['同意'])
    expect((wrapper.find('.oj-comment__input').element as HTMLTextAreaElement).value).toBe('')
    // 受控：组件自己不改 `thread.replies`
    expect(wrapper.findAll('.oj-comment__reply')).toHaveLength(1)

    wrapper.unmount()
  })

  it('解决按钮按当前状态派发"切到哪一态"', async () => {
    const wrapper = mount(OjCommentThread, { props })
    await wrapper.find('.oj-comment__resolve').trigger('click')
    expect(wrapper.emitted('toggle-resolved')?.[0]).toEqual([true])

    const resolved = mount(OjCommentThread, { props: { ...props, thread: { ...THREAD, resolved: true } } })
    expect(resolved.find('.oj-comment__resolve').text()).toBe('重新打开')
    await resolved.find('.oj-comment__resolve').trigger('click')
    expect(resolved.emitted('toggle-resolved')?.[0]).toEqual([false])

    wrapper.unmount()
    resolved.unmount()
  })
})

describe('OjReviewPanel', () => {
  const props = {
    changes: CHANGES,
    label: '修订',
    acceptLabel: '接受',
    rejectLabel: '拒绝',
    acceptAllLabel: '全部接受',
    rejectAllLabel: '全部拒绝',
    emptyLabel: '没有待处理的修订',
    allKindsLabel: '全部',
    kindLabels: { insert: '插入', delete: '删除', format: '格式' },
    formatTime,
  }

  it('列出全部修订，逐条接受派发 id 与决策', async () => {
    const wrapper = mount(OjReviewPanel, { props })
    const items = wrapper.findAll('.oj-review__item')
    expect(items).toHaveLength(2)
    expect(items[0]?.attributes('data-kind')).toBe('insert')

    await items[0]!.find('.oj-review__decide button').trigger('click')
    expect(wrapper.emitted('decide')?.[0]).toEqual(['a1', 'accept'])

    wrapper.unmount()
  })

  it('筛选改变可见列表；"全部接受"把当前筛选条件一起带出去', async () => {
    const wrapper = mount(OjReviewPanel, { props })
    const chips = wrapper.findAll('.oj-review__chip')
    // 全部 + 三个种类
    expect(chips.map((chip) => chip.text())).toEqual(['全部', '插入', '删除', '格式'])

    await chips[2]!.trigger('click')
    expect(wrapper.findAll('.oj-review__item')).toHaveLength(1)
    expect(chips[2]!.attributes('aria-pressed')).toBe('true')

    // 筛选后批量决策必须带上 kind，否则宿主会把别人的修订一起接受
    const acceptAll = wrapper.findAll('.oj-review__actions button')
    await acceptAll[0]!.trigger('click')
    expect(wrapper.emitted('decide-all')?.[0]).toEqual(['accept', 'delete'])

    wrapper.unmount()
  })

  it('空列表：给空态文案，批量按钮禁用', () => {
    const wrapper = mount(OjReviewPanel, { props: { ...props, changes: [] } })
    expect(wrapper.find('.oj-review__empty').text()).toBe('没有待处理的修订')
    const buttons = wrapper.findAll('.oj-review__actions button')
    expect(buttons[0]!.attributes('disabled')).toBeDefined()
    expect(buttons[1]!.attributes('disabled')).toBeDefined()
    wrapper.unmount()
  })
})
