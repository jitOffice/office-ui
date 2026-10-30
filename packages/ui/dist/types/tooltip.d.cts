/** Tooltip 延迟状态机。Office 默认 400ms：时间未到就离开，则不打开。 */
export interface TooltipMachine {
    readonly open: boolean;
    enter(): void;
    leave(): void;
    show(): void;
    hide(): void;
    dispose(): void;
}
export interface TooltipOptions {
    delay?: number;
    /** 返回取消函数。测试注入同步调度器。 */
    schedule?: (fn: () => void, ms: number) => () => void;
    onChange?: (open: boolean) => void;
}
export declare function createTooltipMachine(options?: TooltipOptions): TooltipMachine;
