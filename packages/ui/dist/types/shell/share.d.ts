/**
 * 共享权限模型（03 §3 E 组 `OjShareDialog`）。
 *
 * 这里只做一件容易被做错的事：**决定"实际发出去的是什么权限"**。
 *
 * 界面上的选择组合不都是合法的：`private` 没有角色，`link` 不该给"可编辑"（拿到链接就能改），
 * 有效期只对链接有意义。把归一化放进组件，就会出现"界面上选了可编辑、请求里发的是可评论"，
 * 谁也不知道到底给了什么权限。所以：范围切换时把角色降级，`resolveShare()` 给出真正生效的值。
 */
export declare const SHARE_SCOPES: readonly ['private', 'link', 'org', 'people'];
export type ShareScope = (typeof SHARE_SCOPES)[number];
export declare const SHARE_ROLES: readonly ['viewer', 'commenter', 'editor'];
export type ShareRole = (typeof SHARE_ROLES)[number];
export interface ShareState {
    readonly scope: ShareScope;
    /** 角色选择会被记住，但只有当前范围允许的角色才生效（见 `resolveShare`）。 */
    readonly role: ShareRole;
    /** 链接有效期（天）；`0` = 永久。只对 `link` 生效。 */
    readonly expiryDays: number;
    /** 指定人数量；只对 `people` 生效。 */
    readonly peopleCount: number;
}
export interface ResolvedShare {
    readonly scope: ShareScope;
    /** `private` 没有"角色"这回事。 */
    readonly role: ShareRole | undefined;
    /** 只有 `link` 有有效期。 */
    readonly expiryDays: number | undefined;
    /** 只有 `people` 有指定人数。 */
    readonly peopleCount: number | undefined;
}
export declare const SHARE_MAX_EXPIRY_DAYS = 3650;
export declare const SHARE_MAX_PEOPLE = 9999;
export declare function rolesForScope(scope: ShareScope): readonly ShareRole[];
export interface ShareStateOptions {
    readonly scope?: ShareScope;
    readonly role?: ShareRole;
    readonly expiryDays?: number;
    readonly peopleCount?: number;
}
export declare function createShareState(options?: ShareStateOptions): ShareState;
/** 切范围时顺手把角色降级到合法值：界面上不会出现"当前范围根本不允许的角色"。 */
export declare function setShareScope(state: ShareState, scope: ShareScope): ShareState;
/** 选角色。当前范围不允许的角色直接忽略（UI 不该放出这种选项，但宿主可能直接调）。 */
export declare function setShareRole(state: ShareState, role: ShareRole): ShareState;
/** 链接有效期。只影响 `link`；负数/NaN 归 0（永久）。 */
export declare function setShareExpiry(state: ShareState, days: number): ShareState;
export declare function setSharePeopleCount(state: ShareState, count: number): ShareState;
export declare function isShareEnabled(state: ShareState): boolean;
/**
 * 归一化后的权限——真正该发给后端的东西。
 *
 * 不做这一步，就会出现"界面显示可评论、实际给了可编辑"或反过来的事故：
 * 两类信息（范围、角色）在 UI 上互相覆盖，只有一处能算出最终值才不会分叉。
 */
export declare function resolveShare(state: ShareState): ResolvedShare;
