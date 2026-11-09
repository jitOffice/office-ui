//#region src/shell/share.ts
/**
* 共享权限模型（03 §3 E 组 `OjShareDialog`）。
*
* 这里只做一件容易被做错的事：**决定"实际发出去的是什么权限"**。
*
* 界面上的选择组合不都是合法的：`private` 没有角色，`link` 不该给"可编辑"（拿到链接就能改），
* 有效期只对链接有意义。把归一化放进组件，就会出现"界面上选了可编辑、请求里发的是可评论"，
* 谁也不知道到底给了什么权限。所以：范围切换时把角色降级，`resolveShare()` 给出真正生效的值。
*/
var SHARE_SCOPES = [
	"private",
	"link",
	"org",
	"people"
];
var SHARE_ROLES = [
	"viewer",
	"commenter",
	"editor"
];
/** 各范围允许的角色。链接范围不给"可编辑"：链接会被转发，转发的人不该顺带给出编辑权。 */
var ROLES_BY_SCOPE = {
	private: [],
	link: ["viewer", "commenter"],
	org: [
		"viewer",
		"commenter",
		"editor"
	],
	people: [
		"viewer",
		"commenter",
		"editor"
	]
};
var SHARE_MAX_EXPIRY_DAYS = 3650;
var SHARE_MAX_PEOPLE = 9999;
function rolesForScope(scope) {
	return ROLES_BY_SCOPE[scope];
}
function whole(value, fallback, max) {
	if (value === void 0 || !Number.isFinite(value)) return fallback;
	return Math.min(Math.max(0, Math.floor(value)), max);
}
function allowedRole(scope, role) {
	const allowed = ROLES_BY_SCOPE[scope];
	if (allowed.includes(role)) return role;
	return allowed[0] ?? role;
}
function createShareState(options = {}) {
	const scope = options.scope ?? "private";
	return {
		scope,
		role: allowedRole(scope, options.role ?? "viewer"),
		expiryDays: whole(options.expiryDays, 0, SHARE_MAX_EXPIRY_DAYS),
		peopleCount: whole(options.peopleCount, 0, SHARE_MAX_PEOPLE)
	};
}
/** 切范围时顺手把角色降级到合法值：界面上不会出现"当前范围根本不允许的角色"。 */
function setShareScope(state, scope) {
	const role = allowedRole(scope, state.role);
	if (scope === state.scope && role === state.role) return state;
	return {
		...state,
		scope,
		role
	};
}
/** 选角色。当前范围不允许的角色直接忽略（UI 不该放出这种选项，但宿主可能直接调）。 */
function setShareRole(state, role) {
	if (state.role === role) return state;
	if (!ROLES_BY_SCOPE[state.scope].includes(role)) return state;
	return {
		...state,
		role
	};
}
/** 链接有效期。只影响 `link`；负数/NaN 归 0（永久）。 */
function setShareExpiry(state, days) {
	const expiryDays = whole(days, state.expiryDays, SHARE_MAX_EXPIRY_DAYS);
	if (expiryDays === state.expiryDays) return state;
	return {
		...state,
		expiryDays
	};
}
function setSharePeopleCount(state, count) {
	const peopleCount = whole(count, state.peopleCount, SHARE_MAX_PEOPLE);
	if (peopleCount === state.peopleCount) return state;
	return {
		...state,
		peopleCount
	};
}
function isShareEnabled(state) {
	return state.scope !== "private";
}
/**
* 归一化后的权限——真正该发给后端的东西。
*
* 不做这一步，就会出现"界面显示可评论、实际给了可编辑"或反过来的事故：
* 两类信息（范围、角色）在 UI 上互相覆盖，只有一处能算出最终值才不会分叉。
*/
function resolveShare(state) {
	if (state.scope === "private") return {
		scope: state.scope,
		role: void 0,
		expiryDays: void 0,
		peopleCount: void 0
	};
	return {
		scope: state.scope,
		role: allowedRole(state.scope, state.role),
		expiryDays: state.scope === "link" ? state.expiryDays : void 0,
		peopleCount: state.scope === "people" ? state.peopleCount : void 0
	};
}
//#endregion
export { SHARE_MAX_EXPIRY_DAYS, SHARE_MAX_PEOPLE, SHARE_ROLES, SHARE_SCOPES, createShareState, isShareEnabled, resolveShare, rolesForScope, setShareExpiry, setSharePeopleCount, setShareRole, setShareScope };
