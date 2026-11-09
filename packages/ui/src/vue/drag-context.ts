import { defineComponent, h, inject, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import type { InjectionKey, PropType, Ref } from 'vue'

import { negotiateTransfer, readTransfer } from '../shell/drag-context.ts'
import type { DragNegotiation, DragPayload, TransferKind } from '../shell/drag-context.ts'

/** 注入给子组件的拖放上下文：只读状态，子组件据此做高亮、插入指示线等。 */
export interface OjDragContextState {
  readonly dragging: Readonly<Ref<boolean>>
  readonly kind: Readonly<Ref<TransferKind | 'none'>>
  /** 内部拖拽的宿主数据（被拖块 id 等）；外部拖入时为空串。 */
  readonly data: Readonly<Ref<string>>
}

export const OJ_DRAG_CONTEXT: InjectionKey<OjDragContextState> = Symbol('oj-drag-context')

/** 子组件读取上下文。没有 `OjDragContext` 包裹时返回 `undefined`，调用方按"不在拖拽"处理。 */
export function useOjDragContext(): OjDragContextState | undefined {
  return inject(OJ_DRAG_CONTEXT)
}

/**
 * `OjDragContext`（03 §3 D 组）：拖放协议的统一入口，区分内部拖拽与外部拖入。
 *
 * 与 `OjDropZone` 的分工：`OjDropZone` 是"整页遮罩 + 文件受理"的成品；
 * 这里是"协议层"——不画遮罩，只判断这次拖拽归谁、是什么载荷，然后上抛。
 * 需要"拖拽高亮 + 内部排序 + 外部文件导入"同屏共存时用这个。
 *
 * 组件本身不产生盒子（`display: contents`）：它套在布局外面，但布局仍由内部的
 * 分栏/网格决定。`data-kind` / `data-dragging` 落在包裹元素上，宿主用属性选择器做高亮。
 */
export const OjDragContext = defineComponent({
  name: 'OjDragContext',
  props: {
    accept: { type: Object as PropType<DragNegotiation>, default: () => ({}) },
    disabled: { type: Boolean, default: false },
  },
  emits: ['enter', 'leave', 'drop'],
  setup(props, { emit, slots }) {
    const dragging = ref(false)
    const kind = ref<TransferKind | 'none'>('none')
    const data = ref('')
    let depth = 0

    provide(OJ_DRAG_CONTEXT, { dragging, kind, data })

    function payloadOf(transfer: DataTransfer): DragPayload<File> {
      return readTransfer({
        types: [...transfer.types],
        files: Array.from(transfer.files),
        getData: (format: string) => transfer.getData(format),
      })
    }

    function reset(): void {
      depth = 0
      dragging.value = false
      kind.value = 'none'
      data.value = ''
    }

    function onDragEnter(event: DragEvent): void {
      if (props.disabled) return
      const types = event.dataTransfer?.types ?? []
      if (!negotiateTransfer(types, props.accept)) return
      depth += 1
      dragging.value = true
      // 拖入阶段拿不到文件名（Chrome 连 files 都是空的），只能先按类型给个大概
      const preview = readTransfer({ types, files: [], getData: () => '' })
      kind.value = preview.kind
      data.value = preview.data
      emit('enter', preview.kind)
    }

    function onDragOver(event: DragEvent): void {
      if (props.disabled || !dragging.value) return
      // 不 preventDefault 就收不到 drop
      event.preventDefault()
      if (event.dataTransfer !== null) {
        event.dataTransfer.dropEffect = kind.value === 'internal' ? 'move' : 'copy'
      }
    }

    function onDragLeave(event: DragEvent): void {
      if (event.relatedTarget === null) {
        reset()
        emit('leave')
        return
      }
      depth = Math.max(0, depth - 1)
      if (depth > 0) return
      dragging.value = false
      kind.value = 'none'
      data.value = ''
      emit('leave')
    }

    function onDrop(event: DragEvent): void {
      if (props.disabled) return
      const transfer = event.dataTransfer
      if (transfer === null) {
        reset()
        return
      }
      if (!negotiateTransfer([...transfer.types], props.accept)) {
        reset()
        return
      }
      event.preventDefault()
      const payload = payloadOf(transfer)
      reset()

      // 文本载荷默认不接管：文档里拖选区内文字是最常见的拖拽，默认上报会把正文搞乱
      if ((payload.kind === 'html' || payload.kind === 'text') && props.accept.text !== true) return
      emit('drop', payload)
    }

    onMounted(() => {
      if (typeof window === 'undefined') return
      window.addEventListener('dragenter', onDragEnter)
      window.addEventListener('dragover', onDragOver)
      window.addEventListener('dragleave', onDragLeave)
      window.addEventListener('drop', onDrop)
      window.addEventListener('dragend', reset)
    })

    onBeforeUnmount(() => {
      if (typeof window === 'undefined') return
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
      window.removeEventListener('dragend', reset)
    })

    return () =>
      h(
        'div',
        {
          class: 'oj-drag-context',
          'data-dragging': dragging.value ? '' : undefined,
          'data-kind': kind.value === 'none' ? undefined : kind.value,
        },
        slots.default?.(),
      )
  },
})
