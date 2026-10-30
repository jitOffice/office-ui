import { computed, defineComponent, onMounted, onUnmounted, watch } from 'vue'
import type { PropType } from 'vue'

import { detectPlatform, hotkeyConflicts, matchHotkey, parseHotkey } from '../hotkey.ts'
import type { OjHotkeyBinding, OjPlatform } from '../hotkey.ts'

/** dev 环境下同一个冲突只报一次：命令表通常一次注册十几条，刷屏等于没告警。 */
const reported = new Set<string>()

const dev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true

/**
 * `OjHotkey`（03 §3 B 组）：把命令表里的 `keys` 绑到真实键盘事件上。渲染 `null`，
 * 只负责监听、匹配、发事件——执行由使用方交给命令注册表（`registry.run(id)`）。
 *
 * 三条必须在这里做对的语义：
 *   1. **IME 期间不响应**（03 §5 第 7 条）。中日文输入法的合成阶段按 Enter/Esc 是给
 *      输入法的，抢过来就等于在核心场景里让用户打不出字。
 *   2. **`event.defaultPrevented` 之后不再抢**。前一个处理器已经处理过的键（比如浮层里的
 *      `Esc`），快捷键层必须让路。
 *   3. **只发意图，不判断能不能执行**。`enabled` / `when` 属于注册表，它比这一层知道得多。
 */
export const OjHotkey = defineComponent({
  name: 'OjHotkey',
  props: {
    bindings: { type: Array as PropType<readonly OjHotkeyBinding[]>, required: true },
    /** 不给就按运行时平台推断；显式给可以用在"按宿主平台显示/匹配"的场景 */
    platform: { type: String as PropType<OjPlatform | undefined>, default: undefined },
    enabled: { type: Boolean, default: true },
  },
  emits: ['run'],
  setup(props, { emit }) {
    const platform = computed(() => props.platform ?? detectPlatform())

    function keysOf(binding: OjHotkeyBinding): readonly string[] {
      if (binding.keys === undefined) return []
      return typeof binding.keys === 'string' ? [binding.keys] : binding.keys
    }

    function onKeydown(event: KeyboardEvent): void {
      if (!props.enabled || event.defaultPrevented || event.isComposing) return

      for (const binding of props.bindings) {
        for (const key of keysOf(binding)) {
          const spec = parseHotkey(key, platform.value)
          if (spec === undefined || !matchHotkey(spec, event)) continue
          event.preventDefault()
          emit('run', binding.id)
          return
        }
      }
    }

    function warnConflicts(): void {
      if (!dev) return
      for (const conflict of hotkeyConflicts(props.bindings, platform.value)) {
        const key = `${conflict.label}:${conflict.ids.join(',')}`
        if (reported.has(key)) continue
        reported.add(key)
        console.warn(`[OjHotkey] ${conflict.label} 被多个命令占用：${conflict.ids.join(' / ')}`)
      }
    }

    onMounted(() => {
      window.addEventListener('keydown', onKeydown)
      warnConflicts()
    })
    onUnmounted(() => {
      window.removeEventListener('keydown', onKeydown)
    })
    watch(() => [props.bindings, props.platform], warnConflicts)

    return () => null
  },
})
