//#region src/a11y.ts
function iconLabelProblem(name, options = {}) {
	if (typeof options.label === "string" && options.label.length > 0 || options.decorative === true) return void 0;
	return `[${name}] 既没有 label 也没有标 decorative：纯图标元素不进无障碍树，读屏用户读到的是一片空白（prd/03 §2）。给 label（有语义）或 decorative（装饰性，渲染 aria-hidden）二选一。`;
}
/** 只有构建器**明确**说是 dev 才告警：宁可线上漏报，也不要在产物里刷控制台。 */
function isDevEnv(env) {
	return env?.DEV === true;
}
//#endregion
export { iconLabelProblem, isDevEnv };
