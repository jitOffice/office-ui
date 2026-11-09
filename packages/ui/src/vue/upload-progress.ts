import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import { uploadPercent, uploadSummary } from '../shell/upload.ts'
import type { UploadItem, UploadState } from '../shell/upload.ts'

/**
 * `OjUploadProgress`（03 §3 F 组）：分片上传的进度列表，带暂停 / 续传 / 失败重试。
 *
 * 三种动作按状态各只出一个按钮，**不做"能用不能用"的灰按钮**：上传中给"暂停"、
 * 已暂停给"续传"、失败给"重试"。灰着的按钮点击无反应，用户只会反复点。
 *
 * 进度条用 `role="progressbar"` + `aria-valuenow`，失败项额外把原因写在下面：
 * 只画一根红条不说明原因，用户唯一能做的就是再点一次重试。
 *
 * 状态文案由宿主给（`statusLabels`）：组件不拼"正在上传 3/5"这类句子。
 */
export const OjUploadProgress = defineComponent({
  name: 'OjUploadProgress',
  props: {
    items: { type: Array as PropType<readonly UploadItem[]>, required: true },
    /** 整个列表的可访问名（"上传进度"）。 */
    label: { type: String, required: true },
    pauseLabel: { type: String, required: true },
    resumeLabel: { type: String, required: true },
    retryLabel: { type: String, required: true },
    /** 各状态的中文/译文由宿主给；缺的状态就不显示状态文字。 */
    statusLabels: {
      type: Object as PropType<Readonly<Partial<Record<UploadState, string>>>>,
      default: () => ({}),
    },
    emptyLabel: { type: String, default: '' },
  },
  emits: ['pause', 'resume', 'retry'],
  setup(props, { emit }) {
    function action(item: UploadItem): { label: string; event: 'pause' | 'resume' | 'retry' } | undefined {
      if (item.state === 'uploading') return { label: props.pauseLabel, event: 'pause' }
      if (item.state === 'paused') return { label: props.resumeLabel, event: 'resume' }
      if (item.state === 'failed') return { label: props.retryLabel, event: 'retry' }
      return undefined
    }

    function track(percent: number, name: string): ReturnType<typeof h> {
      const value = Math.round(percent * 100)
      return h(
        'div',
        {
          class: 'oj-upload-progress__track',
          role: 'progressbar',
          'aria-label': name,
          'aria-valuemin': 0,
          'aria-valuemax': 100,
          'aria-valuenow': value,
          'aria-valuetext': `${value}%`,
        },
        [h('div', { class: 'oj-upload-progress__bar', style: { width: `${value}%` } })],
      )
    }

    return () => {
      const summary = uploadSummary(props.items)
      if (props.items.length === 0) {
        return props.emptyLabel === ''
          ? null
          : h('p', { class: 'oj-upload-progress__empty' }, props.emptyLabel)
      }

      const rows = props.items.map((item) => {
        const percent = uploadPercent(item)
        const button = action(item)
        return h(
          'li',
          {
            class: 'oj-upload-progress__item',
            'data-state': item.state,
            key: item.id,
          },
          [
            h('div', { class: 'oj-upload-progress__row' }, [
              h('span', { class: 'oj-upload-progress__name', title: item.name }, item.name),
              h(
                'span',
                {
                  class: 'oj-upload-progress__status',
                  // 进度已经通过 progressbar 播报，状态文字只是补充；不用 live region 反复吵
                  'aria-hidden': 'true',
                },
                props.statusLabels[item.state] ?? '',
              ),
              button === undefined
                ? null
                : h(
                    'button',
                    {
                      type: 'button',
                      class: 'oj-button oj-upload-progress__action',
                      'data-size': 'mini',
                      'data-action': button.event,
                      'aria-label': button.label,
                      onClick: () => emit(button.event, item.id),
                    },
                    button.label,
                  ),
            ]),
            track(percent, item.name),
            item.error === undefined || item.error === ''
              ? null
              : h('p', { class: 'oj-upload-progress__error' }, item.error),
          ],
        )
      })

      const summaryPercent = Math.round(summary.percent * 100)
      return h('section', { class: 'oj-upload-progress', 'aria-label': props.label }, [
        h('div', { class: 'oj-upload-progress__summary' }, [
          h('span', { class: 'oj-upload-progress__count' }, `${summary.done} / ${summary.count}`),
          h('span', { class: 'oj-upload-progress__total' }, `${summaryPercent}%`),
        ]),
        h('ul', { class: 'oj-upload-progress__list', role: 'list' }, rows),
      ])
    }
  },
})
