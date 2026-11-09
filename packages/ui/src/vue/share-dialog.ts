import { defineComponent, h } from 'vue'
import type { PropType } from 'vue'

import {
  SHARE_SCOPES,
  resolveShare,
  rolesForScope,
  setShareExpiry,
  setSharePeopleCount,
  setShareRole,
  setShareScope,
} from '../shell/share.ts'
import type { ShareRole, ShareScope, ShareState } from '../shell/share.ts'
import { OjDialog } from './dialog.ts'

export interface ShareExpiryOption {
  readonly days: number
  readonly label: string
}

/**
 * `OjShareDialog`（03 §3 E 组）：共享范围 + 角色 + 链接有效期。
 *
 * 只负责把选择变成 `update:state`，确认时上抛 **归一化后的** `resolveShare(state)`——
 * 也就是真正该发给后端的权限。界面显示"可评论"而请求里发"可编辑"这类事故，
 * 根因就是两处各算一遍；这里只算一次。
 *
 * 范围切换时角色会降级（链接范围不给"可编辑"，见 `shell/share.ts`）：
 * 降级发生在 `update:state` 里，不是渲染时偷偷改，宿主存下来的状态与界面永远一致。
 */
export const OjShareDialog = defineComponent({
  name: 'OjShareDialog',
  props: {
    open: { type: Boolean, required: true },
    title: { type: String, required: true },
    state: { type: Object as PropType<ShareState>, required: true },
    /** "谁可以访问"分组名。 */
    scopeLabel: { type: String, required: true },
    /** "权限"分组名。 */
    roleLabel: { type: String, required: true },
    scopeLabels: { type: Object as PropType<Record<ShareScope, string>>, required: true },
    roleLabels: { type: Object as PropType<Record<ShareRole, string>>, required: true },
    expiryLabel: { type: String, default: '' },
    expiryOptions: { type: Array as PropType<readonly ShareExpiryOption[]>, default: () => [] },
    peopleLabel: { type: String, default: '' },
    confirmLabel: { type: String, default: '' },
    cancelLabel: { type: String, default: '' },
    teleport: { type: [String, Boolean], default: 'body' },
  },
  emits: ['update:open', 'update:state', 'confirm', 'cancel'],
  setup(props, { emit }) {
    function option(scope: ShareScope): ReturnType<typeof h> {
      const active = props.state.scope === scope
      return h(
        'label',
        { class: 'oj-share__option', 'data-active': active ? '' : undefined },
        [
          h('input', {
            class: 'oj-share__radio',
            type: 'radio',
            name: 'oj-share-scope',
            value: scope,
            checked: active,
            onChange: () => emit('update:state', setShareScope(props.state, scope)),
          }),
          h('span', { class: 'oj-share__option-text' }, props.scopeLabels[scope]),
        ],
      )
    }

    function role(role: ShareRole): ReturnType<typeof h> {
      const active = props.state.role === role
      return h(
        'label',
        { class: 'oj-share__option', 'data-active': active ? '' : undefined },
        [
          h('input', {
            class: 'oj-share__radio',
            type: 'radio',
            name: 'oj-share-role',
            value: role,
            checked: active,
            onChange: () => emit('update:state', setShareRole(props.state, role)),
          }),
          h('span', { class: 'oj-share__option-text' }, props.roleLabels[role]),
        ],
      )
    }

    return () => {
      const roles = rolesForScope(props.state.scope)
      const body: ReturnType<typeof h>[] = [
        h('fieldset', { class: 'oj-share__group' }, [
          h('legend', { class: 'oj-share__legend' }, props.scopeLabel),
          ...SHARE_SCOPES.map(option),
        ]),
      ]

      // private 没有角色可选：画一组全灰的单选只会让用户以为漏点了什么
      if (roles.length > 0) {
        body.push(
          h('fieldset', { class: 'oj-share__group' }, [
            h('legend', { class: 'oj-share__legend' }, props.roleLabel),
            ...roles.map(role),
          ]),
        )
      }

      if (props.state.scope === 'link' && props.expiryOptions.length > 0) {
        body.push(
          h('label', { class: 'oj-share__field' }, [
            h('span', { class: 'oj-share__field-label' }, props.expiryLabel),
            h(
              'select',
              {
                class: 'oj-share__select',
                value: String(props.state.expiryDays),
                onChange: (event: Event) =>
                  emit('update:state', setShareExpiry(props.state, Number((event.target as HTMLSelectElement).value))),
              },
              props.expiryOptions.map((choice) =>
                h('option', { value: String(choice.days), selected: choice.days === props.state.expiryDays }, choice.label),
              ),
            ),
          ]),
        )
      }

      if (props.state.scope === 'people' && props.peopleLabel !== '') {
        body.push(
          h('label', { class: 'oj-share__field' }, [
            h('span', { class: 'oj-share__field-label' }, props.peopleLabel),
            h('input', {
              class: 'oj-share__count',
              type: 'number',
              min: 0,
              value: String(props.state.peopleCount),
              onChange: (event: Event) =>
                emit('update:state', setSharePeopleCount(props.state, Number((event.target as HTMLInputElement).value))),
            }),
          ]),
        )
      }

      return h(
        OjDialog,
        {
          open: props.open,
          title: props.title,
          confirmLabel: props.confirmLabel,
          cancelLabel: props.cancelLabel,
          teleport: props.teleport,
          onConfirm: () => emit('confirm', resolveShare(props.state)),
          onCancel: () => emit('cancel'),
          'onUpdate:open': (open: boolean) => emit('update:open', open),
        },
        { default: () => h('div', { class: 'oj-share' }, body) },
      )
    }
  },
})
