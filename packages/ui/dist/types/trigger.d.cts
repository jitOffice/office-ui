/**
 * `OjTrigger` 的交互状态机（prd/03 §3 D 组）。
 *
 * 为什么单独抽成框架无关的一层：`hover/click/focus/manual` 的组合语义、离开延迟、
 * "移进面板要能取消关闭"这些规则，全部是**时序**问题。放在组件里只能靠真浏览器测，
 * 而这里注入一个 scheduler 就能在零依赖的 `node --test` 里把每条时序都钉死。
 */
export type TriggerMode = 'hover' | 'click' | 'focus' | 'manual';
export type TriggerCloseReason = 'leave' | 'panel-leave' | 'blur' | 'press' | 'escape' | 'manual';
export interface TriggerScheduler {
    setTimeout(task: () => void, ms: number): number;
    clearTimeout(handle: number): void;
}
export interface TriggerMachineOptions {
    /** 默认只认点击：hover 自动弹出在触摸屏上是灾难，必须显式选择 */
    modes?: readonly TriggerMode[];
    /**
     * 悬停后多久弹出。默认 0（点击与 focus 立即生效，悬停的延迟由使用方决定）。
     * 显式带 `| undefined`：仓库开了 `exactOptionalPropertyTypes`，否则把组件的 `Number` prop
     * （`number | undefined`）直接透传进来会编译失败。
     */
    openDelay?: number | undefined;
    /**
     * 离开后多久关闭。**默认不能是 0**：鼠标从触发器移向面板的途中会先离开触发器，
     * 立刻关闭会让面板永远够不到（03 §3 D 组点名的那条）。
     */
    closeDelay?: number | undefined;
    onOpen?(): void;
    onClose?(reason: TriggerCloseReason): void;
    scheduler?: TriggerScheduler;
}
export declare function createTriggerMachine(options?: TriggerMachineOptions): {
    isOpen: () => boolean;
    /** 指针进入触发器（或触发器获得焦点时的 hover 语义） */
    enter(): void;
    leave(): void;
    /**
     * 指针进入面板：只取消待关闭，不动 open。
     * 这是 closeDelay 存在的全部理由——从触发器到面板之间必然有一段空白。
     */
    panelEnter(): void;
    panelLeave(): void;
    press(): void;
    focusIn(): void;
    focusOut(): void;
    escape(): void;
    close(reason?: TriggerCloseReason): void;
    /**
     * 跟上外部真值（`v-model:open`）。
     *
     * 不跟的话，外部把面板关掉之后机器内部还记着 `open === true`，
     * 下一次 `press()` 会算成"关闭"，用户点两下才打开。
     */
    sync(value: boolean): void;
    dispose(): void;
};
export type TriggerMachine = ReturnType<typeof createTriggerMachine>;
