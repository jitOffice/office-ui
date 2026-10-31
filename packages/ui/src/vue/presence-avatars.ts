import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import { avatarTone, initialsOf, stackPeople } from '../shell/people.ts'
import type { OjPerson } from '../shell/people.ts'

/**
 * `OjPresenceAvatars`（03 §3 E 组）：协同在场头像堆叠。
 *
 * 三个决定：
 *   1. **颜色与首字母由 `id` 与姓名派生**，不接受外部传色板：同一人在批注区和标题栏必须是同一个颜色，
 *      允许外部指定就一定有两处不一致的那天。
 *   2. **"还有 N 人"是按钮而不是一段文字**：它是唯一能展开完整名单的入口，
 *      做成 `<span>` 就等于这批人永远看不到（03 §5 的可达性底线）。
 *   3. **堆叠数由 `max` 决定，不做 CSS 自动折行**：折行会让参与人数改变标题栏高度，
 *      标题栏一抖，下面的文档就跟着跳。
 */
export const OjPresenceAvatars = defineComponent({
  name: 'OjPresenceAvatars',
  props: {
    people: { type: Array as PropType<readonly OjPerson[]>, required: true },
    /** 最多显示几格（含"更多"按钮）。给 0 表示这个位置放不下，整组不画。 */
    max: { type: Number, default: 5 },
    /** 整组的可访问名（"当前在线的协作者"）。 */
    label: { type: String, required: true },
    /** 已格式化的"还有 N 人"文案；不给时按钮上只显示 `+N`。 */
    overflowLabel: { type: String, default: '' },
    /** 溢出按钮的提示（"查看全部协作者"）。 */
    overflowTitle: { type: String, default: '' },
  },
  emits: ['select', 'overflow'],
  setup(props, { emit }) {
    return () => {
      // `max <= 0` = 这个位置放不下：整组不画，而不是画一个点不开的"更多"
      if (!(props.max > 0)) return null
      const stacked = stackPeople(props.people, props.max)
      if (stacked.visible.length === 0 && stacked.overflow === 0) return null
      const overflow = stacked.overflow

      return h('div', { class: 'oj-presence', role: 'group', 'aria-label': props.label }, [
        ...stacked.visible.map((person) =>
          h(
            'button',
            {
              key: person.id,
              type: 'button',
              class: 'oj-presence__avatar oj-avatar',
              'data-tone': String(avatarTone(person)),
              title: person.name,
              'aria-label': person.name,
              onClick: () => emit('select', person.id),
            },
            initialsOf(person.name),
          ),
        ),
        overflow > 0
          ? h(
              'button',
              {
                type: 'button',
                class: 'oj-presence__more',
                title: props.overflowTitle === '' ? props.overflowLabel : props.overflowTitle,
                'aria-label': props.overflowLabel === '' ? `+${overflow}` : props.overflowLabel,
                onClick: () => emit('overflow'),
              },
              props.overflowLabel === '' ? `+${overflow}` : props.overflowLabel,
            )
          : null,
      ])
    }
  },
})
