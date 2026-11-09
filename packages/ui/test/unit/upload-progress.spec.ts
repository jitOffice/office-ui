import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import {
  advanceUpload,
  createUpload,
  failUpload,
  pauseUpload,
  startUpload,
} from '../../src/index.ts'
import type { UploadItem } from '../../src/index.ts'
import { OjUploadProgress } from '../../src/vue/index.ts'

/**
 * `OjUploadProgress` 的组件契约。
 *
 * 状态迁移在 `test/upload.test.ts` 用 `node --test` 覆盖；这里只验：
 * 每种状态出哪个按钮、进度条的读屏值、失败原因真的画出来了。
 */

const LABELS = {
  label: '上传进度',
  pauseLabel: '暂停',
  resumeLabel: '续传',
  retryLabel: '重试',
  statusLabels: { uploading: '上传中', paused: '已暂停', failed: '失败', done: '已完成' },
}

function mountList(items: readonly UploadItem[], overrides: Record<string, unknown> = {}) {
  return mount(OjUploadProgress, { props: { items, ...LABELS, ...overrides } })
}

const uploading = advanceUpload(startUpload(createUpload({ id: 'a', name: '甲.docx', size: 100 })), 25)
const paused = pauseUpload(startUpload(createUpload({ id: 'b', name: '乙.pdf', size: 200 })))
const failed = failUpload(
  advanceUpload(startUpload(createUpload({ id: 'c', name: '丙.png', size: 50 })), 10),
  '网络中断',
)
const done = advanceUpload(startUpload(createUpload({ id: 'd', name: '丁.txt', size: 10 })), 10)

describe('OjUploadProgress', () => {
  it('空列表：可以完全不渲染，也可以给一句空态文案', () => {
    const silent = mount(OjUploadProgress, { props: { items: [], ...LABELS } })
    expect(silent.find('.oj-upload-progress').exists()).toBe(false)
    silent.unmount()

    const empty = mount(OjUploadProgress, { props: { items: [], ...LABELS, emptyLabel: '还没有上传任务' } })
    expect(empty.find('.oj-upload-progress__empty').text()).toBe('还没有上传任务')
    empty.unmount()
  })

  it('逐项渲染进度与状态，动作按钮按状态各出一个', () => {
    const wrapper = mountList([uploading, paused, failed, done])
    const items = wrapper.findAll('.oj-upload-progress__item')
    expect(items.map((item) => item.attributes('data-state'))).toEqual(['uploading', 'paused', 'failed', 'done'])

    const bars = wrapper.findAll('[role="progressbar"]')
    expect(bars.map((bar) => bar.attributes('aria-valuenow'))).toEqual(['25', '0', '20', '100'])
    // 进度条的读屏名就是文件名，否则一列进度条全是"进度"
    expect(bars[0]!.attributes('aria-label')).toBe('甲.docx')
    expect(bars[3]!.find('.oj-upload-progress__bar').attributes('style')).toContain('width: 100%')

    const actions = wrapper.findAll('.oj-upload-progress__action')
    expect(actions.map((button) => button.attributes('data-action'))).toEqual(['pause', 'resume', 'retry'])
    // 已完成的行没有动作按钮：留着只会让用户以为还能操作
    expect(items[3]!.find('.oj-upload-progress__action').exists()).toBe(false)
    wrapper.unmount()
  })

  it('状态文案与失败原因都来自宿主；没给文案就不显示那一段', () => {
    const wrapper = mountList([uploading, paused, failed, done])
    const statuses = wrapper.findAll('.oj-upload-progress__status')
    expect(statuses.map((status) => status.text())).toEqual(['上传中', '已暂停', '失败', '已完成'])

    const errors = wrapper.findAll('.oj-upload-progress__error')
    expect(errors).toHaveLength(1)
    expect(errors[0]!.text()).toBe('网络中断')
    wrapper.unmount()

    const bare = mount(OjUploadProgress, {
      props: { items: [uploading], label: '进度', pauseLabel: '暂停', resumeLabel: '续传', retryLabel: '重试' },
    })
    expect(bare.find('.oj-upload-progress__status').text()).toBe('')
    bare.unmount()
  })

  it('点动作只上抛 id，组件不改状态（受控）', async () => {
    const wrapper = mountList([uploading, paused, failed])
    const actions = wrapper.findAll('.oj-upload-progress__action')

    await actions[0]!.trigger('click')
    await actions[1]!.trigger('click')
    await actions[2]!.trigger('click')

    expect(wrapper.emitted('pause')?.[0]).toEqual(['a'])
    expect(wrapper.emitted('resume')?.[0]).toEqual(['b'])
    expect(wrapper.emitted('retry')?.[0]).toEqual(['c'])
    // 受控：没有 props 变化时状态不会自己跳
    expect(wrapper.findAll('.oj-upload-progress__item')[1]!.attributes('data-state')).toBe('paused')
    wrapper.unmount()
  })

  it('汇总行给完成数与总进度', () => {
    const wrapper = mountList([uploading, paused, failed, done])
    expect(wrapper.find('.oj-upload-progress__count').text()).toBe('1 / 4')
    // 25 + 0 + 10 + 10 = 45 / 360 ≈ 13%
    expect(wrapper.find('.oj-upload-progress__total').text()).toBe('13%')
    wrapper.unmount()
  })
})
