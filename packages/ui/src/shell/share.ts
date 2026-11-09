/**
 * 共享权限模型（03 §3 E 组 `OjShareDialog`）。
 *
 * 这里只做一件容易被做错的事：**决定"实际发出去的是什么权限"**。
 *
 * 界面上的选择组合不都是合法的：`private` 没有角色，`link` 不该给"可编辑"（拿到链接就能改），
 * 有效期只对链接有意义。把归一化放进组件，就会出现"界面上选了可编辑、请求里发的是可评论"，
 * 谁也不知道到底给了什么权限。所以：范围切换时把角色降级，`resolveShare()` 给出真正生效的值。
 */

export const SHARE_SCOPES = ['private', 'link', 'org', 'people'] as const
export type ShareScope = (typeof SHARE_SCOPES)[number]

export const SHARE_ROLES = ['viewer', 'commenter', 'editor'] as const
export type ShareRole = (typeof SHARE_ROLES)[number]

export interface ShareState {
  readonly scope: ShareScope
  /** 角色选择会被记住，但只有当前范围允许的角色才生效（见 `resolveShare`）。 */
  readonly role: ShareRole
  /** 链接有效期（天）；`0` = 永久。只对 `link` 生效。 */
  readonly expiryDays: number
  /** 指定人数量；只对 `people` 生效。 */
  readonly peopleCount: number
}

export interface ResolvedShare {
  readonly scope: ShareScope
  /** `private` 没有"角色"这回事。 */
  readonly role: ShareRole | undefined
  /** 只有 `link` 有有效期。 */
  readonly expiryDays: number | undefined
  /** 只有 `people` 有指定人数。 */
  readonly peopleCount: number | undefined
}

/** 各范围允许的角色。链接范围不给"可编辑"：链接会被转发，转发的人不该顺带给出编辑权。 */
const ROLES_BY_SCOPE: Record<ShareScope, readonly ShareRole[]> = {
  private: [],
  link: ['viewer', 'commenter'],
  org: ['viewer', 'commenter', 'editor'],
  people: ['viewer', 'commenter', 'editor'],
}

export const SHARE_MAX_EXPIRY_DAYS = 3650
export const SHARE_MAX_PEOPLE = 9999

export function rolesForScope(scope: ShareScope): readonly ShareRole[] {
  return ROLES_BY_SCOPE[scope]
}

function whole(value: number | undefined, fallback: number, max: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback
  return Math.min(Math.max(0, Math.floor(value)), max)
}

function allowedRole(scope: ShareScope, role: ShareRole): ShareRole {
  const allowed = ROLES_BY_SCOPE[scope]
  if (allowed.includes(role)) return role
  // 降级到该范围里权限最小的一档：宁可少给，也不要悄悄多给
  return allowed[0] ?? role
}

export interface ShareStateOptions {
  readonly scope?: ShareScope
  readonly role?: ShareRole
  readonly expiryDays?: number
  readonly peopleCount?: number
}

export function createShareState(options: ShareStateOptions = {}): ShareState {
  const scope = options.scope ?? 'private'
  return {
    scope,
    role: allowedRole(scope, options.role ?? 'viewer'),
    expiryDays: whole(options.expiryDays, 0, SHARE_MAX_EXPIRY_DAYS),
    peopleCount: whole(options.peopleCount, 0, SHARE_MAX_PEOPLE),
  }
}

/** 切范围时顺手把角色降级到合法值：界面上不会出现"当前范围根本不允许的角色"。 */
export function setShareScope(state: ShareState, scope: ShareScope): ShareState {
  const role = allowedRole(scope, state.role)
  if (scope === state.scope && role === state.role) return state
  return { ...state, scope, role }
}

/** 选角色。当前范围不允许的角色直接忽略（UI 不该放出这种选项，但宿主可能直接调）。 */
export function setShareRole(state: ShareState, role: ShareRole): ShareState {
  if (state.role === role) return state
  if (!ROLES_BY_SCOPE[state.scope].includes(role)) return state
  return { ...state, role }
}

/** 链接有效期。只影响 `link`；负数/NaN 归 0（永久）。 */
export function setShareExpiry(state: ShareState, days: number): ShareState {
  const expiryDays = whole(days, state.expiryDays, SHARE_MAX_EXPIRY_DAYS)
  if (expiryDays === state.expiryDays) return state
  return { ...state, expiryDays }
}

export function setSharePeopleCount(state: ShareState, count: number): ShareState {
  const peopleCount = whole(count, state.peopleCount, SHARE_MAX_PEOPLE)
  if (peopleCount === state.peopleCount) return state
  return { ...state, peopleCount }
}

export function isShareEnabled(state: ShareState): boolean {
  return state.scope !== 'private'
}

/**
 * 归一化后的权限——真正该发给后端的东西。
 *
 * 不做这一步，就会出现"界面显示可评论、实际给了可编辑"或反过来的事故：
 * 两类信息（范围、角色）在 UI 上互相覆盖，只有一处能算出最终值才不会分叉。
 */
export function resolveShare(state: ShareState): ResolvedShare {
  if (state.scope === 'private') {
    return { scope: state.scope, role: undefined, expiryDays: undefined, peopleCount: undefined }
  }
  return {
    scope: state.scope,
    role: allowedRole(state.scope, state.role),
    expiryDays: state.scope === 'link' ? state.expiryDays : undefined,
    peopleCount: state.scope === 'people' ? state.peopleCount : undefined,
  }
}
