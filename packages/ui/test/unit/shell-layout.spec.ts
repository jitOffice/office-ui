import { mount } from '@vue/test-utils'
import { h } from 'vue'
import { describe, expect, it } from 'vitest'

import { OjDropZone, OjPaneGroup, OjSplitter } from '../../src/vue/index.ts'

/**
 * `OjSplitter` / `OjDropZone` 的组件契约。
 *
 * 算法（夹取、步进、折叠阈值、受理优先级）在 `test/shell-layout.test.ts` 用 `node --test` 覆盖；
 * 这里只断言"接线接对了"：事件名与实参、ARIA 属性、受控不变量，
 * 以及拖放最容易被忽略的那条——**拒绝要出现在界面上**，而不是静默什么都不发生。
 */

// happy-dom 没有实现指针捕获：补一个 no-op，否则 pointerdown 会抛在捕获这一步
if (typeof Element.prototype.setPointerCapture !== 'function') {
  Object.defineProperty(Element.prototype, 'setPointerCapture', { value: () => undefined, configurable: true })
}

function pointer(element: Element, type: string, x: number, y = 0): void {
  const event = new Event(type)
  Object.assign(event, { clientX: x, clientY: y, pointerId: 1, button: 0 })
  element.dispatchEvent(event)
}

interface DragInit {
  types?: string[]
  files?: File[]
  data?: Record<string, string>
}

/** 在 window 上派发一次拖放事件：组件的监听全在 window（drop 的目标是文档区，不是包裹层）。 */
function drag(type: string, init: DragInit = {}): Event {
  const event = new Event(type, { cancelable: true })
  Object.assign(event, {
    dataTransfer: {
      types: init.types ?? [],
      files: init.files ?? [],
      dropEffect: 'none',
      getData: (format: string) => init.data?.[format] ?? '',
    },
  })
  window.dispatchEvent(event)
  return event
}

const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const docx = (name: string): File => new File(['x'], name, { type: DOCX_TYPE })

describe('OjSplitter', () => {
  it('暴露 separator 语义：方向、当前值与上下界都能被读屏读到', () => {
    const wrapper = mount(OjSplitter, {
      props: { size: 240, min: 160, max: 400, label: '调整批注栏宽度' },
    })
    const splitter = wrapper.find('.oj-splitter')
    expect(splitter.attributes('role')).toBe('separator')
    expect(splitter.attributes('aria-orientation')).toBe('vertical')
    expect(splitter.attributes('aria-valuenow')).toBe('240')
    expect(splitter.attributes('aria-valuemin')).toBe('160')
    expect(splitter.attributes('aria-valuemax')).toBe('400')
    expect(splitter.attributes('aria-label')).toBe('调整批注栏宽度')
    wrapper.unmount()
  })

  it('拖拽：向左拖让右栏变宽，位移取反后上抛，松开时给最终值', async () => {
    const wrapper = mount(OjSplitter, { props: { size: 240, min: 160, max: 400, label: '宽度' } })
    const splitter = wrapper.find('.oj-splitter').element

    pointer(splitter, 'pointerdown', 300)
    expect(wrapper.emitted('drag-start')).toHaveLength(1)

    pointer(splitter, 'pointermove', 260)
    await wrapper.vm.$nextTick()
    // 往左 40px = 右栏宽 40px
    expect(wrapper.emitted('update:size')?.[0]).toEqual([280])

    pointer(splitter, 'pointermove', 260)
    await wrapper.vm.$nextTick()
    // 同一个位置不重复上抛：拖拽期间几十个 move 事件不该打断宿主合帧
    expect(wrapper.emitted('update:size')).toHaveLength(1)

    pointer(splitter, 'pointermove', 800)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:size')?.[1]).toEqual([160])

    pointer(splitter, 'pointerup', 800)
    expect(wrapper.emitted('drag-end')?.[0]).toEqual([160])
    wrapper.unmount()
  })

  it('键盘：方向键移动的是分隔条本身，Home/End 到两端，Enter 折叠', async () => {
    const wrapper = mount(OjSplitter, { props: { size: 240, min: 160, max: 400, label: '宽度' } })
    const splitter = wrapper.find('.oj-splitter')

    // 受控：每一步都模拟宿主把新值写回 prop
    await splitter.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:size')?.[0]).toEqual([224])
    await wrapper.setProps({ size: 224 })

    await splitter.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:size')?.[1]).toEqual([240])
    await wrapper.setProps({ size: 240 })

    await splitter.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:size')?.[2]).toEqual([160])
    await wrapper.setProps({ size: 160 })

    await splitter.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:size')?.[3]).toEqual([400])
    await wrapper.setProps({ size: 400 })

    // 不可折叠时 Enter 不该把栏宽变成 0，也不该重复上抛同一个值
    await splitter.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:size')).toHaveLength(4)
    wrapper.unmount()

    const collapsible = mount(OjSplitter, {
      props: { size: 240, min: 160, max: 400, collapsible: true, label: '宽度' },
    })
    await collapsible.find('.oj-splitter').trigger('keydown', { key: 'Enter' })
    expect(collapsible.emitted('update:size')?.[0]).toEqual([0])

    // 折叠后双击是"展开"：组件不存历史宽度，回到 min
    await collapsible.setProps({ size: 0 })
    await collapsible.find('.oj-splitter').trigger('dblclick')
    expect(collapsible.emitted('update:size')?.[1]).toEqual([160])
    collapsible.unmount()
  })

  it('横向分栏走 clientY，且禁用后完全不出事件', async () => {
    const wrapper = mount(OjSplitter, {
      props: { size: 200, min: 100, max: 300, orientation: 'horizontal', label: '高度' },
    })
    expect(wrapper.find('.oj-splitter').attributes('aria-orientation')).toBe('horizontal')

    const splitter = wrapper.find('.oj-splitter').element
    pointer(splitter, 'pointerdown', 0, 100)
    pointer(splitter, 'pointermove', 0, 60)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:size')?.[0]).toEqual([240])
    wrapper.unmount()

    const disabled = mount(OjSplitter, { props: { size: 200, disabled: true, label: '高度' } })
    const el = disabled.find('.oj-splitter')
    expect(el.attributes('aria-disabled')).toBe('true')
    expect(el.attributes('tabindex')).toBe('-1')
    pointer(el.element, 'pointerdown', 0, 100)
    pointer(el.element, 'pointermove', 0, 60)
    await disabled.vm.$nextTick()
    await el.trigger('keydown', { key: 'ArrowLeft' })
    expect(disabled.emitted('update:size')).toBeUndefined()
    expect(disabled.emitted('drag-start')).toBeUndefined()
    disabled.unmount()
  })
})

describe('OjPaneGroup', () => {
  const PANES = [
    { id: 'outline', size: 240, min: 160, collapsible: true, label: '调整大纲栏宽度' },
    { id: 'doc', size: 0, flexible: true, min: 320 },
    { id: 'comments', size: 320, min: 240, max: 560, collapsible: true, label: '调整批注栏宽度' },
  ]

  function mountGroup(overrides: Record<string, unknown> = {}) {
    return mount(OjPaneGroup, {
      props: { panes: PANES, label: '调整分栏宽度', ...overrides },
      slots: {
        outline: () => h('p', { class: 'slot-outline' }, '大纲'),
        doc: () => h('p', { class: 'slot-doc' }, '正文'),
        comments: () => h('p', { class: 'slot-comments' }, '批注'),
      },
    })
  }

  it('按声明渲染三栏与两根条子，尺寸只落在固定栏上', () => {
    const wrapper = mountGroup()
    const panes = wrapper.findAll('.oj-pane-group__pane')
    expect(panes.map((pane) => pane.attributes('data-pane'))).toEqual(['outline', 'doc', 'comments'])

    // 命名插槽各归各栏：默认插槽会把同一段内容重复画进三栏
    expect(wrapper.find('.slot-outline').text()).toBe('大纲')
    expect(wrapper.find('.slot-doc').text()).toBe('正文')

    expect((panes[0]!.element as HTMLElement).style.width).toBe('240px')
    // 可伸缩栏不写死宽度，否则窗口一变就被顶出容器
    expect((panes[1]!.element as HTMLElement).style.width).toBe('')
    expect((panes[1]!.element as HTMLElement).style.flex).toContain('1 1 0')

    const splitters = wrapper.findAll('.oj-splitter')
    expect(splitters).toHaveLength(2)
    // 左条子调的是"之前"那一栏（大纲），右条子调"之后"那一栏（批注）
    expect(splitters[0]!.attributes('data-pane')).toBe('before')
    expect(splitters[0]!.attributes('aria-label')).toBe('调整大纲栏宽度')
    expect(splitters[1]!.attributes('data-pane')).toBe('after')
    wrapper.unmount()
  })

  it('拖拽与键盘都带栏位 id 上抛：左栏向右放宽、右栏向左放宽', async () => {
    const wrapper = mountGroup()
    const splitters = wrapper.findAll('.oj-splitter')

    pointer(splitters[0]!.element, 'pointerdown', 200)
    pointer(splitters[0]!.element, 'pointermove', 240)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:size')?.[0]).toEqual(['outline', 280])

    pointer(splitters[1]!.element, 'pointerdown', 400)
    pointer(splitters[1]!.element, 'pointermove', 360)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:size')?.[1]).toEqual(['comments', 360])

    // 方向键移动条子：→ 让左栏变宽，← 让右栏变宽
    await splitters[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:size')?.[2]).toEqual(['outline', 256])
    await splitters[1]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:size')?.[3]).toEqual(['comments', 336])
    wrapper.unmount()
  })

  it('不能拖的栏与两侧都可伸缩的组合都不画条子', () => {
    const fixed = mount(OjPaneGroup, {
      props: {
        panes: [
          { id: 'a', size: 200, resizable: false },
          { id: 'b', size: 0, flexible: true },
        ],
        label: '宽度',
      },
    })
    expect(fixed.findAll('.oj-pane-group__pane')).toHaveLength(2)
    expect(fixed.findAll('.oj-splitter')).toHaveLength(0)
    fixed.unmount()

    const both = mount(OjPaneGroup, {
      props: {
        panes: [
          { id: 'a', size: 0, flexible: true },
          { id: 'b', size: 0, flexible: true },
        ],
        label: '宽度',
      },
    })
    expect(both.findAll('.oj-splitter')).toHaveLength(0)
    both.unmount()
  })

  it('横向分栏沿高度排布，折叠栏带标记', () => {
    const wrapper = mountGroup({
      orientation: 'horizontal',
      panes: [
        { id: 'top', size: 120, collapsible: true },
        { id: 'bottom', size: 0, flexible: true },
        { id: 'closed', size: 0 },
      ],
    })
    expect(wrapper.find('.oj-pane-group').attributes('data-orientation')).toBe('horizontal')
    const panes = wrapper.findAll('.oj-pane-group__pane')
    expect((panes[0]!.element as HTMLElement).style.height).toBe('120px')
    expect(panes[2]!.attributes('data-collapsed')).toBe('')
    wrapper.unmount()
  })
})

describe('OjDropZone', () => {
  const baseProps = {
    accept: { types: ['.docx'] },
    title: '松开以导入',
    hint: '支持 .docx',
    rejectLabels: { type: '这个格式不支持', count: '一次只能传一个' },
  }

  it('整页遮罩按 dragenter / dragleave 计数进出，不在子元素之间闪', async () => {
    const wrapper = mount(OjDropZone, { props: baseProps })
    expect(wrapper.find('.oj-drop-zone__overlay').exists()).toBe(false)

    drag('dragenter', { types: ['Files'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drop-zone__overlay').exists()).toBe(true)
    expect(wrapper.find('.oj-drop-zone__title').text()).toBe('松开以导入')
    expect(wrapper.find('.oj-drop-zone__hint').text()).toBe('支持 .docx')

    // 进入子元素：第二次 enter 与一次 leave 相抵，遮罩必须仍然在
    drag('dragenter', { types: ['Files'] })
    drag('dragleave')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drop-zone__overlay').exists()).toBe(true)

    drag('dragleave')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drop-zone__overlay').exists()).toBe(false)

    // 只有 dragover、没有 dragenter 的来源（跨窗口 / 部分 Linux 文件管理器）：
    // 不 preventDefault 就收不到 drop，所以这里必须同时点亮遮罩并吞掉默认行为
    const over = drag('dragover', { types: ['Files'] })
    await wrapper.vm.$nextTick()
    expect(over.defaultPrevented).toBe(true)
    expect(wrapper.find('.oj-drop-zone__overlay').exists()).toBe(true)
    wrapper.unmount()
  })

  it('受理通过：把原始 File 交回宿主，遮罩收起', async () => {
    const wrapper = mount(OjDropZone, { props: baseProps })
    const file = docx('合同.docx')

    drag('dragenter', { types: ['Files'] })
    drag('drop', { types: ['Files'], files: [file] })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('files')?.[0]).toEqual([[file]])
    expect(wrapper.emitted('reject')).toBeUndefined()
    expect(wrapper.find('.oj-drop-zone__overlay').exists()).toBe(false)
    wrapper.unmount()
  })

  it('格式不支持：拒绝要说得出原因，且不能让文件静默消失', async () => {
    const wrapper = mount(OjDropZone, { props: baseProps })
    const exe = new File(['x'], 'setup.exe', { type: 'application/x-msdownload' })

    drag('drop', { types: ['Files'], files: [exe] })
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('files')).toBeUndefined()
    expect(wrapper.emitted('reject')?.[0]).toEqual(['type'])
    expect(wrapper.find('.oj-drop-zone__message').text()).toBe('这个格式不支持')

    // 成功导入后旧提示必须撤掉：否则"已导入"和"格式不支持"会同时挂在界面上
    drag('drop', { types: ['Files'], files: [docx('合同.docx')] })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drop-zone__message').exists()).toBe(false)
    wrapper.unmount()
  })

  it('只收一个：多出来的按数量拒绝，不冒充格式错误', async () => {
    const wrapper = mount(OjDropZone, { props: { ...baseProps, accept: { types: ['.docx'], multiple: false } } })
    drag('drop', { types: ['Files'], files: [docx('a.docx'), docx('b.docx')] })
    await wrapper.vm.$nextTick()

    expect((wrapper.emitted('files')?.[0]?.[0] as File[]).map((file) => file.name)).toEqual(['a.docx'])
    expect(wrapper.emitted('reject')?.[0]).toEqual(['count'])
    expect(wrapper.find('.oj-drop-zone__message').text()).toBe('一次只能传一个')
    wrapper.unmount()
  })

  it('粘贴只接管带文件的剪贴板，纯文本粘贴留给宿主', async () => {
    // 粘贴图片的前提是这一栏收图片：受理规则对拖入与粘贴一视同仁
    const wrapper = mount(OjDropZone, { props: { ...baseProps, accept: { types: ['image/*'] } } })
    const shot = new File(['x'], 'shot.png', { type: 'image/png' })

    const image = new Event('paste', { cancelable: true })
    Object.assign(image, { clipboardData: { files: [shot] } })
    window.dispatchEvent(image)
    await wrapper.vm.$nextTick()

    expect(image.defaultPrevented).toBe(true)
    expect(wrapper.emitted('files')?.[0]).toEqual([[shot]])

    const text = new Event('paste', { cancelable: true })
    Object.assign(text, { clipboardData: { files: [] } })
    window.dispatchEvent(text)
    await wrapper.vm.$nextTick()

    // 抢掉纯文本粘贴 = 编辑器里连文字都贴不进来
    expect(text.defaultPrevented).toBe(false)
    expect(wrapper.emitted('files')).toHaveLength(1)
    wrapper.unmount()
  })

  it('文本载荷默认不接管：拖选区内文字不该弹出导入遮罩', async () => {
    const wrapper = mount(OjDropZone, { props: baseProps })
    drag('dragenter', { types: ['text/html', 'text/plain'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.oj-drop-zone__overlay').exists()).toBe(false)

    drag('drop', { types: ['text/html', 'text/plain'], data: { 'text/html': '<b>x</b>', 'text/plain': 'x' } })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('insert')).toBeUndefined()
    wrapper.unmount()

    const textZone = mount(OjDropZone, { props: { ...baseProps, textPayload: true } })
    drag('dragenter', { types: ['text/html', 'text/plain'] })
    await textZone.vm.$nextTick()
    expect(textZone.find('.oj-drop-zone__overlay').exists()).toBe(true)

    drag('drop', { types: ['text/html', 'text/plain'], data: { 'text/html': '<b>x</b>', 'text/plain': 'x' } })
    await textZone.vm.$nextTick()
    expect(textZone.emitted('insert')?.[0]).toEqual([{ html: '<b>x</b>', text: 'x' }])
    textZone.unmount()
  })

  it('文件选择框带上 accept / multiple，选完清空以便选同一个文件', async () => {
    const wrapper = mount(OjDropZone, { props: baseProps })
    const input = wrapper.find('.oj-drop-zone__input')
    expect(input.attributes('accept')).toBe('.docx')
    expect(input.attributes('multiple')).toBe('')

    const file = docx('合同.docx')
    Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
    await input.trigger('change')

    expect(wrapper.emitted('files')?.[0]).toEqual([[file]])
    expect((input.element as HTMLInputElement).value).toBe('')
    wrapper.unmount()
  })

  it('卸载后监听全部摘掉：不会继续抢下一次拖放', async () => {
    const wrapper = mount(OjDropZone, { props: baseProps })
    wrapper.unmount()
    // 断言"可观测的事实"而不是 VTU 的 emitted（unmount 会清空记录，那样的断言永远绿）
    expect(() => drag('drop', { types: ['Files'], files: [docx('a.docx')] })).not.toThrow()
    expect(document.querySelector('.oj-drop-zone__overlay')).toBeNull()
  })
})
