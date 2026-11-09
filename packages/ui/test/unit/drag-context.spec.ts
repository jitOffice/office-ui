import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'

import { DRAG_MARKER } from '../../src/index.ts'
import { OjDragContext, useOjDragContext } from '../../src/vue/index.ts'

/**
 * `OjDragContext` 的组件契约。
 *
 * 判定逻辑在 `test/drag-context.test.ts` 用 `node --test` 覆盖；这里验：
 * 状态真的挂到 DOM 上、drop 上抛的载荷对不对、文本载荷默认不接管、注入给子组件的状态可用。
 */

interface DragInit {
  types?: string[]
  files?: File[]
  data?: Record<string, string>
  relatedTarget?: EventTarget | null
}

/** 在 window 上派发拖放事件：上下文组件的监听全在 window（拖放没有固定的目标元素）。 */
function drag(type: string, init: DragInit = {}): Event {
  const event = new Event(type, { cancelable: true })
  const store = init.data ?? {}
  Object.assign(event, {
    dataTransfer: {
      types: init.types ?? [],
      files: init.files ?? [],
      dropEffect: 'none',
      getData: (format: string) => store[format] ?? '',
      setData: (format: string, value: string) => {
        store[format] = value
      },
    },
    relatedTarget: init.relatedTarget ?? null,
  })
  window.dispatchEvent(event)
  return event
}

const docx = (name: string): File =>
  new File(['x'], name, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })

const Child = defineComponent({
  name: 'Child',
  setup() {
    const context = useOjDragContext()
    return () =>
      h('span', {
        class: 'child',
        'data-dragging': context?.dragging.value === true ? '' : undefined,
        'data-kind': context?.kind.value,
      })
  },
})

function mountContext(overrides: Record<string, unknown> = {}) {
  return mount(OjDragContext, {
    props: { ...overrides },
    slots: { default: () => h(Child) },
  })
}

describe('OjDragContext', () => {
  it('外部文件：进入时点亮状态与类型，dragover 才允许 drop', async () => {
    const wrapper = mountContext()
    const box = wrapper.find('.oj-drag-context')
    expect(box.attributes('data-dragging')).toBeUndefined()

    drag('dragenter', { types: ['Files'] })
    await wrapper.vm.$nextTick()
    expect(box.attributes('data-dragging')).toBe('')
    expect(box.attributes('data-kind')).toBe('files')
    expect(wrapper.emitted('enter')?.[0]).toEqual(['files'])
    // 子组件通过 inject 读到的也是"正在拖"
    expect(wrapper.find('.child').attributes('data-dragging')).toBe('')

    const over = drag('dragover', { types: ['Files'] })
    expect(over.defaultPrevented).toBe(true)
    wrapper.unmount()
  })

  it('drop 上抛完整载荷并清空拖拽态', async () => {
    const wrapper = mountContext()
    const file = docx('合同.docx')

    drag('dragenter', { types: ['Files'] })
    drag('drop', { types: ['Files'], files: [file] })
    await wrapper.vm.$nextTick()

    const payload = wrapper.emitted('drop')?.[0]?.[0] as { kind: string; files: File[] }
    expect(payload.kind).toBe('files')
    expect(payload.files).toEqual([file])
    expect(wrapper.find('.oj-drag-context').attributes('data-dragging')).toBeUndefined()
    wrapper.unmount()
  })

  it('内部拖拽：靠私有标记识别，不当文件也不当富文本', async () => {
    const wrapper = mountContext({ accept: { text: true } })
    const store = { [DRAG_MARKER]: 'block-7', 'text/html': '<p>一段</p>' }

    const over = drag('dragenter', { types: [DRAG_MARKER, 'text/html'], data: store })
    expect(over.defaultPrevented).toBe(false)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drag-context').attributes('data-kind')).toBe('internal')

    const move = drag('dragover', { types: [DRAG_MARKER, 'text/html'], data: store })
    expect(move.defaultPrevented).toBe(true)
    // 内部拖拽是"移动"，不是复制
    expect((move as unknown as { dataTransfer: { dropEffect: string } }).dataTransfer.dropEffect).toBe('move')

    drag('drop', { types: [DRAG_MARKER, 'text/html'], data: store })
    await wrapper.vm.$nextTick()
    const payload = wrapper.emitted('drop')?.[0]?.[0] as { kind: string; data: string; html: string }
    expect(payload.kind).toBe('internal')
    expect(payload.data).toBe('block-7')
    expect(payload.html).toBe('<p>一段</p>')
    wrapper.unmount()
  })

  it('文本载荷默认不上报，显式开启才给（否则拖选区内文字就变成导入）', async () => {
    const wrapper = mountContext()
    drag('dragenter', { types: ['text/plain'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drag-context').attributes('data-dragging')).toBeUndefined()

    drag('drop', { types: ['text/html', 'text/plain'], data: { 'text/html': '<b>x</b>' } })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('drop')).toBeUndefined()
    wrapper.unmount()

    const text = mountContext({ accept: { text: true } })
    drag('drop', { types: ['text/html', 'text/plain'], data: { 'text/html': '<b>x</b>', 'text/plain': 'x' } })
    await text.vm.$nextTick()
    expect(text.emitted('drop')?.[0]?.[0]).toMatchObject({ kind: 'html', html: '<b>x</b>', text: 'x' })
    text.unmount()
  })

  it('accept 的 MIME 规则能提前挡掉明显不对的拖拽', async () => {
    const wrapper = mountContext({ accept: { types: ['image/*'] } })

    drag('dragenter', { types: ['Files'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drag-context').attributes('data-dragging')).toBeUndefined()

    drag('dragenter', { types: ['Files', 'image/png'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drag-context').attributes('data-dragging')).toBe('')
    wrapper.unmount()
  })

  it('离开窗口时收起状态；子元素之间的进出一进一出相抵', async () => {
    const wrapper = mountContext()
    drag('dragenter', { types: ['Files'] })
    drag('dragenter', { types: ['Files'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drag-context').attributes('data-dragging')).toBe('')

    // 进入子元素再离开：计数回到 1，仍然在拖
    drag('dragleave', { relatedTarget: document.body })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drag-context').attributes('data-dragging')).toBe('')

    // 真正离开窗口（relatedTarget 为 null）：直接把计数清零
    drag('dragleave')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drag-context').attributes('data-dragging')).toBeUndefined()
    // 只有真正"离开"那次才上报，子元素之间相抵的那次不该惊动宿主
    expect(wrapper.emitted('leave')).toHaveLength(1)
    wrapper.unmount()
  })

  it('卸载后不再响应拖放', async () => {
    const wrapper = mountContext()
    wrapper.unmount()
    expect(() => drag('drop', { types: ['Files'], files: [docx('a.docx')] })).not.toThrow()
    expect(document.querySelector('.oj-drag-context')).toBeNull()
  })
})
