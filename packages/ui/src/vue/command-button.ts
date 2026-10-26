import { defineComponent, h, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import type { PropType } from 'vue'

import type { OjCommandLike } from '../commands.ts'
import type { OjEditorState } from '../editor-host.ts'
import { OjIcon } from './icon.ts'

export interface OjCommandView {
  label: OjCommandLike['label']
  icon?: string
}

/** 命令按钮要读的那一面。`createCommandRegistry()` 的返回值可以直接传进来。 */
export interface OjCommandButtonSource {
  get(id: string): OjCommandView | undefined
  state(id: string): OjEditorState | undefined
  resolve(message: OjCommandLike['label']): string
  run(id: string, arg?: unknown): Promise<unknown>
  subscribe(id: string, listener: (state: OjEditorState) => void): () => void
}

export const OjCommandButton = defineComponent({
  name: 'OjCommandButton',
  props: {
    source: { type: Object as PropType<OjCommandButtonSource>, required: true },
    id: { type: String, required: true },
    size: { type: String as PropType<'mini' | 'medium'>, default: 'medium' },
  },
  setup(props) {
    const view = shallowRef<OjEditorState>({ enabled: true })
    let stop = (): void => {}

    function bind(): void {
      stop()
      view.value = props.source.state(props.id) ?? { enabled: true }
      stop = props.source.subscribe(props.id, (next) => {
        view.value = next
      })
    }

    onMounted(bind)
    watch(() => props.id, bind)
    onUnmounted(() => stop())

    return () => {
      const command = props.source.get(props.id)
      const state = view.value
      const enabled = state.enabled !== false
      const label = command ? props.source.resolve(command.label) : props.id
      const pressed = typeof state.active === 'boolean' ? String(state.active) : undefined
      return h(
        'button',
        {
          type: 'button',
          class: 'oj-button',
          'data-size': props.size === 'mini' ? 'mini' : undefined,
          'data-active': state.active === true ? '' : undefined,
          'data-command': props.id,
          'aria-pressed': pressed,
          'aria-disabled': enabled ? undefined : 'true',
          onClick: () => {
            if (enabled) void props.source.run(props.id)
          },
        },
        [command?.icon ? h(OjIcon, { name: command.icon, decorative: true }) : null, h('span', { class: 'oj-button__label' }, label)],
      )
    }
  },
})
