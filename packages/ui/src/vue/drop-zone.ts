import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import type { PropType } from 'vue'

import { classifyTransfer, selectDropped } from '../shell/drop-zone.ts'
import type { DropAccept, DropRejection, DroppedFile } from '../shell/drop-zone.ts'

/** 受理通过的文件：`DroppedFile` 的字段供判定，`file` 原样交回宿主去上传。 */
export interface OjDroppedFile extends DroppedFile {
  readonly file: File
}

/** 非文件载荷（富文本导入 / 纯文本插入）。取不到的那一项为空串。 */
export interface OjTextPayload {
  readonly html: string
  readonly text: string
}

const EMPTY_LABELS: Readonly<Partial<Record<DropRejection, string>>> = {}

/**
 * `OjDropZone`（03 §3 F 组）：拖放导入 + 整页遮罩 + 类型校验 + 多文件 + 粘贴图片。
 *
 * 三个"不做就会错"的点：
 *   - **按 `DataTransfer.types` 分支**（03 §8.9）。文件、`text/html`、`text/plain` 是三种载荷，
 *     不分支会把"从网页拖一段文字"判成"格式不支持的文件"，提示方向完全相反。
 *     文本分支默认关闭（`textPayload`），否则拖选区内文字也会弹出导入遮罩。
 *   - **整页遮罩用计数器进出**。`dragenter` / `dragleave` 在子元素间移动时会成对触发，
 *     只看单个事件会让遮罩疯狂闪；只有计数归零（或 `relatedTarget === null` 离开窗口）才收起。
 *   - **拒绝要说出原因**。`type`（格式不支持）与 `count`（一次只能一个）是两句话，
 *     混成"导入失败"会让用户改错方向。
 *
 * 全页监听而不是只监听根元素：文档编辑器的拖放目标是画布/文档区，不是这个包裹层；
 * 遮罩本身 `pointer-events: none`，不会挡住 `drop`。代价要写在明面上——**一个页面只应有的一个实例**：
 * 同页挂两个会各自收到同一次 drop / paste（需要区分时由宿主拆页面，或把整个应用包进一个实例）。
 */
export const OjDropZone = defineComponent({
  name: 'OjDropZone',
  props: {
    accept: { type: Object as PropType<DropAccept>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
    /** 遮罩主文案（"松开以导入"）。 */
    title: { type: String, required: true },
    /** 遮罩副文案（"支持 .docx / .pdf，最多 5 个"），由宿主拼好。 */
    hint: { type: String, default: '' },
    /** 打开文件选择框的按钮文案；留空则不出现按钮。 */
    browseLabel: { type: String, default: '' },
    /** 两类拒绝的原因文案，按种类给（组件不拼句子）。 */
    rejectLabels: {
      type: Object as PropType<Readonly<Partial<Record<DropRejection, string>>>>,
      default: () => EMPTY_LABELS,
    },
    /** 拒绝提示保留多久（ms）；`0` 表示留到下一次成功导入。 */
    messageDuration: { type: Number, default: 4000 },
    /** 是否接管 `text/html` / `text/plain` 拖放（富文本导入、纯文本插入）。 */
    textPayload: { type: Boolean, default: false },
  },
  emits: ['files', 'reject', 'insert'],
  setup(props, { emit, slots }) {
    const active = ref(false)
    const message = ref('')
    const input = ref<HTMLInputElement | null>(null)

    let depth = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    function clearTimer(): void {
      if (timer === undefined) return
      clearTimeout(timer)
      timer = undefined
    }

    function arm(): void {
      clearTimer()
      if (props.messageDuration <= 0) return
      timer = setTimeout(() => {
        message.value = ''
        timer = undefined
      }, props.messageDuration)
    }

    function reject(reason: DropRejection): void {
      const text = props.rejectLabels[reason] ?? ''
      // 文案留空也要上抛：宿主可能用 toast 而不是行内提示
      message.value = text
      arm()
      emit('reject', reason)
    }

    function deliver(files: readonly File[]): void {
      const candidates: OjDroppedFile[] = files.map((file) => ({ name: file.name, type: file.type, file }))
      const selection = selectDropped(candidates, props.accept)

      if (selection.accepted.length > 0) {
        message.value = ''
        clearTimer()
        emit(
          'files',
          selection.accepted.map((entry) => entry.file),
        )
      }
      if (selection.rejected !== undefined) reject(selection.rejected)
    }

    /** 这一次拖放要不要接管：文件总是接管；文本只在显式开启时接管。 */
    function interested(types: readonly string[]): boolean {
      const kind = classifyTransfer(types)
      if (kind === 'files') return true
      return props.textPayload && kind !== 'none'
    }

    function reset(): void {
      depth = 0
      active.value = false
    }

    function onDragEnter(event: DragEvent): void {
      if (props.disabled) return
      if (!interested(event.dataTransfer?.types ?? [])) return
      depth += 1
      active.value = true
    }

    function onDragOver(event: DragEvent): void {
      if (props.disabled) return
      if (!active.value) {
        // 少数来源（跨窗口拖拽、部分 Linux 文件管理器）只给 dragover 不给 dragenter：
        // 此时若直接 return，dragover 没被 preventDefault，drop 根本不会触发
        if (!interested(event.dataTransfer?.types ?? [])) return
        depth = 1
        active.value = true
      }
      // 不 preventDefault 就收不到 drop：浏览器会把文件当成"用新页面打开它"
      event.preventDefault()
      if (event.dataTransfer !== null) event.dataTransfer.dropEffect = 'copy'
    }

    function onDragLeave(event: DragEvent): void {
      // 离开窗口时 relatedTarget 为 null：此时子元素之间的 leave 已无意义，直接收起
      if (event.relatedTarget === null) {
        reset()
        return
      }
      depth = Math.max(0, depth - 1)
      if (depth === 0) active.value = false
    }

    function onDrop(event: DragEvent): void {
      reset()
      if (props.disabled) return
      const transfer = event.dataTransfer
      if (transfer === null) return
      const kind = classifyTransfer(transfer.types)
      if (kind === 'none') return

      event.preventDefault()

      if (kind === 'files') {
        deliver(Array.from(transfer.files))
        return
      }
      if (!props.textPayload) return

      const payload: OjTextPayload = {
        html: transfer.getData('text/html'),
        text: transfer.getData('text/plain'),
      }
      if (payload.html === '' && payload.text === '') return
      emit('insert', payload)
    }

    /** 粘贴只接管带文件的剪贴板（截图、复制的图片）；纯文本必须原样留给宿主。 */
    function onPaste(event: ClipboardEvent): void {
      if (props.disabled) return
      const files = event.clipboardData?.files
      if (files === undefined || files.length === 0) return
      event.preventDefault()
      deliver(Array.from(files))
    }

    function onPick(event: Event): void {
      const element = event.target as HTMLInputElement
      const files = element.files
      if (files !== null && files.length > 0) deliver(Array.from(files))
      // 清空 value：否则第二次选同一个文件不会触发 change，"重试"就永远没反应
      element.value = ''
    }

    const acceptAttribute = computed(() => (props.accept.types ?? []).join(','))
    const multiple = computed(() => props.accept.multiple !== false)

    onMounted(() => {
      if (typeof window === 'undefined') return
      window.addEventListener('dragenter', onDragEnter)
      window.addEventListener('dragover', onDragOver)
      window.addEventListener('dragleave', onDragLeave)
      window.addEventListener('drop', onDrop)
      window.addEventListener('dragend', reset)
      window.addEventListener('paste', onPaste)
    })

    onBeforeUnmount(() => {
      if (typeof window === 'undefined') return
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
      window.removeEventListener('dragend', reset)
      window.removeEventListener('paste', onPaste)
      clearTimer()
    })

    return () =>
      h(
        'div',
        {
          class: 'oj-drop-zone',
          'data-active': active.value ? '' : undefined,
          'data-disabled': props.disabled ? '' : undefined,
        },
        [
          h('div', { class: 'oj-drop-zone__body' }, slots.default?.()),
          props.browseLabel === ''
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  class: 'oj-button oj-drop-zone__browse',
                  'data-size': 'mini',
                  disabled: props.disabled,
                  onClick: () => input.value?.click(),
                },
                props.browseLabel,
              ),
          h('input', {
            ref: input,
            class: 'oj-drop-zone__input',
            type: 'file',
            tabindex: -1,
            'aria-hidden': 'true',
            accept: acceptAttribute.value === '' ? undefined : acceptAttribute.value,
            multiple: multiple.value ? '' : undefined,
            onChange: onPick,
          }),
          message.value === ''
            ? null
            : h('p', { class: 'oj-drop-zone__message', role: 'status' }, message.value),
          active.value
            ? h('div', { class: 'oj-drop-zone__overlay' }, [
                h('div', { class: 'oj-drop-zone__card' }, [
                  h('strong', { class: 'oj-drop-zone__title' }, props.title),
                  props.hint === '' ? null : h('span', { class: 'oj-drop-zone__hint' }, props.hint),
                ]),
              ])
            : null,
        ],
      )
  },
})
